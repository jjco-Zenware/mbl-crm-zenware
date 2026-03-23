import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { CProgressSpinnerComponent } from '../c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../primeng_modules';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../sharedApp.service';
import { Acciones, CasoNegocio, CotizacionItem, Secciones } from '../../model/interfaces';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { constantesLocalStorage, globalVariable, mensajesQuestion, mensajesSpinner, respuestaProceso } from '../../model/constantes';
import { CDatoCotizacionView } from '../c-dato-cotizacion-view/c-dato-cotizacion-view';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';

@Component({
  selector: 'app-c-business-case',
  templateUrl: './c-business-case.html',
  styleUrls: ['./c-business-case.scss'],
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService]
})
export class CBusinessCase implements OnInit, OnChanges, OnDestroy {
    @Input() IS_codigo: string = '';
    @Output() OB_back = new EventEmitter<boolean>();
    @ViewChild('menu') menu!: Menu;
    $listSubcription: Subscription[] = [];
    filteredProd!: CotizacionItem[];
    filteredProdAll: CotizacionItem[] = [];
    selectedProd!: number;
    selectedProdColor: string = "";
    lstCasoNegocio: CasoNegocio[] = [];
    lstSecciones: Secciones[] = [];
    lstCotizacionItem: CotizacionItem[] = [];
    cotizacionItemNew!: CotizacionItem;
    headCliente: string = '';
    headDescrip!: string;
    headMoneda!: string;
    headFecha!: string;
    preVtaUnitario!: number;
    preVtaTotal!: number;
    preProfit!: number;
    titleTabla:string='';
    totalSecciones:number=0;
    titleBusinessCase: string = "";
    _tipocambio!: number;
    visTipoCam = signal<boolean>(true);
    visMonto = signal<boolean>(true);
    _montoopor!: number;

    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = "Cargando...";

    codestadoBC = signal<boolean>(true);

    headTipoCambio: number = 0;
    headImporte!: number;
    headMonto!: number;
    headMargen: number = 0;
    headProfit!: number;
    headNomCreador!: string;
    mostrarPorProducto = signal<boolean>(false);
    mostrarResumen = signal<boolean>(false);
    mostrarPorProveedor = signal<boolean>(false);
    headNomPreventa!: string;

    totalPrecioventatotal!: number;
    totalPreprofit!: number;
    totalPreciocosto!:  number;
    totalPreciocostototal!: number;
    totalPrecioventa!: number;
    headSimbMoneda!: string;

    dataVerQuote: any;
    dialogVisibleProducto= signal<boolean>(false);
    dialogVisibleProveedor= signal<boolean>(false);
    dialogVisibleResumen= signal<boolean>(false);
    menuItems: MenuItem[] = [];
    lstAcciones: Acciones[] = [];

    headTitulo!: string;

