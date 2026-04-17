import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { Subscription } from 'rxjs';
import { Users } from '../model/interfaces';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { KanbanService } from '../kanban/service/kanban.service';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion } from '../model/constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedAppService } from '../shared/sharedApp.service';
import { CBusinessCase } from '../shared/c-business-case/c-business-case';
import { CCotizacion } from '../shared/c-cotizacion/c-cotizacion';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { CDistOportunidad } from './c-dist-oportunidad/c-dist-oportunidad';
import { CLstOportunidad } from './c-lst-oportunidad/c-lst-oportunidad';
import { CLeadReg } from '../lead/lead-reg/lead-reg';

@Component({
    selector: 'app-dashboard',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, CBusinessCase, CCotizacion, CDistOportunidad, CLstOportunidad, CLeadReg],
    templateUrl: './dashboard.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, KanbanService]
})
export class Dashboard implements OnInit, OnDestroy {
    nomUsuario!: string;
    nomPerfil!: string;

    $listSubcription: Subscription[] = [];
    Vendedor = signal<Users[]>([]);
    Preventa = signal<Users[]>([]);
    Usuario = signal<Users[]>([]);
    Clientes = signal<any[]>([]);
    Proveedores = signal<any[]>([]);
    idproveedor: number = 0;
    idcliente: number = 0;
    events = signal<any[]>([]);
    idestado: number = 0;
    idQ: number = 0;
    idpreventa: number = 0;
    idvendedor: number = 0;
    dataCT: any;
    idperfil: number = 0;
    verDashboard = signal<boolean>(true);
    visQuote = signal<boolean>(false);
    visBussines = signal<boolean>(false);
    visMntOportunidad = signal<boolean>(false);
    dataOportunidad: any;
    codigoBC: string = '';
    annio!: Date;
    lstEnti = signal<any[]>([]);
    tipoentidad: string = 'T';
    blockedDocumentk = signal<boolean>(false);
    mensajeSpinner: string = 'Cargando...!';
    selectedQ = signal<any[]>([]);
    selectedEstados = signal<any[]>([]);
    lstQ = [
        { id: 1, desQ: 'Q1' },
        { id: 2, desQ: 'Q2' },
        { id: 3, desQ: 'Q3' },
        { id: 4, desQ: 'Q4' }
    ];
    lstDesMontos = [
        { id: 0, desmonto: 'TODOS' },
        { id: 1, desmonto: '0K - 20K' },
        { id: 2, desmonto: '21K - 50K' },
        { id: 3, desmonto: '51k - 100k' },
        { id: 4, desmonto: '101k - 500k' },
        { id: 5, desmonto: '501k - 1M...' }
    ];

    lstNotificacion: any;
    completos: number = 0;
    pendientes: number = 0;
    porcierre: number = 0;
    idtipoprod: number = 0;
    lstTipoProducto = signal<any[]>([]);
    idmonto: number = 0;

    constructor(
        private messageService: MessageService,
        private kanbanService: KanbanService,
        private utilitariosService: UtilitariosService,
        protected router: Router
    ) {
        
    }

    setSpinner(valor: boolean) {
        this.blockedDocumentk.set(valor);
    }

    ngOnInit(): void {
        console.log('dashboard...', constantesLocalStorage.nombreUsuario);
        this.nomUsuario = constantesLocalStorage.nombreUsuario;
        this.nomPerfil = '@' + constantesLocalStorage.nomperfil;
        this.idperfil = constantesLocalStorage.idperfil;
        
        this.annio = this.utilitariosService.obtenerFechaActual();
        this.selectedQ.set(this.lstQ);
        this.getListakanban();
        this.listaClientes();
        this.listaProveedor();
        this.listaVendedor();
        this.listaPreventa();
        this.listaTipoProducto();
        this.lstEnti.set([
            { id: 'T', name: 'TODOS' },
            { id: 'P', name: 'SECTOR PRIVADO' },
            { id: 'E', name: 'SECTOR PÚBLICO' }
        ]);
        this.consultarData();
    }

    ngOnDestroy() {
        this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }

