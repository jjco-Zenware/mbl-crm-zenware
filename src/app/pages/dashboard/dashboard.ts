import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { Subscription } from 'rxjs';
import { Users } from '../model/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { KanbanService } from '../kanban/service/kanban.service';
import { UtilitariosService } from '../service/utilitarios.service';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { constantesLocalStorage, mensajesQuestion } from '../model/constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedAppService } from '../shared/sharedApp.service';
import { CBusinessCase } from '../shared/c-business-case/c-business-case';
import { CCotizacion } from '../shared/c-cotizacion/c-cotizacion';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { CDistOportunidad } from './c-dist-oportunidad/c-dist-oportunidad';
import { CLstOportunidad } from './c-lst-oportunidad/c-lst-oportunidad';

//Chart.register(ChartDataLabels);

@Component({
    selector: 'app-dashboard',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, CBusinessCase, CCotizacion, CDistOportunidad, CLstOportunidad],
    templateUrl: './dashboard.html',
    standalone: true,   
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, KanbanService]
})

export class Dashboard implements OnInit {
    //tareasDias:any;
    nomUsuario!: string;
    nomPerfil!: string;

    $listSubcription: Subscription[] = [];
    Vendedor= signal<Users[]>([]);
    Preventa= signal<Users[]>([]);
    Usuario= signal<Users[]>([]);
    Clientes = signal<any[]>([]);
    Proveedores = signal<any[]>([]);
    idproveedor: number = 0;
    idcliente: number = 0;
    events = signal<any[]>([]);
    idestado: number = 0;
    idQ: number = 0;
    idpreventa: number = 0;
    idvendedor: number = 0;
    Cliente: any;
    Proveedor: any;
    event: any;
    dataCT: any;
    //dataCTlst:any;
    idperfil: number = 0;
    verDashboard= signal<boolean>(true);
    visQuote= signal<boolean>(false);
    visBussines= signal<boolean>(false);
    codigoBC: string = '';
    annio!: Date;
    //lstQ: any[]=[];
    lstEnti= signal<any[]>([]);
    tipoentidad: string = 'T';
    blockedDocumentk= signal<boolean>(false);
    mensajeSpinner: string = 'Cargando...!';
    selectedQ= signal<any[]>([]);
    selectedEstados= signal<any[]>([]);
    // selectedQ: any[] = [{ id: 0, desQ: 'TODOS' }];
    lstQ = [
        { id: 1, desQ: 'Q1' },
        { id: 2, desQ: 'Q2' },
        { id: 3, desQ: 'Q3' },
        { id: 4, desQ: 'Q4' },
    ];

    // events = [
    //     { id: 1, title: 'LEAD' },
    //     { id: 2, title: 'PIPELINE' },
    //     { id: 3, title: 'UPSIDE' },
    //     { id: 4, title: 'STRONG' },
    //     { id: 5, title: 'COMMIT' },
    //     { id: 6, title: 'WON' },
    //     { id: 7, title: 'LOST' },
    // ];

    lstDesMontos = [
        { id: 0, desmonto: 'TODOS' },
        { id: 1, desmonto: '0K - 20K' },
        { id: 2, desmonto: '21K - 50K' },
        { id: 3, desmonto: '51k - 100k' },
        { id: 4, desmonto: '101k - 500k' },
        { id: 5, desmonto: '501k - 1M...' },
    ];

