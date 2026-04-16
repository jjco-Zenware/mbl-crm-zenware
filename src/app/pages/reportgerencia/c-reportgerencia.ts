import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { SharedAppService } from '../shared/sharedApp.service';
import { UtilitariosService } from '../service/utilitarios.service';
import { Users } from '../model/interfaces';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportGerenciaService } from './reportgerencia.service';
import { constantesLocalStorage, mensajesQuestion } from '../model/constantes';
import { KanbanService } from '../kanban/service/kanban.service';
import { CPorcentajeOpoComponent } from './c-porcentajeopor/c-porecentajeopo.component';

@Component({
    selector: 'app-c-reportgerencia',
    templateUrl: './c-reportgerencia.html',
    styleUrls: ['./c-reportgerencia.scss'],
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, ReportGerenciaService, KanbanService]
})
export class CReportGerenciaComponent implements OnInit {
    //tareasDias:any;
    nomUsuario!: string;
    nomPerfil!: string;

    $listSubcription: Subscription[] = [];
    Vendedor: Users[] = [];
    idperfil = signal<number>(0);
    chartMonthlyData: any;
    chartMonthlyOptions: any;
    basicData: any;
    basicOptions: any;
    chartMonthlyData2: any;
    chartMonthlyOptions2: any;
    doughnutData: any;
    doughnutOptions: any;
    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = '';
    frmDatos!: FormGroup;
    totalCloCon= signal<number>(0);
    totalCloCal= signal<number>(0);
    totalCloInv= signal<number>(0);
    totalCloPre= signal<number>(0);
    totalCloCie= signal<number>(0);
    totalCloCer= signal<number>(0);
    totalCloPer= signal<number>(0);
    totales = signal<number>(0);
    lstOportunidades: any[] = [];
    lstNroOpor: any[] = [];
    lstMontoOpor: any[] = [];
    totOportunidades = signal<number>(0);
    totMontoOportunidades = signal<number>(0);
    totopormes = signal<number>(0);
    dailyTasks: any[] = [];
    totusersession = signal<number>(0);
    lstMontoOporLead: any[] = [];
    lstMontoOporPipe: any[] = [];
    lstMontoOporUpsi: any[] = [];
    lstMontoOporStro: any[] = [];
    lstMontoOporComm: any[] = [];
    lstMontoOporWon: any[] = [];
    lstMontoOporLost: any[] = [];
    selectedQ: any[] = [];
    lstQ = [
        { id: 1, desQ: 'Q1' },
        { id: 2, desQ: 'Q2' },
        { id: 3, desQ: 'Q3' },
        { id: 4, desQ: 'Q4' }
    ];

    lstOportProyec: any[] = [];
    totoportdic = signal<number>(0);
    totoportnov = signal<number>(0);
    totoportoct = signal<number>(0);
    totoportset = signal<number>(0);
    totoportago = signal<number>(0);
    totoportjul = signal<number>(0);
    totoportjun = signal<number>(0);
    totoportmay = signal<number>(0);
    totoportabr = signal<number>(0);
    totoportmar = signal<number>(0);
    totoportfeb = signal<number>(0);
    totoportene = signal<number>(0);

