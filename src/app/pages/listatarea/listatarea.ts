import { Component, DestroyRef, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs/internal/Subscription';
import { ListatareasService } from './service/listatareas.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Users } from '../model/interfaces';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { SharedAppService } from '../shared/sharedApp.service';
import { UtilitariosService } from '../service/utilitarios.service';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../model/constantes';
import { Tarea } from './tarea/tarea';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CListadoFile } from '../lead/c-listado-file/c-listado-file';
import { mTarea } from './m-tarea/mtarea';

@Component({
    selector: 'app-listatareas',
    templateUrl: './listatarea.html',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, Tarea],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService]
})
export class Listatareas implements OnInit, OnDestroy {
    @Input() IA_data: any;
    $listSubcription: Subscription[] = [];
    frmDatos!: FormGroup;
    listaTareas = signal<any[]>([]);
    btnBuscar: boolean = false;
    cols: any[] = [];

    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = '';
    lstProveedores = signal<any[]>([]);
    vistaLista = signal<boolean>(true);
    visDetalle = signal<boolean>(false);
    tituloDetalle!: string;
    dataPrc: any;
    lstOportunidad = signal<any[]>([]);
    idperfil: number = 0;
    Vendedor = signal<Users[]>([]);
    idvendedor: number = 0;
    Usuario!: Users;
    verPreventa = signal<boolean>(false);
    verComercial = signal<boolean>(false);
    promedio: number = 0;