    lstNotificacion: any;
    completos: number = 0;
    pendientes: number = 0;
    porcierre: number = 0;
    idtipoprod: number = 0;
    lstTipoProducto= signal<any[]>([]);
    idmonto: number = 0;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private kanbanService: KanbanService,
        private utilitariosService: UtilitariosService,
        private oportunidadService: OportunidadService,
        protected router: Router,
    ) {
        console.log('constantesLocalStorage', constantesLocalStorage);

        this.nomUsuario = constantesLocalStorage.nombreUsuario;
        this.nomPerfil = '@' + constantesLocalStorage.nomperfil;
        this.idperfil = constantesLocalStorage.idperfil;

        // this.route.data.subscribe((data) => {
        //     this.tareasDias = data['dataTareaDias']
        //     console.log('dataTareaDias', this.tareasDias);
        // });
    }

    setSpinner(valor: boolean) {
        this.blockedDocumentk.set(valor);
    }

    ngOnInit(): void {
        this.annio = this.utilitariosService.obtenerFechaActual();
        this.selectedQ.set(this.lstQ);
        //this.selectedEstados = this.events;

        this.getListakanban();

        this.listaClientes();
        this.listaProveedor();
        this.listaVendedor();
        this.listaPreventa();
        this.listaTipoProducto();

        this.lstEnti.set([
            { id: 'T', name: 'TODOS' },
            { id: 'P', name: 'SECTOR PRIVADO' },
            { id: 'E', name: 'SECTOR PÚBLICO' },
        ]);
        this.consultarData(); 
        //this.lstCantTareas();
    }

    listaVendedor() {
        this.kanbanService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                //console.info('next : ', rpta);
                this.Vendedor.set(rpta);

                let objeto = {
                    idusuario: 0,
                    name: 'TODOS'
                }

                this.Vendedor.update(objeto => [...objeto]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico,
                });
            },
            complete: () => { },
        });
    }

    listaPreventa() {
        this.kanbanService.listarUsuariosxPerfil(3).subscribe({
            next: (rpta: any) => {
                //console.info('next : ', rpta);
                this.Preventa.set(rpta);

                let objeto = {
                    idusuario: 0,
                    name: 'TODOS'
                }

                this.Preventa.update(objeto => [...objeto]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico,
                });
            },
            complete: () => { },
        });
    }

    listaClientes() {
        let tiporol = 'CLI';
        this.kanbanService.obtenerClientes(tiporol).subscribe({
            next: (rpta: any) => {
                this.Clientes.set(rpta);

                let objeto = {
                    idcliente: 0,
                    nomcomercial: 'TODOS'
                }
                this.Clientes.update(objeto => [...objeto]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico,
                });
            },
            complete: () => { },
        });
    }

    listaProveedor() {
        let tiporol = 'PRO';
        this.kanbanService.obtenerClientes(tiporol).subscribe({
            next: (rpta: any) => {
                this.Proveedores.set(rpta);

                let objeto = {
                    idcliente: 0,
                    razonsocial: 'TODOS'
                }
                this.Proveedores.update(objeto => [...objeto]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico,
                });
            },
            complete: () => { },
        });
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    getListakanban() {
        const $getListakanban = this.kanbanService
            .ListaKanban()
            .subscribe({
                next: (rpta: any) => {
                    this.events.set(rpta);
                     this.selectedEstados.set(this.events());
        // console.log('events', this.events);
        // console.log('selectedEstados', this.selectedEstados);
                },
                error: (err) => {
                    console.error('error : ', err);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensajesQuestion.msgErrorGenerico,
                    });
                },
                complete: () => {
        this.consultarData(); },
            });
        this.$listSubcription.push($getListakanban);
    }

    consultarData(): void {
        console.log('annio xxx', this.annio);
        if (this.annio === null) {
            this.messageService.add({
                severity: 'info',
                summary: 'Validación',
                detail: 'Seleccionar Año',
            });
            return;
        }

        // console.log('annio xxx', this.annio);
        console.log('annio', this.annio.getFullYear());

        console.log('this.selectedEstados', this.selectedEstados);
        let lstEstado: number[] = [];
        this.selectedEstados().forEach((item) => {
            lstEstado.push(parseInt(item.listId));
        });

        console.log('lstEstado', lstEstado.toString());

        let lstQ: string[] = [];
        this.selectedQ().forEach((item) => {
            lstQ.push(item.id);
        });
        console.log('lstQ', lstQ.toString());
        //     if (this.selectedEstados.length === 0) {
        //         this.messageService.add({severity: 'info', summary: 'Validación', detail: 'Seleccionar Estado' });
        //         return;
        //     }
        //   if (lstQ.length === 0) {
        //     this.messageService.add({severity: 'info', summary: 'Validación', detail: 'Seleccionar Trimestre' });
        //     return;
        // }

        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            idvendedor: this.idvendedor,
            idpreventa: this.idpreventa,
            idtipoprod: this.idtipoprod,
            idcliente: this.idcliente,
            idlista: this.idestado,
            annio: this.annio.getFullYear(),
            q: this.idQ,
            idproveedor: this.idproveedor,
            tipoentidad: this.tipoentidad,
            estadoString: lstEstado.toString(),
            qString: lstQ.toString(),
            porcierre: this.porcierre === null ? 0 : this.porcierre,
            idmonto: this.idmonto
        };
        console.log('consultarData', objeto);

        const {
            idusuario,
            idvendedor,
            idpreventa,
            idtipoprod,
            idcliente,
            idlista,
            annio,
            q,
            idproveedor,
            tipoentidad,
            estadoString,
            qString,
            porcierre,
            idmonto
        } = objeto;
        this.dataCT = {
            idusuario,
            idvendedor,
            idpreventa,
            idtipoprod,
            idcliente,
            idlista,
            annio,
            q,
            idproveedor,
            tipoentidad,
            estadoString,
            qString,
            porcierre,
            idmonto
        };

        
        
    }

    consultarData2(): void {
        console.log('annio xxx', this.annio);
        if (this.annio === null) {
            this.messageService.add({
                severity: 'info',
                summary: 'Validación',
                detail: 'Seleccionar Año',
            });
            return;
        }

        // console.log('annio xxx', this.annio);
        console.log('annio', this.annio.getFullYear());

        console.log('this.selectedEstados', this.selectedEstados);
        let lstEstado: number[] = [];
        this.selectedEstados().forEach((item) => {
            lstEstado.push(parseInt(item.listId));
        });

        console.log('lstEstado', lstEstado.toString());

        let lstQ: string[] = [];
        this.selectedQ().forEach((item) => {
            lstQ.push(item.id);
        });
        console.log('lstQ', lstQ.toString());
            if (this.selectedEstados().length === 0) {
                this.messageService.add({severity: 'info', summary: 'Validación', detail: 'Seleccionar Estado' });
                return;
            }
          if (lstQ.length === 0) {
            this.messageService.add({severity: 'info', summary: 'Validación', detail: 'Seleccionar Trimestre' });
            return;
        }

         this.lstCantTareas();

        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            idvendedor: this.idvendedor,
            idpreventa: this.idpreventa,
            idtipoprod: this.idtipoprod,
            idcliente: this.idcliente,
            idlista: this.idestado,
            annio: this.annio.getFullYear(),
            q: this.idQ,
            idproveedor: this.idproveedor,
            tipoentidad: this.tipoentidad,
            estadoString: lstEstado.toString(),
            qString: lstQ.toString(),
            porcierre: this.porcierre === null ? 0 : this.porcierre,
            idmonto : this.idmonto
        };
        console.log('consultarData', objeto);

        const {
            idusuario,
            idvendedor,
            idpreventa,
            idtipoprod,
            idcliente,
            idlista,
            annio,
            q,
            idproveedor,
            tipoentidad,
            estadoString,
            qString,
            porcierre,
            idmonto
        } = objeto;
        this.dataCT = {
            idusuario,
            idvendedor,
            idpreventa,
            idtipoprod,
            idcliente,
            idlista,
            annio,
            q,
            idproveedor,
            tipoentidad,
            estadoString,
            qString,
            porcierre,
            idmonto
        };
    }

    verQuote(dato: any) {
        console.log(' verQuote :  ', dato);
        this.verDashboard.set(false);
        this.visQuote.set(true);
        this.visBussines.set(false);

        const {
            id,
            razonsocial,
            description,
            nommoneda,
            startDate,
            nomcreador,
            tipocambio,
            idlista,
        } = dato;
        this.dataCT = {
            id,
            razonsocial,
            description,
            nommoneda,
            startDate,
            nomcreador,
            tipocambio,
            idlista,
        };
    }

    verBussines(dato: any) {
        console.log(' verBussines :  ', dato);

        this.verDashboard.set(false);
        this.visBussines.set(true);
        this.visQuote.set(false);

        this.codigoBC = dato.id;
    }

    getOportunidadKanban(dato: any) {
        console.log('getOportunidadKanban retornando del quote... ', dato);
        this.verDashboard.set(true);
        this.visQuote.set(false);
        this.visBussines.set(false);
        this.getListakanban();
        this.consultarData();
    }

    actualizarKanban() {
        console.log('actualizar getKanbanList :  ');
        //this.getKanbanList()
    }

    listarNotificaciones(){        
        const listarNotificaciones = this.kanbanService.ListarNotificacion(constantesLocalStorage.idusuario)
            .subscribe({
                next: (rpta:any) => {
                    console.log("listarNotificaciones : ", rpta);
                    this.lstNotificacion = rpta;
                    for (let i = 0; i < this.lstNotificacion.length; i++) {
                        this.messageService.add({severity: 'warn', detail: this.lstNotificacion[i].msjnoti });
                    }
                },
                error:(err)=>{
                    console.error('error : ',err)                    
                },
                complete:() => { }
            });
        this.$listSubcription.push(listarNotificaciones)
    }

    direcTareas() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando Tareas...';
        this.router.navigate(['/pages/oportunidades/listatareas']);
    }


    lstCantTareas(){ 
        this.completos = 0;
        this.pendientes = 0;
        
        let usuario = 0;
        switch (constantesLocalStorage.idperfil) {
            case 4:
                if (this.idvendedor === 0) {
                    usuario = 0;
                } else {
                    usuario = this.idvendedor;
                }
                break;
            default:
                usuario = constantesLocalStorage.idusuario;
                break;
        }

        const objeto = {
            annio : this.annio.getFullYear(),
            idusuario : usuario
        };
        const lstCantTareas = this.kanbanService.lstCantTareas(objeto)
            .subscribe({
                next: (rpta:any) => {
                    console.log("lstCantTareas : ", rpta);
                    this.completos = rpta[0].completo;
                    this.pendientes = rpta[1].completo;
                },
                error:(err)=>{
                    console.error('error : ',err)                    
                },
                complete:() => { }
            });
        this.$listSubcription.push(lstCantTareas)
    }

    listaTipoProducto() {
        this.kanbanService.listarTipoProducto().subscribe({
            next: (rpta: any) => {
            //console.info('next : ', rpta);
            this.lstTipoProducto.set(rpta);

             let objeto = {
                    idtipoprod: 0,
                    nomtipoproducto: 'TODOS'
                }
                this.lstTipoProducto.update(objeto => [...objeto]);

            },
            error: (err) => {
            console.info('error : ', err);
            this.messageService.clear();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: mensajesQuestion.msgErrorGenerico,
            });
            },
            complete: () => {
            },
        });
    }
}
