
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { KanbanService } from '../../kanban/service/kanban.service';
import { PRIMENG_MODULES } from '../primeng_modules';
import { CProgressSpinnerComponent } from '../c-progress-spinner/c-progress-spinner.component';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../sharedApp.service';
import { Cliente, Contacto, CotizacionItem, Moneda, TipoDocumento } from '../../model/interfaces';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../../model/constantes';
import { CItemCotizacion } from '../c-item-cotizacion/c-item-cotizacion';
import { CListadoFile } from '../../lead/c-listado-file/c-listado-file';


@Component({
  selector: 'app-c-dato-cotizacion',
  templateUrl: './c-dato-cotizacion.html',
  imports: [PRIMENG_MODULES, CProgressSpinnerComponent, CListadoFile],
      standalone: true,
      providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, KanbanService]
})
export class CDatoCotizacion implements OnInit, OnDestroy {


    $listSubcription: Subscription[] = [];
    param: any;
    frmDatosCot!: FormGroup;
    lstCotizacionItem= signal<CotizacionItem[]>([]);//: CotizacionItem[] = [];
    lstProveedores= signal<Cliente[]>([]);//: Cliente[] = [];
    lstMonedas= signal<Moneda[]>([]);//: Moneda[] = [];
    lstTipoDocumento= signal<TipoDocumento[]>([]);//: TipoDocumento[] = [];

    idOportunidad: number = 0;
    idCotiza: number = 0;
    nrodocumentoadd: string = "";

    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = "";

    ExcelData: any;
    i_valor: number = 2;
    visibleDocument= signal<boolean>(true);
    registerFormCliente!: FormGroup;
    proveedorVisible = signal<boolean>(false);
    personaNatural = signal<boolean>(false);
    headerTitle: string = '';

    asignadosContacto= signal<any[]>([]);//: Contacto[] = [];
    filteredContac= signal<any[]>([]);//: Contacto[] = [];
    lstTotalcontacs= signal<any[]>([]);//: Contacto[] = [];
    contactoVisible = signal<boolean>(false);
    registerFormContacto!: FormGroup;
    submitted = signal<boolean>(false);
    IdContacto: number = 0;
    listaContacInicial: any = undefined;
    contacto: Contacto = {idcontacto: 0, idcliente:0, nombrecontacto: '', cargo: '',image:'', telefono:'', idcotiza:0 };
    montoTotal: number = 0;
    lstTipoRol= signal<any[]>([]);

    dropdownItemsTipPer = [
        { name: 'Jurídica', code: 'J' },
        { name: 'Natural', code: 'N' }
    ];

    dropdownItemsNac = [
        { name: 'Extranjero', code: '0' },
        { name: 'Nacional', code: '1' }
    ];

