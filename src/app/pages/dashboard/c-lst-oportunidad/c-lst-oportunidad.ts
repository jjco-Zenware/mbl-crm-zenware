import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Subscription } from 'rxjs';
import { KanbanService } from '../../kanban/service/kanban.service';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';
import { SharedAppService } from '../../shared/sharedApp.service';
import { KanbanCard } from '../../model/interfaces';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { constantesLocalStorage, mensajesQuestion } from '../../model/constantes';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-c-lst-oportunidad',
    templateUrl: './c-lst-oportunidad.html',
    styleUrls: ['./c-lst-oportunidad.scss'],
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    standalone: true,
    providers: [MessageService, DialogService, SharedAppService, KanbanService]
})
export class CLstOportunidad implements OnInit, OnDestroy {
    @Input() IA_data: any;
    $listSubcription: Subscription[] = [];
    @ViewChild('menu') menu!: Menu;
    @Output() verQuote = new EventEmitter<any>();
    @Output() verBussines = new EventEmitter<any>();
    @Output() OB_back = new EventEmitter<any>();
    @Output() verMntOportunidad = new EventEmitter<any>();
    @Output() kpiData = new EventEmitter<{ total: number; montoTotal: number }>();
    codigoBC: string = '';
    cardList= signal<any[]>([]);
    dataCT: any;
    menuItems: MenuItem[] = [];
    menuItem!: MenuItem;
    acciones: any;
    oportunidad!: KanbanCard;
    tipoproducto: any;
    events= signal<any[]>([]);
    blockedDocumentk= signal<boolean>(false);
    blockedDocument= signal<boolean>(false);
    mensajeSpinner: string = 'Cargando...!';
    dialogVisible: boolean = false;
    lstExportar= signal<any[]>([]);
    dataOpo: any;
    lstExportarProvee= signal<any[]>([]);
    lstExportarEXCEL= signal<any[]>([]);
    verPreventa= signal<boolean>(false);
    verComercial= signal<boolean>(false);

    constructor(
        private oportunidadService: OportunidadService,
        public dialogService: DialogService,
        private messageService: MessageService,
        private kanbanService: KanbanService,
        private serviceSharedApp: SharedAppService
    ) {}

    setSpinner(valor: boolean) {
        this.blockedDocumentk.set(valor);
    }

