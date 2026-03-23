

import { ChangeDetectorRef, Component, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { KanbanService } from '../../kanban/service/kanban.service';
import { Cliente, Contacto, CotizacionItem, Moneda, TipoDocumento } from '../../model/interfaces';
import { SharedAppService } from '../sharedApp.service';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion } from '../../model/constantes';
import { PRIMENG_MODULES } from '../primeng_modules';
import { CProgressSpinnerComponent } from '../c-progress-spinner/c-progress-spinner.component';
import { CListadoFile } from '../../lead/c-listado-file/c-listado-file';

@Component({
  selector: 'app-c-dato-cotizacion-view',
  templateUrl: './c-dato-cotizacion-view.html',
  styleUrls: ['./c-dato-cotizacion-view.scss'],
  imports: [PRIMENG_MODULES, CProgressSpinnerComponent, CListadoFile],
      standalone: true,
      providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, KanbanService]
})
export class CDatoCotizacionView implements OnInit, OnDestroy {

    $listSubcription: Subscription[] = [];
    param: any;
    frmDatosCot!: FormGroup;
    lstCotizacionItem = signal<CotizacionItem[]>([]);// CotizacionItem[] = [];
    lstProveedores = signal<Cliente[]>([]); //: Cliente[] = [];
    lstMonedas = signal<Moneda[]>([]); //: Moneda[] = [];
    lstTipoDocumento = signal<TipoDocumento[]>([]); //: TipoDocumento[] = [];

    idOportunidad: number = 0;
    idCotiza: number = 0;
    nrodocumentoadd: string = "";

    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = "";

    ExcelData: any;
    i_valor: number = 2;
    visibleDocument = signal<boolean>(true);
    registerFormCliente: any = FormGroup;
    proveedorVisible = signal<boolean>(false);
    personaNatural = signal<boolean>(false);
    headerTitle: string = '';

    asignadosContacto = signal<Contacto[]>([]); //: Contacto[] = [];
    filteredContac = signal<Contacto[]>([]);
    lstTotalcontacs = signal<Contacto[]>([]);
    registerFormContacto: any= FormGroup;
    submitted = false;
    IdContacto: number = 0;
    listaContacInicial: any = undefined;
    contacto: Contacto = {idcontacto: 0, idcliente:0, nombrecontacto: '', cargo: '',image:'', telefono:'', idcotiza:0 };
    montoTotal: number = 0;

    IdCliente: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    public refCtz: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private serviceSharedApp: SharedAppService,
    private serviceOportunidad: OportunidadService,
    private serviceUtilitario: UtilitariosService,
    private messageService: MessageService,
    private kanbanService: KanbanService,
    private formBuilder: FormBuilder
  ) { }


  get formContacto() { return this.registerFormContacto.controls; }

  setSpinner(valor: boolean) {
    this.blockedDocument.set(valor);
  }

  ngOnInit(): void {
    this.param = this.config.data;
    this.createFrm();
    this.getRegistro();
    this.listaMonedas();
    this.listaProveedores();
  }

  ngOnDestroy() {
    if (this.$listSubcription != undefined) {
      this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }
  }

  get formCot() { return this.frmDatosCot.controls; }

  createFrm() {
    this.frmDatosCot = this.fb.group({
      idcotiza: [{ value: this.param.data.idcotiza, disabled: true }],
      idrequerimiento: [{ value: 0, disabled: true }],
      idoportunidad: [{ value: null, disabled: true }],
      codtipodoc: [{ value: 'QTE', disabled: true }],
      fechaingreso: [{
        value: this.serviceUtilitario.obtenerFechaActual(),
        disabled: true,
      }],
      idproveedor: [{ value: 0, disabled: true }, [Validators.required]],
      idmoneda: [{ value: 0, disabled: true }, [Validators.required]],
      iduserreg: [{ value: 0, disabled: true }],
      fecreg: [{ value: new Date(), disabled: true }],
      tiempoentrega: [{ value: 0, disabled: true }],
      codformapago: [{ value: '0', disabled: true }],
      validezoferta: [{ value: 0, disabled: true }],
      lugarentrega: [{ value: '0', disabled: true }],
      observacion: [{ value: '...', disabled: true }],
      garantia: [{ value: 0, disabled: true }],
      nrodocumentoadd: [{ value: null, disabled: true }],
      servicionombre: [{ value: '0', disabled: true }],
      condicionescomerciales:[{value: '', disabled: true }]
    })
  }

  getRegistro() {
    console.log('this.param.idoportunidad', this.param.idoportunidad);
    this.frmDatosCot.patchValue(this.param.data);
    this.idOportunidad = this.param.idoportunidad;
    this.idCotiza = this.param.data.idcotiza;
    this.asignadosContacto = this.param.data.contactos;
    this.listaContacInicial= this.param.data.contactos;
    this.lstCotizacionItem.set(this.param.data['items'] && this.param.data['items'].length > 0 ? this.param.data.items : []);

    this.calcularTotales() ;
  }

  listaProveedores() {
    const objeto = {
      idrolpersona: 'PRO',
      idusuario: constantesLocalStorage.idusuario
    }

    console.log('listaProveedores', objeto);

    const $getClientes = this.serviceOportunidad.ListaClientes(objeto).subscribe({
      next: (rpta: any) => {
        this.lstProveedores.set(rpta);
      },
      error: (err) => {
        this.serviceSharedApp.messageToast()
      },
      complete: () => { },
    });
    this.$listSubcription.push($getClientes);

  }

  listaMonedas() {
    const $listaMonedas = this.serviceOportunidad.obtenerMonedas().subscribe({
      next: (rpta: any) => {
        this.lstMonedas.set(rpta);
      },
      error: (err) => {
        this.serviceSharedApp.messageToast()
      },
      complete: () => {
      },
    });
    this.$listSubcription.push($listaMonedas);

  }

  destroy() {
    this.refCtz.close();
  }

getContactos(codigo: any) {
    //this.IdCliente= idcliente;
    this.kanbanService.obtenerContactos(codigo).subscribe({
        next: (rpta: any) => {
            console.log('getContactos',rpta);
        this.asignadosContacto.set(rpta);
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

filterContac(event: any) {
    let filtered: Contacto[] = [];
    let query = event.query;

    for (let i = 0; i < this.lstTotalcontacs().length; i++) {
        let contac = this.lstTotalcontacs()[i];
        if (
            contac.nombrecontacto &&
            contac.nombrecontacto.toLowerCase().indexOf(query.toLowerCase()) == 0
        ) {
            filtered.push(contac);
        }
    }
    this.filteredContac.set(filtered);
}

calcularTotales() {
    console.log('this.filteredProd...', this.lstCotizacionItem);
    let totalpreventot = 0;

    for (let lstCotiza of this.lstCotizacionItem()) {
        totalpreventot = totalpreventot + lstCotiza.preciocostototal;
    }

    this.montoTotal = totalpreventot;
}

}