    lstoportNro: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private utilitariosService: UtilitariosService,
        private fb: FormBuilder,
        public dialogService: DialogService,
        private reportGerenciaService: ReportGerenciaService,
        private kanbanService: KanbanService
    ) {
        console.log('constantesLocalStorage', constantesLocalStorage);

        this.nomUsuario = constantesLocalStorage.nombreUsuario;
        this.nomPerfil = '@' + constantesLocalStorage.nomperfil;
        this.idperfil.set(constantesLocalStorage.idperfil);
    }

    ngOnInit(): void {
        this.createFrm();
        this.selectedQ = this.lstQ;

        this.listaVendedor();

        //this.consultarData();
        //this.monthlyChartInit2();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    doughnutChartInit() {
        this.doughnutData = this.getDoughnutData();
        this.doughnutOptions = this.getDoughnutOptions();
    }

    listaUserSession() {
        const objeto = {
            idusuario: this.frmDatos.value.idvendedor,
            annio: this.frmDatos.value.fecini.getFullYear()
        };

        this.kanbanService.getUserSession(objeto).subscribe({
            next: (rpta: any) => {
                console.info('listaUserSession : ', rpta);
                this.dailyTasks = rpta;
                this.totusersession = this.dailyTasks.reduce((suma, item) => suma + item.total, 0);
                ///this.frmDatos.get('idusuario')?.setValue(constantesLocalStorage.idusuario);
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

    listaVendedor() {
        this.kanbanService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                console.info('listaVendedor : ', rpta);
                this.Vendedor = rpta;
                this.frmDatos.get('idvendedor')?.setValue(rpta[0].idusuario);
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
            complete: () => {
                this.consultarData();
            }
        });
    }

    createFrm() {
        this.frmDatos = this.fb.group({
            fecini: [{ value: this.utilitariosService.obtenerFechaInicioMes(), disabled: false }],
            fecfin: [{ value: this.utilitariosService.obtenerFechaFinMes(), disabled: false }],
            //idusuario: [{ value: constantesLocalStorage.idusuario, disabled: false }],
            idvendedor: [{ value: 0, disabled: false }]
        });
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    consultarData(): void {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...!';
        this.getDataFunnel();
        this.consultarData2();

        let lstQ: string[] = [];
        this.selectedQ.forEach((item) => {
            lstQ.push(item.id);
        });

        const objeto = {
            idusuario: this.frmDatos.value.idvendedor,
            annio: this.frmDatos.value.fecini.getFullYear(),
            qString: lstQ.toString()
        };

        const $getListar = this.reportGerenciaService.obtenerOportunidadNroMonto(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta getListar', rpta);

                this.lstOportunidades = rpta;
                this.lstMontoOpor = [];
                //this.lstNroOpor = [];
                this.lstOportunidades.forEach((element) => {
                    if (element.tipo === 'A') {
                        this.lstMontoOpor = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                        this.totMontoOportunidades.set(element.total);
                        this.lstOportProyec = element.lstoport;
                    }
                    if (element.tipo === 'B') {
                        this.totOportunidades.set(
                            [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre].reduce(
                                (acc, val) => acc + (val ?? 0),
                                0
                            )
                        );
                    }
                    if (element.tipo === 'L') {
                        this.lstMontoOporLead = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                    if (element.tipo === 'U') {
                        this.lstMontoOporUpsi = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                    if (element.tipo === 'P') {
                        this.lstMontoOporPipe = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                    if (element.tipo === 'S') {
                        this.lstMontoOporStro = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                    if (element.tipo === 'C') {
                        this.lstMontoOporComm = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                    if (element.tipo === 'W') {
                        this.lstMontoOporWon = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                    if (element.tipo === 'LO') {
                        this.lstMontoOporLost = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    }
                });
            },
            error: (err) => {
                this.setSpinner(false);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {
                this.monthlyChartInit();
                this.doughnutChartInit();
                //this.listaUserSession();
            }
        });
        this.$listSubcription.push($getListar);
    }

    consultarData2(): void {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...!';

        let lstQ: string[] = [];
        this.selectedQ.forEach((item) => {
            lstQ.push(item.id);
        });

        const objeto = {
            idusuario: this.frmDatos.value.idvendedor,
            annio: this.frmDatos.value.fecini.getFullYear(),
            qString: lstQ.toString()
        };

        const $getListar = this.reportGerenciaService.obtenerOportunidadNroOpor(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta getListar nro opor', rpta);

                let listas = rpta;
                this.lstNroOpor = [];
                listas.forEach((element: { enero: any; febrero: any; marzo: any; abril: any; mayo: any; junio: any; julio: any; agosto: any; xxxx: any; octubre: any; noviembre: any; diciembre: any; total: number; lstopor: any }) => {
                    this.lstNroOpor = [element.enero, element.febrero, element.marzo, element.abril, element.mayo, element.junio, element.julio, element.agosto, element.xxxx, element.octubre, element.noviembre, element.diciembre];
                    this.totopormes.set(element.total);

                    this.lstoportNro = element.lstopor;

                    this.totoportdic.set(element.diciembre);
                    this.totoportnov.set(element.noviembre);
                    this.totoportoct.set(element.octubre);
                    this.totoportset.set(element.xxxx);
                    this.totoportago.set(element.agosto);
                    this.totoportjul.set(element.julio);
                    this.totoportjun.set(element.junio);
                    this.totoportmay.set(element.mayo);
                    this.totoportabr.set(element.abril);
                    this.totoportmar.set(element.marzo);
                    this.totoportfeb.set(element.febrero);
                    this.totoportene.set(element.enero);
                });
            },
            error: (err) => {
                this.setSpinner(false);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {
                this.monthlyChartInit2();
            }
        });
        this.$listSubcription.push($getListar);
    }

    monthlyChartInit() {
        this.chartMonthlyData = this.getChartData();
        this.chartMonthlyOptions = this.getChartOptions();

        this.setSpinner(false);
    }

    getChartData() {
        const { limeColor, amberColor, orangeColor, blueColor, lightblueColor, cyanColor, tealColor, greenColor, lightgreenColor, LeadColor, PipeColor, UpsiColor, StroColor, CommColor, WonColor, LostColor } = this.getColors();

        return {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    type: 'bar',
                    label: 'Contacto',
                    data: this.lstMontoOporLead,
                    backgroundColor: LeadColor,
                    borderWidth: 1,
                    fill: true
                },
                {
                    type: 'bar',
                    label: 'Calificación',
                    data: this.lstMontoOporPipe,
                    backgroundColor: PipeColor,
                    borderWidth: 1,
                    fill: true
                },
                {
                    type: 'bar',
                    label: 'Investigación',
                    data: this.lstMontoOporUpsi,
                    backgroundColor: UpsiColor,
                    borderWidth: 1,
                    fill: true
                },
                {
                    type: 'bar',
                    label: 'Presentación',
                    data: this.lstMontoOporStro,
                    backgroundColor: StroColor,
                    borderWidth: 1,
                    fill: true
                },
                {
                    type: 'bar',
                    label: 'Cierre',
                    data: this.lstMontoOporComm,
                    backgroundColor: CommColor,
                    borderWidth: 1,
                    fill: true
                },
                {
                    type: 'bar',
                    label: 'Cerrado',
                    data: this.lstMontoOporWon,
                    backgroundColor: WonColor,
                    borderWidth: 1,
                    fill: true
                },
                {
                    type: 'bar',
                    label: 'Perdido',
                    data: this.lstMontoOporLost,
                    backgroundColor: LostColor,
                    borderWidth: 1,
                    fill: true
                }
            ]
        };
    }

    getChartOptions() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const gridLinesColor = getComputedStyle(document.body).getPropertyValue('--surface-border') || 'rgba(160, 167, 181, .3)';
        const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-family');
        return {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        fontFamily,
                        color: textColor
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    stacked: true,
                    ticks: {
                        fontFamily,
                        color: textColor
                    },
                    grid: {
                        color: gridLinesColor
                    }
                },
                x: {
                    stacked: true,
                    categoryPercentage: 0.9,
                    barPercentage: 0.8,
                    ticks: {
                        fontFamily,
                        color: textColor
                    },
                    grid: {
                        color: gridLinesColor
                    }
                }
            }
        };
    }

    getColors() {
        const isLight = true;
        return {
            pinkColor: isLight ? '#EC407A' : '#F48FB1',
            purpleColor: isLight ? '#AB47BC' : '#CE93D8',
            deeppurpleColor: isLight ? '#7E57C2' : '#B39DDB',
            indigoColor: isLight ? '#5C6BC0' : '#9FA8DA',
            blueColor: isLight ? '#42A5F5' : '#90CAF9',
            lightblueColor: isLight ? '#29B6F6' : '#81D4FA',
            cyanColor: isLight ? '#00ACC1' : '#4DD0E1',
            tealColor: isLight ? '#26A69A' : '#80CBC4',
            greenColor: isLight ? '#66BB6A' : '#A5D6A7',
            lightgreenColor: isLight ? '#9CCC65' : '#C5E1A5',
            limeColor: isLight ? '#D4E157' : '#E6EE9C',
            yellowColor: isLight ? '#FFEE58' : '#FFF59D',
            amberColor: isLight ? '#FFCA28' : '#FFE082',
            orangeColor: isLight ? '#FFA726' : '#FFCC80',
            deeporangeColor: isLight ? '#FF7043' : '#FFAB91',
            brownColor: isLight ? '#8D6E63' : '#BCAAA4',
            LeadColor: isLight ? '#9c27b0' : '#9c27b0',
            PipeColor: isLight ? '#673ab7' : '#673ab7',
            UpsiColor: isLight ? '#27eccb' : '#27eccb',
            StroColor: isLight ? '#607d8b' : '#607d8b',
            CommColor: isLight ? '#ff9800' : '#ff9800',
            WonColor: isLight ? '#1ba436' : '#1ba436',
            LostColor: isLight ? '#f32905' : '#f32905'
        };
    }

    monthlyChartInit2() {
        this.chartMonthlyData2 = this.getChartData2();
        this.chartMonthlyOptions2 = this.getChartOptions2();
    }

    getChartData2() {
        const { limeColor, amberColor, orangeColor, blueColor, lightblueColor, cyanColor, tealColor, greenColor, lightgreenColor } = this.getColors();

        return {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'Oportunidades por Mes',
                    data: this.lstNroOpor,
                    borderColor: amberColor,
                    backgroundColor: cyanColor,
                    borderWidth: 1,
                    fill: false
                }
            ]
        };
    }

    getChartOptions2() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const gridLinesColor = getComputedStyle(document.body).getPropertyValue('--surface-border') || 'rgba(160, 167, 181, .3)';
        const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-family');
        return {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        fontFamily,
                        color: textColor
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        fontFamily,
                        color: textColor
                    },
                    grid: {
                        color: gridLinesColor
                    }
                },
                x: {
                    categoryPercentage: 0.9,
                    barPercentage: 0.8,
                    ticks: {
                        fontFamily,
                        color: textColor
                    },
                    grid: {
                        color: gridLinesColor
                    }
                }
            }
        };
    }

    getDoughnutData() {
        const { blueColor, lightblueColor, cyanColor, tealColor, greenColor, deeporangeColor, lightgreenColor, orangeColor } = this.getColors();
        const borderColor = getComputedStyle(document.body).getPropertyValue('--surface-border') || 'rgba(160, 167, 181, .3)';

        return {
            labels: ['Monto Proyectado'],
            datasets: [
                {
                    data: [this.totMontoOportunidades()],
                    backgroundColor: [greenColor],
                    borderColor: orangeColor
                }
            ]
        };
    }

    getDoughnutOptions() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-family');
        return {
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        fontFamily,
                        color: textColor
                    }
                }
            },
            circumference: 180,
            rotation: -90,
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
    }

    cargarDataChart(data: any) {
        //console.log('cargarDataChart', data);
        this.totalCloCon.set(0);
        this.totalCloCal.set(0);
        this.totalCloInv.set(0);
        this.totalCloPre.set(0);
        this.totalCloCie.set(0);
        this.totalCloCer.set(0);
        this.totalCloPer.set(0);
        data.forEach((item: any) => {
            if (item.name === 'CONTACTO') {
                this.totalCloCon.set(item.y);
            }
            if (item.name === 'CALIFICACION') {
                this.totalCloCal.set(item.y);
            }
            if (item.name === 'INVESTIGACION') {
                this.totalCloInv.set(item.y);
            }
            if (item.name === 'PRESENTACION') {
                this.totalCloPre.set(item.y);
            }
            if (item.name === 'CIERRE') {
                this.totalCloCie.set(item.y);
            }
            if (item.name === 'PERDIDO') {
                this.totalCloPer.set(item.y);
            }
            if (item.name === 'CERRADO') {
                this.totalCloCer.set(item.y);
            }
        });
        //this.monthlyChartInit();
    }

    getDataFunnel() {
        if (this.frmDatos.value.idvendedor === 0) {
            return;
        }

        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...!';

        let lstQ: string[] = [];
        this.selectedQ.forEach((item) => {
            lstQ.push(item.id);
        });

        const objeto = {
            annio: this.frmDatos.value.fecini.getFullYear(),
            estadoString: '1,2,3,4,5,6,7',
            idcliente: 0,
            idlista: 0,
            idmonto: 0,
            idpreventa: 0,
            idproveedor: 0,
            idtipoprod: 0,
            idusuario: this.frmDatos.value.idvendedor,
            idvendedor: this.frmDatos.value.idvendedor,
            porcierre: 0,
            q: 0,
            qString: lstQ.toString(),
            tipo: 2,
            tipoentidad: 'T'
        };
        console.log('getDataFunnel objeto', objeto);
        const obtenerReporte = this.reportGerenciaService.obtenerOportunidadReporte(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('getDataFunnel', rpta[0].data[0]);
                this.cargarDataChart(rpta[0].data[0].dataPoints);
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
    }

    cargarOportunidades() {
        //this.setSpinner(true);
        //this.mensajeSpinner = "Cargando...";

        const objeto = {
            oportString: this.lstOportProyec
        };

        const $listarOportunidad = this.reportGerenciaService.oportunidadesProyectadas(objeto).subscribe({
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

                const refItemx = this.dialogService.open(CPorcentajeOpoComponent, {
                    data: resultado,
                    header: 'Oportunidades Proyectadas a Cerrar y Participación (%)',
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

    cargarOportunidadesNuevas() {
        //this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...';

        const objeto = {
            oportString: this.lstoportNro
        };

        const $listarOportunidad = this.reportGerenciaService.oportunidadesProyectadas(objeto).subscribe({
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

                const refItemx = this.dialogService.open(CPorcentajeOpoComponent, {
                    data: resultado,
                    header: 'Oportunidades Nuevas',
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

    vistaPreliminar() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Descargando Vista Preliminar...!';

        let lstQ: string[] = [];
        this.selectedQ.forEach((item) => {
            lstQ.push(item.id);
        });

        const objeto = {
            idusuario: this.frmDatos.value.idvendedor,
            annio: this.frmDatos.value.fecini.getFullYear(),
            qString: lstQ.toString()
        };

        const $cargarOrdenC = this.reportGerenciaService.prcDocumentoDet(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);

                const mediaType = 'application/pdf';
                const blob = new Blob([rpta.body], { type: mediaType });
                const filename = 'REP_GER - ' + this.frmDatos.value.fecini.getFullYear();

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.target = '_blank';
                a.click();

                window.open(url);

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            },
            error: (err) => {
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
        this.$listSubcription.push($cargarOrdenC);
    }

    vistaPreliminarGen() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Descargando Vista Preliminar...!';

        let lstQ: string[] = [];
        this.selectedQ.forEach((item) => {
            lstQ.push(item.id);
        });

        const objeto = {
            idusuario: this.frmDatos.value.idvendedor,
            annio: this.frmDatos.value.fecini.getFullYear(),
            qString: lstQ.toString()
        };

        const $cargarOrdenC = this.reportGerenciaService.prcDocumentoDetGen(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);

                const mediaType = 'application/pdf';
                const blob = new Blob([rpta.body], { type: mediaType });
                const filename = 'REP_GER - ' + this.frmDatos.value.fecini.getFullYear();

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.target = '_blank';
                a.click();

                window.open(url);

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            },
            error: (err) => {
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
        this.$listSubcription.push($cargarOrdenC);
    }
}
