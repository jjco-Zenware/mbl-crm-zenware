import { ChangeDetectorRef, Component, DestroyRef, ElementRef, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '../lead.services';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { CListadoFile } from '../c-listado-file/c-listado-file';
import { DialogService } from 'primeng/dynamicdialog';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { UtilitariosService } from '../../service/utilitarios.service';
import { ShareService } from '../../service/serviceShare.service';
import { Assignees, Contacto, I_rptaDataLogin, KanbanCard, Plan, RegOportunidadExt, TareaAsignado, Tasks } from '../../model/interfaces';
import { constantesLocalStorage, mensajesQuestion } from '../../model/constantes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mProceso } from '../m-proceso/m-proceso';
import { CBusinessCase } from '../../shared/c-business-case/c-business-case';
import { CCotizacion } from '../../shared/c-cotizacion/c-cotizacion';
import { CalificacionOport } from '../m-calificar/m-califica';

@Component({
    selector: 'app-c-lead-reg',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, CBusinessCase, CCotizacion],
    templateUrl: './lead-reg.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ShareService, ConfirmationService, DialogService],
    styleUrls: ['./lead-reg.scss']
})
export class CLeadReg {
    @Input() IS_Data: any;
    @Output() actualizarKanban = new EventEmitter<string>();
    @Output() OB_back = new EventEmitter<boolean>();
    
    $listSubcription: Subscription[] = [];
    card: KanbanCard = { id: '0', idlista: 0, monto: 0, tipocambio: 0, dueDate: '', taskList: { title: 'Lista de tareas sin título', tasks: [] }, fecampliacion: '' };

    frmDatos: KanbanCard = { id: '0', idlista: 1, monto: 0, tipocambio: 0, dueDate: '', taskList: { title: 'Lista de tareas sin título', tasks: [] }, fecampliacion: '', regoportunidadesext: [] };
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal<boolean>(false);
    lstOrigenOportunidad = signal<any[]>([]);
    lstClientes = signal<any[]>([]);
    lstTipoProducto = signal<any[]>([]);
    lstSectorInd = signal<any[]>([]);
    lstContactos = signal<any[]>([]);
    lstTipoProy = signal<any[]>([]);
    lstEstProy = signal<any[]>([]);
    lstMoneda = signal<any[]>([]);
    lstEstPresupuesto = signal<any[]>([]);
    lstPrioridad = signal<any[]>([]);
    lstEtapas = signal<any[]>([]);
    lstTiempo = signal<any[]>([]);
    isMoneda = signal<boolean>(false);
    etiquetaMonto: string = 'Monto';
    Usuarios = signal<any[]>([]);
    verjustificacion = signal<boolean>(true);
    verfecAmplia = signal<boolean>(true);
    minimaFechaAmpli: Date = new Date();
    //submitted= signal<boolean>(false);
    registerFormRegistro: any = FormGroup;
    registerFormContacto!: FormGroup;
    registerFormCliente!: FormGroup;
    listaRegistroInicial: any = undefined;
    IdRegistro: number = 0;
    paramRegistro: string = '';
    headerTitle: string = '';
    registroVisible = signal<boolean>(false);
    nroindex: number = 0;
    lstProveedores = signal<any[]>([]);
    lstMarcas = signal<any[]>([]);
    regoportunidadesext: RegOportunidadExt = { idregoportunidadext: 0, numregoportunidad: '', idoportunidad: '0', fechavence: '', idusuario: 0, idmarca: 0, idproveedor: 0, nommarca: '', nomproveedor: '' };
    maxDateValue: Date = new Date();
    newTask: Tasks = { idtarea: 0, sidtarea: '', text: '', completed: false, fechafin: '', fechaini: '', nroorden: 0, asignados: [], horafin: '00:00', horaini: '00:00' };
    timeout: any = null;
    filteredAssignees = signal<any[]>([]);
    filteredContac = signal<Contacto[]>([]);
    filteredDecisor = signal<Contacto[]>([]);
    assignees = signal<Assignees[]>([]);
    assigneesTarea = signal<TareaAsignado[]>([]);
    asignadosTareas = signal<TareaAsignado[]>([]);
    asignadosTareaVisible = signal<boolean>(false);
    filteredAsignadosTareas = signal<TareaAsignado[]>([]);
    idtarea: number = 0;
    _nroorden: number = 0;
    headerTarea?: string;
    minDateValueTarea!: Date;
    maxDateValueTarea!: Date;
    listaContacInicial: any = undefined;
    lstTotalcontacs = signal<Contacto[]>([]);
    lstTotaldecisores = signal<Contacto[]>([]);

    @ViewChild('inputTitle') inputTitle!: ElementRef;
    @ViewChild('inputTaskListTitle') inputTaskListTitle!: ElementRef;
    @ViewChild('inputTaskList') inputTaskList!: ElementRef;

    @Output() TaskList = new EventEmitter<any>();
    @Output() contactos = new EventEmitter<any>();
    @Output() decisores = new EventEmitter<any>();
    @Output() registroExt = new EventEmitter<any>();

    // @Output() verCotizacion = new EventEmitter<any>();
    // @Output() verBussines = new EventEmitter<any>();

