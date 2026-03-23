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
    frmAccion!: FormGroup;
    //disabled = signal<boolean>(true);

    //   blockedDocument: boolean = false;
    //   mensajeSpinner: string = "Cargando...";
    private readonly destroyRef = inject(DestroyRef);
    errorMensaje: string = '';

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
        this.createFrm();
        this.cargarPlanAccion();
    }

    createFrm() {
        this.frmAccion = this.fb.group({
            nomoportunidad: [{ value: null, disabled: true }],
            fecplan_ant: [{ value: null, disabled: true }],
            desplan_ant: [{ value: null, disabled: true }],
            idprioridad_ant: [{ value: null, disabled: true }],
            fecplan: [{ value: this.utilitariosService.obtenerFechaActual(), disabled: false }, [Validators.required]],
            desplan: [{ value: null, disabled: false }, [Validators.required]],
            idprioridad: [{ value: null, disabled: false }, [Validators.required]],
            fecplan_ant2: [{ value: null, disabled: false }]
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
            idoportunidad: this.data.id
        };
        const $OportunidadesLista = this.leadService
            .OportunidadesPlanAccion(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    console.log('cargarPlanAccion...', rpta);
                    const maxItem = rpta.reduce((prev: any, current: any) => (current.idplan > prev.idplan ? current : prev));

                    console.log('maxItem...',maxItem);
                    this.frmAccion.patchValue({
                        nomoportunidad: this.data.title,
                        fecplan_ant: maxItem.fecha,
                        fecplan_ant2: maxItem.fecha,
                        desplan_ant: maxItem.desplan,
                        idprioridad_ant: maxItem.idprioridad
                    });
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

    prcPlanAccion() {
        this.data = this.config.data;

        if (this.validarDatos())
        {
            console.log("errorMensaje : ", this.errorMensaje);
            this.messageService.add({severity: 'info', summary: 'Validación', detail: this.errorMensaje });
            return;
        }
        
        const objeto = {
            idoportunidad: this.data.id,
            idplan: 0,
            fecplan: this.frmAccion.get('fecplan')?.value,
            desplan: this.frmAccion.get('desplan')?.value,
            idprioridad: this.frmAccion.get('idprioridad')?.value,
            idusuario: 12
        };

        const $OportunidadesLista = this.leadService
            .prcPlanAccion(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    console.log('cargarPlanAccion...', rpta);
                    if (rpta.resultProceso === '0') {
                        this.messageService.add({
                            severity: 'info',   
                            summary: 'Información',
                            detail: rpta.message
                        });
                        this.cerrar(objeto);
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

    cerrar(data:any) {
        this.ref.close({data});
    }

    validarDatos():boolean{
        let _error = false;
        this.errorMensaje="";
        console.log('this.frmAccion...', this.frmAccion.value);
        //console.log('this.fecplan_ant2...',new Date(this.utilitariosService.formatFecha(this.frmAccion.get('fecplan_ant2')?.value)));
        console.log('this.frmAccion...', this.frmAccion.get('fecplan')?.value);

        if (this.frmAccion.get('fecplan_ant2')?.value != null )
        {
           let fecplan_ant2 = new Date(this.utilitariosService.formatFecha(this.frmAccion.get('fecplan_ant2')?.value));

           if (this.frmAccion.get('fecplan')?.value <= fecplan_ant2)
           {
                this.errorMensaje="La Fecha de Planificación debe ser mayor a la Fecha Anterior...!";
                _error = true;
           }
        }
                
        

           if (!_error && (this.frmAccion.get('idprioridad')?.value === 0 || this.frmAccion.get('idprioridad')?.value === null))
            {
                this.errorMensaje="Seleccionar Prioridad...!";
                _error = true;
            }

           if (!_error && (this.frmAccion.get('desplan')?.value === null || this.frmAccion.get('desplan')?.value === ""))
            {
                this.errorMensaje="Ingresar Descripción de Planificación...";
                _error = true;
            }

           return _error;
         }
}
