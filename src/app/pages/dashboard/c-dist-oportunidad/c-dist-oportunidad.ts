import { Component, Input, OnDestroy, OnInit, signal, SimpleChanges, ViewChild } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { KanbanService } from '../../kanban/service/kanban.service';
import { DialogService } from 'primeng/dynamicdialog';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { Customer } from '../../service/customer.service';
import { Users } from '../../model/interfaces';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { mensajesQuestion } from '../../model/constantes';
import { CPorcentajeOpo } from '../c-porcentajeopor/c-porecentajeopo';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';

@Component({
    selector: 'app-c-dist-oportunidad',
    templateUrl: './c-dist-oportunidad.html',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, KanbanService]
})
export class CDistOportunidad implements OnInit, OnDestroy {
    @Input() IA_data: any;
    @Input() IS_codigo!: number;
    @ViewChild('doughnut') doughnutViewChild!: UIChart;
    $listSubcription: Subscription[] = [];
    doughnutData: any;
    doughnutOptions: any
    totalCloWon= signal<number>(0);
    totalCloLos= signal<number>(0);
    totalCloLed= signal<number>(0);
    totalCloPip= signal<number>(0);
    totalCloUps= signal<number>(0);
    totalCloStr= signal<number>(0);
    totalCloCom= signal<number>(0);
    totalCloWon2= signal<number>(0);
    chartOptionsData= signal<number[]>([]);
    chartOptionsLabel= signal<string[]>([]);
    customers!: Customer[];
    Usuarios: Users[] = [];
    idcomercial!: number;
    Usuario!: Users;
    verVendedor = signal<boolean>(false);
    verCliente = signal<boolean>(false);
    verProducto = signal<boolean>(false);
    verSemiFull = signal<boolean>(false);
    tipoChart: string = '';
    chartOptionscolor= signal<string[]>([]);
    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = 'Cargando...!';