    private readonly destroyRef = inject(DestroyRef);
    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private listatareasService: ListatareasService,
        private utilitariosService: UtilitariosService,
        private serviceSharedApp: SharedAppService,
        public dialogService: DialogService
    ) {
        this.idperfil = constantesLocalStorage.idperfil;
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit(): void {
        if (this.idperfil === 3) {
            this.verPreventa.set(true);
        }
        if (this.idperfil === 2 || this.idperfil === 4) {
            this.verComercial.set(true);
        }
        console.log('ngOnInit : ', this.IA_data);

        this.createFrm();
        this.listaClientes();
        this.listaVendedor();
        this.getBuscar();

        if (this.IA_data !== undefined) {
            this.dataPrc = {
                data: this.IA_data,
                paramReg: 'E'
            };
            this.tituloDetalle = 'Seguimiento de Tarea';
            this.vistaLista.set(false);
            this.visDetalle.set(true);
        }
    }

    ngOnDestroy(): void {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
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
            ]
        });
    }

    getBuscar() {
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;

        let usuario = 0;
        switch (this.idperfil) {
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
            ...this.frmDatos.getRawValue(),
            idusuario: usuario
        };

        this.btnBuscar = true;
        const $listaTareas = this.listatareasService
            .listaTareas(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('rpta listaTareas', rpta);
                    this.listaTareas.set(rpta);
                    this.promedio = Number((this.listaTareas().reduce((acc: any, item: any) => acc + item.progreso, 0) / this.listaTareas.length).toFixed(2));
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
                    this.btnBuscar = false;
                    this.setSpinner(false);
                }
            });
        this.$listSubcription.push($listaTareas);
    }

    listaClientes() {
        const objeto = {
            idrolpersona: 'CLI',
            idusuario: constantesLocalStorage.idusuario
        };

        const $getClientes = this.listatareasService.ListaProveedores(objeto).subscribe({
            next: (rpta: any) => {
                this.lstProveedores.set(rpta);
                const objet = {
                    idcliente: 0,
                    nomcomercial: 'TODOS'
                };
                this.lstProveedores.set([objet, ...rpta]);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($getClientes);
    }

    onVer(data: any) {
        // this.dataPrc = {
        //   idordencompra: data.idordencompra,
        //   paramReg:'V'
        // }
        // this.tituloDetalle = "Ver Factura N° " + data.nrofactura;
        // this.vistaLista = false;
        // this.visDetalle = true;
        // this.visQuote = false;
    }

    onVerDetalle(data: any) {
        //   this.setSpinner(true);
        // this.mensajeSpinner = 'Descargando Detalle...!';
        // const objeto = {
        //   idusuario : constantesLocalStorage.idusuario,
        //   iddocumentoprc: data.idordencompra,
        //   codtipoprc: 6,
        //   idplantilla: 0
        // }
        // const $cargarOrdenC = this.ordencompraService.prcDocumentoDet(objeto).subscribe({
        //   next: (rpta: any) => {
        //     this.setSpinner(false);
        //     const mediaType = 'application/pdf';
        //       const blob = new Blob([rpta.body], { type: mediaType });
        //       const filename = 'DET_FACT_VENTA_'+ data.nrofactura;
        //       const url = window.URL.createObjectURL(blob);
        //       const a = document.createElement('a');
        //       a.href = url;
        //       a.download = filename;
        //       document.body.appendChild(a);
        //       a.target = '_blank';
        //       a.click();
        //       window.open(url);
        //       setTimeout(() => {
        //           document.body.removeChild(a);
        //           window.URL.revokeObjectURL(url);
        //       }, 100);
        //   },
        //       error: (err) => {
        //         this.setSpinner(false);
        //       this.messageService.clear();
        //       this.messageService.add({
        //           severity: 'error',
        //           summary: 'Error',
        //           detail: mensajesQuestion.msgErrorGenerico,
        //       });
        //   },
        //       complete: () => {
        //   },
        // });
        // this.$listSubcription.push($cargarOrdenC)
    }

    onGestionar(data: any) {
        this.dataPrc = {
            data: data,
            paramReg: 'E'
        };
        this.tituloDetalle = 'Seguimiento de Tarea';
        this.vistaLista.set(false);
        this.visDetalle.set(true);
    }

    getDetalle(dato: any) {
        this.vistaLista.set(true);
        this.visDetalle.set(false);
    }

    getBack() {
        this.vistaLista.set(true);
        this.getBuscar();
        this.visDetalle.set(false);
    }

    anexos(dato: any, param: string) {
        console.log('anexos : ', dato);
        const ref = this.dialogService.open(CListadoFile, {
            data: {
                idoportunidad: dato.id,
                codtipoproc: 1,
                idnroproceso: 0,
                parametro: param
            },
            header: dato.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true
        });
        ref?.onClose.subscribe(() => {
            //this.actualizarLista();
        });
    }

    listarOportunidades() {
        if (this.frmDatos.value.idcliente > 0) {
            const objeto = {
                idcliente: this.frmDatos.value.idcliente
            };

            const $getClientes = this.listatareasService.listarOportxCliente(objeto).subscribe({
                next: (rpta: any) => {
                    this.lstOportunidad = rpta;
                    const objet = {
                        id: 0,
                        titulo: 'TODOS'
                    };
                    this.lstOportunidad.set([objet, ...rpta]);
                },
                error: (err) => {
                    this.serviceSharedApp.messageToast();
                },
                complete: () => {}
            });
            this.$listSubcription.push($getClientes);
        }
    }

    listaVendedor() {
        this.listatareasService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                //console.info('next : ', rpta);
                this.Vendedor.set(rpta);
                this.Vendedor.update((vendedor) => [
                    ...vendedor,
                    (this.Usuario = {
                        idusuario: 0,
                        name: 'TODOS'
                    })
                ]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
    }

    onNuevo() {
        const objeto = {
            idtarea: 0
        };
        const refMensaje = this.dialogService.open(mTarea, {
            data: objeto,
            header: 'Registrar Tarea',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: false,
            width: '35%'
        });
        if (refMensaje) {
            refMensaje.onClose.subscribe((rpta: any) => {
                this.getBuscar();
            });
        }
    }

    onEditar(data: any) {
        
        const refMensaje = this.dialogService.open(mTarea, {
            data: data,
            header: 'Editar Tarea',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: false,
            width: '35%'
        });
        if (refMensaje) {
            refMensaje.onClose.subscribe((rpta: any) => {
                this.getBuscar();
            });
        }
    }
}
