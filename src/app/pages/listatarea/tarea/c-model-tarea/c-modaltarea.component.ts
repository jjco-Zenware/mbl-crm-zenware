import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilitariosService } from '@/app/pages/service/utilitarios.service';
import { CProgressSpinnerComponent } from '@/app/pages/shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '@/app/pages/shared/primeng_modules';
import { ListatareasService } from '../../service/listatareas.service';
import { SharedAppService } from '@/app/pages/shared/sharedApp.service';

@Component({
  selector: 'app-c-modaltarea',
  templateUrl: './c-modaltarea.component.html',
  imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService, SharedAppService]
})
export class CModalTareaComponent implements OnInit, OnDestroy {
  $listSubcription: Subscription[] = [];
  param: any;
  headerTitle?: string;
  idTarea: any;
  blockedDocument = signal<boolean>(false);
  mensajeSpinner: string = '';
  registerFormRegistro!: FormGroup;
  errorMensaje!: string;
  verControl= signal<boolean>(false);

   minimaFechaDesde!: Date;
    //maximaFechaDesde!: Date ;
    minimaFechaHasta!: Date;
    maximaFechaHasta!: Date;
    lstSubTareas= signal<any[]>([]);
    lstEtapas= signal<any[]>([]);
    submitted!: boolean;
    registerFormEtapa!: FormGroup;
etapaVisible: any;

  constructor(
    public refDatoItem: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
     private formBuilder: FormBuilder,
    private serviceSharedApp: SharedAppService,
    private serviceUtilitario: UtilitariosService,
    private listatareasService: ListatareasService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) { }



  ngOnInit(): void {
    this.createFormRegistro();
        this.createFormEtapa();
    
        this.listarEtapas();
    this.param = this.config.data;
    console.log('this.param...', this.param);
    this.idTarea = this.param.idtarea;
    this.registerFormRegistro.patchValue({
        idtarea_origen: this.param.idtarea_origen,
        idtarea_acti: this.param.idtarea_acti,
        idetapa: this.param.idetapa,
        fechaini: this.param.fechaininva,
    });

    if (this.idTarea > 0) {
        this.verControl.set(true);
        this.minimaFechaHasta = new Date( this.serviceUtilitario.formatFecha( this.param.fechaininva ) );
        this.minimaFechaDesde = new Date( this.serviceUtilitario.formatFecha( this.param.fecdesde ) );
        //this.maximaFechaDesde = new Date( this.serviceUtilitario.formatFecha( this.param.fechasta ) );
        this.maximaFechaHasta = new Date( this.serviceUtilitario.formatFecha( this.param.fechasta ) );
    }else{
        this.obtenerSubTareas();
    }
    


  }

  get formContacto() { return this.registerFormEtapa.controls; }

  createFormEtapa() {
    //Agregar validaciones de formulario
    this.registerFormEtapa = this.fb.group({
    nometapa: ['', [Validators.required]],
    });
}

  createFormRegistro() {
        //Agregar validaciones de formulario
        this.registerFormRegistro = this.formBuilder.group({
            idtarea: [{ value: 0, disabled: false }],
            fechaini: [{ value: null, disabled: false }],
            fechafin: [{ value: null, disabled: false }],
            completo: [{ value: null, disabled: false }],
            indvig: [{ value: false, disabled: false }],
            nroorden: [{ value: 0, disabled: false }],
            idtarea_origen: [{ value: 0, disabled: false }],
            descripcion: [{ value: null, disabled: false }],
            idtarea_acti: [{ value: 0, disabled: false }],
            progreso: [{ value: 0, disabled: false }],
            horaini:[{ value: '00:00', disabled: false }],
            horafin:[{ value: '00:00', disabled: false }],
            idetapa: [{ value: 0, disabled: false }],
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

  grabarTarea() {

    if (this.verControl()) {    
        if (this.validarDatos()) {
                this.setSpinner(false);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Aviso',
                    detail: this.errorMensaje,
                });
                return;
            }

            this.setSpinner(true);
            this.mensajeSpinner="Cargando...!";

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
                idtarea_origen: this.registerFormRegistro.value.idtarea_origen,
                idtarea_acti: this.registerFormRegistro.value.idtarea_acti,
                descripcion: this.registerFormRegistro.value.descripcion,
                fechaini: fechaini,
                fechafin: fechafin,
                progreso: 0,
                completo: false,
                indvig: true,
                horaini:this.registerFormRegistro.value.horaini,
                horafin:this.registerFormRegistro.value.horafin,
                idetapa: this.registerFormRegistro.value.idetapa,
            };

            const $agregarSubTarea = this.listatareasService
                .tareaPrcActividad(objeto)
                .subscribe({
                    next: (rpta: any) => {  
                        this.cerrar(rpta);  
                    },
                    error: (err) => {
                        this.serviceSharedApp.messageToast();
                    },
                    complete: () => {},
                });
            this.$listSubcription.push($agregarSubTarea);

        }
        else{

            if (this.validarDatos()) {
                this.setSpinner(false);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Aviso',
                    detail: this.errorMensaje,
                });
                return;
            }

