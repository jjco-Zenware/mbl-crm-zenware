import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CProgressSpinnerComponent } from '../c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../primeng_modules';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../sharedApp.service';
import { CotizacionItem, Cotizacion } from '../../model/interfaces';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { globalVariable } from '../../model/constantes';
import { CDatoCotizacion } from '../c-dato-cotizacion/c-dato-cotizacion';

@Component({
  selector: 'app-c-cotizacion',
  templateUrl: './c-cotizacion.html',
  imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, DynamicDialogRef, DynamicDialogConfig]

})
export class CCotizacion implements OnInit, OnChanges, OnDestroy {
  @Input() IA_data: any;
  @Output() OB_back = new EventEmitter<any>();
  $listSubcription: Subscription[] = [];

  filteredCotizaItems = signal<CotizacionItem[]>([]);
  selectedCoti: any;
  nroCotizacion: string = 'Quote ';
  nomproveedor!: string ;
  idoportunidad: any;
  headerTitleProducto!: string;
  headerTitleItem!: string;
  headCliente!: string;
  headDescrip!: string;
  headMoneda!: string;
  headFecha!: string;
  lstCotizacionItem = signal<CotizacionItem[]>([]);//: CotizacionItem[] = [];
  lstCotizacion= signal<Cotizacion[]>([]);//: Cotizacion[] = [];
  titleQuote: string = '';
  titleQuoteOportunidad: string = "";
  headTotalQuote= signal<number>(0);

  blockedDocument = signal<boolean>(false);
  mensajeSpinner: string = "Cargando...";

  headTipoCambio: any;
  headNomCreador!: string;
  Cantidad!: number;
  PreciocostoTotal= signal<number>(0);
  smonto!: string ;
    simbmoneda!: string;

  constructor(
    private cdr: ChangeDetectorRef,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private serviceSharedApp: SharedAppService,
    private serviceOportunidad: OportunidadService,
  ) { }