    IdContacto: number = 0;
    contactoVisible = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    Usuario!: I_rptaDataLogin;
    IdCliente: any;
    clienteVisible = signal<boolean>(false);
    submitted = signal<boolean>(false);
    personaNatural = signal<boolean>(true);
    disabledCli = signal<boolean>(false);
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
    lstExiste = [
        { id: 1, name: 'SI' },
        { id: 2, name: 'NO' }
    ];
    lstTipoRol = signal<any[]>([]);
    contacto: Contacto = { idcontacto: 0, idcliente: 0, nombrecontacto: '', cargo: '', image: '', telefono: '', tipocontacto: '' };
    errorMensaje: string = '';
    lstAcciones: Plan[] = [];
    lstAccionfilter: Plan[] = [];
    listId: string = '1';
    IdOportunidad: string = '0';
    tc: number = 0;
    visBussines = signal<boolean>(false);
    visMntLead = signal<boolean>(true);
    visQuote = signal<boolean>(false);

    private readonly destroyRef = inject(DestroyRef);
    verRegreso: any;
tituloDetalle: any;
    dataCT: { id: any; razonsocial: any; description: any; nommoneda: any; startDate: any; nomcreador: any; tipocambio: any; idlista: any; } | undefined;
    verCompetencia = signal<boolean>(false);

    constructor(
        private leadService: LeadService,
        private formBuilder: FormBuilder,
        private utilitariosService: UtilitariosService,
        private messageService: MessageService,
        private shareService: ShareService,
        private confirmationService: ConfirmationService,
        public dialogService: DialogService,
        private cd: ChangeDetectorRef
    ) {}

    get formContacto() {
        return this.registerFormContacto.controls;
    }
    get formCliente() {
        return this.registerFormCliente.controls;
    }
    //get formRegistro() { return this.registerFormRegistro.controls; }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit() {
        console.log('IS_Data', this.IS_Data);
        this.IdOportunidad = this.IS_Data.id;
        this.verRegreso = this.IS_Data.paramReg
        this.cargarOrigen();
        this.cargarEmpresa();
        this.listaSector();
        this.listaMonedas();
        this.listarPreventa();
        this.listaAsignados();
        this.listaPrioridad();

        this.createFormContacto();
        this.createFormCliente();
        this.createFormRegistro();
        this.listaTipoProducto();

        //this.Usuario = JSON.parse(localStorage.getItem('ZENWARE_OPOR')!);
        console.log('Usuario', this.Usuario);
        this.frmDatos.nomcreador = constantesLocalStorage.nombreUsuario;
        this.frmDatos.startDate = this.utilitariosService.obtenerFechaActualFormat();

