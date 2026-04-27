import { ChangeDetectorRef, Component, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../model/constantes';
import { Subscription } from 'rxjs';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { MessageService } from 'primeng/api';
import { EChartsOption } from 'echarts/types/dist/shared';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { Users } from '../model/interfaces';
import { KanbanService } from '../kanban/service/kanban.service';

@Component({
    selector: 'app-grafico',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    templateUrl: './grafico.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, KanbanService]
})
export class Grafico implements OnDestroy {
    $listSubcription: Subscription[] = [];
    annio!: Date;
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal(false);
    lstCan: number[] = [];
    lstMes: number[] = [];

    data: any;
    options: any;
    platformId = inject(PLATFORM_ID);
    periodo: any;
    resumenEtapas = signal<any[]>([]);
    perdidoRow = signal<any>(null);
    selectedQ = signal<any[]>([]);
    lstQ = [
        { id: 1, desQ: 'Q1' },
        { id: 2, desQ: 'Q2' },
        { id: 3, desQ: 'Q3' },
        { id: 4, desQ: 'Q4' }
    ];
    Vendedor = signal<Users[]>([]);
    idvendedor: number = 0;
    idperfil: number = constantesLocalStorage.idperfil;
    chartOption!: EChartsOption;
    chartOption2!: EChartsOption;
tot_cantidad: number = 0;
tot_monto: number = 0;
tot_ponderado: number = 0;
cerradoRow = signal<any>(null);
forecastCnt = signal<number>(0);
forecastMonto = signal<number>(0);
closingRatioCnt = signal<number>(0);
closingRatioMonto = signal<number>(0);
    

    constructor(
        private cd: ChangeDetectorRef,
        private utilitariosService: UtilitariosService,
        private oportunidadService: OportunidadService,
        private messageService: MessageService,
        private kanbanService: KanbanService
    ) {}

    ngOnInit() {
        this.annio = this.utilitariosService.obtenerFechaActual();
        this.selectedQ.set(this.lstQ);
        this.periodo = this.utilitariosService.obtenerFechaInicioMes();
        //this.idvendedor = constantesLocalStorage.idusuario;
        if (this.idperfil === 4) this.listaVendedor();
        this.getDataFunnel();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            let nommes = this.periodo.toLocaleString('default', { month: 'long' }).charAt(0).toUpperCase() + this.periodo.toLocaleString('default', { month: 'long' }).slice(1) + ' ' + this.periodo.getFullYear();

            this.data = {
                labels: this.lstMes,
                datasets: [
                    {
                        //label: `Acciones de ${nommes}`,
                        backgroundColor: documentStyle.getPropertyValue('--p-primary-color'),
                        borderColor: documentStyle.getPropertyValue('--p-primary-color'),
                        data: this.lstCan
                    }
                ]
            };

            this.options = {
                maintainAspectRatio: false,
                aspectRatio: 0.9,
                plugins: {
                    legend: {
                        display: false,
                        labels: {
                            color: textColor
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (value: number) => {
                            return value; // proporción del p-chart
                        },
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: {
                                weight: 500
                            }
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    },
                    y: {
                        min: 0,
                        //max: 20,
                        ticks: {
                            color: textColorSecondary,
                            stepSize: 1
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    }
                }
            };
            this.cd.markForCheck();
        }
    }

    getDataFunnel() {
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;
        if (this.annio === null) {
            this.messageService.add({
                severity: 'info',
                summary: 'Validación',
                detail: 'Seleccionar Año'
            });
            return;
        }

        let lstQ: string[] = [];
        this.selectedQ().forEach((item) => {
            lstQ.push(item.id);
        });

        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            idvendedor: this.idvendedor,
            idpreventa: 0,
            idtipoprod: 0,
            idcliente: 0,
            idlista: 0,
            annio: this.annio.getFullYear(),
            q: 0,
            idproveedor: 0,
            tipoentidad: 'T',
            estadoString: '1,2,3,4,5,6,7',
            qString: lstQ.toString(),
            porcierre: 0,
            idmonto: 0,
            tipo: 2
        };

        const obtenerFunnel = this.oportunidadService.obtenerFunnel5(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                let data = rpta[0].data[0].dataPoints;
                console.log('obtenerFunnel5...', data);

                data = data.filter((x: any) => x.name !== 'PERDIDO');
                const totalSteps = data.length;
                const dataTransformada = data.map((x: { name: any; value: any; cantidad: any; bgcolor: any  }, index: number) => {
                    return {
                        name: x.name,
                        value: (index + 1) * 20, // ancho progresivo (20,40,60...)
                        realValue: x.value, // valor real del SP
                        cantidad: x.cantidad,
                        itemStyle: { color: x.bgcolor }
                    };
                });
                const dataTransformada2 = data.map((x: { name: any; value: any; cantidad: any; bgcolor: any  }, index: number) => {
                    return {
                        name: x.name,
                        value: (index + 1) * 20, //x.cantidad, // ancho progresivo (20,40,60...)
                        realValue: x.cantidad, // valor real del SP
                        cantidad: x.cantidad,
                        itemStyle: { color: x.bgcolor  }
                    };
                });

                // Diamond graphic between CONTACTO and CIERRE
                const N = data.length;
                const ciIdx = data.findIndex((x: any) => x.name?.toUpperCase() === 'CONTACTO');
                const ziIdx = data.findIndex((x: any) => x.name?.toUpperCase() === 'CIERRE');
                let diamondGraphic: any[] = [];
                if (ciIdx >= 0 && ziIdx >= 0) {
                    const ciRow = N - 4 - ciIdx;
                    const ziRow = N - 1 - ziIdx;
                    const topRow = Math.min(ciRow, ziRow);
                    const botRow = Math.max(ciRow, ziRow);
                    const titleH = 60, funnelH = 140;
                    const itemH = funnelH / N;
                    const midY = titleH + ((topRow + 1 + botRow) / 2) * itemH;
                    // Width of each stage proportional to its funnel value
                    const funnelHalfW = 500 * 0.30; // 60% funnel width, half = 30% of ~600px estimated
                    const topDataIdx = N - 1 - topRow;
                    const botDataIdx = N - 1 - botRow;
                    const topHalfW = ((topDataIdx + 1) / N) * funnelHalfW;
                    const botHalfW = ((botDataIdx + 1) / N) * funnelHalfW * 1.3;
                    const h = (botRow - topRow + 1) * itemH / 2;
                    diamondGraphic = [{
                        type: 'group',
                        left: 'center',
                        top: midY,
                        children: [{
                            type: 'polygon',
                            shape: { points: [[-topHalfW, -h], [topHalfW, -h], [botHalfW, h], [-botHalfW, h]] },
                            style: { fill: 'rgba(99, 102, 241, 0.1)', stroke: '#343586', lineWidth: 2 }
                        }]
                    }];
                }

                this.chartOption = {
                    tooltip: {
                        trigger: 'item',
                        formatter: (params: any) => {
                            const valor = Number(params.data.realValue || 0);
                          
                            return `${params.name}<br/>
                                    Monto: ${valor.toLocaleString('es-PE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}`;
                          }
                    },
                    series: [
                        {
                            type: 'funnel',
                            min: 0,
                            max: totalSteps * 20, // 👈 importante
                            sort: 'descending', // 👈 evita que reordene por value
                            
                            width: '60%',
                            label: {
                                formatter: (params: any) => {
                                    return `${params.name}: ${params.data.realValue.toLocaleString('es-PE', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      })}`;
                                  }
                            },
                            data: dataTransformada
                        }
                    ],
                    graphic: diamondGraphic
                };

                this.chartOption2 = {
                    tooltip: {
                        trigger: 'item',
                        formatter: (params: any) => {
                            return `${params.name}<br/>
                                    Cantidad: ${params.data.cantidad}`;
                          }
                    },
                    series: [
                        {
                            type: 'funnel',
                            width: '60%',
                             label: {
                                formatter: (params: any) => {
                                    return `${params.name}: ${params.data.realValue}`;
                                  }
                            },
                            data: dataTransformada2
                        }
                    ],
                    graphic: diamondGraphic
                };
            },
            error: (err) => {
                console.error('error : ', err);
                this.setSpinner(false);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {
                this.getDataFunnel2(objeto);
            }
        });
        this.$listSubcription.push(obtenerFunnel);
    }

    listaVendedor() {
        const sub = this.kanbanService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                this.Vendedor.set(rpta);
                this.Vendedor.update((list) => [{ idusuario: 0, name: 'TODOS' } as Users, ...list]);
            },
            error: (err) => {
                console.error('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
        this.$listSubcription.push(sub);
    }

    ngOnDestroy() {
        this.$listSubcription.forEach((s) => s.unsubscribe());
    }

    getDataFunnel2(objeto:any) {


        const obtenerFunnel = this.oportunidadService.obtenerFunnel(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('getDataFunnel2', rpta[0].data[0]);
                const dataPoints = (rpta[0].data[0].dataPoints as any[]).map((item: any) => ({
                    ...item,
                    ponderado: (item.y ?? 0) === 0 ? 0 : (item.ponderado ?? 0)
                }));
                const sinPerdido = dataPoints.filter((item: any) => item.name !== 'PERDIDO').reverse();
                const perdido = dataPoints.find((item: any) => item.name === 'PERDIDO') ?? null;
                this.resumenEtapas.set(sinPerdido);
                this.perdidoRow.set(perdido);
                const pipelineStates = ['CIERRE', 'PRESENTACION', 'INVESTIGACION', 'CALIFICACION', 'CONTACTO'];
                const pipelineItems = sinPerdido.filter((item: any) => pipelineStates.includes(item.name?.toUpperCase()));
                this.tot_cantidad = pipelineItems.reduce((acc: number, item: any) => acc + (item.cantidad ?? 0), 0);
                this.tot_monto = pipelineItems.reduce((acc: number, item: any) => acc + (item.y ?? 0), 0);
                this.tot_ponderado = pipelineItems.reduce((acc: number, item: any) => acc + (item.ponderado ?? 0), 0);
                const cerrado = sinPerdido.find((item: any) => item.name === 'CERRADO') ?? null;
                const forecastItems = sinPerdido.filter((item: any) => item.name === 'PRESENTACION' || item.name === 'CIERRE');
                const fCnt = forecastItems.reduce((acc: number, item: any) => acc + (item.cantidad ?? 0), 0);
                const fMonto = forecastItems.reduce((acc: number, item: any) => acc + (item.y ?? 0), 0);
                this.cerradoRow.set(cerrado);
                this.forecastCnt.set(fCnt);
                this.forecastMonto.set(fMonto);
                this.closingRatioCnt.set(this.tot_cantidad > 0 && cerrado ? +((cerrado.cantidad / this.tot_cantidad) * 100).toFixed(2) : 0);
                this.closingRatioMonto.set(this.tot_monto > 0 && cerrado ? +((cerrado.y / this.tot_monto) * 100).toFixed(2) : 0);
            },
            error: (err) => {
                this.setSpinner(false);
                console.error('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {this.setSpinner(false);}
        });
    }
}
