import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion } from '../model/constantes';
import { SharedAppService } from '../shared/sharedApp.service';
import { ListatareasService } from '../listatarea/service/listatareas.service';
import { mLead } from './m-lead/m-lead';
import { Users } from '../model/interfaces';
import { LeadService } from '../lead/lead.services';
import { Tarea } from '../listatarea/tarea/tarea';

@Component({
    selector: 'app-c-tareas-pre',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, Tarea],
    templateUrl: './tareaspre.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService, LeadService]
})
export class TareaPre implements OnInit, OnDestroy {
    private readonly destroyRef = inject(DestroyRef);
    $listSubcription: Subscription[] = [];

    dataAdjunto: any;
    blockedDocument = signal<boolean>(false);
    mensajeSpinner = signal<string>('');

    errorMensaje: string = '';
    //listaTareas = signal<any[]>([]);
    headerTarea?: string;
    headerTitle: string = '';
    lstpreventas = signal<any[]>([]);
    frmDatos!: FormGroup;
    Vendedor = signal<Users[]>([]);
    idvendedor: number = 0;
    Usuario!: Users;
    lstProveedores = signal<any[]>([]);
    lstOportunidades = signal<any[]>([]);
    visOportunidad = signal<boolean>(true);
    dataPrc: any;
    tituloDetalle: string = 'Gestión de Actividades';

    constructor(
        private fb: FormBuilder,
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private serviceSharedApp: SharedAppService,
        private serviceUtilitario: UtilitariosService,
        public dialogService: DialogService,
        private listatareasService: ListatareasService,
        private confirmationService: ConfirmationService,
        private utilitariosService: UtilitariosService,
        private leadService: LeadService
    ) {}

    ngOnInit(): void {
        this.createFrm();
        this.listaClientes();
        this.listaVendedor();
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
            ]
            // idcliente: [
            //     {
            //         value: 0,
            //         disabled: false,
            //     },
            // ],
            // idoportunidad: [
            //     {
            //         value: 0,
            //         disabled: false,
            //     },
            // ],
        });
    }

    getBuscar() {
        this.lstOportunidades.set([]);
        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            fechaini: this.frmDatos.value.fechaini,
            fechafin: this.frmDatos.value.fechafin
        };
        this.mensajeSpinner.set('Cargando...!');
        this.setSpinner(true);

        this.leadService.listLeadPreventa(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('cargarOportunidades...', rpta);
                this.lstOportunidades.set(rpta);
            },
            error: () => {
                this.setSpinner(false);
            },
            complete() {}
        });
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

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    nuevoLead() {
        const refMensaje = this.dialogService.open(mLead, {
            // data: data,
            header: 'REGISTRAR LEAD',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '35%'
        });
        if (refMensaje) {
            refMensaje.onClose.subscribe((rpta: any) => {
                this.getBuscar();
            });
        }
    }

    getBack() {
        this.visOportunidad.set(true);
        this.getBuscar();
    }

    nuevaTarea(dato: any) {
        const objeto = {
            idoportunidad: dato.idoportunidad
        };

        this.leadService.listTareaOport(objeto).subscribe({
            next: (rpta: any) => {
                console.log('nuevaTarea...', rpta);
                if (rpta.length === 0) {
                    this.agregarTarea(dato);
                } else {
                    this.traerUnoTarea(rpta[0].idtarea, dato);
                }
            },
            error: () => {
                this.serviceSharedApp.messageToast();
            },
            complete() {}
        });
    }

    agregarTarea(dato: any) {
        this.setSpinner(true);
        this.mensajeSpinner.set('Cargando...');

        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + 3)
        console.log('fecha...', new Date(fecha))

        const objeto = {
            idtarea: 0,
            idoportunidad: parseInt(dato.idoportunidad),
            idtarea_origen: 0,
            descripcion: 'Revisión de especificaciones técnicas',
            fechaini: new Date(),
            fechafin: new Date(fecha.setMonth(fecha.getMonth() + 3)),
            progreso: 0,
            completo: false,
            indvig: true,
            horaini: '00:00',
            horafin: '00:00',
            idtarea_acti: 0,
            idetapa: 0
        };
        console.log('agregarEtapa', objeto);

        const $agregarSubTarea = this.listatareasService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('tareaPrc', rpta);
                this.traerUnoTarea(rpta.resultProceso, dato);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);
    }

    traerUnoTarea(id: any, dato: any) {
        const objeto = {
            idtarea: id
        };
        const $agregarSubTarea = this.listatareasService.tareaTraeruno(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('traerUnoTarea', rpta);
                console.log('rpta.descripcion', rpta[0].descripcion);

                ((dato.descripcion = rpta[0].descripcion), 
                (dato.fechaini = rpta[0].fechaini), 
                (dato.fechafin = rpta[0].fechafin));

                const parametro = {
                    ...dato,
                    idtarea: parseInt(id)
                };
                this.dataPrc = {
                    data: parametro,
                    paramReg: 'E'
                };

                this.visOportunidad.set(false);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);
    }
}
