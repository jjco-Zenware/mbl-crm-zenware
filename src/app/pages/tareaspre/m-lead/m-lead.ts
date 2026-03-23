import { Component, DestroyRef, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { ShareService } from '../../service/serviceShare.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { LeadService } from '../../lead/lead.services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { constantesLocalStorage, mensajesQuestion } from '../../model/constantes';
import { KanbanCard, Users } from '../../model/interfaces';
import { KanbanService } from '../../kanban/service/kanban.service';

@Component({
    selector: 'app-m-lead',
    imports: [PRIMENG_MODULES],
    templateUrl: './m-lead.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ShareService, ConfirmationService, SharedAppService, KanbanService]
})
export class mLead implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
     card: KanbanCard = { id: '0', idlista: 1, monto: 0, tipocambio: 0, dueDate: '', taskList: { title: 'Lista de tareas sin título', tasks: [] }, fecampliacion: '' };
     frmDatos: KanbanCard = { id: '0', idlista: 1, monto: 0, tipocambio: 0, dueDate: '', taskList: { title: 'Lista de tareas sin título', tasks: [] }, fecampliacion: '', regoportunidadesext: [] };
      
    data: any;
    lstClientes = signal<any[]>([]);
    frmAccion!: FormGroup;
    registerFormCliente!: FormGroup;
    lstTipoProducto = signal<any[]>([]);
    blockedDocument = signal<boolean>(false);
    mensajeSpinner = signal<string>('');
    private readonly destroyRef = inject(DestroyRef);
    errorMensaje: string = '';
    personaNatural = signal<boolean>(false);
    submitted = signal<boolean>(false);
    headerTitle: string = '';
    clienteVisible = signal<boolean>(false);
    Vendedor = signal<Users[]>([]);
    Preventa = signal<Users[]>([]);
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

    lstEnti = [
        { id: 'P', name: 'PRIVADO' },
        { id: 'E', name: 'ESTADO' }
    ];

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private leadService: LeadService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private serviceSharedApp: SharedAppService,
        private fb: FormBuilder,
        private formBuilder: FormBuilder,
        private utilitariosService: UtilitariosService,
        private kanbanService: KanbanService,
    ) {}

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit(): void {
        console.log('this.config...', this.config.data);
        this.createFrm();
        this.cargarEmpresa();
        this.createFormCliente();
        this.listaTipoProducto();
        this.listaVendedor();
        this.listaPreventa();
    }

    createFrm() {
        this.frmAccion = this.fb.group({
            idcliente: [{ value: null, disabled: false }],
            title: [{ value: null, disabled: false }],
            description: [{ value: null, disabled: false }],
            justificacion: [{ value: null, disabled: false }],
            startDate: [{ value: this.utilitariosService.obtenerFechaActual(), disabled: false }],
            idtipoprod: [{ value: null, disabled: false }],
            idusuario: [{ value: null, disabled: false }],
            idpreventa: [{ value: constantesLocalStorage.idusuario, disabled: false }]
        });
    }

    createFormCliente() {
        //Agregar validaciones de formulario
        this.registerFormCliente = this.formBuilder.group({
            idrolpersona: [{ value: 'CLI', disabled: false }],
            tipopersona: [{ value: 'J', disabled: false }],
            tipoalta: [{ value: 'NOR', disabled: false }],
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
            indmigrado: [{ value: false, disabled: false }],
            indestado: [{ value: '1', disabled: false }],
            indvig: [{ value: true, disabled: false }],
            fechareg: [{ value: new Date(), disabled: false }],
            iduserreg: [{ value: 1, disabled: false }],
            fechaact: [{ value: new Date(), disabled: false }],
            iduseract: [{ value: 1, disabled: false }],
            idpersona: [{ value: 0, disabled: false }],
            tipocambio: [{ value: 0, disabled: false }],
            tipoentidad: [{ value: null, disabled: false }, [Validators.required]],
            idtipoprod: [{ value: null, disabled: false }],
            codigoproyecto: [{ value: null, disabled: false }],
            proyecto_cod: [{ value: null, disabled: false }]
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

    cargarEmpresa() {
        this.lstClientes.set([]);
        const $OportunidadesLista = this.leadService
            .obtenerClientes('CLI')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.lstClientes.set(
                        rpta.map((item: any) => ({
                            idcliente: item.idcliente,
                            razonsocial: item.razonsocial
                        }))
                    );
                    //this.lstClientes = rpta;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error...',
                        detail: err
                    });
                },
                complete: () => {}
            });
        this.$listSubcription.push($OportunidadesLista);
    }

    /*INICIO PRC CLIENTE*/
    NuevoCliente() {
        this.cambioTipoPer('J');
        this.submitted.set(false);
        this.headerTitle = 'Nuevo Cliente';
        this.clienteVisible.set(true);
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
        } else {
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
        } else {
            //this.cliente.tipopersona == 'N';
        }
    }

    guardarCliente() {
        this.submitted.set(true);
        console.log('guardarCliente...', this.registerFormCliente.getRawValue());

        // deténgase aquí si el formulario no es válido
        if (this.registerFormCliente.invalid) {
            console.log('deténgase aquí si el formulario no es válido');
            this.messageService.add({ severity: 'warn', detail: 'Formulario inválido, falta información requerida' });
            return;
        }

        //Verdadero si todos los campos están llenos
        if (this.submitted()) {
            this.leadService.prcClientes(this.registerFormCliente.getRawValue()).subscribe({
                next: (rpta: any) => {
                    console.log('rpta prcClientes : ', rpta);
                    if (rpta.procesoSwitch == 0) {
                        this.messageService.add({ severity: 'success', detail: 'Operación exitosa' });
                        this.cargarEmpresa();
                        this.clienteVisible.set(false);
                    } else {
                        this.messageService.add({ severity: 'error', detail: rpta.mensaje });
                    }
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
        }
    }

    /*FIN PRC CLIENTE */

    listaTipoProducto() {
        this.lstTipoProducto.set([]);

        this.leadService
            .listarTipoProducto()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    //console.info('next : ', rpta);

                    this.lstTipoProducto.set(
                        rpta.map((item: any) => ({
                            idtipoprod: item.idtipoprod,
                            nomtipoproducto: item.nomtipoproducto
                        }))
                    );
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

    listaVendedor() {
        this.kanbanService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                this.Vendedor.set(rpta);
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

    listaPreventa() {
        this.kanbanService.listarUsuariosxPerfil(3).subscribe({
            next: (rpta: any) => {
                this.Preventa.set(rpta);
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

     onSave() {
        if (this.validarDatos()) {
            console.log('errorMensaje : ', this.errorMensaje);
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: this.errorMensaje });
            return;
        }

        let objectPriority = {
            color: '',
            title: ''
        };

        // for (let i = 0; i < this.frmDatos.taskList.tasks.length; i++) {
        //     this.frmDatos.taskList.tasks[i].nroorden = i + 1;
        // }

        // let fecampliacion: string | undefined = this.frmDatos.fecampliacion;
        // let dueDate = this.frmDatos.dueDate;
        // let prcannio = 0;

        // if (fecampliacion && fecampliacion.length > 10) {
        //     fecampliacion = this.utilitariosService.obtenerFechaFormateadoDMA(fecampliacion);
        //     prcannio = parseInt(fecampliacion.substring(6, 10));
        // }
        // if (dueDate.length > 10) {
        //     dueDate = this.utilitariosService.obtenerFechaFormateadoDMA(dueDate);
        //     prcannio = parseInt(dueDate.substring(6, 10));
        // }

        // let decisores = this.frmDatos.decisores ?? [];
        // if (decisores.length > 0) {
        //     for (let i = 0; i < decisores.length; i++) {
        //         this.frmDatos.contactos?.push(decisores[i]);
        //     }
        // }

        this.card = { ...this.frmDatos,
            idcliente: this.frmAccion.value.idcliente,
            title: this.frmAccion.value.title,
            description: this.frmAccion.value.description,
            justificacion: this.frmAccion.value.justificacion,
            startDate: this.frmAccion.value.startDate,
            idtipoprod: this.frmAccion.value.idtipoprod,
            idusuario: constantesLocalStorage.idusuario,
            idpreventa: this.frmAccion.value.idpreventa,
            idusuarioprev: this.frmAccion.value.idpreventa,
         };
        this.card.priority = objectPriority;
        this.card.idlista = 1;

        console.log('card xxxx: ', this.card);

      

        this.grabarOportunidad();
    }

    grabarOportunidad() {
            this.setSpinner(true);
            this.mensajeSpinner.set('Procesando...!');
            const $updateCard = this.leadService.prcCard(this.card, '1').subscribe({
                next: (rpta: any) => {
                    console.log('grabarOportunidad', rpta);
                    if (rpta.procesoSwitch === 0) {
                        this.setSpinner(false);
                        this.cerrar(rpta);
    
                    } else {
                        this.setSpinner(false);
                        this.messageService.add({ severity: 'error', summary: 'Error...', detail: rpta.mensaje });
                    }
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
        }

        

    validarDatos(): boolean {
        let _error = false;
        this.errorMensaje = '';
        console.log('this.frmDatos...', this.frmAccion.value);

         if (this.frmAccion.value.idcliente === null) {
            this.errorMensaje = 'Ingresar Prospecto...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.title === '' || this.frmAccion.value.title === ' ' || this.frmAccion.value.title === null)) {
            this.errorMensaje = 'Ingresar Lead...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.description === '' || this.frmAccion.value.description === null)) {
            this.errorMensaje = 'Ingresar Descripción del Problema...!';
            _error = true;
        }

       if (!_error && (this.frmAccion.value.justificacion === '' || this.frmAccion.value.justificacion === null)) {
            this.errorMensaje = 'Ingresar Alcance...!';
            _error = true;
        }

        if (!_error && (this.frmAccion.value.idtipoprod === 0 || this.frmAccion.value.idtipoprod === null)) {
            this.errorMensaje = 'Seleccionat Producto/Servicio...';
            _error = true;
        }

        // if (!_error && (this.frmDatos.monto === 0 || this.frmDatos.monto === null)) {
        //     this.errorMensaje = 'Ingresar Monto...';
        //     _error = true;
        // }

        // if (!_error && (this.frmDatos.tipocambio === 0 || this.frmDatos.tipocambio === null)) {
        //     this.errorMensaje = 'Ingresar Tipo de Cambio...';
        //     _error = true;
        // }

        

        // if (!_error && (this.frmDatos.startDate === '' || this.frmDatos.startDate === ' ')) {
        //     this.errorMensaje = 'Ingresar Fecha de Inicio...!';
        //     _error = true;
        // }

        // if (!_error && (this.frmDatos.dueDate === '' || this.frmDatos.dueDate === ' ')) {
        //     this.errorMensaje = 'Ingresar Fecha de Vencimiento...!';
        //     _error = true;
        // }

        return _error;
    }
}