    expandedRows: any = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private serviceOportunidad: OportunidadService,
    private serviceSharedApp: SharedAppService,
    public dialogService: DialogService,
    private messageService: MessageService,
  ) { }

  setSpinner(valor: boolean) {
    this.blockedDocument.set(valor);
    }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['IS_codigo']) {
      this.listarCasoNegocio();
    }
  }

  ngOnDestroy() {
    if (this.$listSubcription != undefined) {
      this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }
  }

  listarCasoNegocio() {
    this.setSpinner(true);
    this.lstCasoNegocio = [];
    this.lstSecciones = [];
    this.lstCotizacionItem = [];
    this.filteredProd = [];
    this.filteredProdAll = [];    
    const objeto ={
      idoportunidad: this.IS_codigo,
      idusuario: constantesLocalStorage.idusuario,
    }
    const $listarCasoNegocio = this.serviceOportunidad.listarCasoNegocio(objeto)
      .subscribe({
        next: (rpta: any) => {
            this.setSpinner(false);
            console.log('lstCasoNegocio', rpta);
          this.lstCasoNegocio = rpta;
          this.cargarFilterItems();
        },
        error: (err) => {
          this.serviceSharedApp.messageToast()
        },
        complete: () => {

        }
      });
    this.$listSubcription.push($listarCasoNegocio);
  }

  cargarFilterItems() {

    for (let i = 0; i < this.lstCasoNegocio.length; i++) {
      this.lstCasoNegocio[i].secciones.forEach((item) => {
        this.lstSecciones.push({ ...item })
      });

      
    console.log('cargarItems', this.lstSecciones);

    //   if (this.lstCasoNegocio[i].acciones !== null) {
    //   this.lstCasoNegocio[i].acciones.forEach((item) => {
    //     this.lstAcciones.push({ ...item })
    //   });
    // }
    }

    if (this.lstSecciones.length > 0) {
      this.selectedProd = this.lstSecciones[0].idtipoprod;
      this.selectedProdColor = this.lstSecciones[0].badgeColor;
      this.cargarItems(this.lstSecciones);
      this.cargarCabecera();
    }
  }

  cargarItems(lista: Secciones[]) {
    console.log('cargarItems', lista);
    for (let x = 0; x < lista.length; x++) {
      lista[x].itemsQuote.forEach((item) => {
        this.lstCotizacionItem.push({...item})
      });
    }
    
  

    // this.lstSecciones.forEach((item: any) => {
    //   this.lstCotizacionItem.push({...item})
    // });

    console.log('length', this.lstCotizacionItem.length);

    if (this.lstCotizacionItem.length > 0) {
        console.log('this.lstCotizacionItem', this.lstCotizacionItem);
        this.mostrarPorProducto.set(false);
        this.mostrarPorProveedor.set(false);
        this.mostrarResumen.set(true);
        //this.filteredProd = this.lstCotizacionItem.filter(item => item.idtipoprod === this.selectedProd);
        this.filteredProd = this.lstCotizacionItem;
        this.calcularTotales();
      }
  }

  cargarCabecera() {
    console.log('this.lstCasoNegocio[0]', this.lstCasoNegocio[0]);
    this.headCliente = this.lstCasoNegocio[0].razonsocial;
    this.headDescrip = this.lstCasoNegocio[0].descripcion;
    this.headMoneda = this.lstCasoNegocio[0].desmoneda;
    this.headFecha = this.lstCasoNegocio[0].fecoportunidad;
    this.headSimbMoneda  = this.lstCasoNegocio[0].simbmoneda + ' ';

    this.headTipoCambio = this.lstCasoNegocio[0].tipocambio;
    this.headImporte = this.lstCasoNegocio[0].ventatotal;
    this.headMonto = this.lstCasoNegocio[0].monto;
    this.headMargen = this.lstCasoNegocio[0].margen;
    this.headProfit = this.lstCasoNegocio[0].profit;
    this.headNomCreador = this.lstCasoNegocio[0].nomusuariocomercial;
    this.headNomPreventa = this.lstCasoNegocio[0].nomusuariopreventa;
    this.titleBusinessCase = 'Business Case de Oportunidad N° - ' + this.lstCasoNegocio[0].idoportunidad ;
    this.headTitulo = this.lstCasoNegocio[0].titulo;

    this.titleTabla = this.lstSecciones[0].nomtipoproducto.concat(' (',this.filteredProd.length.toString(),') ')
    this.cdr.detectChanges();
  }

  itemsFilter(team: any) {
    console.log('team...', team);
    this.filteredProd = [];
    this.selectedProd = team.idtipoprod;
    this.selectedProdColor = team.badgeColor;

    switch (team.idtipoprod) {
        case 0:
            this.mostrarPorProducto.set(false)
            this.mostrarResumen.set(true)
            this.mostrarPorProveedor.set(false)
            this.filteredProd = this.lstCotizacionItem;
        break;
        case 8:
            this.mostrarPorProducto.set(false)
            this.mostrarResumen.set(false)
            this.mostrarPorProveedor.set(true)
            this.filteredProd = this.lstCotizacionItem;
        break;

        default:
            this.mostrarPorProducto.set(true)
            this.mostrarResumen.set(false)
            this.mostrarPorProveedor.set(false)
            this.filteredProd = this.lstCotizacionItem.filter(item => item.idtipoprod === this.selectedProd);
        break;
    }
    this.titleTabla = team.nomtipoproducto.concat(' (',this.filteredProd.length.toString(),') ')
    this.calcularTotales();

  }

  verResumen() {
    this.mostrarPorProducto.set(false)
    this.mostrarResumen.set(true)
    this.filteredProd = this.lstCotizacionItem.sort((a, b) => {{a.idtipoprod > b.idtipoprod?1:-1}
     return 0;
    });
    this.selectedProdColor = "bg-primary-900";
    let titulo="Resumen Business Case";

    this.titleTabla = titulo.concat(' (',this.filteredProd.length.toString(),') ')
    this.calcularTotales();

  }

  calcularTotales() {
        console.log('this.filteredProd...', this.filteredProd);
        let totalpreventot = 0;
        let totalprofit = 0;
        let totalprecosto = 0;
        let totalprecostotot = 0;
        let totalpreve = 0;

        for (let lstCotiza of this.filteredProd) {
            totalpreventot = totalpreventot + lstCotiza.precioventatotal;
            totalprofit = totalprofit + lstCotiza.preprofit;
            totalprecosto = totalprecosto + lstCotiza.preciocosto;
            totalprecostotot = totalprecostotot + lstCotiza.preciocostototal;
            totalpreve = totalpreve +lstCotiza.precioventa;
        }

        this.totalPrecioventatotal = totalpreventot;
        this.totalPreprofit = totalprofit;
        this.totalPreciocosto = totalprecosto;
        this.totalPreciocostototal = totalprecostotot;
        this.totalPrecioventa = totalpreve;
    }

    calcularPreciocosto(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idtipoprod === id) {
                    total = total + lstTipiProd.preciocosto;
                }
            }
        }

        return total;
    }

    calcularPreciocostoTotal(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idtipoprod === id) {
                    total = total + lstTipiProd.preciocostototal;
                }
            }
        }

        return total;
    }

    calcularPrecioVenta(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idtipoprod === id) {
                    total = total + lstTipiProd.precioventa;
                }
            }
        }

        return total;
    }

    calcularPrecioVentaTotal(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idtipoprod === id) {
                    total = total + lstTipiProd.precioventatotal;
                }
            }
        }

        return total;
    }

    calcularProfitProvee(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idproveedor === id) {
                    total = total + lstTipiProd.preprofit;
                }
            }
        }

        return total;
    }

    calcularPrecioVentaTotalProvee(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idproveedor === id) {
                    total = total + lstTipiProd.precioventatotal;
                }
            }
        }

        return total;
    }

    calcularPreciocostoProvee(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idproveedor === id) {
                    total = total + lstTipiProd.preciocostototal;
                }
            }
        }

        return total;
    }

    calcularProfit(id: number) {
        let total = 0;

        if (this.filteredProd) {
            for (let lstTipiProd of this.filteredProd) {
                if (lstTipiProd.idtipoprod === id) {
                    total = total + lstTipiProd.preprofit;
                }
            }
        }

        return total;
    }

  calcularMargen(event: any) {
    this.preVtaUnitario =  parseFloat((event.preciocosto / (1 - (event.margen) / 100)).toFixed(2));

    this.preVtaTotal = parseFloat((event.cantidad * this.preVtaUnitario).toFixed(2));

    this.preProfit = parseFloat((this.preVtaTotal - event.preciocostototal).toFixed(2));
    let _posicion:number=this.filteredProd.findIndex((x=>x.idcotizaitem == event.idcotizaitem))

    this.filteredProd[_posicion].margen = event.margen;
    this.filteredProd[_posicion].precioventa = this.preVtaUnitario;
    this.filteredProd[_posicion].precioventatotal = this.preVtaTotal;
    this.filteredProd[_posicion].preprofit = this.preProfit;

    console.log('this.filteredProd[_posicion]...', this.filteredProd[_posicion]);

    this.calcularTotales();

    let _posAll:number=this.filteredProdAll.findIndex((x=>x.idcotizaitem == event.idcotizaitem))
    if (_posAll != -1){
      this.filteredProdAll.splice(_posAll, 1)
    }
    this.filteredProdAll.push(this.filteredProd[_posicion]);


  }

  async procesarQuoteItem() {
    const rpta = await this.serviceSharedApp.confirmDialog({ message: mensajesQuestion.msgPreguntaGuardar })

    if (!rpta) { return }

    this.setSpinner(true);
    this.mensajeSpinner = mensajesSpinner.msjProcesando


    const objeto = {
      itemsQuote: this.filteredProdAll,
      idusuario: constantesLocalStorage.idusuario
    }

    const $procesarQuoteItem = this.serviceOportunidad.procesarQuoteItem(objeto)
      .subscribe({
        next: (rpta: any) => {
            this.setSpinner(false);
          this.listarCasoNegocio();
          this.serviceSharedApp.messageToast({
            severity: rpta.procesoSwitch == respuestaProceso.ConExito ? 'success':'error',
            summary: rpta.procesoSwitch == respuestaProceso.ConExito ? 'Exito':'Info',
            detail: rpta.mensaje
          })
        },
        error: (err) => {
            this.setSpinner(false);
          console.error('error : ', err)
          this.serviceSharedApp.messageToast()
        },
        complete: () => { }
      });
    this.$listSubcription.push($procesarQuoteItem)
  }

  getBack(){
    this.OB_back.emit(true);
  }


  verQuoteItems(data: any)
    {
        this.setSpinner(true);
        const $listarCotizacionUno = this.serviceOportunidad.listarCotizacionUno(data.idcotiza)
          .subscribe({
            next: (rpta: any) => {
                console.log('listarCotizacionUno', rpta.quotes);
                this.verDetalle(rpta.quotes);
                this.setSpinner(false);
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

    verDetalle(data: any) {

        console.log('verDetalle...', data, this.lstCasoNegocio[0].idoportunidad);
        globalVariable.codigoId = data[0].idcotiza;
        globalVariable.oportunidadId = this.lstCasoNegocio[0].idoportunidad;

         const objeto = {
            data: data[0],
            idindicador: 3,
            lstCotizacionItem: data[0].items,
            idoportunidad: this.lstCasoNegocio[0].idoportunidad,
            idnroproceso: data[0].idcotiza
          }

          console.log('objeto........', objeto);
          const ref = this.dialogService.open(CDatoCotizacionView, {
            data: objeto,
            header: "Cotización N° - " + data[0].idcotiza,
            closeOnEscape: false,
            styleClass: 'testDialog',
            closable: true,
            width: '40%',
          });
      }

      showDialog() {
        switch (this.selectedProd) {
          case 0:            
          console.log('showDialog 0');
            this.dialogVisibleResumen.set(true)
            this.dialogVisibleProveedor.set(false)
            this.dialogVisibleProducto.set(false)
          break;
          case 8:            
          console.log('showDialog 8');
            this.dialogVisibleResumen.set(false)
            this.dialogVisibleProveedor.set(true)
            this.dialogVisibleProducto.set(false)
          break;
        
          default:
            
            console.log('showDialog yodos');
            this.dialogVisibleResumen.set(false)
            this.dialogVisibleProveedor.set(false)
            this.dialogVisibleProducto.set(true)
            break;
        }
    }

    prcTC(dato: any, tc:any){
      switch (dato) {
        case 1:
          this.visTipoCam.set(false)
          this._tipocambio = this.headTipoCambio;
        break;
        case 2:
          console.log('_tipocambio', tc);
          this.visTipoCam.set(true)

          this.setSpinner(true);
          this.mensajeSpinner = "Actualizando...";

          let object ={
              idoportunidad: this.IS_codigo,
              tc: tc,
              mtooportunidad: this.headImporte
          }
          this.serviceOportunidad.prcDashboard2(object)
          .subscribe({
            next: (rpta: any) => {
              this.setSpinner(false);
              this.headTipoCambio = tc;
              console.log('rpta...', rpta);
              this.listarCasoNegocio();
            },
            error: (err) => {
              this.setSpinner(false);
              this.serviceSharedApp.messageToast();
            },
            complete: () => { }
          });
        break;
    
      }
    }

    prcMonto(dato: any, monto:any){
      switch (dato) {
        case 1:
          this.visMonto.set(false)
          this._montoopor = this.headMonto;
        break;
        case 2:
          console.log('monto', monto);
          this.visMonto.set(true)

          this.setSpinner(true);
          this.mensajeSpinner = "Actualizando...";

          let object ={
              idoportunidad: this.IS_codigo,
              mtooportunidad: monto,
              tc: this.headTipoCambio
          }
          this.serviceOportunidad.prcDashboard2(object)
          .subscribe({
            next: (rpta: any) => {
              this.setSpinner(false);
              this.headMonto = rpta.monto;
              this.listarCasoNegocio();
              console.log('rpta...', rpta);
            },
            error: (err) => {
              this.setSpinner(false);
              this.serviceSharedApp.messageToast();
            },
            complete: () => { }
          });
        break;
    
      }
    }

     onRowExpand(event: TableRowExpandEvent) {
        this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
    }

    onRowCollapse(event: TableRowCollapseEvent) {
        this.messageService.add({
            severity: 'success',
            summary: 'Product Collapsed',
            detail: event.data.name,
            life: 3000
        });
    }


    
}