    setSpinner2(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['IA_data']) {
            console.log('this.IA_data...', this.IA_data);
            this.cargarOportunidades(this.IA_data);
        }
    }

    ngOnInit(): void {
        //console.log('this.IA_data...', this.IA_data);
        //this.getListakanban();
        //this.cargarOportunidades(this.IA_data);

        if (constantesLocalStorage.idperfil === 3) {
            this.verPreventa.set(true);
        }
        if (constantesLocalStorage.idperfil === 2 || constantesLocalStorage.idperfil === 4) {
            this.verComercial.set(true);
        }
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    // onVer(data: KanbanCard) {
    //     //console.log('dataxxxxxxx...', data);
    //     const ref = this.dialogService.open(CDetalleOportunidadComponent, {
    //         data: data,
    //         header: 'N° ' + data.id +' - '+ data.title,
    //         closeOnEscape: false,
    //         styleClass: 'testDialog',
    //         width: '60%'
    //     });
    // }

    toggleMenu(event: Event, data: KanbanCard) {
        console.log('toggleMenu', data);

        if (data.acciones && data.acciones.length > 0) {
            this.cargarMenu(data.acciones);
            //console.log('toggleMenu', data);
            this.oportunidad = data;
            this.tipoproducto = data.tipoproducto;
            this.menu.toggle(event);
        }
    }

    cargarMenu(data: any) {
        this.menuItems = [];
        data.forEach((item: any) => {
            this.menuItems.push({
                label: item.nomtrx,
                icon: 'pi pi-cog',
                command: () => this.onAccion(item)
            });
        });
    }

    onAccion(item: any) {
        console.log(item);
        // this.descripcion = "";
        // this.modalvisible = true;

        // this.headerTitleAccion = item.nomtrx;
        // this.btnTitleAccion = item.nomtrxbtn;
        // this.btnIdAccion = item.idtrx;
        // this.btnIconAccion = item.icono;
        // this.btnColor = item.clasebtn;

        // if (item.idtrx == 104) {
        //     this.tipoproducto.forEach((item: any) => {
        //         console.log('tipoproducto...', item);
        //         switch (item.nomtipoproducto) {
        //             case "HARDWARE":
        //                 this.harvisible = true;
        //             break;
        //             case "SOFTWARE":
        //                 this.sofvisible = true;
        //             break;
        //             case "SERVICIOS":
        //                 this.servisible = true;
        //             break;
        //             case "CAPACITACION":
        //                 this.capvisible = true;
        //             break;
        //             case "OTROS":
        //                 this.otrvisible = true;
        //             break;
        //         }
        //     });
        // }
    }

    businessCase(data: KanbanCard) {
        console.log('businessCase : ', data);
        this.verBussines.emit(data);
        //this.codigoBC = data.id;
    }

    quote(data: KanbanCard) {
        console.log('quote : ', data);
        this.verQuote.emit(data);

        //const {id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio} = data;
        //this.dataCT = {id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio};
    }

    // anexos(dato: any, param: string) {
    //     console.log("anexos : ", dato);
    //     const ref = this.dialogService.open(CListadoFileComponent, {
    //         data: { idoportunidad: dato.id , codtipoproc: 1, idnroproceso: 0, parametro: param},
    //         header: dato.title,
    //         styleClass: 'testDialog',
    //         closeOnEscape: false,
    //         closable: true,
    //     });
    // }

    cargarOportunidades(datos: any) {
        this.cardList.set([]);
        this.lstExportar.set([]);
        this.setSpinner(true);
        console.log('cargarOportunidades', datos);

        const $listarOportunidad = this.oportunidadService.obtenerDataDasboard(datos).subscribe({
            next: (rpta: any) => {
                this.cardList.set(rpta);
                this.lstExportar.set(rpta);
                console.log('cardList', rpta);
                const montoTotal = rpta.reduce((acc: number, item: any) => acc + (item.monto ?? 0), 0);
                this.kpiData.emit({ total: rpta.length, montoTotal });
                this.setSpinner(false);
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
        this.$listSubcription.push($listarOportunidad);
    }

    getListakanban() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...';
        const $getListakanban = this.kanbanService.ListaKanban().subscribe({
            next: (rpta: any) => {
                console.log('rpta getListakanban : ', rpta);
                this.events.set(rpta);
                //this.lstExportar = rpta;
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
            complete: () => {
                this.setSpinner(false);
            }
        });
        this.$listSubcription.push($getListakanban);
    }

    showDialog() {
        this.dialogVisible = true;
    }

    editarRegistro(data: any) {
        this.setSpinner(true);
        this.mensajeSpinner = 'Actualizando...';

        console.log('editarRegistro...', data);

        let object = {
            idoportunidad: data.id,
            mescierre: data.mescierre,
            porcentaje: data.porcentaje
        };
        this.oportunidadService.prcDashboard(object).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta...', rpta);
                this.cargarOportunidades(this.IA_data);
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }

 

    onRowSelect(event: any) {
        console.log('onRowSelect', event.data);

        this.verMntOportunidad.emit(event.data);
        /*this.dataOpo = event.data;
        this.setSpinner2(true);
        this.mensajeSpinner = 'Cargando...!';

        this.kanbanService.onCardSeleccionar(event.data.id, event.data.idlista).subscribe({
            next: (rpta: any) => {
                this.setSpinner2(false);
            },
            error: (err) => {
                this.setSpinner2(false);
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });*/
    }

    actualizarKanban(data: any) {
        console.log('actualizarKanban : ', data);
        if (data === 'G') {
            this.OB_back.emit(data);
        }
    }

    businessCase2(data: KanbanCard) {
        console.log('businessCase2 : ', data);
        this.verBussines.emit(data);
    }

    quote2(data: KanbanCard) {
        console.log('quote2 : ', data);
        this.verQuote.emit(data);
    }

    oportunidadextList() {
        let usuario = 0;
        if (constantesLocalStorage.idperfil !== 4) {
            usuario = constantesLocalStorage.idusuario;
        }
        this.lstExportarProvee.set([]);
        const $getListakanban = this.oportunidadService.oportunidadextList(this.IA_data.annio, usuario).subscribe({
            next: (rpta: any) => {
                console.log('rpta getListakanban : ', rpta);
                this.lstExportarProvee.set(rpta);
                this.exportExcelExt();
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

     

    exportExcelExt() {
        const list: any[] = [];
        for (let i = 0; i < this.lstExportarProvee().length; i++) {
            const objeto = {
                'N°': i + 1,
                'FEC REGISTRO': this.lstExportarProvee()[i].fecreg,
                'PROVEEDOR': this.lstExportarProvee()[i].razonsocial,
                'MARCA': this.lstExportarProvee()[i].nommarca,
                'N° OPORT EN MARCA': this.lstExportarProvee()[i].numregoportunidad,
                'FEC VENCIMIENTO': this.lstExportarProvee()[i].fechavence,
                'VENDEDOR': this.lstExportarProvee()[i].nomusuario,
                'N° OPORTUNIDAD': this.lstExportarProvee()[i].idoportunidad,
                'ESTADO': this.lstExportarProvee()[i].nomlista,
                'OPORTUNIDAD': this.lstExportarProvee()[i].titulo,
            };
            list.push(objeto);
        }
        this.lstExportarEXCEL.set(list);

        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(this.lstExportarEXCEL());
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile2(excelBuffer, 'Oportunidades en Proveedor');
        });
    }

    saveAsExcelFile2(buffer: any, fileName: string): void {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_'+ EXCEL_EXTENSION);
    }

    exportExcel() {
        const list: any[] = [];
        for (let i = 0; i < this.cardList().length; i++) {
            let oportuexter = this.cardList()[i].regoporext;
            if (oportuexter != null || oportuexter != undefined) {
                oportuexter = this.cardList()[i].regoporext;
            } else {
                oportuexter = [{ numregoportunidad: '', fechavence: '' }];
            }

            const objeto = {
                'N°': i + 1,
                'VENDEDOR': this.cardList()[i].nomcreador,
                'N° OPORTUNIDAD': this.cardList()[i].id,
                'TÍTULO': this.cardList()[i].title,
                'PREVENTA': this.cardList()[i].nompreventa,
                'TEAM PREVENTA': this.cardList()[i].nomasignados,
                'CLIENTE': this.cardList()[i].nomcomercial,
                'PROVEEDOR': this.cardList()[i].lst_regoportuext,
                'ESTADO': this.cardList()[i].nomlista,
                'MONEDA': this.cardList()[i].nommoneda,
                'MONTO': this.cardList()[i].monto,
                'Q': this.cardList()[i].Q,
                'FEC REGISTRO': this.cardList()[i].startDate,
                'MES CIERRE': this.cardList()[i].mescierre.substring(0, 2) + '/' + this.cardList()[i].mescierre.substring(2, 6),
                'OPOR EN MARCA': this.cardList()[i].lst_regoportuext,
                'N° OPO MARCA': (oportuexter === null || oportuexter === undefined) ? '' : oportuexter[0].numregoportunidad,
                'FEC VEN MARCA': (oportuexter === null || oportuexter === undefined) ? '' : oportuexter[0].fechavence
            };
            list.push(objeto);
        }
        this.lstExportar.set(list);

        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(this.lstExportar());
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, 'Oportunidades');
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_'+ EXCEL_EXTENSION);
    }

    getExportarExcel(data:any) {
        console.log("rpta getExportarExcel : ", data._value);
        this.setSpinner(true);
        //this.mensajeSpinner = mensajesSpinner.msjRecuperaLista
    
        const objeto = {
          lista: this.lstExportar(),
          idusuario: constantesLocalStorage.idusuario
        }
    
        const $getListar = this.oportunidadService.exportarexcelOportunidades(objeto)
        .subscribe({
          next: (rpta:any) => {
              this.setSpinner(false);
              this.oportunidadService.descargarExcel(rpta, 'Oportunidades');
          },
          error:(err)=>{
              this.setSpinner(false);
              this.serviceSharedApp.messageToast()
          },
          complete:() => {
            this.setSpinner(false);
          }
        });
      this.$listSubcription.push($getListar)
      }
}