             if (this.lstSubTareas !== undefined) {
                if (this.lstSubTareas().some(subtarea => subtarea.idetapa === this.registerFormRegistro.value.idetapa)) {
                    // Description already exists in subtasks
                    this.setSpinner(false);
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Aviso',
                        detail: 'La Etapa ya se encunetra Registrada...!' ,
                    });
                    return;
                }
            }

            this.setSpinner(false);
            const objeto = {
                descripcion: this.registerFormRegistro.value.descripcion,
                idetapa:this.registerFormRegistro.value.idetapa
            }
            this.cerrar(objeto);

        }
    }


  cerrar(data:any) {
    const objeto = {
      ...data
    }
    this.refDatoItem.close({objeto});
  }

  validarDatos(): boolean {
        let _error = false;
        this.errorMensaje = '';
        console.log('this.formValue...', this.registerFormRegistro.value);

        if (
            this.registerFormRegistro.value.descripcion === '' ||
            this.registerFormRegistro.value.descripcion === null
        ) {
            this.errorMensaje = 'Ingresar Descripción...!';
            _error = true;
        }

        if (this.verControl()) {
             if (
            !_error &&
            (this.registerFormRegistro.value.fechaini === null ||
                this.registerFormRegistro.value.fechaini === '')
            ) {
                this.errorMensaje = 'Ingresar Fecha Inicio...!';
                _error = true;
            }

            if (
                !_error &&
                (this.registerFormRegistro.value.fechafin === null ||
                    this.registerFormRegistro.value.fechafin === '')
            ) {
                this.errorMensaje = 'Ingresar Fecha Fin...!';
                _error = true;
            }
        }       

        return _error;
    }

    changeFechaDesde(event: Date) {
        this.minimaFechaHasta = event;
    }

    changeFechaHasta(event: Date) {
        let fecemision = this.registerFormRegistro.value.fechaini;
        if (fecemision.toString().length === 10) {
            fecemision = new Date(
                this.serviceUtilitario.formatFecha(fecemision)
            );
        }
       // this.maximaFechaDesde = event;
    }
 
    obtenerSubTareas() {
        this.mensajeSpinner = 'Cargando...';
        this.setSpinner(true);
        const $agregarSubTarea = this.listatareasService
            .listarSubTareas(this.param.idtarea_origen)
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('obtenerSubTareas...', rpta);
                    this.lstSubTareas = rpta.subtareas;                    
                    
                },
                error: (err) => {
                    this.setSpinner(false);
                    this.serviceSharedApp.messageToast();
                },
                complete: () => {
                },
            });
        this.$listSubcription.push($agregarSubTarea);
    }

    listarEtapas() {
        const $listarEtapas = this.listatareasService.obtenerEtapas().subscribe({
        next: (rpta: any) => {
            this.lstEtapas.set(rpta);
        },
        error: (err) => {
            console.info('error : ', err);
            this.serviceSharedApp.messageToast()
        },
        complete: () => {
        },
        });
        this.$listSubcription.push($listarEtapas);
    }

    guardarEtapa() {
      this.submitted = true;
      if (this.registerFormEtapa.invalid) {
          this.serviceSharedApp.messageToast({ severity: 'info', summary: 'Validación...', detail: "Ingresar Descripción..." });
          return;
      }
      if(this.submitted)
      {
          const objeto = {
              idetapa: 0,
              nometapa: this.registerFormEtapa.value.nometapa
            }
            const $prcEtapas = this.listatareasService.prcEtapa(objeto).subscribe({
              next: (rpta: any) => {
                this.listarEtapas();
              },
              error: (err) => {
                console.info('error : ', err);
                this.serviceSharedApp.messageToast()
              },
              complete: () => {
              },
            });
            this.$listSubcription.push($prcEtapas);

          this.etapaVisible=false;
      }
  }

  NuevaEtapa()  {
    this.submitted = false;
    this.headerTitle= 'Nueva Etapa' ;
    this.etapaVisible = true;
  }

  seleccionarEtapa(dato: Event){
    console.log('seleccionarEtapa', dato);
    let etapa = this.lstEtapas().filter((e: any) => e.idetapa === dato)[0].nometapa
    this.registerFormRegistro.get('descripcion')?.setValue(etapa);
  }
}
