import { Component, OnInit, Input, ChangeDetectionStrategy, ViewChild, OnDestroy, signal } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { KanbanCard } from '../model/interfaces';
import { KanbanService } from '../kanban/service/kanban.service';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { SharedAppService } from '../shared/sharedApp.service';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../model/constantes';
import { CListadoFile } from '../lead/c-listado-file/c-listado-file';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilitariosService } from '../service/utilitarios.service';
import { CBusinessCase } from '../shared/c-business-case/c-business-case';
import { CCotizacion } from '../shared/c-cotizacion/c-cotizacion';
import { CLeadReg } from '../lead/lead-reg/lead-reg';
import { mAccion } from '../oportunidad/m-acciones/m-accion';
import { CalOportunidad } from '../calificaroportunidad/calificaroportunidad';

@Component({
    selector: 'app-lista-opor',
    templateUrl: './lista-opor.html',
    styleUrls: ['./lista-opor.scss'],
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent, CBusinessCase, CCotizacion, CLeadReg, CalOportunidad],
    standalone: true,
    providers: [MessageService, DialogService, SharedAppService, KanbanService, ConfirmationService, UtilitariosService]
})
export class ClistaOpor implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
    cardList = signal<KanbanCard[]>([]);
    @Input() title!: string;
    @ViewChild('menu') menu!: Menu;

    oportunidad!: KanbanCard;
    headerTitle: any;
    blockedDocument = signal<boolean>(false);
    menuItems: MenuItem[] = [];
    menuItem!: MenuItem;

    modalvisible: boolean = false;
    errorMensaje: string = '';
    visQuote = signal<boolean>(false);
    visBussines = signal<boolean>(false);
    dataCT: any;
    dataBC: any;
    events = signal<any[]>([]);
    selectedProdColor: string = '#27ECCB';

    codigoBC: string = '';
    cols: any[] = [];
    mensajeSpinner: string = '';
    vistaLista = signal<boolean>(true);
    frmDatos!: FormGroup;
    dataOportunidad: any;
    visMntOportunidad = signal<boolean>(false);
    visCalOportunidad = signal<boolean>(false);

    constructor(
        private serviceSharedApp: SharedAppService,
        private oportunidadService: OportunidadService,
        public dialogService: DialogService,
        private listaKanbanService: KanbanService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService
    ) {}

    ngOnInit(): void {
        this.getListakanban();
        this.createFrm();

        this.cols = [
            { field: 'id', header: 'OPORTUNIDAD' },
            { field: 'title', header: 'OPORTUNIDAD' },
            { field: 'nomcreador', header: 'VENDEDOR' },
            { field: 'nompreventa', header: 'PREVENTA' },
            { field: 'nomcomercial', header: 'CLIENTE' },
            //{ field: 'nomproveedor', header: 'PROVEEDOR' },
            { field: 'monto', header: 'MONTO' },
            { field: 'nomlista', header: 'ESTADO' },
            { field: 'startDate', header: 'FECHA' }
        ];
        this.actualizarLista();
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    createFrm() {
        this.frmDatos = this.fb.group({
            fechaini: [
                {
                    value: this.utilitariosService.obtenerFechaInicioMes(),
                    disabled: false
                }
            ],
            fechafin: [
                {
                    value: this.utilitariosService.obtenerFechaFinMes(),
                    disabled: false
                }
            ],
            idusuario: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false
                }
            ],
            idcliente: [
                {
                    value: 0,
                    disabled: false
                }
            ],
            idoportunidad: [
                {
                    value: 0,
                    disabled: false
                }
            ],
            idvendedor: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false
                }
            ]
        });
    }

    toggleMenu(event: Event, data: KanbanCard) {
        if (data.acciones) {
            this.menuItems = data.acciones.map((item: any) => ({
                label: item.nomtrx,
                icon: 'pi pi-cog',
                command: () => this.onAccion(item)
            }));
            this.oportunidad = data;
            this.menu.toggle(event);
        }
    }

    onAccion(item: any) {
        // placeholder: implementar acción según item.idtrx
        console.log('onAccion', item, this.oportunidad);
    }

    /*onVer(data: KanbanCard) {
        //console.log('dataxxxxxxx...', data);
        const ref = this.dialogService.open(CDetalleOportunidadComponent, {
            data: data,
            header: 'N° ' + data.id +' - '+ data.title,
            closeOnEscape: false,
            styleClass: 'testDialog',
            width: '60%'
        });
    }*/

    businessCase(data: KanbanCard) {
        this.vistaLista.set(false);
        this.visQuote.set(false);
        this.visBussines.set(true);
        this.visMntOportunidad.set(false);
        this.visCalOportunidad.set(false);

        this.codigoBC = data.id;
    }

    quote(data: KanbanCard) {
        console.log('data : ', data);
        this.vistaLista.set(false);
        this.visBussines.set(false);
        this.visQuote.set(true);
        this.visMntOportunidad.set(false);

        const { id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio } = data;
        this.dataCT = { id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio };
    }

    anexos(dato: any, param: string) {
        console.log('anexos : ', dato);
        const ref = this.dialogService.open(CListadoFile, {
            data: { idoportunidad: dato.id, codtipoproc: 1, idnroproceso: 0, parametro: param },
            header: dato.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true
        });
        if (ref) {
            ref.onClose.subscribe(() => {
                this.actualizarLista();
            });
        }
    }

    getOportunidad(dato: boolean) {
        this.vistaLista.set(true);
        this.visBussines.set(false);
        this.visQuote.set(false);
        this.visMntOportunidad.set(false);
        this.visCalOportunidad.set(false);

        this.actualizarLista();
    }

    getListakanban() {
        const $getListakanban = this.listaKanbanService.ListaKanban().subscribe({
            next: (rpta: any) => {
                console.log('rpta getListakanban : ', rpta);
                this.events.set(rpta);
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
        this.$listSubcription.push($getListakanban);
    }

    actualizarLista() {
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;
        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            fechaini: this.frmDatos.value.fechaini,
            fechafin: this.frmDatos.value.fechafin
        };

        const $OportunidadesLista = this.oportunidadService.listaOportunidad(objeto).subscribe({
            next: (rpta: any) => {
                this.cardList.set(rpta);
                console.log('rpta actualizarLista : ', rpta);
                this.setSpinner(false);
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($OportunidadesLista);
    }

    verMntOportunidad(dato: any) {
        this.visMntOportunidad.set(true);
        this.visCalOportunidad.set(false);
        this.vistaLista.set(false);
        this.visBussines.set(false);
        this.visQuote.set(false);
        this.dataOportunidad = { id: dato.id, paramReg: 'k' };
    }

    agregarAccion(data: any, tipo: number) {
        console.log('data...', data);
        data.tipopro = tipo;
        data.idtarea = 0;    
        data.idoportunidad = data.id;        

        console.log('onAccion...', data.idtarea);

        const ref = this.dialogService.open(mAccion, {
            data: data,
            header: 'Agregar Acción',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '35%'
        });

        if (ref) {
            ref.onClose.subscribe((rpta: any) => {
                //this.cargarOportunidades();
                console.log('onClose', rpta);
                if (rpta !== undefined) {
                    ref.onClose.subscribe(() => {
                        this.actualizarLista();
                    });
                }
            });
        }
    }

    calificarOportunidad(dato: any) {
        this.visMntOportunidad.set(false);
        this.visCalOportunidad.set(true);
        this.vistaLista.set(false);
        this.visBussines.set(false);
        this.visQuote.set(false);
        this.dataOportunidad = {  dato:dato, paramReg: 'k' };
    }
}
