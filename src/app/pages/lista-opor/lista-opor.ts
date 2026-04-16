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

@Component({
    selector: 'app-lista-opor',
    templateUrl: './lista-opor.html',
    styleUrls: ['./lista-opor.scss'],
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
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
    errorMensaje: string = "";
    visOportunidad: boolean = true;
    visBussines: boolean = false;
    visQuote: boolean = false;
    dataCT:any;
    dataBC:any;
    events= signal<any[]>([]);
    selectedProdColor: string = "#27ECCB";

    codigoBC: string = '';
    cols: any[] = [];
    mensajeSpinner: string = "";
    vistaLista = signal<boolean>(true);
    frmDatos!: FormGroup;

    constructor(
        private serviceSharedApp: SharedAppService,
        private oportunidadService: OportunidadService,
        public dialogService: DialogService,
        private listaKanbanService: KanbanService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
    ) { }

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
            { field: 'startDate', header: 'FECHA' },
        ];
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
                    disabled: false,
                },
            ],
            fechafin: [
                {
                    value: this.utilitariosService.obtenerFechaFinMes(),
                    disabled: false,
                },
            ],
            idusuario: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false,
                },
            ],
            idcliente: [
                {
                    value: 0,
                    disabled: false,
                },
            ],
            idoportunidad: [
                {
                    value: 0,
                    disabled: false,
                },
            ],
            idvendedor: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false,
                },
            ],
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
        this.visOportunidad = false;
        this.visQuote =  false;
        this.visBussines = true;

        this.codigoBC = data.id;
    }

    quote(data: KanbanCard) {
        console.log("data : ", data);
        this.visOportunidad = false;
        this.visBussines = false;
        this.visQuote =  true;

        const {id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio} = data;
        this.dataCT = {id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio};
    }

    anexos(dato: any, param: string) {
        console.log("anexos : ", dato);
        const ref = this.dialogService.open(CListadoFile, {
            data: { idoportunidad: dato.id , codtipoproc: 1, idnroproceso: 0, parametro: param},
            header: dato.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
        });
        if (ref) {
        ref.onClose.subscribe(() => {
            this.actualizarLista();
          });
        }
    }

    getOportunidad(dato:boolean){
        this.visOportunidad = true;
        this.visBussines = false;
    }

    getListakanban(){

        const $getListakanban = this.listaKanbanService.ListaKanban()
            .subscribe({
                next: (rpta:any) => {
                    console.log("rpta getListakanban : ", rpta);
                    this.events.set(rpta);
                },
                error:(err)=>{
                    console.error('error : ',err);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensajesQuestion.msgErrorGenerico
                    })
                },
                complete:() => { }
            });
            this.$listSubcription.push($getListakanban);

    }

    actualizarLista(){
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;
        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            fechaini: this.frmDatos.value.fechaini,
            fechafin: this.frmDatos.value.fechafin
        }

        const $OportunidadesLista = this.oportunidadService.listaOportunidad(objeto )
        .subscribe({
            next: (rpta: any) => {
                this.cardList.set(rpta);
                console.log("rpta actualizarLista : ", rpta);
                this.setSpinner(false);
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => { }
        });
    this.$listSubcription.push($OportunidadesLista)
    }
}
