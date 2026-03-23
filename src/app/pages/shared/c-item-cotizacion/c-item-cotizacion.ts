import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedAppService } from '../sharedApp.service';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { PRIMENG_MODULES } from '../primeng_modules';

@Component({
  selector: 'app-c-item-cotizacion',
  templateUrl: './c-item-cotizacion.html',
   imports: [PRIMENG_MODULES],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService]
})
export class CItemCotizacion
 implements OnInit, OnDestroy {
  $listSubcription: Subscription[] = [];
  param: any;
  frmDatosItem!: FormGroup;
  lstTipoProducto= signal<any[]>([]);
  lstTipoProductoTot= signal<any[]>([]);
  lstMarcas= signal<any[]>([]);
    marcaVisible = signal<boolean>(false);
    headerTitle?: string;
    submitted = signal<boolean>(false);
    registerFormMarca!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public refDatoItem: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private serviceSharedApp: SharedAppService,
    private serviceOportunidad: OportunidadService,
    private serviceUtilitario: UtilitariosService,
    private messageService: MessageService,
  ) { }

  get formContacto() { return this.registerFormMarca.controls; }

  ngOnInit(): void {
    this.param = this.config.data;
    this.createFrm();
    this.createFormContacto();
    this.getRegistro();
    this.listarTipoProducto();
    this.listarMarcas();
  }

  ngOnDestroy() {
    if (this.$listSubcription != undefined) {
      this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }
  }

  createFrm() {
    this.frmDatosItem = this.fb.group({
      idcotizaitem: [{ value: 0, disabled: false }],
      idcotiza: [{ value: 0, disabled: false }],
      idtipoprod: [{ value: 0, disabled: false }, [Validators.required]],
      idprod: [{ value: 0, disabled: false }],
      descripcion: [{ value: null, disabled: false }, [Validators.required]],
      cantidad: [{ value: 1, disabled: false }, [Validators.required]],
      codunidad: [{ value: 'UNID', disabled: false }],
      preciocosto: [{ value: 0, disabled: false }, [Validators.required]],
      descuento: [{ value: 0, disabled: false }],
      margen: [{ value: 0, disabled: false }],
      precioventa: [{ value: 0, disabled: true }],
      indvig: [{ value: true, disabled: true }],
      iduserreg: [{ value: 0, disabled: false }],
      fecreg :[{ value: this.serviceUtilitario.obtenerFechaActual(), disabled: true }],
      iduseract: [{ value: 0, disabled: false }],
      fecact: [{ value: this.serviceUtilitario.obtenerFechaActual(), disabled: true }],
      coditem: [{ value: '0', disabled: false }],
      idmarca: [{ value: 0, disabled: false }, [Validators.required]],
      nomprod: [{ value: null, disabled: false }],
      nommarca: [{ value: null, disabled: false }],
      preciocostototal: [{ value: 0, disabled: true }],
      precioventatotal: [{ value: 0, disabled: true }],
      preprofit: [{ value: 0, disabled: true }],
      nomtipoprod: [{ value: '', disabled: false }],
      nomproveedor: [{ value: '', disabled: false }],
      serialnumber: [{ value: '', disabled: false }],
      sku: [{ value: '', disabled: false }],
      nrocontrato: [{ value: '', disabled: false }],
      nromeses: [{ value: 0, disabled: false }]
    })
  }

  createFormContacto() {
    //Agregar validaciones de formulario
    this.registerFormMarca = this.fb.group({
    nommarca: ['', [Validators.required]],
    });
}

  getRegistro(){
    console.log("params item : ", this.param);
    this.frmDatosItem.patchValue(this.param);
    console.log("frmDatosItem  : ", this.frmDatosItem.getRawValue());
  }

  listarTipoProducto() {
    const $listarTipoProducto = this.serviceOportunidad.obtenerTipoProducto().subscribe({
      next: (rpta: any) => {
        this.lstTipoProductoTot.set(rpta);
        this.lstTipoProducto.set(this.lstTipoProductoTot().filter(x => x.idtipoprod !== 0 && x.idtipoprod !== 8));
      },
      error: (err) => {
        console.info('error : ', err);
        this.serviceSharedApp.messageToast()
      },
      complete: () => {
      },
    });
    this.$listSubcription.push($listarTipoProducto);

  }

  listarMarcas() {
    const $listarMarcas = this.serviceOportunidad.obtenerMarcas().subscribe({
      next: (rpta: any) => {
        this.lstMarcas.set(rpta);
      },
      error: (err) => {
        console.info('error : ', err);
        this.serviceSharedApp.messageToast()
      },
      complete: () => {
      },
    });
    this.$listSubcription.push($listarMarcas);

  }

  calcularBCQ(event: any) {
    if (event.value > 0) {
      const total = event.value * this.frmDatosItem.get('preciocosto')?.value;
      this.frmDatosItem.get('preciocostototal')?.setValue(total);
    }
  }

  calcularBCPu(event: any) {
    if (event.value > 0) {
      const total = event.value * this.frmDatosItem.get('cantidad')?.value;
      this.frmDatosItem.get('preciocostototal')?.setValue(total);
    }
  }

  guardarItem() {
    //console.log('frmDatosItem...', this.frmDatosItem.getRawValue());

    // if (this.frmDatosItem.get('descripcion')?.value == "") {
    //     this.messageService.add({severity: 'info', summary: 'Validación...', detail: 'Agregar Descripción'});
    //     return;
    //   }

      if (this.frmDatosItem.get('preciocosto')?.value == 0) {
        this.messageService.add({severity: 'info', summary: 'Validación...', detail: 'Agregar Precio Costo'});
        return;
      }

    if (this.frmDatosItem.invalid) {
      //console.log('invalid...', this.frmDatosItem.invalid);
      this.serviceSharedApp.messageToast({ severity: 'info', summary: 'Validación...', detail: "Falta Ingresar Datos ..." });
      return;
    }

    const _nomtipoprod:string=this.lstTipoProducto().filter(x=>x.idtipoprod == this.frmDatosItem.get('idtipoprod')?.value)[0].nomtipoprod;
    this.frmDatosItem.get('nomtipoprod')?.setValue(_nomtipoprod)

    const _marca:string=this.lstMarcas().filter(x=>x.idmarca == this.frmDatosItem.get('idmarca')?.value)[0].nommarca;
    this.frmDatosItem.get('nommarca')?.setValue(_marca)

    this.cerrar({...this.frmDatosItem.getRawValue()})
  }

  cerrar(data:any) {
    this.refDatoItem.close({data});
  }

  NuevaMarca()  {
        this.submitted.set(false);
        this.headerTitle= 'Nueva Marca' ;
        this.marcaVisible.set(true);
    }

    guardarMarca() {
        this.submitted.set(true);

        if (this.registerFormMarca.invalid) {
            this.serviceSharedApp.messageToast({ severity: 'info', summary: 'Validación...', detail: "Falta Ingresar Datos ..." });
            return;
        }

        if(this.submitted())
        {
            const objeto = {
                idmarca: 0,
                nommarca: this.registerFormMarca.value.nommarca,
                idproveedor: 0
              }

              const $prcMarcas = this.serviceOportunidad.procesarMarca(objeto).subscribe({
                next: (rpta: any) => {
                    console.log('guardarMarca', rpta);
                  this.listarMarcas();
                },
                error: (err) => {
                  console.info('error : ', err);
                  this.serviceSharedApp.messageToast()
                },
                complete: () => {
                },
              });
              this.$listSubcription.push($prcMarcas);

            this.marcaVisible.set(false);
        }
    }
}