  setSpinner(valor: boolean) {
    this.blockedDocument.set(valor);
    }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['IA_data']) {
        this.cargarCabecera();
      this.listarCotizaciones();
      this.ObtenerMonto();
    }
  }

  ngOnDestroy() {
    if (this.$listSubcription != undefined) {
      this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }
  }

  getBack() {
    console.log('getBack...', this.IA_data);
    this.OB_back.emit(this.IA_data);
  }

  cargarCabecera() {
    //console.log('this.IA_data...', this.IA_data);

    this.headCliente = this.IA_data.razonsocial;
    this.headDescrip = this.IA_data.description;
    this.headMoneda = this.IA_data.nommoneda;
    this.headFecha = this.IA_data.startDate;
    this.idoportunidad = this.IA_data.id;

    this.headTipoCambio = this.IA_data.tipocambio;
    this.headNomCreador = this.IA_data.nomcreador;
    this.titleQuoteOportunidad = "Quotes de Oportunidad N° - " + this.IA_data.id;
  }

  listarCotizaciones() {
    this.setSpinner(true);

    this.lstCotizacion.set([]);
    this.lstCotizacionItem.set([]);
    this.filteredCotizaItems.set([]);
    const $listarCotizaciones = this.serviceOportunidad.listarCotizaciones(this.IA_data.id)
      .subscribe({
        next: (rpta: any) => {
            this.setSpinner(false);
            console.log('listarCotizaciones', rpta);
            this.lstCotizacion .set(rpta.quotes);
            this.selectedCoti = this.lstCotizacion()[0].idcotiza;
            this.nomproveedor = this.lstCotizacion()[0].nomempresa ;
            this.smonto = this.lstCotizacion()[0].s_monto;
            this.simbmoneda = this.lstCotizacion()[0].simbmoneda;
            this.cargarFilterItems();
            this.calcularPreciocosto(this.lstCotizacion()[0].idcotiza);
            this.calcularPreciocostoTotal(this.lstCotizacion()[0].idcotiza);


        },
        error: (err) => {
            this.setSpinner(false);
          console.error('error : ', err)
          this.serviceSharedApp.messageToast()
        },
        complete: () => {
            this.setSpinner(false);
        }
      });
    this.$listSubcription.push($listarCotizaciones);
  }

  cargarFilterItems() {
    this.lstCotizacionItem.set([]);

    if (this.lstCotizacion()[0].idcotiza == 0) {
        this.lstCotizacion.set([]);
    }else{
        for (let i = 0; i < this.lstCotizacion().length; i++) {
            if (this.lstCotizacion()[i].items && this.lstCotizacion()[i].items.length > 0) {
              for (let y = 0; y < this.lstCotizacion()[i].items.length; y++) {
                this.lstCotizacionItem().push(this.lstCotizacion()[i].items[y]);
              }
            }
          }
          if (this.lstCotizacionItem.length > 0) {
            this.filteredCotizaItems.set(this.lstCotizacionItem().filter(item => item.idcotiza === this.selectedCoti));
          }
          this.titleQuote = "Quote (" + this.lstCotizacion.length.toString()+ ")";
    }
    //this.calcularTotalQuote();
    this.ObtenerMonto();
    this.cdr.detectChanges();
  }

  calcularTotalQuote() {
    //console.log('this.lstCotizacionItem...',this.lstCotizacionItem);
        let total = 0;

        if (this.lstCotizacionItem()) {
            for (let lista of this.lstCotizacionItem()) {
                total = total + lista.preciocostototal;
            }
        }
        this.headTotalQuote.set(total);
    }

    calcularPreciocosto(id: any) {
        let total = 0;
        if (this.lstCotizacionItem()) {
            for (let lstTipiProd of this.lstCotizacionItem()) {
                if (lstTipiProd.idcotiza === id) {
                    total = total + lstTipiProd.cantidad;
                }
            }
        }
        this.Cantidad = total;
    }

    calcularPreciocostoTotal(id: any) {
        let total = 0;
        if (this.lstCotizacionItem()) {
            for (let lstTipiProd of this.lstCotizacionItem()) {
                if (lstTipiProd.idcotiza === id) {
                    total = total + lstTipiProd.preciocostototal;
                }
            }
        }
        this.PreciocostoTotal.set(total);
    }

  cotizaFilter(dato: any) {
    console.log('dato...',dato);
    this.selectedCoti = dato.idcotiza;
    this.nomproveedor = dato.nomempresa;
    this.smonto = dato.s_monto;
            this.simbmoneda = dato.simbmoneda;

    this.calcularPreciocosto(dato.idcotiza);
    this.calcularPreciocostoTotal(dato.idcotiza);

    if (this.lstCotizacionItem().length > 0) {
      this.filteredCotizaItems.set(this.lstCotizacionItem().filter(item => item.idcotiza === dato.idcotiza))
    }
  }

  getCotizacion(data: any, idindicador: number) {
    data.idoportunidad = this.idoportunidad;
    console.log('getCotizacion...', data);

    globalVariable.codigoId = data.idcotiza;
    globalVariable.oportunidadId = this.idoportunidad;

    const objeto = {
      data,
      idindicador: idindicador,
      lstCotizacionItem: this.lstCotizacionItem().filter(item => item.idcotiza === data.idcotiza)
    }

    const ref = this.dialogService.open(CDatoCotizacion, {
      data: objeto,
      header: data.length == 0 ? "Nuevo Quote" : "Editar Quote N° - " + data.idcotiza,
      closeOnEscape: false,
      styleClass: 'testDialog',
      width: '50%',
      closable: true,
      //height: '60%'
    });

    if (ref) {
       ref.onClose.subscribe(() => {
      this.listarCotizaciones();
    });
    }

   
  }

  ObtenerMonto() {
    const $ObtenerMonto = this.serviceOportunidad.obtenerMontoOportunidad(this.IA_data.id)
      .subscribe({
        next: (rpta: any) => {
            console.log('ObtenerMonto', rpta);
            this.headTotalQuote .set(rpta.montototalquotes);
        },
        error: (err) => {
          console.error('error : ', err)
          this.serviceSharedApp.messageToast()
        },
        complete: () => {
        }
      });
    this.$listSubcription.push($ObtenerMonto);
  }
}
