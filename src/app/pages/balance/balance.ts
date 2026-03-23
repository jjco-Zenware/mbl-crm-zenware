import { ChangeDetectorRef, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { UtilitariosService } from '../service/utilitarios.service';
import { mensajesQuestion, mensajesSpinner } from '../model/constantes';
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
            mes: this.periodo.getMonth() + 1
        };

        const $listaTareas = this.oportunidadService.listaAccionesxMes(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta acciones x mes', rpta);
                this.lstCan = rpta.map((item: any) => item.CantidadAcciones);
                this.lstMes = rpta.map((item: any) => item.Dia);

                console.log('this.lstMes', this.lstMes);
                console.log('this.lstCan', this.lstCan);

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
                        label: `Acciones de ${nommes}`,
                        backgroundColor: documentStyle.getPropertyValue('--p-primary-color'),
                        borderColor: documentStyle.getPropertyValue('--p-primary-color'),
                        data: this.lstCan
                    }
                ]
            };

            this.options = {
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                    // datalabels: {
                    //     anchor: 'end',
                    //     align: 'top',
                    //     formatter: (value: number) => {
                    //         return value // proporción del p-chart
                    //     },
                    //     font: {
                    //         weight: 'bold'
                    //     }
                    // }
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
                        max: 5,
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
