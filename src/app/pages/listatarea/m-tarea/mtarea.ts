import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { ShareService } from '../../service/serviceShare.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { LeadService } from '../../lead/lead.services';
import { FormBuilder, FormGroup } from '@angular/forms';
import { constantesLocalStorage, mensajesQuestion } from '../../model/constantes';
import { KanbanCard } from '../../model/interfaces';
import { KanbanService } from '../../kanban/service/kanban.service';
import { ListatareasService } from '../service/listatareas.service';

@Component({
    selector: 'app-m-lead',
    imports: [PRIMENG_MODULES],
    templateUrl: './mtarea.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ShareService, ConfirmationService, SharedAppService, ListatareasService, LeadService]
})
export class mTarea implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
    card: KanbanCard = { id: '0', idlista: 1, monto: 0, tipocambio: 0, dueDate: '', taskList: { title: 'Lista de tareas sin título', tasks: [] }, fecampliacion: '' };
    frmDatos: KanbanCard = { id: '0', idlista: 1, monto: 0, tipocambio: 0, dueDate: '', taskList: { title: 'Lista de tareas sin título', tasks: [] }, fecampliacion: '', regoportunidadesext: [] };

    data: any;
    lstClientes = signal<any[]>([]);
    frmAccion!: FormGroup;
    registerFormCliente!: FormGroup;
    blockedDocument = signal<boolean>(false);
    mensajeSpinner = signal<string>('');
    errorMensaje: string = '';
    personaNatural = signal<boolean>(false);
    submitted = signal<boolean>(false);
    headerTitle: string = '';

    lstProveedores = signal<any[]>([]);
    lstOportunidad = signal<any[]>([]);

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService,
        private serviceSharedApp: SharedAppService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
        private listatareasService: ListatareasService,
        private leadService: LeadService,
    ) {}

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit(): void {
        this.createFrm();
        this.listaClientes();
        console.log('this.config...', this.config.data);
        this.frmAccion.patchValue(this.config.data)
        console.log('this.frmAccion...', this.frmAccion.value);

        if (this.frmAccion.get('idtarea')?.value > 0) {
            this.listarOportunidades02();
        }
    }

    createFrm() {
        this.frmAccion = this.fb.group({
            idtarea: [{ value: 0, disabled: false }],
            idcliente: [{ value: null, disabled: false }],
            idoportunidad: [{ value: null, disabled: false }],
            descripcion: [{ value: null, disabled: false }],
            fechaini: [{ value: this.utilitariosService.obtenerFechaActual(), disabled: false }],
            fechafin: [{ value: null, disabled: false }],
        });
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    cerrar(data: any) {
        this.ref.close({ data });
    }

    listaClientes() {
        const objeto = {
            idrolpersona: 'CLI',
            idusuario: constantesLocalStorage.idusuario,
        };

        const $getClientes = this.listatareasService
            .ListaProveedores(objeto)
            .subscribe({
                next: (rpta: any) => {
                    this.lstProveedores.set(rpta);
                    // const objet = {
                    //     idcliente: 0,
                    //     nomcomercial: 'TODOS',
                    // };
                    // this.lstProveedores.set([objet, ...rpta]);
                },
                error: (err) => {
                    this.serviceSharedApp.messageToast();
                },
                complete: () => { },
            });
        this.$listSubcription.push($getClientes);
    }

    onSave() {
        if (this.validarDatos()) {
            console.log('errorMensaje : ', this.errorMensaje);
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: this.errorMensaje });
            return;
        }

         let fechaini = this.frmAccion.get('fechaini')?.value
        console.log('fechaini...', fechaini);
        let fechafin = this.frmAccion.get('fechafin')?.value
        console.log('fechafin...', fechafin);

        if (fechaini.length === 10) {
            fechaini = new Date(this.utilitariosService.formatFecha(fechaini))
        }

        if (fechafin.length === 10) {
            fechafin = new Date(this.utilitariosService.formatFecha(fechafin))
        }

        const objeto = {
            idtarea: this.frmAccion.get('idtarea')?.value,
            idoportunidad: this.frmAccion.get('idoportunidad')?.value,
            idtarea_origen: 0,
            descripcion: this.frmAccion.get('descripcion')?.value ,
            fechaini: fechaini,
            fechafin: fechafin,
            progreso: 0,
            completo: false,
            indvig: true,
            horaini: '00:00',
            horafin: '00:00',
            idtarea_acti: 0,
            idetapa: 0,
            idprioridad: 1,
            idusuario: constantesLocalStorage.idusuario
        };
        console.log('objeto...', objeto);

        
        const $agregarSubTarea = this.leadService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('tareaPrc', rpta);
                if (rpta.procesoSwitch === 0) {
                    this.tareaprcasignado(rpta.resultProceso);
                }
                
                
                this.cerrar(objeto);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);


    }

    validarDatos(): boolean {
        let _error = false;
        this.errorMensaje = '';
        console.log('this.frmDatos...', this.frmAccion.value);

        if (this.frmAccion.value.idcliente === null) {
            this.errorMensaje = 'Seleccionar Cliente...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.idoportunidad === '' || this.frmAccion.value.idoportunidad === ' ' || this.frmAccion.value.idoportunidad === null)) {
            this.errorMensaje = 'Seleccionar Oportunidad...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.descripcion === '' || this.frmAccion.value.descripcion === null)) {
            this.errorMensaje = 'Ingresar Descripción...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.fechaini === '' || this.frmAccion.value.fechaini === null)) {
            this.errorMensaje = 'Ingresar Fecha Inicio...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.fechafin === '' || this.frmAccion.value.fechafin === null)) {
            this.errorMensaje = 'Ingresar Fecha Final...!';
            _error = true;
        }

        // if (!_error) {
        //     const ini = new Date(this.frmAccion.value.fechaini);
        //     const fin = new Date(this.frmAccion.value.fechafin);
        //     ini.setHours(0, 0, 0, 0);
        //     fin.setHours(0, 0, 0, 0);
        //     if (fin < ini) {
        //         this.errorMensaje = 'La Fecha Final no puede ser menor a la Fecha Inicio...!';
        //         _error = true;
        //     }
        // }

        return _error;
    }

    listarOportunidades() {
        if (this.frmAccion.value.idcliente > 0) {
            const objeto = {
                idcliente: this.frmAccion.value.idcliente,
            };

            const $getClientes = this.listatareasService
                .listarOportxCliente(objeto)
                .subscribe({
                    next: (rpta: any) => {
                        this.lstOportunidad.set(rpta);
                        // const objet = {
                        //     id: 0,
                        //     titulo: 'TODOS',
                        // };
                        // this.lstOportunidad.set([objet, ...rpta]);
                    },
                    error: (err) => {
                        this.serviceSharedApp.messageToast();
                    },
                    complete: () => { },
                });
            this.$listSubcription.push($getClientes);
        }
    }

    listarOportunidades02() {
        console.log('listarOportunidades02');
        const objeto = {
            idcliente: this.frmAccion.value.idcliente,
        };

        const $getClientes = this.listatareasService
            .listarOportxCliente(objeto)
            .subscribe({
                next: (rpta: any) => {
                    this.lstOportunidad.set(rpta);
                    
                },
                error: (_err) => {
                    this.serviceSharedApp.messageToast();
                },
                complete: () => { 
                    this.setearOportunidad();
                },
            });
        this.$listSubcription.push($getClientes);
    }

    setearOportunidad(){
        console.log('setearOportunidad');
        console.log('this.lstOportunidad', this.lstOportunidad());
        const idoportunidad  =  (this.frmAccion.get('idoportunidad')?.value).toString();
        console.log('idoportunidad', idoportunidad);
        this.frmAccion.get('idoportunidad')?.setValue(idoportunidad);
    }

     tareaprcasignado(idtarea:any) {

         console.log('this.tareaprcasignado', idtarea);
        
        const objeto = {
            idtarea: idtarea,
            idusuario: constantesLocalStorage.idusuario
        };

        const $getClientes = this.leadService
            .tareaPrcAsignado(objeto)
            .subscribe({
                next: (rpta: any) => {
                    
                    
                },
                error: (_err) => {
                    this.serviceSharedApp.messageToast();
                },
                complete: () => { 
                    
                },
            });
        this.$listSubcription.push($getClientes);
    }
}