    constructor(
        private messageService: MessageService,
        private kanbanService: KanbanService,
        private oportunidadService: OportunidadService,
        public dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.listaUsuarios();
        this.verCodigo();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    verCodigo() {
        switch (this.IS_codigo) {
            case 0:
                this.verVendedor.set(false);
                this.verCliente.set(false);
                this.verProducto.set(false);
                this.tipoChart = 'doughnut';
                this.verSemiFull.set(true);
                break;
            case 1:
                this.verVendedor.set(true);
                this.verCliente.set(false);
                this.verProducto.set(false);
                this.tipoChart = 'pie';
                this.verSemiFull.set(false);
                break;
            case 2:
                this.verVendedor.set(false);
                this.verCliente.set(true);
                this.verProducto.set(false);
                this.tipoChart = 'doughnut';
                this.verSemiFull.set(false);
                break;
            // case 3:
            //     this.verVendedor = false;
            //     this.verCliente = false;
            //     this.verProducto = true;
            //     this.tipoChart = "doughnut";
            //     this.verSemiFull = false;
            // break;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['IA_data']) {
            switch (this.IS_codigo) {
                case 0:
                    this.getDataFunnel(this.IA_data);
                    break;
                case 1:
                    this.getDataFunnel1(this.IA_data);
                    break;
                case 2:
                    this.getDataFunnel2(this.IA_data);
                    break;
            }
        }
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    changeDoughnutDataView() {
        if (this.doughnutViewChild.chart.options.circumference === 180) {
            this.doughnutViewChild.chart.options.circumference = 360;
            this.doughnutViewChild.chart.options.rotation = -45;
        } else {
            this.doughnutViewChild.chart.options.circumference = 180;
            this.doughnutViewChild.chart.options.rotation = -90;
        }

        this.doughnutViewChild.chart.update();
    }

    cargarDataChart(data: any) {
        //console.log('cargarDataChart', data);
        this.totalCloWon.set(0);
        this.totalCloWon2.set(0);
        this.totalCloLos.set(0);
        this.totalCloLed.set(0);
        this.totalCloPip.set(0);
        this.totalCloUps.set(0);
        this.totalCloStr.set(0);
        this.totalCloCom.set(0);
        this.chartOptionsLabel.set([]);
        this.chartOptionsData.set([]);
        this.chartOptionscolor.set([]);
        data.forEach((item: any) => {
            this.chartOptionsLabel().push(item.name);
            this.chartOptionsData().push(item.y);
            this.chartOptionscolor().push(item.name);
            if (this.IS_codigo === 0) {
                if (item.name === 'Lead ') {
                    this.totalCloLed.set(item.y);
                }
                if (item.name === 'PIPELINE') {
                    this.totalCloPip.set(item.y);
                }
                if (item.name === 'UPSIDE') {
                    this.totalCloUps.set(item.y);
                }
                if (item.name === 'STRONG') {
                    this.totalCloStr.set(item.y);
                }
                if (item.name === 'COMMIT') {
                    this.totalCloCom.set(item.y);
                }
                if (item.name === 'LOST') {
                    this.totalCloLos.set(item.y);
                }
                if (item.name === 'WON') {
                    this.totalCloWon.set(item.y);
                }
            }
        });
        this.doughnutChartInit();
    }

    doughnutChartInit() {
        this.doughnutData = this.getDoughnutData();
        this.doughnutOptions = this.getDoughnutOptions();
    }

    getDoughnutData() {
        const { lead, pipeline, upside, strong, commit, won, lost } = this.getColors();
        const borderColor = getComputedStyle(document.body).getPropertyValue('--surface-border') || 'rgba(160, 167, 181, .3)';

        //this.chartOptionscolor = this.getColors();
        //console.log('this.this.chartOptionscolor', this.chartOptionscolor);

        return {
            labels: this.chartOptionsLabel(),
            datasets: [
                {
                    data: this.chartOptionsData(),
                    //label:'Lead',
                    backgroundColor: [lead, pipeline, upside, strong, commit, won, lost ],
                    borderWidth: 1,
                    fill: true
                },
                // {
                //     data: this.totalCloPip(), 
                //     label:'Pipeline',
                //     backgroundColor: pipeline,
                //     borderColor
                // },
                // {
                //     data: this.totalCloUps(), 
                //     label:'upside',
                //     backgroundColor: upside,
                //     borderColor
                // },
                // {
                //     data: this.totalCloStr(), 
                //     label:'strong',
                //     backgroundColor: strong,
                //     borderColor
                // }
            ]
        };
    }

    getDoughnutOptions() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-family');
        return {
            plugins: {
                legend: {
                    display: false,
                    position: 'top',
                    labels: {
                        fontFamily,
                        color: textColor
                    }
                }
            },
            circumference: 360,
            rotation: -45,
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
    }

    getColors() {
        return {
            lead: '#B39DDB',
            pipeline: '#673AB7',
            upside: '#27ECCB',
            strong: '#607D8B',
            commit: '#FF9800',
            won: '#1BA436',
            lost: '#F32905'
        };
    }

    listaUsuarios() {
        this.kanbanService.listarUsuarios().subscribe({
            next: (rpta: any) => {
                //console.info('next : ', rpta);
                this.Usuarios = rpta;
                this.Usuarios.unshift(
                    (this.Usuario = {
                        idusuario: 0,
                        name: 'TODOS'
                    })
                );
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
    }

    getDataFunnel(datos: any) {
        datos.tipo = 2;
        console.log('getDataFunnel', datos);
        const obtenerFunnel = this.oportunidadService.obtenerFunnel(datos).subscribe({
            next: (rpta: any) => {
                console.log('getDataFunnel', rpta[0].data[0]);
                this.cargarDataChart(rpta[0].data[0].dataPoints);
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
    }

    getDataFunnel1(datos: any) {
        datos.tipo = 2;
        const obtenerFunnel = this.oportunidadService.obtenerFunnel1(datos).subscribe({
            next: (rpta: any) => {
                //console.log('getDataFunnel1', rpta[0].data[0]);
                this.cargarDataChart(rpta[0].data[0].dataPoints);
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
    }

    getDataFunnel2(datos: any) {
        datos.tipo = 2;
        const obtenerFunnel = this.oportunidadService.obtenerFunnel2(datos).subscribe({
            next: (rpta: any) => {
                //console.log('getDataFunnel2', rpta[0]);
                this.cargarDataChart(rpta[0].data[0].dataPoints);
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
    }

    mostrarDetalle(valor: number) {
        console.log('mostrarDetalle...', valor);
        console.log('IA_data...', this.IA_data);

        const objeto = {
            ...this.IA_data,
            idlista: valor
        };
        this.cargarOportunidades(objeto);
    }

    cargarOportunidades(datos: any) {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...';

        const $listarOportunidad = this.oportunidadService.oportunidadesporEstado(datos).subscribe({
            next: (rpta: any) => {
                console.log('Porcenta de participación de Oportunidad por Estado:', rpta);
                if (rpta.length === 0) {
                    this.setSpinner(false);
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Aviso...!',
                        detail: 'No existen registros...'
                    });
                    return;
                }

                const total = rpta.reduce((acc: number, x: any) => acc + x.monto, 0);
                //  Agregar porcentaje a cada item
                const resultado = rpta.map((x: { monto: number }) => ({
                    ...x,
                    porcentaje_est: total === 0 ? 0 : +((x.monto / total) * 100).toFixed(2)
                }));

                console.log(resultado);

                const refItemx = this.dialogService.open(CPorcentajeOpo, {
                    data: resultado,
                    header: 'Oportunidades por Estado y Participación (%) - ' + resultado[0].nomlista,
                    closeOnEscape: false,
                    styleClass: 'testDialog',
                    width: '60%',
                    closable: true
                });
                this.setSpinner(false);
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
            complete: () => {}
        });
        this.$listSubcription.push($listarOportunidad);
    }
}
