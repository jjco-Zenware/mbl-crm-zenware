import { Component, DestroyRef, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';
import { UtilitariosService } from '../../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion } from '../../model/constantes';
import { Assignees, TareaAsignado, Tasks } from '../../model/interfaces';
import { SharedAppService } from '../../shared/sharedApp.service';
import { ListatareasService } from '../service/listatareas.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CModalComentarioComponent } from './modalComentario/c-modalcoment.component';
import { CModalTareaComponent } from './c-model-tarea/c-modaltarea.component';
import { CListadoFile } from '../../lead/c-listado-file/c-listado-file';

@Component({
    selector: 'app-c-tarea',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    templateUrl: './tarea.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService]
})
export class Tarea implements OnInit, OnDestroy {
    @Input() IA_data: any;

    private readonly destroyRef = inject(DestroyRef);
    $listSubcription: Subscription[] = [];

    frmDatosCab!: FormGroup;
    dataAdjunto: any;
    registerFormRegistro!: FormGroup;
    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = '';
    verAdjunto= signal<boolean>(false);
    ExcelData: any;
    onlyRead= signal<boolean>(false);
    errorMensaje: string = '';
    idTarea: any;
    lstSubTareas = signal<any[]>([]);
    comentarios = signal<any[]>([]);
    comentario: any;
    newComment: any = {
        idcomentario: 0,
        name: constantesLocalStorage.nombreUsuario,
        comentario: '',
        image: constantesLocalStorage.imagen,
        fechareg: '',
        idtarea: 0,
        indvig: true,
        idusuario: constantesLocalStorage.idusuario
    };
    totalcomentarios: number = 0;
    totaladjuntos: any;
    verPreventa = signal<boolean>(false);
    verComercial = signal<boolean>(false);
    expandedRows = {};
    Descripcion: any;
    asignadosTareaVisible= signal<boolean>(false);
    headerTarea?: string;
    headerTitle: string = '';
    asignadosTareas = signal<TareaAsignado[]>([]); //: TareaAsignado[] = [];
    assigneesTarea = signal<TareaAsignado[]>([]);
    filteredAsignadosTareas = signal<TareaAsignado[]>([]);
    idtarea: number = 0;
    assignees = signal<Assignees[]>([]); 
    Tarea!: Tasks;
    idUsuarioAsignado: number = 0;
    verayuda= signal<boolean>(false);
    idEtapa: number = 0;
    totcompletadas: any;
    totvencidas: any;
    totpendientes: any;
    tituloAyuda: any;
    dias!: any[];
    sumtareas: number = 0;
    detOportunidad: any;
    lstpreventas = signal<any[]>([]);
    fecdesde: any;
    fechasta: any;
    minimaFechaDesde!: Date;
    //maximaFechaDesde!: Date ;
    minimaFechaHasta!: Date;
    maximaFechaHasta!: Date;
    idperfil: number = 0;

    constructor(
        private fb: FormBuilder,
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private serviceSharedApp: SharedAppService,
        private serviceUtilitario: UtilitariosService,
        public dialogService: DialogService,
        private listatareasService: ListatareasService,
        private confirmationService: ConfirmationService
    ) {
        this.idperfil = constantesLocalStorage.idperfil;
    }

    ngOnInit(): void {
        console.log('ngOnInit CTareaConfigComponent', this.IA_data);
        this.idTarea = this.IA_data.data.idtarea;
        this.detOportunidad = this.IA_data.data.descripcion;
        this.createFormRegistro();
        this.listaAsignados();

        if (this.idperfil === 3) {
            this.verPreventa.set(true);
        }
        if (this.idperfil === 2 || this.idperfil === 4) {
            this.verComercial.set(true);
        }

        if (this.idTarea > 0) {
        console.log('Tarea mayor a cero ');
            if (this.IA_data.paramReg === 'V') {
                this.dataAdjunto = {
                    idCliente: this.idTarea,
                    codtipoproc: 3, //adjuntos de tareas de oportunidad
                    veracciones: 1,
                    idoportunidad: this.IA_data.data.idoportunidad
                };
            } else {
                this.dataAdjunto = {
                    idCliente: this.idTarea,
                    codtipoproc: 3,
                    veracciones: 0,
                    idoportunidad: this.IA_data.data.idoportunidad
                };
            }
            this.verAdjunto.set(true);
            this.traerUno();
        } else {
            this.dataAdjunto = {
                idCliente: 0,
                codtipoproc: 3,
                veracciones: 0,
                idoportunidad: this.IA_data.data.idoportunidad
            };
        }

        this.expandAll();
    }

    expandAll() {
        this.expandedRows = this.lstSubTareas().reduce((acc, p) => (acc[p.idtarea_acti] = true) && acc, {});

        const fechasMin = this.lstSubTareas().map((d) => d.fechaini);
        //console.log('this.fechasMin lista...', fechasMin);
        // Convertir las fechas (formato dd/mm/yyyy) a objetos Date
        const fechasConvertidasMin = fechasMin.map((f) => {
            const [dia, mes, anio] = f.split('/').map(Number);
            return new Date(anio, mes - 1, dia);
        });
        const fechamin = new Date(Math.min(...fechasConvertidasMin.map((date: any) => new Date(date).getTime())));
        ////console.log('this.fechaMin...', fechamin);
        let fechaInicial = new Date(fechamin);

        /**/
        const fechasMax = this.lstSubTareas().map((d) => d.fechafinal);
        //console.log('this.fechasIni...', fechasMax);
        // Convertir las fechas (formato dd/mm/yyyy) a objetos Date
        const fechasConvertidas = fechasMax.map((f) => {
            const [dia, mes, anio] = f.split('/').map(Number);
            return new Date(anio, mes - 1, dia);
        });
        const fecha = new Date(Math.max(...fechasConvertidas.map((date: any) => new Date(date).getTime())));
        //console.log('this.fechasMax...', fecha);
        let fechafinal = new Date(fecha);

        this.dias = this.generarDias(fechaInicial, fechafinal);
        console.log('this.dias...', this.dias);
    }

    createFormRegistro() {
        //Agregar validaciones de formulario
        this.registerFormRegistro = this.formBuilder.group({
            idtarea: [{ value: this.idTarea, disabled: false }],
            idoportunidad: [{ value: 0, disabled: false }],
            cliente: [{ value: null, disabled: false }],
            fechaini: [{ value: null, disabled: false }],
            fechafin: [{ value: null, disabled: false }],
            completo: [{ value: null, disabled: false }],
            indvig: [{ value: false, disabled: false }],
            nroorden: [{ value: 0, disabled: false }],
            idtarea_origen: [{ value: 0, disabled: false }],
            descripcion: [{ value: false, disabled: false }],
            s_oportunidad: [{ value: false, disabled: false }],
            progreso: [{ value: 0, disabled: false }],
            tot_comentarios: [{ value: 0, disabled: false }],
            tot_adjuntos: [{ value: 0, disabled: false }],
            idetapa: [{ value: 0, disabled: false }],
            oportunidad: [{ value: false, disabled: false }],
            detoportunidad: [{ value: null, disabled: false }],
            idresponsabletar: [{ value: '', disabled: false }]
        });
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    traerUno() {
        this.registerFormRegistro.patchValue(this.IA_data.data);
        this.totalcomentarios = this.registerFormRegistro.value.tot_comentarios;
        this.totaladjuntos = this.registerFormRegistro.value.tot_adjuntos;
        this.obtenerSubTareas();
        this.listarComentarios();
        this.fecdesde = this.IA_data.data.fechaini;
        this.fechasta = this.IA_data.data.fechafin;

        console.log('traerUno', this.fecdesde, this.fecdesde)

        this.minimaFechaHasta = new Date(this.serviceUtilitario.formatFecha(this.fechasta));
        this.minimaFechaDesde = new Date(this.serviceUtilitario.formatFecha(this.fecdesde));
        //this.maximaFechaDesde = new Date( this.serviceUtilitario.formatFecha( this.param.fechasta ) );
        this.maximaFechaHasta = new Date(this.serviceUtilitario.formatFecha(this.fechasta));
    }

    agregarEtapa() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...';

        //let etapa = 0;
        //     etapa = this.Descripcion.substring(0,1).toUpperCase();
        //     switch (etapa) {
        //         case 'A':
        //             this.idEtapa = 1;
        //             break;
        //         case 'B':
        //             this.idEtapa = 2;
        //             break;
        //         case 'C':
        //             this.idEtapa = 3;
        //             break;
        //         case 'D':
        //             this.idEtapa = 4;
        //             break;
        //     }

        let fechaini;
        let fechafin;
        fechaini = this.registerFormRegistro.value.fechaini;
        fechafin = this.registerFormRegistro.value.fechafin;

        if (fechaini.toString().length === 10) {
            fechaini = new Date(this.serviceUtilitario.formatFecha(fechaini));
        }
        if (fechafin.toString().length === 10) {
            fechafin = new Date(this.serviceUtilitario.formatFecha(fechafin));
        }

        const objeto = {
            idtarea: 0,
            idtarea_origen: this.idTarea,
            descripcion: this.Descripcion,
            fechaini: fechaini,
            fechafin: fechafin,
            progreso: 0,
            completo: false,
            indvig: true,
            horaini: '00:00',
            horafin: '00:00',
            idtarea_acti: 0,
            idetapa: this.idEtapa
        };
        console.log('agregarEtapa', objeto);

        const $agregarSubTarea = this.listatareasService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                console.log('tareaPrc', rpta);
                objeto.idtarea_acti = parseInt(rpta.resultProceso);

                //damos de baja la tarea
                this.eliminarEtapa(objeto);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);
    }

    onComment(event: any) {
        console.log('onComment...', event);
        const desdeStr = this.serviceUtilitario.obtenerFechaActualFormat();
        event.preventDefault();
        if (this.comentario.trim().length > 0) {
            this.newComment = {
                ...this.newComment,
                comentario: this.comentario,
                fechareg: desdeStr,
                idtarea: this.idTarea
            };

            const $comentarioTareaPrc = this.listatareasService.comentarioTareaPrc(this.newComment).subscribe({
                next: (rpta: any) => {
                    console.log('comentarioTareaPrc...', rpta);
                    this.comentario = '';
                    this.listarComentarios();
                },
                error: (err) => {
                    this.setSpinner(false);
                    this.serviceSharedApp.messageToast();
                },
                complete: () => {}
            });
            this.$listSubcription.push($comentarioTareaPrc);
        }
    }

    listarComentarios() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando...!';
        const $agregarSubTarea = this.listatareasService.listarComentariosTareas(this.idTarea).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('listarComentarios...', rpta);
                this.comentarios = rpta;
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);
    }

    obtenerSubTareas() {
        this.mensajeSpinner = 'Cargando...';
        this.setSpinner(true);
        this.lstSubTareas.set([]);
        const $agregarSubTarea = this.listatareasService.listarSubTareas(this.idTarea).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('obtenerSubTareas...', rpta.subtareas);
                console.log('length...', rpta.length);
                if (rpta.subtareas !== undefined) {
                    this.lstSubTareas.set(rpta.subtareas);                
                    this.calculateProgress();
                    this.sumtareas = this.lstSubTareas()[0].sum_tareas;
                    this.expandAll();
                
                }
                               
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {
                
                
            }
        });
        this.$listSubcription.push($agregarSubTarea);
    }

    editarRegistro(data: any, value: number) {
        let fechaini;
        let fechafin;
        let fechanvafin;
        fechaini = data.fechaini;
        fechafin = data.fechafin;
        fechanvafin = data.fechanvafin;
        let horaini = data.horaini;
        let horafin = data.horafin;

        console.log('completar tarea...', data);

        if (this.verPreventa()) {
            if (data.completo) {
                //this.obtenerSubTareas();
                let cantAsignados = data.asignados.length;
                if (cantAsignados === 0) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se puede marcar como completo porque no hay asignados.'
                    });
                    return;
                }

                if (data.tot_comentarios === 0 && data.tot_adjuntos === 0) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se puede marcar como completo porque no hay comentarios o adjuntos.'
                    });
                    return;
                }
                fechanvafin = new Date();
            }
        }

        let vigente;
        if (value === 0) {
            vigente = false;
        } else {
            vigente = true;
        }

        this.mensajeSpinner = 'Actualizando...';
        console.log('editarRegistro...', data);
        console.log('fechaini...', fechaini);
        console.log('fechafin...', fechafin);
        this.setSpinner(true);

        // console.log('horaini...', horaini);
        // console.log('fechanvafin...', fechanvafin);

        // console.log('horafin...', horafin);
        if (fechaini.toString().length === 10) {
            fechaini = new Date(this.serviceUtilitario.formatFecha(fechaini));
        }
        if (fechafin.toString().length === 10) {
            fechafin = new Date(this.serviceUtilitario.formatFecha(fechafin));
        }

        if (fechanvafin !== undefined) {
            if (fechanvafin.toString().length === 10) {
                fechanvafin = new Date(this.serviceUtilitario.formatFecha(fechanvafin));
            }
        }

        if (horaini.toString().length > 5) {
            horaini = data.horaini.getHours() + ':' + data.horaini.getMinutes();
        }

        if (horafin.toString().length > 5) {
            horafin = data.horafin.getHours() + ':' + data.horafin.getMinutes();
        }

        const objeto = {
            idtarea: data.idtarea,
            idtarea_origen: this.idTarea,
            descripcion: data.descripcion,
            fechaini: fechaini,
            fechafin: fechafin,
            fechanvafin: fechanvafin,
            progreso: 0,
            completo: data.completo,
            indvig: vigente,
            horaini: horaini,
            horafin: horafin,
            idtarea_acti: data.idtarea_acti,
            idetapa: data.idetapa
        };

        console.log('objeto editar...', objeto);

        this.listatareasService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta...', rpta);
                this.obtenerSubTareas();
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }

    eliminarRegistro(data: any) {
        //preguntar si desea eliminar subtarea
        this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            message: '¿Desea Eliminar SubTarea ' + '<b>' + data.descripcion + '</b>' + '?',
            accept: () => {
                this.editarRegistro(data, 0);
            }
        });
    }

    calculateProgress() {
        console.log('Cálculo...');
        if (this.lstSubTareas().length === 0) {
            this.registerFormRegistro.get('progreso')?.setValue(0);
            return
        }
        
        let tot;
        let completed: number = 0;

        if (this.lstSubTareas().length > 0) {
            completed = this.lstSubTareas().filter((t: { completo: any }) => t.completo).length;
        }
        let tottareas: number = this.lstSubTareas().length;
        console.log('completed...', completed);
        console.log('this.lstSubTareas().length...', tottareas);
        console.log('Math.round...', (completed / tottareas));

        // if (this.lstSubTareas().length === 0) {
        //     tot = 0;
        // } else {
            tot = Math.round( (completed / tottareas)* 100);
        //}

        console.log('tot...', tot);

        if (tot === 100) {
            this.registerFormRegistro.get('completo')?.setValue(true);
        } else {
            this.registerFormRegistro.get('completo')?.setValue(false);
        }
        console.log('tot...', tot);
        this.registerFormRegistro.get('progreso')?.setValue(tot);
        //this.editarProgreso();
    }

    editarProgreso() {
        // this.mensajeSpinner = "Actualizando...";
        // this.setSpinner(true);

        let fechaini;
        let fechafin;
        fechaini = this.registerFormRegistro.value.fechaini;
        fechafin = this.registerFormRegistro.value.fechafin;

        if (fechaini.toString().length === 10) {
            fechaini = new Date(this.serviceUtilitario.formatFecha(fechaini));
        }
        if (fechafin.toString().length === 10) {
            fechafin = new Date(this.serviceUtilitario.formatFecha(fechafin));
        }

        const objeto = {
            ...this.registerFormRegistro.value,
            fechaini: fechaini,
            fechafin: fechafin
        };

        console.log('objeto...', objeto);

        this.listatareasService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                //this.setSpinner(false);
                console.log('rpta...', rpta);
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }

    delComentario(dato: any) {
        console.log('delComentario...', dato);
        dato.idusuario = constantesLocalStorage.idusuario;
        this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            message: '¿Desea Eliminar Comentario ' + '<b>' + dato.comentario + '</b>' + '?',
            accept: () => {
                this.listatareasService.comentarioTareaDel(dato).subscribe({
                    next: (rpta: any) => {
                        this.setSpinner(false);
                        console.log('rpta...', rpta);
                        this.listarComentarios();
                    },
                    error: (err) => {
                        this.setSpinner(false);
                        this.serviceSharedApp.messageToast();
                    },
                    complete: () => {}
                });
            }
        });
    }

    agregarComentario(data: any) {
        const refMensaje = this.dialogService.open(CModalComentarioComponent, {
            data: data,
            header: 'SUB TAREA: ' + data.descripcion.toUpperCase(),
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '35%'
        });
        if (refMensaje) {
            refMensaje.onClose.subscribe((rpta: any) => {
                this.obtenerSubTareas();
            });
        }
    }

    anexos(dato: any, param: string) {
        console.log('anexos : ', dato);
        const ref = this.dialogService.open(CListadoFile, {
            data: { idoportunidad: this.IA_data.data.idoportunidad, codtipoproc: 3, idnroproceso: dato.idtarea, parametro: param, texto: dato.descripcion },
            header: dato.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true
        });
        if (ref) {
            ref.onClose.subscribe(() => {
                this.obtenerSubTareas();
            });
        }
    }

    getSeverity(status: any) {
        switch (status) {
            case 'COMPLETADO':
                return 'success';
            case 'PROCESO':
                return 'warn';
            case 'VENCIDO':
                return 'danger';
            case 'PENDIENTE':
                return 'info';
            default:
                return 'info';
        }
    }

    agregarTarea(data: any, id: number) {
        console.log('CItemCotizacionComponent', data, id);

        console.log('this.lstSubTareas', this.lstSubTareas);

        if (this.lstSubTareas !== undefined) {
            const fechasMax = this.lstSubTareas().map((d) => d.fechafinal);
            console.log('this.fechasIni...', fechasMax);

            // Convertir las fechas (formato dd/mm/yyyy) a objetos Date
            const fechasConvertidas = fechasMax.map((f) => {
                const [dia, mes, anio] = f.split('/').map(Number);
                return new Date(anio, mes - 1, dia);
            });

            const fecha = new Date(Math.max(...fechasConvertidas.map((date: any) => new Date(date).getTime())));
            console.log('this.fechaMin...', fecha);

            //asignar fecha + 1 día
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setDate(nuevaFecha.getDate() + 1);
            console.log('this.nuevaFecha...', nuevaFecha);
            data.fechaininva = this.serviceUtilitario.obtenerFechaFormateadoDMA(nuevaFecha);
        }

        let titulo = '';

        if (id === 1) {
            data.idtarea = 0;
            data.idtarea_origen = this.idTarea;
            data.idtarea_acti = 0;
            titulo = 'AGREGAR ETAPA';
        } else {
            titulo = data.destarea_acti + ' - AGREGAR TAREA';
        }

        data.fecdesde = this.fecdesde;
        data.fechasta = this.fechasta;

        const refItem = this.dialogService.open(CModalTareaComponent, {
            data: data,
            header: titulo,
            closeOnEscape: false,
            styleClass: 'testDialog',
            width: ' 30%',
            closable: true
        });
        if (refItem) {
            refItem.onClose.subscribe((rpta: any) => {
                console.log('onClose', rpta);
                if (rpta != undefined) {
                    console.log('rpta.objeto...', rpta.objeto);
                    this.idEtapa = rpta.objeto.idetapa;
                    this.Descripcion = rpta.objeto.descripcion;
                    console.log('this.Descripcion...', this.idEtapa);
                    if (id == 1) {
                        //agregar etapa
                        this.agregarEtapa();
                    } else {
                        this.obtenerSubTareas();
                    }
                }
            });
        }
    }

    agregarActividad(data: any) {
        console.log('agregarActividad', data);

        let fechaini;
        let fechafin;
        fechaini = this.registerFormRegistro.value.fechaini;
        fechafin = this.registerFormRegistro.value.fechafin;

        if (fechaini.toString().length === 10) {
            fechaini = new Date(this.serviceUtilitario.formatFecha(fechaini));
        }
        if (fechafin.toString().length === 10) {
            fechafin = new Date(this.serviceUtilitario.formatFecha(fechafin));
        }

        let nuevaFecha = new Date();
        console.log('this.lstSubTareas()...', this.lstSubTareas());

        if (this.lstSubTareas().length > 0) {
            const fechasMax = this.lstSubTareas().map((d) => d.fechafinal);
            console.log('this.fechasIni...', fechasMax);

            // Convertir las fechas (formato dd/mm/yyyy) a objetos Date
            const fechasConvertidas = fechasMax.map((f) => {
                const [dia, mes, anio] = f.split('/').map(Number);
                return new Date(anio, mes - 1, dia);
            });

            const fecha = new Date(Math.max(...fechasConvertidas.map((date: any) => new Date(date).getTime())));
            console.log('this.fechaMin...', fecha);

            //asignar fecha + 1 día
            nuevaFecha = new Date(fecha);
            nuevaFecha.setDate(nuevaFecha.getDate() + 1);
            console.log('this.nuevaFecha...', nuevaFecha);
        }

        const objeto = {
            idtarea: 0,
            idtarea_origen: this.idTarea,
            idtarea_acti: data.idtarea_acti,
            descripcion: 'describir la tarea',
            fechaini: nuevaFecha,
            fechafin: nuevaFecha,
            progreso: 0,
            completo: false,
            indvig: true,
            horaini: '00:00',
            horafin: '00:00',
            idetapa: this.idEtapa
        };
        console.log('agregarSubTarea', objeto);

        const $agregarSubTarea = this.listatareasService.tareaPrcActividad(objeto).subscribe({
            next: (rpta: any) => {
                this.obtenerSubTareas();
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);
    }

    eliminarEtapa(objeto: any) {
        console.log('eliminarEtapa', objeto);
        objeto.indvig = false;
        objeto.idtarea = objeto.idtarea_acti;

        const $agregarSubTarea = this.listatareasService.tareaPrc(objeto).subscribe({
            next: (rpta: any) => {
                console.log('resultado...', rpta);
                this.agregarActividad(objeto);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($agregarSubTarea);
    }

    asignarTarea(task: Tasks) {
        this.Tarea = task;
        console.log('task...', task);
        this.asignadosTareas.set([]);
        this.idtarea = task.idtarea;
        this.asignadosTareas.set(task.asignados);
        this.headerTitle = 'Asignados de la Tarea';
        this.headerTarea = 'Tarea: ' + task.descripcion;
        this.asignadosTareaVisible.set(true);
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
        if (this.asignadosTareas().length > 1) {
            this.messageService.add({ severity: 'info', detail: 'la tarea debe tener solo un Asignado' });
            return;
        }
        for (let x = 0; x < this.lstSubTareas().length; x++) {
            if (this.lstSubTareas()[x].idtarea == this.idtarea) {
                //identificamos la tarea
                this.lstSubTareas()[x].asignados = []; //limpiamos array de asigandos de la tarea
                for (let z = 0; z < this.asignadosTareas().length; z++) {
                    this.idUsuarioAsignado = this.asignadosTareas()[z].idasignado;
                    this.lstSubTareas()[x].asignados.unshift(this.asignadosTareas()[z]); //agregamos asignados a la tarea
                }
            }
        }
        this.editarAsignadoTarea();
        console.log('this.lstSubTareas....', this.lstSubTareas);
        this.asignadosTareaVisible.set(false);
    }

    listaAsignados() {
        this.assignees.set([]);
                this.assigneesTarea.set([]);
                this.lstpreventas.set([]);
        this.listatareasService.listaPreVentas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (rpta: any) => {
                console.log('listaAsignados...', rpta);
                this.assignees.set(rpta);
                this.assigneesTarea.set(rpta);
                this.lstpreventas.set(rpta);

                const objet = {
                    idasignado: 0,
                    name: 'Seleccionar'
                };
                this.lstpreventas.set([objet, ...this.lstpreventas()]);
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

    editarAsignadoTarea() {
        this.mensajeSpinner = 'Procesando Asignado...';
        this.setSpinner(true);

        const objeto = {
            idtarea: this.idtarea,
            idusuario: this.idUsuarioAsignado
        };

        console.log('objeto editar...', objeto);

        this.listatareasService.tareaAsignadoPrc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta...', rpta);
                this.obtenerSubTareas();
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }

    mostrarAyuda(data: any) {
        console.log('mostrarAyuda...', data);
        this.verayuda.set(true);
        this.idEtapa = data.idetapa;

        switch (this.idEtapa) {
            case 1:
                this.tituloAyuda = 'A. ETAPA DE DESCUBRIMIENTO';
                break;
            case 2:
                this.tituloAyuda = 'B. ETAPA DE ANÁLISIS';
                break;
            case 3:
                this.tituloAyuda = 'C. ETAPA DE DISEÑO';
                break;
            case 4:
                this.tituloAyuda = 'D. ETAPA DE CIERRE TÉCNICO';
                break;
        }

        //this.messageService.add({severity:'info', summary:'Ayuda', detail:'En esta sección podrá configurar las etapas y tareas que componen el proceso de la oportunidad. Primero debe agregar las etapas y luego dentro de cada etapa podrá agregar las tareas correspondientes. Recuerde que cada tarea puede tener un solo asignado.'});
    }

    vistaPreliminar() {
        if (this.lstSubTareas === undefined) {
            this.messageService.add({
                severity: 'info',
                summary: 'Aviso',
                detail: 'No existen Tareas para generar la Vista Preliminar.'
            });
            return;
        }

        this.setSpinner(true);
        this.mensajeSpinner = 'Descargando Vista Preliminar...!';

        const objeto = {
            idtarea_origen: this.idTarea
        };

        const $cargarOrdenC = this.listatareasService.subtareasRDLC(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);

                const mediaType = 'application/pdf';
                const blob = new Blob([rpta.body], { type: mediaType });
                const filename = 'GestionPreVenta_' + this.idTarea;

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.target = '_blank';
                a.click();

                window.open(url);

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            },
            error: (err) => {
                this.setSpinner(false);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
        this.$listSubcription.push($cargarOrdenC);
    }

    generarDias(inicio: Date, fin: Date): Date[] {
        console.log('generarDias...', inicio, fin)
        const dias = [];
        const actual = new Date(inicio);
        while (actual <= fin) {
            dias.push(new Date(actual));
            actual.setDate(actual.getDate() + 1);
        }

        return dias;
    }

    getEstiloCelda(tarea: any, dia: Date) {
        switch (tarea.estado_s) {
            case 'COMPLETADO':
                return dia >= new Date(this.serviceUtilitario.formatFecha(tarea.fechaini)) && dia <= new Date(this.serviceUtilitario.formatFecha(tarea.fechafinal)) ? { backgroundColor: '#36aa3fff' } : {};
            case 'PROCESO':
                return dia >= new Date(this.serviceUtilitario.formatFecha(tarea.fechaini)) && dia <= new Date(this.serviceUtilitario.formatFecha(tarea.fechafinal)) ? { backgroundColor: '#ce9428ff' } : {};
            case 'VENCIDO':
                return dia >= new Date(this.serviceUtilitario.formatFecha(tarea.fechaini)) && dia <= new Date(this.serviceUtilitario.formatFecha(tarea.fechafinal)) ? { backgroundColor: '#e72214ff' } : {};
            case 'PENDIENTE':
                return dia >= new Date(this.serviceUtilitario.formatFecha(tarea.fechaini)) && dia <= new Date(this.serviceUtilitario.formatFecha(tarea.fechafinal)) ? { backgroundColor: '#0288d1' } : {};
            default:
                return dia >= new Date(this.serviceUtilitario.formatFecha(tarea.fechaini)) && dia <= new Date(this.serviceUtilitario.formatFecha(tarea.fechafinal)) ? { backgroundColor: '#ffffff' } : {};
        }
    }

    mayorDiaFinal(idetapa: any) {
        /**/
        console.log('this.idetapa...', idetapa);
        let listaetapa = this.lstSubTareas().filter((item: any) => item.idetapa === idetapa);
        const fechasMax = listaetapa.map((d) => d.fechafinal);
        console.log('this.fechasIni...', fechasMax);
        // Convertir las fechas (formato dd/mm/yyyy) a objetos Date
        const fechasConvertidas = fechasMax.map((f) => {
            const [dia, mes, anio] = f.split('/').map(Number);
            return new Date(anio, mes - 1, dia);
        });
        const fecha = new Date(Math.max(...fechasConvertidas.map((date: any) => new Date(date).getTime())));
        //console.log('this.fechasMax...', fecha);
        let fechafinal = new Date(fecha);

        console.log('this.dias...', fechafinal);
    }

    prcTreaResponsable(event: any) {
        this.setSpinner(true);
        this.mensajeSpinner = 'Agregando Responsable de la Gestión';

        console.log('prcTreaResponsable...', event);

        let fechaini;
        let fechafin;
        fechaini = this.registerFormRegistro.value.fechaini;
        fechafin = this.registerFormRegistro.value.fechafin;

        if (fechaini.toString().length === 10) {
            fechaini = new Date(this.serviceUtilitario.formatFecha(fechaini));
        }
        if (fechafin.toString().length === 10) {
            fechafin = new Date(this.serviceUtilitario.formatFecha(fechafin));
        }

        const objeto = {
            ...this.registerFormRegistro.value,
            idusuario: event,
            fechaini: fechaini,
            fechafin: fechafin
        };

        console.log('objeto...', objeto);

        this.listatareasService.tareaResponsablePrc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta...', rpta);
                if (rpta.procesoSwitch === 0) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'OK...',
                        detail: rpta.mensaje
                    });
                }
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }
}
