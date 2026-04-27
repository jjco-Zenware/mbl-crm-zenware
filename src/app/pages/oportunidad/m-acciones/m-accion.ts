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
import { constantesLocalStorage } from '../../model/constantes';

@Component({
    selector: 'app-m-accion',
    imports: [PRIMENG_MODULES],
    templateUrl: './m-accion.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ShareService, ConfirmationService, SharedAppService]
})
export class mAccion implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
    data: any;
    lstPrioridad = signal<any[]>([
        { iditem: 1, valoritem: '1. Alta' },
        { iditem: 2, valoritem: '2. Media' },
        { iditem: 3, valoritem: '3. Baja' }
    ]);
    lstTipoTarea = signal<any[]>([
        { iditem: 1, valoritem: 'Llamada' },
        { iditem: 2, valoritem: 'Reunión' },
        { iditem: 3, valoritem: 'WhatsApp' },
        { iditem: 4, valoritem: 'Email' }
    ]);
    frmAccion!: FormGroup;
    tipopro = signal<number>(1);

    private readonly destroyRef = inject(DestroyRef);
    errorMensaje: string = '';
    idtareaanterior: number = 0;
    nomoportunidad!: string;
    nomcliente!: string;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private leadService: LeadService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private serviceSharedApp: SharedAppService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService
    ) {}

    setSpinner(valor: boolean) {
        //this.blockedDocument = valor;
    }

    ngOnInit(): void {
        console.log('this.config...', this.config.data);
        this.tipopro.set(this.config.data.tipopro ?? 1);
        this.nomoportunidad = this.config.data.title || this.config.data.oportunidad;
        this.nomcliente = this.config.data.nomcomercial || this.config.data.cliente;
        this.createFrm();
        this.cargarPlanAccion();
    }

    createFrm() {
        const editMode = this.tipopro() === 2 || this.tipopro() === 4;
        this.frmAccion = this.fb.group({
            nomoportunidad: [{ value: null, disabled: true }],
            fecplan_ant: [{ value: null, disabled: !editMode }],
            desplan_ant: [{ value: null, disabled: !editMode }],
            idprioridad_ant: [{ value: null, disabled: !editMode }],
            idtipotarea_ant: [{ value: null, disabled: !editMode }],
            fecplan: [{ value: this.utilitariosService.obtenerFechaActual(), disabled: false }, [Validators.required]],
            desplan: [{ value: null, disabled: false }, [Validators.required]],
            idprioridad: [{ value: null, disabled: false }, [Validators.required]],
            fecplan_ant2: [{ value: null, disabled: false }],
            tipopro: [{ value: null, disabled: false }],
            idoportunidad: [{ value: 0, disabled: false }],
            idtarea: [{ value: this.config.data.idtarea, disabled: false }],
            idtipotarea: [{ value: null, disabled: false }],
            resultado: [{ value: null, disabled: false }]
        });
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    cargarPlanAccion() {
        this.data = this.config.data;

        const objeto = {
            idoportunidad: this.data.id || this.data.idoportunidad
        };
        const $OportunidadesLista = this.leadService
            .OportunidadesPlanAccion(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    console.log('cargarPlanAccion...', rpta);
                    if (rpta.length > 0 && this.data.tipopro !== 4) {
                        const maxItem = rpta.reduce((prev: any, current: any) => (current.idtarea > prev.idtarea ? current : prev));

                        if (this.data.tipopro === 3) {
                            this.idtareaanterior = this.data.idtarea;
                        } else {
                            this.idtareaanterior = maxItem.idtarea;
                        }

                        console.log('idtareaanterior...', this.idtareaanterior);

                        console.log('maxItem...', maxItem);
                        this.frmAccion.patchValue({
                            nomoportunidad: this.data.title,
                            fecplan_ant: maxItem.fecha,
                            fecplan_ant2: maxItem.fecha,
                            desplan_ant: maxItem.descripcion,
                            idprioridad_ant: maxItem.idprioridad,
                            idtipotarea_ant: maxItem.idtipotarea,
                            idoportunidad: maxItem.idoportunidad,
                            tipopro: this.data.tipopro,
                            idtarea: this.data.idtarea
                        });

                        console.log('this.frmAccion...', this.frmAccion.value);
                    }
                    if (this.data.tipopro === 4) {
                        this.frmAccion.patchValue({
                            idoportunidad: this.data.id,
                            tipopro: this.data.tipopro,
                            idtarea: this.data.idtarea,
                            fecplan_ant: new Date(),
                        });
                    }
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

    // prcPlanAccion() {
    //     this.data = this.config.data;

    //     if (this.validarDatos()) {
    //         console.log('errorMensaje : ', this.errorMensaje);
    //         this.messageService.add({ severity: 'info', summary: 'Validación', detail: this.errorMensaje });
    //         return;
    //     }

    //     const objeto = {
    //         idoportunidad: this.data.id,
    //         idplan: 0,
    //         fecplan: this.frmAccion.get('fecplan')?.value,
    //         desplan: this.frmAccion.get('desplan')?.value,
    //         idprioridad: this.frmAccion.get('idprioridad')?.value,
    //         idusuario: 12
    //     };

    //     const $OportunidadesLista = this.leadService
    //         .prcPlanAccion(objeto)
    //         .pipe(takeUntilDestroyed(this.destroyRef))
    //         .subscribe({
    //             next: (rpta: any) => {
    //                 console.log('cargarPlanAccion...', rpta);
    //                 if (rpta.resultProceso === '0') {
    //                     this.messageService.add({
    //                         severity: 'info',
    //                         summary: 'Información',
    //                         detail: rpta.message
    //                     });
    //                     this.cerrar(objeto);
    //                 }
    //             },
    //             error: (err) => {
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error...',
    //                     detail: err
    //                 });
    //             },
    //             complete: () => {}
    //         });
    //     this.$listSubcription.push($OportunidadesLista);
    // }

    cerrar(data: any) {
        this.ref.close({ data });
    }

    validarDatos(): boolean {
        let _error = false;
        this.errorMensaje = '';

        if (this.tipopro() === 2 || this.tipopro() === 4) {
            if (!_error && (this.frmAccion.get('idprioridad_ant')?.value === 0 || this.frmAccion.get('idprioridad_ant')?.value === null)) {
                this.errorMensaje = 'Seleccionar Prioridad...!';
                _error = true;
            }

            if (!_error && (this.frmAccion.get('desplan_ant')?.value === null || this.frmAccion.get('desplan_ant')?.value === '')) {
                this.errorMensaje = 'Ingresar Descripción de la Acción...';
                _error = true;
            }
        } else if (this.tipopro() === 3) {
            if (!_error && (this.frmAccion.get('resultado')?.value === null || this.frmAccion.get('resultado')?.value === '')) {
                this.errorMensaje = 'Ingresar Resultado de la Acción...';
                _error = true;
            }
        } else {
            if (!_error && (this.frmAccion.get('resultado')?.value === null || this.frmAccion.get('resultado')?.value === '')) {
                this.errorMensaje = 'Ingresar Resutado de la Acción Anterior...';
                _error = true;
            }
            if (this.frmAccion.get('fecplan_ant2')?.value != null) {
                const fecplan_ant2 = new Date(this.utilitariosService.formatFecha(this.frmAccion.get('fecplan_ant2')?.value));

                if (this.frmAccion.get('fecplan')?.value < fecplan_ant2) {
                    this.errorMensaje = 'La Fecha de Planificación debe ser mayor a la Fecha Anterior...!';
                    _error = true;
                }
            }

            if (!_error && (this.frmAccion.get('idprioridad')?.value === 0 || this.frmAccion.get('idprioridad')?.value === null)) {
                this.errorMensaje = 'Seleccionar Prioridad...!';
                _error = true;
            }

            if (!_error && (this.frmAccion.get('idtipotarea')?.value === 0 || this.frmAccion.get('idtipotarea')?.value === null)) {
                this.errorMensaje = 'Seleccionar Tipo Tarea...!';
                _error = true;
            }

            if (!_error && (this.frmAccion.get('desplan')?.value === null || this.frmAccion.get('desplan')?.value === '')) {
                this.errorMensaje = 'Ingresar Descripción de la Acción...';
                _error = true;
            }
        }

        return _error;
    }

    prcPlanAccion() {
        console.log('prcPlanAccion', this.frmAccion.value);
        if (this.validarDatos()) {
            console.log('errorMensaje : ', this.errorMensaje);
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: this.errorMensaje });
            return;
        }

        
        let fechaant = this.frmAccion.get('fecplan_ant')?.value;
        console.log('fechaant...', fechaant);
        let fechaant2 = this.frmAccion.get('fecplan_ant2')?.value;
        console.log('fechaant2...', fechaant2);

        if (fechaant.length === 10) {
            fechaant = new Date(this.utilitariosService.formatFecha(fechaant));
        }

        if (fechaant2 !== null) {
            if (fechaant2.length === 10) {
                fechaant2 = new Date(this.utilitariosService.formatFecha(fechaant2));
            }
        }

        const objeto = {
            idtarea: this.frmAccion.get('idtarea')?.value,
            idoportunidad: this.frmAccion.get('idoportunidad')?.value,
            idtarea_origen: 0,
            descripcion: this.tipopro() === 1 ? this.frmAccion.get('desplan')?.value : this.frmAccion.get('desplan_ant')?.value,
            fechaini: this.tipopro() === 1 ? this.frmAccion.get('fecplan')?.value : fechaant,
            fechafin: this.tipopro() === 1 ? this.frmAccion.get('fecplan')?.value : fechaant,
            progreso: 0,
            completo: false,
            indvig: true,
            horaini: '00:00',
            horafin: '00:00',
            idtarea_acti: 0,
            idetapa: 0,
            idprioridad: this.tipopro() === 1 ? this.frmAccion.get('idprioridad')?.value : this.frmAccion.get('idprioridad_ant')?.value,
            idtipotarea: this.tipopro() === 1 ? this.frmAccion.get('idtipotarea')?.value : this.frmAccion.get('idtipotarea_ant')?.value,
            resultado: '',
            idusuario: constantesLocalStorage.idusuario
        };
        console.log('agregarEtapa', objeto);

        const $agregarSubTarea = this.leadService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('tareaPrc', rpta);
                if (this.tipopro() === 1) {
                    this.completarTarea(this.idtareaanterior);
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

    completarTarea(idtarea: number) {
        console.log('completarTarea...', idtarea);
        const objeto = {
            idtarea: idtarea,
            resultado: this.frmAccion.get('resultado')?.value
        };
        console.log('objeto...', objeto);
        const $completarTarea = this.leadService.completarTarea(objeto).subscribe({
            next: (rpta: any) => {
                console.log('completarTarea...', rpta);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            }
        });
    }

    completarTarea2() {
        if (this.validarDatos()) {
            console.log('errorMensaje : ', this.errorMensaje);
            this.messageService.add({ severity: 'info', summary: 'Validación', detail: this.errorMensaje });
            return;
        }
        const objeto = {
            idtarea: this.idtareaanterior,
            resultado: this.frmAccion.get('resultado')?.value
        };

        console.log('objeto...', objeto);

        const $completarTarea = this.leadService.completarTarea(objeto).subscribe({
            next: (rpta: any) => {
                this.cerrar(objeto);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            }
        });
    }
}