    listaVendedor() {
        this.kanbanService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                this.Vendedor.set([{ idusuario: 0, name: 'TODOS' }, ...rpta]);
            },
            error: (err) => {
                console.error('listaVendedor error:', err);
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajesQuestion.msgErrorGenerico });
            }
        });
    }

    listaPreventa() {
        this.kanbanService.listarUsuariosxPerfil(3).subscribe({
            next: (rpta: any) => {
                this.Preventa.set([{ idusuario: 0, name: 'TODOS' }, ...rpta]);
            },
            error: (err) => {
                console.error('listaPreventa error:', err);
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajesQuestion.msgErrorGenerico });
            }
        });
    }

    listaClientes() {
        this.kanbanService.obtenerClientes('CLI').subscribe({
            next: (rpta: any) => {
                this.Clientes.set([{ idcliente: 0, nomcomercial: 'TODOS' }, ...rpta]);
            },
            error: (err) => {
                console.error('listaClientes error:', err);
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajesQuestion.msgErrorGenerico });
            }
        });
    }

    listaProveedor() {
        this.kanbanService.obtenerClientes('PRO').subscribe({
            next: (rpta: any) => {
                this.Proveedores.set([{ idcliente: 0, razonsocial: 'TODOS' }, ...rpta]);
            },
            error: (err) => {
                console.error('listaProveedor error:', err);
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajesQuestion.msgErrorGenerico });
            }
        });
    }

    getListakanban() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...!';
        const sub = this.kanbanService.ListaKanban().subscribe({
            next: (rpta: any) => {
                this.events.set(rpta);
                this.selectedEstados.set(this.events());
            },
            error: (err) => {
                this.setSpinner(false);
                console.error('getListakanban error:', err);
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajesQuestion.msgErrorGenerico });
            },
            complete: () => {
                this.consultarData();
                this.setSpinner(false);
            }
        });
        this.$listSubcription.push(sub);
    }

    private buildFiltro() {
        const lstEstado = this.selectedEstados().map((item) => parseInt(item.listId));
        const lstQ = this.selectedQ().map((item) => item.id);
        return {
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
            porcierre: this.porcierre ?? 0,
            idmonto: this.idmonto
        };
    }

    consultarData(): void {
        if (this.annio === null) {
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: 'Seleccionar Año' });
            return;
        }
        this.dataCT = this.buildFiltro();
    }

    consultarData2(): void {
        if (this.annio === null) {
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: 'Seleccionar Año' });
            return;
        }
        if (this.selectedEstados().length === 0) {
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: 'Seleccionar Estado' });
            return;
        }
        const filtro = this.buildFiltro();
        if (!filtro.qString) {
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: 'Seleccionar Trimestre' });
            return;
        }
        this.lstCantTareas();
        this.dataCT = filtro;
    }

    verQuote(dato: any) {
        this.verDashboard.set(false);
        this.visQuote.set(true);
        this.visBussines.set(false);
        this.visMntOportunidad.set(false);
        const { id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio, idlista } = dato;
        this.dataCT = { id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio, idlista };
    }

    verBussines(dato: any) {
        this.verDashboard.set(false);
        this.visBussines.set(true);
        this.visQuote.set(false);
        this.visMntOportunidad.set(false);
        this.codigoBC = dato.id;
    }

    verMntOportunidad(dato: any) {
        this.verDashboard.set(false);
        this.visMntOportunidad.set(true);
        this.visQuote.set(false);
        this.visBussines.set(false);
        this.dataOportunidad = { id: dato.id, paramReg: 'k' };
    }

    getOportunidadKanban(_dato: any) {
        this.verDashboard.set(true);
        this.visQuote.set(false);
        this.visBussines.set(false);
        this.visMntOportunidad.set(false);
        this.getListakanban();
        this.consultarData();
    }

    listarNotificaciones() {
        const sub = this.kanbanService.ListarNotificacion(constantesLocalStorage.idusuario).subscribe({
            next: (rpta: any) => {
                this.lstNotificacion = rpta;
                for (const noti of this.lstNotificacion) {
                    this.messageService.add({ severity: 'warn', detail: noti.msjnoti });
                }
            },
            error: (err) => console.error('listarNotificaciones error:', err)
        });
        this.$listSubcription.push(sub);
    }

    direcTareas() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando Tareas...';
        this.router.navigate(['/pages/oportunidades/listatareas']);
    }

    lstCantTareas() {
        this.completos = 0;
        this.pendientes = 0;
        const usuario = constantesLocalStorage.idperfil === 4 ? this.idvendedor : constantesLocalStorage.idusuario;
        const sub = this.kanbanService.lstCantTareas({ annio: this.annio.getFullYear(), idusuario: usuario }).subscribe({
            next: (rpta: any) => {
                this.completos = rpta[0].completo;
                this.pendientes = rpta[1].completo;
            },
            error: (err) => console.error('lstCantTareas error:', err)
        });
        this.$listSubcription.push(sub);
    }

    listaTipoProducto() {
        this.kanbanService.listarTipoProducto().subscribe({
            next: (rpta: any) => {
                this.lstTipoProducto.set([{ idtipoprod: 0, nomtipoproducto: 'TODOS' }, ...rpta]);
            },
            error: (err) => {
                console.error('listaTipoProducto error:', err);
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajesQuestion.msgErrorGenerico });
            }
        });
    }
}
