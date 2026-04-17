import { ChangeDetectorRef, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../model/constantes';
import { Subscription } from 'rxjs';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { MessageService } from 'primeng/api';
//import ChartDataLabels from 'chartjs-plugin-datalabels';
//import { Chart } from 'chart.js';

//Chart.register(ChartDataLabels);

@Component({
    selector: 'app-balance',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    templateUrl: './balance.html',
    standalone: true,
    providers: [MessageService, UtilitariosService]
})
export class Balance {
    $listSubcription: Subscription[] = [];
    [x: string]: any;
    mes: number = 0;
    annio: number = 0;
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal(false);
    lstCan: number[] = [];
    lstMes: number[] = [];

    data: any;
    options: any;
    platformId = inject(PLATFORM_ID);
    periodo: any;
    tot_acciones: number = 0;

    constructor(
        private cd: ChangeDetectorRef,
        private utilitariosService: UtilitariosService,
        private oportunidadService: OportunidadService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.periodo = this.utilitariosService.obtenerFechaInicioMes();
        this.getBuscar();
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
                console.log('rpta acciones x mes', rpta);
                this.lstCan = rpta.map((item: any) => item.CantidadAcciones);
                this.lstMes = rpta.map((item: any) => item.Dia);

                this.tot_acciones = rpta.reduce((acc: number, x: any) => acc + x.CantidadAcciones, 0)

                console.log('this.lstMes', this.lstMes);
                console.log('rpta', rpta.reduce((acc: number, x: any) => acc + x.CantidadAcciones, 0));

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

            const nommes =
                this.periodo.toLocaleString('es-PE', { month: 'long' }).replace(/^\w/, (c: string) => c.toUpperCase()) +
                ' ' +
                this.periodo.getFullYear();

            const maxVal = Math.max(...this.lstCan, 1);
            const bgColors = this.lstCan.map((val: number) => {
                const ratio = val / maxVal;
                const h = Math.round(210 + ratio * 90); // azul → violeta → púrpura
                return `hsla(${h}, 72%, 58%, 0.88)`;
            });
            const borderColors = this.lstCan.map((val: number) => {
                const ratio = val / maxVal;
                const h = Math.round(210 + ratio * 90);
                return `hsl(${h}, 72%, 42%)`;
            });

            this.data = {
                labels: this.lstMes,
                datasets: [
                    {
                        label: `Acciones de ${nommes}`,
                        backgroundColor: bgColors,
                        borderColor: borderColors,
                        borderWidth: 1.5,
                        borderRadius: 8,
                        borderSkipped: false,
                        hoverBackgroundColor: bgColors.map((c: string) => c.replace('0.88', '1')),
                        data: this.lstCan
                    }
                ]
            };

            this.options = {
                maintainAspectRatio: false,
                aspectRatio: 0.9,
                animation: {
                    duration: 700,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { size: 13, weight: '600' },
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: textColorSecondary,
                        formatter: (value: number) => (value > 0 ? value : ''),
                        font: { weight: 'bold', size: 11 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.88)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx: any) => ` ${ctx.parsed.y} acción${ctx.parsed.y !== 1 ? 'es' : ''}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: { weight: 500 }
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    },
                    y: {
                        min: 0,
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
}
