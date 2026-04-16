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
    tot_acciones: number = 0;
    closingRatioCantidad: number = 0;
    closingRatioMonto: number = 0;
    cerradoCantidad: number = 0;
    cerradoMonto: number = 0;
    forecastCantidad: number = 0;
    forecastMonto: number = 0;
    resumenEtapas: any[] = [];
    selectedQ = signal<any[]>([]);
    lstQ = [
        { id: 1, desQ: 'Q1' },
        { id: 2, desQ: 'Q2' },
        { id: 3, desQ: 'Q3' },
        { id: 4, desQ: 'Q4' }
    ];
    Vendedor = signal<Users[]>([]);
    idvendedor: number = 0;
    chartOption!: EChartsOption;
    chartOption2!: EChartsOption;
    

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
        //this.getBuscar();
        this.listaVendedor();
        this.getDataFunnel();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    getBuscar() {
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;
        this.lstCan = [];
        this.lstMes = [];

        const objeto = {
            annio: this.periodo.getFullYear(),
            mes: this.periodo.getMonth() + 1,
            idusuario: constantesLocalStorage.idusuario
        };

        const $listaTareas = this.oportunidadService.listaAccionesxMes(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                this.lstCan = rpta.map((item: any) => item.CantidadAcciones);
                this.lstMes = rpta.map((item: any) => item.Dia);
                this.tot_acciones = rpta.reduce((acc: number, x: any) => acc + x.CantidadAcciones, 0);
                this.initChart();
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
            complete: () => {
                this.setSpinner(false);
            }
        });
        this.$listSubcription.push($listaTareas);
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

                const totalSteps = rpta[0].data[0].dataPoints.length;
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
                        value: x.cantidad, // ancho progresivo (20,40,60...)
                        realValue: x.cantidad, // valor real del SP
                        cantidad: x.cantidad,
                        itemStyle: { color: x.bgcolor  }
                    };
                });

                this.chartOption = {
                    title: {
                        text: 'Funnel por Monto'
                    },
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
                            left: '10%',
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
                    ]
                };

                this.chartOption2 = {
                    title: {
                        text: 'Por Cantidad'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: (params: any) => {
                            return `${params.name}<br/>
                                    Cantidad: ${params.data.cantidad}`;
                          }
                    },
                    series: [
                        {
                            type: 'pie',
                            width: '100%',
                            label: {
                                formatter: '{b}: {c}'
                            },
                            data: dataTransformada2
                        }
                    ]
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
            complete: () => {}
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
}
