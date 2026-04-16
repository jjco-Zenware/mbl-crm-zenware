import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { mensajesQuestion, mensajesSpinner } from '../../model/constantes';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';
@Component({
    selector: 'app-c-modalagenda',
    templateUrl: './c-modalagenda.component.html',
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent]
})
export class CModalAgendaComponent implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
    param: any;
    registerFormRegistro!: FormGroup;
    headerTitle?: string;
    submitted?: boolean;
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal(false);

    constructor(
        public refDatoItem: DynamicDialogRef,
        public config: DynamicDialogConfig,
        public dialogService: DialogService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private oportunidadService: OportunidadService
    ) {}

    ngOnInit(): void {
        console.log('ngOnInit...', this.config.data);
        this.createForm();
        this.traerUno();
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    createForm() {
        //Agregar validaciones de formulario
        this.registerFormRegistro = this.formBuilder.group({
            cliente: [{ value: null, disabled: false }],
            oportunidad: [{ value: null, disabled: false }],
            fechaini: [{ value: null, disabled: false }],
            fin: [{ value: null, disabled: false }],
            nomusuario: [{ value: null, disabled: false }],
            desplan: [{ value: null, disabled: false }],
            horaini: [{ value: null, disabled: false }],
            horafin: [{ value: null, disabled: false }]
        });
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    traerUno() {
      this.setSpinner(true);

        const objeto = {
            idtarea: this.config.data[0].description
        };

        const $listaTareas = this.oportunidadService.TraerUnoAcciones(objeto).subscribe({
            next: (rpta: any) => {
              this.setSpinner(false);
                console.log('rpta listaAgenda', rpta[0]);
                this.registerFormRegistro.patchValue(rpta[0]);
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
              
            }
        });
        this.$listSubcription.push($listaTareas);
    }
}