    dropdownItemsTipNro = [
        { name: 'RUC', code: 'RUC' },
        { name: 'DNI', code: 'DNI' }
    ];
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
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder
  ) { }


  get formContacto() { return this.registerFormContacto.controls; }

  setSpinner(valor: boolean) {
    this.blockedDocument.set(valor);
  }

  ngOnInit(): void {
    this.param = this.config.data;
    console.log('ngOnInit', this.param);    

    this.createFrm();
    this.createFormContacto();
    this.getRegistro();
    this.listaMonedas();
    this.listaProveedores();
    this.createFormProveedor();
    this.listarItemsTabla();
  }

  ngOnDestroy() {
    if (this.$listSubcription != undefined) {
      this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }
  }

  get formCot() { return this.frmDatosCot.controls; }
  get formProveedor() { return this.registerFormCliente.controls; }

  createFrm() {
    this.frmDatosCot = this.fb.group({
      idcotiza: [{ value: this.param.data.idcotiza, disabled: true }],
      idrequerimiento: [{ value: 0, disabled: false }],
      idoportunidad: [{ value: null, disabled: false }],
      codtipodoc: [{ value: 'QTE', disabled: false }],
      fechaingreso: [{
        value: this.serviceUtilitario.obtenerFechaActual(),
        disabled: false,
      }],
      idproveedor: [{ value: 0, disabled: false }, [Validators.required]],
      idmoneda: [{ value: 0, disabled: false }, [Validators.required]],
      iduserreg: [{ value: 0, disabled: false }],
      fecreg: [{ value: new Date(), disabled: false }],
      tiempoentrega: [{ value: 0, disabled: false }],
      codformapago: [{ value: '0', disabled: false }],
      validezoferta: [{ value: 0, disabled: false }],
      lugarentrega: [{ value: '0', disabled: false }],
      observacion: [{ value: '...', disabled: false }],
      garantia: [{ value: 0, disabled: false }],
      nrodocumentoadd: [{ value: null, disabled: false }],
      servicionombre: [{ value: '0', disabled: false }],
      condicionescomerciales:[{value: '', disabled: false }]
    })
  }

  createFormContacto() {
    //Agregar validaciones de formulario
    this.registerFormContacto = this.formBuilder.group({
    nombrecontacto: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    cargo: ['', [Validators.required]],
    tiporol: ['', [Validators.required]],
    });
}

  createFormProveedor() {
    //Agregar validaciones de formulario
    this.registerFormCliente = this.fb.group({
    idrolpersona: [{ value: 'PRO', disabled: false }],
    tipopersona :  [{ value: 'J', disabled: false }],
    tipoalta : [{ value: 'NOR', disabled: false }],
    indnacionalidad: [{ value: null, disabled: false }, [Validators.required]],
    idpais: [{ value: '1', disabled: false }],
    idtipodoc: [{ value: null, disabled: false }, [Validators.required]],
    nrodocumento: [{ value: null, disabled: false }, [Validators.required]],
    appaterno: [{ value: null, disabled: false }, [Validators.required]],
    apmaterno: [{ value: null, disabled: false }, [Validators.required]],
    apcasada: [{ value: null, disabled: false }],
    nombres: [{ value: null, disabled: false }, [Validators.required]],
    razonsocial: [{ value: null, disabled: false }, [Validators.required]],
    nomcomercial: [{ value: null, disabled: false }],
    direcresumen: [{ value: null, disabled: false }, [Validators.required]],
    telefresumen: [{ value: null, disabled: false }],
    email: ['', [Validators.required, Validators.email]],
    paginaweb: [{ value: null, disabled: false }],
    facebook: [{ value: null, disabled: false }],
    youtube: [{ value: null, disabled: false }],
    indmigrado :  [{ value: false, disabled: false }],
    indestado:  [{ value: '1', disabled: false }],
    indvig :  [{ value: true, disabled: false }],
    fechareg: [{ value: new Date(), disabled: false }],
    iduserreg : [{ value: 1, disabled: false }],
    fechaact: [{ value: new Date(), disabled: false }],
    iduseract: [{ value: 1, disabled: false }],
    idpersona: [{ value: 0, disabled: false }],
    tipocambio: [{ value: 0, disabled: false }],
    });
}

  getRegistro() {
    console.log("params dato: ", this.param);
    this.frmDatosCot.patchValue(this.param.data);
    this.asignadosContacto.set([]);

    console.log("this.param.data.contactos: ", this.param.data.contactos);
    console.log("idindicador: ", this.param.idindicador);
    this.idOportunidad = this.param.data.idoportunidad;

    this.idCotiza = this.param.data.idcotiza;

    if (this.param.data.contactos !== null && this.param.data.contactos !== undefined) {
        console.log("ENTRO idindicador: ", );
        this.asignadosContacto = this.param.data.contactos;
        this.listaContacInicial= this.param.data.contactos;
    }


    console.log("getContactos: ", this.param.data.idproveedor);
    if (this.param.data.idproveedor !== undefined) {
      this.getContactos(this.param.data.idproveedor);
    }
    
    if (this.idCotiza > 0) {
        this.visibleDocument.set(false);
    }else{
        this.idCotiza = 0;
    }
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

  grabarCotizacion() {
    console.log('frmDatosCot...', this.frmDatosCot.getRawValue());
    console.log('this.idCotiza...', this.idCotiza);
    console.log('fechaingreso...', this.frmDatosCot.get('fechaingreso')?.getRawValue());
    if (this.frmDatosCot.invalid) {
      console.log('formulario invalido...', this.frmDatosCot.invalid);
      this.serviceSharedApp.messageToast({ severity: 'info', summary: 'Validación...', detail: "Falta Ingresar Datos ..." });
      return;
    }

    if (this.lstCotizacionItem().length == 0) {
        this.serviceSharedApp.messageToast({ severity: 'info', summary: 'Validación...', detail: "Debe Ingresar Items..." });
        return;
    }

    let  fechaingreso_;
    if (this.idCotiza > 0) {
        fechaingreso_ = this.serviceUtilitario.formatFecha(this.frmDatosCot.get('fechaingreso')?.getRawValue())
    }else{
        fechaingreso_ =this.frmDatosCot.get('fechaingreso')?.getRawValue()
    }

    this.setSpinner(true);
    this.mensajeSpinner = mensajesSpinner.msjProcesando

    const cotizacion = {
      ...this.frmDatosCot.getRawValue(),
      idoportunidad: this.idOportunidad,
      idcotiza: this.idCotiza,
      fechaingreso: fechaingreso_,
      items: this.lstCotizacionItem(),
      contactos: this.asignadosContacto,
      idusuario: constantesLocalStorage.idusuario
    }

    console.log('grabarCotizacion...', cotizacion);

    const $procesarCotizacion = this.serviceOportunidad.procesarCotizacion(cotizacion)
      .subscribe({
        next: (rpta: any) => {
            console.log('procesarCotizacion rpta...', rpta);
          this.setSpinner(false);
          if (rpta.procesoSwitch == 0) {
            if (this.idCotiza == 0) {
                this.idCotiza = rpta.resultProceso;
                this.serviceOportunidad.emitirEvento(rpta.resultProceso);
                //this.mensajeEmit.emit(rpta.resultProceso);
                this.frmDatosCot.get('idcotiza')?.setValue(this.idCotiza);
                this.getRegistro2();


                // const ref = this.dialogService.open(CListadoFileComponent, {
                //     data: { idoportunidad: this.idOportunidad , codtipoproc: 2, idnroproceso: this.idCotiza},
                //     header: dato.title,
                //     styleClass: 'testDialog',
                //     closeOnEscape: false,
                //     closable: true,
                // });
            }

          }


          this.serviceSharedApp.messageToast({
            severity: rpta.procesoSwitch == 0 ? 'success' : 'error',
            summary: rpta.procesoSwitch == 0 ? 'Exito' : 'Info',
            detail: rpta.mensaje
          });
        },
        error: (err) => {
          this.setSpinner(false);
          console.error('error : ', err)
          this.serviceSharedApp.messageToast()
        },
        complete: () => { }
      });
    this.$listSubcription.push($procesarCotizacion);
  }

  getRegistro2() {
    this.confirmationService.confirm({
        key: 'confirm3',
        header: 'Confirmación',
        message: '¿Desea Adjuntar Documentos?',
        accept: () => {
            this.visibleDocument.set(false);
            //this.listarCotizacionUno();
        }
    });
  }

  listarCotizacionUno() {
    this.lstCotizacionItem.set([]);
    const $listarCotizacionUno = this.serviceOportunidad.listarCotizacionUno(this.idCotiza)
      .subscribe({
        next: (rpta: any) => {
            this.setSpinner(false);
            console.log('listarCotizacionUno', rpta.quotes);
            this.lstCotizacionItem.set(rpta.quotes.items);
        },
        error: (err) => {
          console.error('error : ', err)
          this.serviceSharedApp.messageToast()
        },
        complete: () => {
        }
      });
    this.$listSubcription.push($listarCotizacionUno);
  }

  getItem(data: any,index: number) {
    data.idcotiza = this.param.data.idcotiza;
    data.nroindex = index;
    console.log("getItem : ", data);
    console.log("this.lstCotizacionItem : ", this.lstCotizacionItem);
    console.log("index : ", index);
    const refItem = this.dialogService.open(CItemCotizacion, {
      data: data,
      header: data.length == 0 ? "Nuevo Item" : "Editar Item - " + data.idcotizaitem,
      closeOnEscape: false,
      styleClass: 'testDialog',
      width: '40%',
      //height: '55%'
    });
    if (refItem) {
    refItem.onClose.subscribe((rpta: any) => {
      if (rpta != undefined) {
        console.log("getItem modal 01 : ", rpta.data);
        console.log("index modal 01 : ", index);

          const _posAll: number = this.lstCotizacionItem().findIndex((x => x.nroindex == index))
          if (_posAll != -1) {
            this.lstCotizacionItem().splice(_posAll, 1)
          }
        this.lstCotizacionItem().push(rpta.data);
      }
      this.calcularTotales();
    });
  }
  }

  async eliminarItem(data: any) {
    console.log("getItem : ", data);

    const rpta = await this.serviceSharedApp.confirmDialog({ message: '¿Desea Eliminar Item ' + '<b>' + data.descripcion + '</b>' + '?' });
    if (!rpta) return;

    // if (data.idcotiza > 0) {
    //     const _posAll:number=this.lstCotizacionItem.findIndex((x=>x.idcotizaitem == data.idcotizaitem))
    //     if (_posAll != -1){
    //         this.lstCotizacionItem.splice(_posAll, 1)
    //       }
    // }
        if (data.idcotizaitem > 0) {
            const _posAll: number = this.lstCotizacionItem().findIndex((x => x.idcotizaitem == data.idcotizaitem))
            if (_posAll != -1) {
            this.lstCotizacionItem().splice(_posAll, 1)
            }
        }else{
            const _posAll: number = this.lstCotizacionItem().findIndex((x => x.idnvoitem == data.idnvoitem))
            if (_posAll != -1) {
            this.lstCotizacionItem().splice(_posAll, 1)
            }
        }
  }

  destroy() {
    this.refCtz.close();
  }

// ReadExcel(event: any, fubauto: any){
//     let file = event.files[0];
//     let s_nombre = file.name.split('.').pop();

//     if (s_nombre != "xlsx") {
//         this.messageService.add({severity: 'info', summary: 'Info', detail: "Archivo Incorrecto..." });
//         fubauto.clear();
//         return;
//     }

//     let fileReader = new FileReader();
//     fileReader.readAsBinaryString(file);

//     fileReader.onload = (e) =>{
//         var workBook = XLSX.read(fileReader.result,{type:'binary'});
//         var sheetNames = workBook.SheetNames;
//         this.ExcelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]])
//         console.log(this.ExcelData);

//         this.ExcelData.forEach((item: any) => {
//             this.lstCotizacionItem.push(item)
//         });
//         console.log( 'listaitems...' ,this.lstCotizacionItem);
//     }
//     fubauto.clear();
//   }

  /*INICIO PRC PROVEEDOR*/
NuevoProveedor()  {
    this.cambioTipoPer('J');
    this.submitted.set(false);
    this.headerTitle= 'Nuevo Proveedor' ;
    this.proveedorVisible.set(true);
}

cambioTipoPer(dato: any) {
  if (dato === 'J') {
    this.personaNatural.set(false);

    this.registerFormCliente.get('razonsocial')?.clearValidators();
    this.registerFormCliente.get('razonsocial')?.setValidators(Validators.required);
    this.registerFormCliente.get('razonsocial')?.updateValueAndValidity();

    this.registerFormCliente.get('nombres')?.clearValidators();
    this.registerFormCliente.get('nombres')?.updateValueAndValidity();

    this.registerFormCliente.get('appaterno')?.clearValidators();
    this.registerFormCliente.get('appaterno')?.updateValueAndValidity();

    this.registerFormCliente.get('apmaterno')?.clearValidators();
    this.registerFormCliente.get('apmaterno')?.updateValueAndValidity();
      }else{
    this.personaNatural.set(true);

    this.registerFormCliente.get('nombres')?.clearValidators();
    this.registerFormCliente.get('nombres')?.setValidators(Validators.required);
    this.registerFormCliente.get('nombres')?.updateValueAndValidity();

    this.registerFormCliente.get('appaterno')?.clearValidators();
    this.registerFormCliente.get('appaterno')?.setValidators(Validators.required);
    this.registerFormCliente.get('appaterno')?.updateValueAndValidity();

    this.registerFormCliente.get('apmaterno')?.clearValidators();
    this.registerFormCliente.get('apmaterno')?.setValidators(Validators.required);
    this.registerFormCliente.get('apmaterno')?.updateValueAndValidity();

    this.registerFormCliente.get('razonsocial')?.clearValidators();
    this.registerFormCliente.get('razonsocial')?.updateValueAndValidity();
}
}

cambioTipoDoc(dato: any) {
    if (dato == 'RUC') {
        //this.idtipodoc
    }else{
        //this.cliente.tipopersona == 'N';
    }
}

guardarProveedor() {
    this.submitted.set(true);
    console.log('guardarProveedor...', this.registerFormCliente.getRawValue());

    // deténgase aquí si el formulario no es válido
    if (this.registerFormCliente.invalid) {
        console.log('deténgase aquí si el formulario no es válido');
        this.serviceSharedApp.messageToast({ severity: 'info', summary: 'Validación...', detail: "Falta Ingresar Datos ..." });
        return;
    }

    //Verdadero si todos los campos están llenos
    if(this.submitted())
    {
        this.kanbanService.prcClientes(this.registerFormCliente.getRawValue())
            .subscribe({
            next: (rpta:any) => {
                console.log("rpta prcClientes : ", rpta);
                if (rpta.procesoSwitch == 0){
                    this.messageService.add({severity: 'success', detail: "Operación exitosa" });
                    this.listaProveedores();
                    this.proveedorVisible.set(false);
                    }
            },
            error:(err)=>{
                console.error('error : ',err)
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                })
            },
            complete:() => {}
            });
    }
}