        if (this.IdOportunidad !== '0') {
            this.oportunidadTraerUno();
            this.disabledCli.set(false);
        } else {
            this.disabledCli.set(true);
            this.gettipocambiodia(new Date());
            if (this.verRegreso === 'k') {
                this.tituloDetalle = 'REGISTRAR LEAD';
            }
            this.frmDatos.idcompetencia = 2;
            this.changeCompetencia(2);
        }
    }

     getBack(){
    this.OB_back.emit(true);
  }

    createFormContacto() {
        //Agregar validaciones de formulario
        this.registerFormContacto = this.formBuilder.group({
            nombrecontacto: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            telefono: ['', [Validators.required]],
            cargo: ['', [Validators.required]],
            tiporol: ['', [Validators.required]],
            tipocontacto: ['']
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

    createFormRegistro() {
        //Agregar validaciones de formulario
        this.registerFormRegistro = this.formBuilder.group({
            fechavence: [{ value: this.utilitariosService.obtenerFechaActual(), disabled: false }],
            numregoportunidad: ['', [Validators.required]],
            idproveedor: ['', [Validators.required]],
            idmarca: ['', [Validators.required]]
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

        for (let i = 0; i < this.frmDatos.taskList.tasks.length; i++) {
            this.frmDatos.taskList.tasks[i].nroorden = i + 1;
        }

        let fecampliacion: string | undefined = this.frmDatos.fecampliacion;
        let dueDate = this.frmDatos.dueDate;
        let prcannio = 0;

        if (fecampliacion && fecampliacion.length > 10) {
            fecampliacion = this.utilitariosService.obtenerFechaFormateadoDMA(fecampliacion);
            prcannio = parseInt(fecampliacion.substring(6, 10));
        }
        if (dueDate.length > 10) {
            dueDate = this.utilitariosService.obtenerFechaFormateadoDMA(dueDate);
            prcannio = parseInt(dueDate.substring(6, 10));
        }

        let decisores = this.frmDatos.decisores ?? [];
        if (decisores.length > 0) {
            for (let i = 0; i < decisores.length; i++) {
                this.frmDatos.contactos?.push(decisores[i]);
            }
        }

        this.card = { ...this.frmDatos, fecampliacion, dueDate, prcannio };
        this.card.priority = objectPriority;
        this.card.idlista = parseInt(this.listId);

        console.log('card xxxx: ', this.card);

        // if (this.card.id === '0') {
        //     this.confirmationService.confirm({
        //     key: 'confirm1',
        //     header: 'Confirmación',
        //     message: '¿Estás seguro de Grabar la Oportunidad con esta Fecha de Cierre ' + fecampliacion + ' y con esta Moneda' +  ' ?',
        //     acceptLabel: 'Si',
        //     rejectLabel: 'No',
        //     accept: () => {
        //         this.grabarOportunidad();
        //     }
        // });
        // }else{
        //     this.grabarOportunidad();
        // }

        this.grabarOportunidad();
    }

    grabarOportunidad() {
        this.setSpinner(true);
        this.isLoading.set(true);
        const $updateCard = this.leadService.prcCard(this.card, this.listId).subscribe({
            next: (rpta: any) => {
                console.log('onSave', rpta);
                if (rpta.procesoSwitch === 0) {
                    this.isLoading.set(false);
                    //this.actualizarKanban.emit('');
                    this.setSpinner(false);
                    this.messageService.add({ severity: 'success', summary: 'OK...', detail: rpta.mensaje });
                    if (this.frmDatos.id === '0') {
                        this.frmDatos.id = rpta.resultProceso;
                        this.IdOportunidad = rpta.resultProceso;
                        this.enviarCorreoAsignacion();
                    }

                    this.oportunidadTraerUno();
                } else {
                    this.isLoading.set(false);
                    this.setSpinner(false);
                    this.messageService.add({ severity: 'error', summary: 'Error...', detail: rpta.mensaje });
                }
            },
            error: (err) => {
                this.isLoading.set(false);
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

    enviarCorreoAsignacion() {
        this.setSpinner(true);
        this.leadService.enviarCorreoAsignacion(this.frmDatos.id).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('oportunidadTraerUno', rpta);
            },
            error: (err) => {
                this.setSpinner(false);
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

    validarDatos(): boolean {
        let _error = false;
        this.errorMensaje = '';
        console.log('this.frmDatos...', this.frmDatos);

        if (this.frmDatos.title === '' || this.frmDatos.title === ' ' || this.frmDatos.title === undefined) {
            this.errorMensaje = 'Ingresar Titulo...!';
            _error = true;
        }

        if (!_error && this.frmDatos.idcliente === 0) {
            this.errorMensaje = 'Ingresar Cliente...!';
            _error = true;
        }

        if (!_error && (this.frmDatos.idtipoprod === 0 || this.frmDatos.idtipoprod === null)) {
            this.errorMensaje = 'Seleccionat Producto/Servicio...';
            _error = true;
        }

        if (!_error && (this.frmDatos.monto === 0 || this.frmDatos.monto === null)) {
            this.errorMensaje = 'Ingresar Monto...';
            _error = true;
        }

        if (!_error && (this.frmDatos.tipocambio === 0 || this.frmDatos.tipocambio === null)) {
            this.errorMensaje = 'Ingresar Tipo de Cambio...';
            _error = true;
        }

        if (!_error && (this.frmDatos.description === '' || this.frmDatos.description === ' ')) {
            this.errorMensaje = 'Ingresar Descripción...!';
            _error = true;
        }

        if (!_error && (this.frmDatos.startDate === '' || this.frmDatos.startDate === ' ')) {
            this.errorMensaje = 'Ingresar Fecha de Inicio...!';
            _error = true;
        }

        if (!_error && (this.frmDatos.dueDate === '' || this.frmDatos.dueDate === ' ')) {
            this.errorMensaje = 'Ingresar Fecha de Vencimiento...!';
            _error = true;
        }

        //    if ( !_error && (this.frmDatos.taskList?.tasks.length === 0 ))
        //    {
        //         this.errorMensaje="Ingresar como Mínimo una Tarea...!";
        //         _error = true;
        //    }

        //     if (!_error && (this.frmDatos.regoportunidadesext?.length ?? 0) === 0) {
        //        this.errorMensaje = "Ingresar Registro en la Marca...!";
        //        _error = true;
        //    }

        // if (!_error && this.frmDatos.fecampliacion !== '') {
        //     if (this.frmDatos.justificacion === null || this.frmDatos.justificacion === ' ') {
        //         this.errorMensaje = 'Ingresar Justificación...!';
        //         _error = true;
        //     }
        // }

        // if (!_error) {
        //     console.log('utilitariosService', this.utilitariosService.obtenerFechaFormateado(this.frmDatos.dueDate));
        //     let fecha = this.utilitariosService.obtenerFechaFormateado(this.frmDatos.dueDate);
        //     let mes = fecha.substring(3, 5);
        //     let dia = fecha.substring(0, 2);
        //     let anio = fecha.substring(6, 10);
        //     let _fecha = mes + '/' + dia + '/' + anio;
        //     var fechaFinOportunidad = new Date(_fecha);

        //     for (let i = 0; i < this.frmDatos.taskList.tasks.length; i++) {
        //         let _mes = this.frmDatos.taskList.tasks[i].fechafin.substring(3, 5);
        //         let _dia = this.frmDatos.taskList.tasks[i].fechafin.substring(0, 2);
        //         let _anio = this.frmDatos.taskList.tasks[i].fechafin.substring(6, 10);
        //         let _fechax = _mes + '/' + _dia + '/' + _anio;

        //         var fechaFinTarea = new Date(_fechax);

        //         if (this.frmDatos.taskList.tasks[i].fechaini === '' || this.frmDatos.taskList.tasks[i].fechaini === ' ') {
        //             this.errorMensaje = 'Ingresar Fecha Inicial de la Tarea...!';
        //             _error = true;
        //         }
        //         if (this.frmDatos.taskList.tasks[i].fechafin === '' || this.frmDatos.taskList.tasks[i].fechafin === ' ') {
        //             this.errorMensaje = 'Ingresar Fecha Final de la Tarea...!';
        //             _error = true;
        //         }
        //         if (fechaFinTarea > fechaFinOportunidad) {
        //             this.errorMensaje = 'Fecha Final de la Tarea debe ser menor al de la Oportunidad...!';
        //             _error = true;
        //         }
        //     }
        // }

        //this.frmDatos.taskList?.tasks
        return _error;
    }

    cargarOrigen() {
        const $OportunidadesLista = this.leadService
            .obtenerItemsTabla(136)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    console.log('lstOrigenOportunidad...', rpta);

                    this.lstOrigenOportunidad.set(
                        rpta.map((item: any) => ({
                            iditem: item.iditem,
                            valoritem: item.valoritem
                        }))
                    );
                    //this.lstOrigenOportunidad = rpta;
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

    cambioDolares(id: any) {
        console.log('cambioDolares', id);
        this.frmDatos.montodolar = 0;
        this.frmDatos.monto = 0;

        if (id === 1) {
            this.etiquetaMonto = 'Monto Dolares';
        }
        if (id === 2) {
            this.etiquetaMonto = 'Monto Soles';
        }
    }

    calcularDolaresM(event: any) {
        if (event > 900000000) {
            this.messageService.add({ severity: 'info', detail: 'Tipo de Cambio no debe ser mayor a ' });
            this.frmDatos.monto = 0;
            return;
        }

        if (this.frmDatos.tipocambio == 0) {
            return;
        }

        if (this.frmDatos.idmoneda == 1) {
            this.frmDatos.montodolar = event / this.frmDatos.tipocambio;
        } else {
            this.frmDatos.montodolar = event * this.frmDatos.tipocambio;
        }
    }

    calcularDolaresT(event: any) {
        //console.log('calcularDolaresT', event);
        if (event > 9) {
            this.messageService.add({ severity: 'info', detail: 'Tipo de Cambio no debe ser mayor a 9' });
            //this.frmDatos.tipocambio = 0
            return;
        }

        if (this.frmDatos.monto == 0) {
            return;
        }

        if (this.frmDatos.idmoneda == 1) {
            this.frmDatos.montodolar = this.frmDatos.monto / event;
        } else {
            this.frmDatos.montodolar = this.frmDatos.monto * event;
        }
    }

    changeFecha(event: Date) {
        console.log('changeFecha event', event);
        this.verjustificacion.set(false);
    }

    crearRegistro() {
        this.listaProveedores();
        this.listarMarcas();
        //this.submitted = false;
        this.registerFormRegistro.reset();
        this.listaRegistroInicial = this.frmDatos.regoportunidadesext;
        this.IdRegistro = 0;
        this.paramRegistro = 'N';
        this.headerTitle = 'Nuevo Registro';
        this.registroVisible.set(true);
    }

    editarRegistro(data: any, index: number) {
        console.log(data);
        this.nroindex = index;
        //this.submitted = false;
        this.registerFormRegistro.reset();
        this.listaRegistroInicial = this.frmDatos.regoportunidadesext;
        this.paramRegistro = 'E';
        this.headerTitle = 'Editar Registro';

        this.IdRegistro = data.idregoportunidadext;
        this.registerFormRegistro.patchValue(data);

        this.registroVisible.set(true);
    }

    eliminarRegistro(data: any, index: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            message: '¿Estás seguro de Eliminar el Registro?',
            icon: 'pi pi-exclamation-triangle text-3xl',
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: () => {
                this.frmDatos.regoportunidadesext?.splice(index, 1);
            }
        });
    }

    guardarRegistro() {
        console.log('entro this.registerFormRegistro', this.registerFormRegistro.value);
        //this.submitted = true;
        // deténgase aquí si el formulario no es válido
        if (this.registerFormRegistro.invalid) {
            return;
        }
        //Verdadero si todos los campos están llenos
        //if (this.submitted) {
        const _nomproveedor = this.lstProveedores().filter((x) => x.idcliente === this.registerFormRegistro.value.idproveedor);
        const _nommarca = this.lstMarcas().filter((x) => x.idmarca === this.registerFormRegistro.value.idmarca);

        console.log('this._nomproveedor', _nomproveedor);

        console.log('this.IdRegistro', this.IdRegistro);
        console.log('this.frmDatos.id', this.frmDatos.id);
        console.log('this.registerFormRegistro', this.registerFormRegistro.value);

        if (this.IdRegistro !== 0) {
            for (let i = 0; i < this.listaRegistroInicial.length; i++) {
                if (this.IdRegistro === this.listaRegistroInicial[i].idregoportunidadext) {
                    this.frmDatos.regoportunidadesext?.splice(i, 1);
                }
            }
        }

        if (this.IdRegistro === 0 && this.paramRegistro === 'E') {
            console.log('entro listaRegistroInicial', this.listaRegistroInicial);
            for (let i = 0; i < this.listaRegistroInicial.length; i++) {
                if (this.IdRegistro === this.listaRegistroInicial[i].idregoportunidadext && this.nroindex === i) {
                    console.log('entro', this.listaRegistroInicial[i].idregoportunidadext, i);
                    this.frmDatos.regoportunidadesext?.splice(i, 1);
                }
            }
        }

        let fecvencimiento;
        fecvencimiento = this.registerFormRegistro.value.fechavence;

        if (fecvencimiento.toString().length > 10) {
            fecvencimiento = this.utilitariosService.obtenerFechaFormateadoDMA(fecvencimiento);
        }

        this.regoportunidadesext = {
            idregoportunidadext: this.IdRegistro,
            numregoportunidad: this.registerFormRegistro.value.numregoportunidad,
            idoportunidad: this.frmDatos.id,
            fechavence: fecvencimiento,
            idusuario: constantesLocalStorage.idusuario,
            idmarca: this.registerFormRegistro.value.idmarca,
            idproveedor: this.registerFormRegistro.value.idproveedor,
            nommarca: _nommarca.length > 0 ? _nommarca[0].nommarca : '',
            nomproveedor: _nomproveedor.length > 0 ? _nomproveedor[0].razonsocial : ''
        };
        console.log('_regoportunidadesext', this.regoportunidadesext);
        //console.log('this.frmDatos', this.frmDatos.regoportunidadesext);

        this.frmDatos.regoportunidadesext?.unshift(this.regoportunidadesext);
        console.log('this.frmDatos.regoportunidadesext', this.frmDatos);
        this.registroVisible.set(false);
        //}
    }

    setFechaMin(event: Date) {
        this.maxDateValue = event;
    }

    crearRegistroTarea() {
        const desdeStr = this.utilitariosService.obtenerFechaActualFormat();
        console.log('desdeStr...', desdeStr);
        const inroorden = this.frmDatos.taskList.tasks.length + 1;
        this.newTask = {
            idtarea: 0,
            sidtarea: '',
            text: 'nueva tarea...!',
            completed: false,
            fechafin: '',
            fechaini: '',
            horafin: '00:00',
            horaini: '00:00',
            nroorden: inroorden,
            asignados: [{ idasignado: constantesLocalStorage.idusuario, name: constantesLocalStorage.nombreUsuario, image: constantesLocalStorage.imagen, idtarea: 0 }]
        };
        this.frmDatos.taskList?.tasks.unshift(this.newTask);
        this.timeout = setTimeout(() => this.inputTitle.nativeElement.focus(), 1);
        this.calculateProgress();
    }

    calculateProgress() {
        console.log('Cálculo...');
        if (this.frmDatos.taskList) {
            let completed = this.frmDatos.taskList.tasks.filter((t: { completed: any }) => t.completed).length;

            if (this.frmDatos.taskList.tasks.length == 0) {
                this.frmDatos.progress = 0;
            } else {
                this.frmDatos.progress = Math.round(100 * (completed / this.frmDatos.taskList.tasks.length));
            }
        }
    }

    draggedBlock: any;
    starter: number = 0;

    dragStart(task: any, i: number) {
        this.draggedBlock = task;
        this.starter = i;
        console.log('Start: ' + i);
    }

    dragEnd() {
        this.draggedBlock = null;
    }

    drop(event: any, i: number) {
        console.log('Drop: ' + i);
        this.frmDatos.taskList.tasks.splice(this.starter, 1);
        this.frmDatos.taskList?.tasks.splice(i, 0, this.draggedBlock);
    }

    focus(arg: number) {
        if (arg == 1) {
            this.timeout = setTimeout(() => this.inputTitle.nativeElement.focus(), 1);
        }
        if (arg == 2) {
            this.timeout = setTimeout(() => this.inputTaskListTitle.nativeElement.focus(), 1);
        }
        if (arg == 3) {
            this.timeout = setTimeout(() => this.inputTaskList.nativeElement.focus(), 1);
        }
    }

    removeTask(index: number) {
        this.frmDatos.taskList.tasks.splice(index, 1);
        this.TaskList.emit(this.frmDatos.taskList);
        this.calculateProgress();
    }

    anexosT(dato: any, param: string) {
        console.log('anexos : ', dato);
        const ref = this.dialogService.open(CListadoFile, {
            data: { idoportunidad: this.frmDatos.id, codtipoproc: 3, idnroproceso: dato.idtarea, parametro: param, texto: dato.text },
            header: this.frmDatos.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true
        });
    }

    AsignarTarea(task: Tasks) {
        console.log('task...', task);
        this.asignadosTareas.set([]);
        this.idtarea = task.idtarea;
        this._nroorden = task.nroorden;
        this.asignadosTareas.set(task.asignados);
        this.headerTitle = 'Asignados de la Tarea';
        this.headerTarea = 'Tarea: ' + task.text;
        this.asignadosTareaVisible.set(true);
    }

    filterAssignees(event: any) {
        let filtered: Assignees[] = [];
        let query = event.query;

        for (let i = 0; i < this.assignees().length; i++) {
            let assignee = this.assignees()[i];
            if (assignee.name && assignee.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(assignee);
            }
        }

        this.filteredAssignees.set(filtered);
        console.log('this.filteredAssignees...', this.filteredAssignees);
    }

    changeHeaderTitle(arg: number, contac: any) {
        this.listarItemsTabla();
        console.log('changeHeaderTitle...', this.frmDatos.idcliente);

        if (this.frmDatos.idcliente === undefined || this.frmDatos.idcliente === null || this.frmDatos.idcliente === 0) {
            this.messageService.add({ severity: 'info', detail: 'Debe elegir un cliente' });
            return;
        }

        //this.submitted = false;
        this.registerFormContacto.reset();

        this.listaContacInicial = this.frmDatos.contactos;
        console.log('lista contactos', this.listaContacInicial);

        if (arg == 1) {
            this.headerTitle = 'NUEVO CONTACTO';
            this.IdContacto = 0;
            this.registerFormContacto.get('tipocontacto')?.setValue('C');
        }
        if (arg == 2) {
            this.headerTitle = 'EDITAR CONTACTO';
            this.IdContacto = contac.idcontacto;
            this.registerFormContacto.get('nombrecontacto')?.setValue(contac.nombrecontacto);
            this.registerFormContacto.get('email')?.setValue(contac.email);
            this.registerFormContacto.get('telefono')?.setValue(contac.telefono);
            this.registerFormContacto.get('cargo')?.setValue(contac.cargo);
            this.registerFormContacto.get('tiporol')?.setValue(contac.tiporol);
        }
        if (arg == 3) {
            this.headerTitle = 'NUEVO DECISOR';
            this.IdContacto = 0;
            this.registerFormContacto.get('tipocontacto')?.setValue('D');
        }
        this.contactoVisible.set(true);
    }

    filterContac(event: any) {
        let filtered: Contacto[] = [];
        let query = event.query;

        for (let i = 0; i < this.lstTotalcontacs().length; i++) {
            let contac = this.lstTotalcontacs()[i];
            if (contac.nombrecontacto && contac.nombrecontacto.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(contac);
            }
        }
        this.filteredContac.set(filtered);
    }

    filterDecisores(event: any) {
        let filtroDecisor: Contacto[] = [];
        let query = event.query;

        for (let i = 0; i < this.lstTotaldecisores().length; i++) {
            let decisore = this.lstTotaldecisores()[i];
            if (decisore.nombrecontacto && decisore.nombrecontacto.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtroDecisor.push(decisore);
            }
        }
        this.filteredDecisor.set(filtroDecisor);
    }

    Quote(dato:any) {
        console.log(' verQuote :  ', dato);
        const { id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio, idlista } = dato;
        this.dataCT = { id, razonsocial, description, nommoneda, startDate, nomcreador, tipocambio, idlista };

        this.visBussines.set(false);
        this.visMntLead.set(false);
        this.visQuote.set(true);
    }

    businessCase() {
        this.visBussines.set(true);
        this.visMntLead.set(false);
        this.visQuote.set(false);
    }

    backbusinessCase() {
        this.visBussines.set(false);
        this.visQuote.set(false);
        this.visMntLead.set(true);
    }

    crearProyecto(data: any) {
        console.log('crearProyecto...', data);
        this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            acceptLabel: 'Si',
            rejectLabel: 'No',
            //target: event.target || new EventTarget,
            message: '¿Desea Generar Código de Proyecto.?',
            icon: 'pi pi-exclamation-triangle text-6xl',
            accept: () => {
                this.generarCodigo(data);
            }
        });
    }

    generarCodigo(data: any) {
        const objeto = {
            idtipoproyecto: 1,
            idoportunidad: data.id,
            idrequerimiento: 0,
            nomproyecto: data.title,
            descripcion: data.description,
            idusuario: constantesLocalStorage.idusuario
        };
        console.log('objeto...', objeto);
        this.leadService.newProyecto(objeto).subscribe({
            next: (rpta: any) => {
                console.log('generarCodigo...', rpta);
                if (rpta.procesoSwitch === 0) {
                    this.messageService.add({ severity: 'success', summary: 'OK...', detail: rpta.mensaje });
                    this.oportunidadTraerUno();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error...', detail: rpta.mensaje });
                }
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.add({ severity: 'error', summary: 'Error...', detail: err.message });
            },
            complete: () => {}
        });
    }

    oportunidadTraerUno() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando información de la oportunidad...!';

        this.leadService
            .oportunidadTraeruno(this.IdOportunidad)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('oportunidadTraerUno', rpta);
                    this.frmDatos = rpta as KanbanCard;
                    this.listId = rpta.idlista.toString();
                    this.tituloDetalle = this.frmDatos.title;

                    this.getContactos(this.frmDatos.idcliente);
                    this.cambioDolaresK(this.frmDatos.idmoneda);
                    this.minimaFechaAmpli = new Date(this.utilitariosService.formatFecha(this.frmDatos.dueDate));
                    // if (this.frmDatos.fecampliacion === '01/01/1900' || this.frmDatos.fecampliacion === null) {
                    //     this.frmDatos.fecampliacion = '';
                    //     this.verjustificacion = true;
                    //     this.verfecAmplia = false;
                    // } else {
                    //     this.verfecAmplia = true;
                    //     this.verjustificacion = true;
                    // }
                    this.changeCompetencia(this.frmDatos.idcompetencia);
                },
                error: (err) => {
                    this.setSpinner(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error...',
                        detail: err.message
                    });
                },
                complete() {}
            });
    }

    cambioDolaresK(id: any) {
        this.frmDatos.montodolar = 0;
        if (id === 1) {
            this.etiquetaMonto = 'Monto Dolares';
            if (this.frmDatos.monto > 0 && this.frmDatos.tipocambio > 0) {
                this.frmDatos.montodolar = this.frmDatos.monto / this.frmDatos.tipocambio;
            }
        }
        if (id === 2) {
            this.etiquetaMonto = 'Monto Soles';
            if (this.frmDatos.monto > 0 && this.frmDatos.tipocambio > 0) {
                this.frmDatos.montodolar = this.frmDatos.monto * this.frmDatos.tipocambio;
            }
        }
    }

    anexosK(dato: any, param: string) {
        const ref = this.dialogService.open(CListadoFile, {
            data: { idoportunidad: this.frmDatos.id, codtipoproc: 1, idnroproceso: 0, parametro: param },
            header: this.frmDatos.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '50%'
        });
    }

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

    listaSector() {
        this.lstSectorInd.set([]);
        const $OportunidadesLista = this.leadService
            .obtenerItemsTabla(119)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    console.log('lstSectorInd...', rpta);
                    this.lstSectorInd.set(
                        rpta.map((item: any) => ({
                            iditem: item.iditem,
                            valoritem: item.valoritem
                        }))
                    );
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

    listaMonedas() {
        this.lstMoneda.set([]);
        this.leadService
            .obtenerMonedas()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.lstMoneda.set(
                        rpta.map((item: any) => ({
                            idmoneda: item.idmoneda,
                            desmoneda: item.desmoneda,
                            simbmoneda: item.simbmoneda
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

    listarPreventa() {
        this.Usuarios.set([]);
        this.leadService
            .listarPreventa()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    //console.info('next : ', rpta);
                    this.Usuarios.set(
                        rpta.map((item: any) => ({
                            idusuario: item.idusuario,
                            name: item.name
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

    listaProveedores() {
        let tiporol = 'PRO';
        this.leadService.obtenerClientes(tiporol).subscribe({
            next: (rpta: any) => {
                console.info('listaProveedores : ', rpta);
                this.lstProveedores.set(rpta);
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

    listarMarcas() {
        this.leadService.obtenerMarcas().subscribe({
            next: (rpta: any) => {
                this.lstMarcas.set(rpta);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
    }

    listaAsignados() {
        this.leadService.obtenerUsuarios().subscribe({
            next: (rpta: any) => {
                this.assignees.set(rpta);
                this.assigneesTarea().map((item: any) => ({
                    idasignado: item.idasignado,
                    name: item.name,
                    image: item.image
                }));
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

    getContactos(idcliente: any) {
        console.log('idcliente', idcliente);
        this.IdCliente = idcliente;
        this.leadService.obtenerContactos(idcliente).subscribe({
            next: (rpta: any) => {
                console.log('getContactos', rpta);
                this.lstTotalcontacs.set(rpta.filter((x: { tipocontacto: string }) => x.tipocontacto !== 'D'));
                console.log('this.lstTotalcontacs', this.lstTotalcontacs());
                this.lstTotaldecisores.set(rpta.filter((x: { tipocontacto: string }) => x.tipocontacto === 'D'));
                console.log('this.lstTotaldecisores', this.lstTotaldecisores());
                // if (this.lstTotaldecisores().length > 0) {
                //     for (let i = 0; i < this.lstTotaldecisores().length; i++) {

                //         this.frmDatos.decisores = [...[i].map((item: any) => ({
                //             idcontacto: this.lstTotaldecisores()[i].idcontacto,
                //             idcliente: this.lstTotaldecisores()[i].idcliente,
                //             nombrecontacto: this.lstTotaldecisores()[i].nombrecontacto,
                //             email: this.lstTotaldecisores()[i].email,
                //             telefono: this.lstTotaldecisores()[i].telefono,
                //             cargo: this.lstTotaldecisores()[i].cargo,
                //             tiporol: this.lstTotaldecisores()[i].tiporol,
                //             nomtiporol: this.lstTotaldecisores()[i].nomtiporol,
                //             image: this.lstTotaldecisores()[i].image,
                //             tipocontacto: this.lstTotaldecisores()[i].tipocontacto
                //         }))];
                        
                //     }
                // }
                // this.decisores.emit(this.frmDatos.decisores);
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

    filterAsignadoTarea(event: any) {
        let filtered: TareaAsignado[] = [];
        let query = event.query;

        for (let i = 0; i < this.assigneesTarea().length; i++) {
            let asignadotar = this.assigneesTarea()[i];
            if (asignadotar.name && asignadotar.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(asignadotar);
            }
        }
        this.filteredAsignadosTareas.set(filtered);
    }

    aceptarAsignado() {
        console.log(' this.asignadosTareas.length....', this.asignadosTareas().length);
        if (this.asignadosTareas().length === 0) {
            this.messageService.add({ severity: 'info', detail: 'Como mínimo la tarea debe tener un Asignado' });
            return;
        }
        for (let x = 0; x < this.frmDatos.taskList?.tasks.length; x++) {
            if (this.frmDatos.taskList.tasks[x].idtarea == this.idtarea && this.frmDatos.taskList.tasks[x].nroorden == this._nroorden) {
                //identificamos la tarea
                this.frmDatos.taskList.tasks[x].asignados = []; //limpiamos array de asigandos de la tarea
                for (let z = 0; z < this.asignadosTareas().length; z++) {
                    this.frmDatos.taskList.tasks[x].asignados.unshift(this.asignadosTareas()[z]); //agregamos asignados a la tarea
                }
            }
        }
        console.log('this.frmDatos.taskList?.tasks....', this.frmDatos.taskList.tasks);
        this.asignadosTareaVisible.set(false);
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

    guardarContacto() {
        this.submitted.set(true);
        // deténgase aquí si el formulario no es válido
        if (this.registerFormContacto.invalid) {
            this.messageService.add({ severity: 'warn', detail: 'Formulario inválido, falta información requerida' });
            return;
        }
        //Verdadero si todos los campos están llenos
        if (this.submitted()) {
            const _nomtiporol = this.lstTipoRol().filter((x: { iditem: any }) => x.iditem === this.registerFormContacto.value.tiporol)[0].valoritem;

            console.log('Id Contacto', this.IdContacto);
            if (this.IdContacto !== 0) {
                for (let i = 0; i < this.listaContacInicial.length; i++) {
                    if (this.IdContacto === this.listaContacInicial[i].idcontacto) {
                        console.log('en el if del for', this.listaContacInicial[i]);
                        this.frmDatos?.contactos?.splice(i, 1);
                    }
                }
            }

            console.log('this.registerFormContacto.value', this.registerFormContacto.value);

            this.contacto = {
                idcontacto: this.IdContacto,
                idcliente: this.IdCliente,
                nombrecontacto: this.registerFormContacto.value.nombrecontacto,
                email: this.registerFormContacto.value.email,
                telefono: this.registerFormContacto.value.telefono,
                cargo: this.registerFormContacto.value.cargo,
                tiporol: this.registerFormContacto.value.tiporol,
                nomtiporol: _nomtiporol,
                image: 'https://res.cloudinary.com/walla-pe/image/upload/v1713475592/zenware/avatar/yfedmft0xzgwdy9je9gh.avif',
                tipocontacto: this.registerFormContacto.value.tipocontacto
            };

            console.log('contacto', this.contacto);

            if (this.registerFormContacto.value.tipocontacto === 'D') {
                this.frmDatos.decisores = [...(this.frmDatos.decisores || []), this.contacto];
                console.log('this.frmDatos.decisores', this.frmDatos.decisores);
                this.decisores.emit(this.frmDatos.decisores);
            } else {
                this.frmDatos.contactos = [...(this.frmDatos.contactos || []), this.contacto];
                console.log('this.frmDatos.contactos', this.frmDatos.contactos);
                this.contactos.emit(this.frmDatos.contactos);
            }

            this.contactoVisible.set(false);
        }
    }

    cancelarContacto() {
        this.contactoVisible.set(false);
        this.clienteVisible.set(false);
        this.registroVisible.set(false); 
        this.asignadosTareaVisible.set(false);  
        
    }

    listarItemsTabla() {
        this.leadService.obtenerItemsTabla(103).subscribe({
            next: (rpta: any) => {
                console.log('listarItemsTabla', rpta);
                this.lstTipoRol.set(rpta);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
    }

    gettipocambiodia(fecha: any) {
        const objeto = {
            anio: fecha.getFullYear(),
            mes: fecha.getMonth() + 1,
            dia: fecha.getDate()
        };
        console.log('gettipocambiodia', objeto);

        const $gettipocambio = this.leadService
            .gettipocambiodia(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('rpta gettipocambiodia', rpta);
                    console.log('rpta valTipo', rpta.valTipo);
                    this.tc = rpta.valTipo;
                    this.frmDatos.tipocambio = rpta.valTipo;
                },
                error: (err) => {
                    this.setSpinner(false);
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
        this.$listSubcription.push($gettipocambio);
    }

    listaPrioridad() {
        this.lstSectorInd.set([]);
        const $OportunidadesLista = this.leadService
            .obtenerItemsTabla(137)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    console.log('lstSectorInd...', rpta);
                    this.lstPrioridad.set(
                        rpta.map((item: any) => ({
                            iditem: item.iditem,
                            valoritem: item.valoritem
                        }))
                    );
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

    verProcesoDecisorio() {
        const ref = this.dialogService.open(mProceso, {
            data: this.frmDatos.decisores,
            header: 'Radar del Proceso Decisorio',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '50%'
        });

        if (ref) {
            ref.onClose.subscribe(() => {
                //this.cargarOportunidades();
            });
        }
    }

    changeCompetencia(dato:any){
        console.log('changeCompetencia', dato)
        if (dato === 1) {
            this.verCompetencia.set(true);            
        }
        else{
            this.verCompetencia.set(false);  
        }

    }

    calificarOport(dato:any){
        console.log('calificarOport', dato)
        const ref = this.dialogService.open(CalificacionOport, {
            data: this.frmDatos.id,
            header: 'Calificación 7P + C',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '30%'
        });

        if (ref) {
            ref.onClose.subscribe(() => {
                //this.cargarOportunidades();
            });
        }
    }
     
}