/*FIN PRC PROVEEDOR */

// listaAsignados() {
//     this.kanbanService.obtenerUsuarios().subscribe({
//         next: (rpta: any) => {
//             this.lstTotalcontacs = rpta;
//         },
//         error: (err) => {
//         console.info('error : ', err);
//         this.messageService.clear();
//         this.messageService.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: mensajesQuestion.msgErrorGenerico,
//         });
//         },
//         complete: () => {
//         },
//     });
// }

getContactos(codigo: any) {
    //this.IdCliente= idcliente;
    this.kanbanService.obtenerContactos(codigo).subscribe({
        next: (rpta: any) => {
            console.log('getContactos',rpta);
        this.lstTotalcontacs = rpta;
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

getContactos2(codigo: any) {
  //this.IdCliente= idcliente;
    this.asignadosContacto.set([]);
  this.kanbanService.obtenerContactos(codigo).subscribe({
      next: (rpta: any) => {
      this.lstTotalcontacs.set(rpta);
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

changeHeaderTitle(arg: number, contac: any) {
    this.listaContacInicial=[];
    this.submitted.set(false);
    this.registerFormContacto.reset();

    this.listaContacInicial = this.asignadosContacto;
    console.log('lista contactos', this.listaContacInicial);

    if (arg == 1) {
        this.headerTitle = "Nuevo Contacto";
        this.IdContacto = 0;
    }
    if (arg == 2) {
        this.headerTitle = "Editar Contacto";
        this.IdContacto = contac.idcontacto;
        this.registerFormContacto.get('nombrecontacto')?.setValue(contac.nombrecontacto);
        this.registerFormContacto.get('email')?.setValue(contac.email);
        this.registerFormContacto.get('telefono')?.setValue(contac.telefono);
        this.registerFormContacto.get('cargo')?.setValue(contac.cargo);

    }
    this.contactoVisible.set(true);
}

guardarContacto() {
    this.submitted.set(true);
    // deténgase aquí si el formulario no es válido
    if (this.registerFormContacto.invalid) {
        return;
    }
    //Verdadero si todos los campos están llenos
    if(this.submitted())
    {
      const _nomtiporol =this.lstTipoRol().filter((x: { iditem: any; })=>x.iditem === this.registerFormContacto.value.tiporol)[0].valoritem;


        console.log('Id Contacto',this.IdContacto);
        console.log('this.registerFormContacto',this.registerFormContacto.value);
        console.log('this.param.data.',this.param.data.idcotiza);
        console.log('this.frmDatosCot',this.frmDatosCot.value);

        if (this.IdContacto !== 0) {
            for (let i = 0; i < this.listaContacInicial.length; i++) {
                //console.log('en el for', this.listaContacInicial[i].idcontacto);
                if (this.IdContacto === this.listaContacInicial[i].idcontacto) {
                    console.log('en el if del for',this.listaContacInicial[i]);
                    this.asignadosContacto().splice(i, 1);
                }
            }
        }
        //console.log('lista despues de eliminar', this.listaContacInicial);
        this.asignadosContacto().unshift(this.contacto ={
            idcontacto: this.IdContacto,
            idcliente: this.frmDatosCot.get('idproveedor')?.getRawValue(),// this.registerFormCliente.idproveedor,
            nombrecontacto : this.registerFormContacto.value.nombrecontacto,
            email : this.registerFormContacto.value.email,
            telefono: this.registerFormContacto.value.telefono,
            cargo:this.registerFormContacto.value.cargo,
            tiporol:this.registerFormContacto.value.tiporol,
            nomtiporol: _nomtiporol,
            image: "ivanmagalhaes.png",
            idcotiza: this.frmDatosCot.get('idcotiza')?.getRawValue(),
        });

        console.log('this.contacto.',this.contacto);
        //this.contactos.emit(this.asignadosContacto);
        this.contactoVisible.set(false);
    }
}

listarItemsTabla() {
  this.serviceOportunidad.obtenerItemsTabla(103).subscribe({
      next: (rpta: any) => {
          console.log('listarItemsTabla', rpta);
      this.lstTipoRol.set(rpta);
      },
      error: (err) => {
      console.info('error : ', err);
      this.serviceSharedApp.messageToast()
      },
      complete: () => {
      },
  });

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
