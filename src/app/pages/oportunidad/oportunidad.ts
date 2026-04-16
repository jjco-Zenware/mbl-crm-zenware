import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OportunidadService } from './oportunidad.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { constantesLocalStorage } from '../model/constantes';
import { UtilitariosService } from '../service/utilitarios.service';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mAccion } from './m-acciones/m-accion';
import { DialogService } from 'primeng/dynamicdialog';
import { CLeadReg } from '../lead/lead-reg/lead-reg';

@Component({
    selector: 'app-oportunidad',
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent, CLeadReg],
    templateUrl: './oportunidad.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, DialogService, ConfirmationService]
})
export class Oportunidad {
    private readonly destroyRef = inject(DestroyRef);

    lstOportunidades = signal<any[]>([]);
    opor_total: number = 0;
    opor_pendiente: number = 0;
    frmDatos!: FormGroup;
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal(false);
    visMntOportunidad: boolean = false;
    dataOportunidad: any;
    visOportunidad: boolean = true;

    constructor(
        private oportunidadService: OportunidadService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.createFrm();
        this.cargarOportunidades();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    createFrm() {
        this.frmDatos = this.fb.group({
            fechaini: [{ value: this.utilitariosService.obtenerFechaInicioMes(), disabled: false }],
            fechafin: [{ value: this.utilitariosService.obtenerFechaFinMes(), disabled: false }]
        });
    }

    cargarOportunidades() {
        this.lstOportunidades.set([]);
        this.opor_pendiente = 0;
        this.opor_total = 0;
        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            fechaini: this.frmDatos.value.fechaini,
            fechafin: this.frmDatos.value.fechafin
        };
        this.setSpinner(true);
        this.oportunidadService
            .listaOportunidadAccion(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    if (rpta !== null) {
                        const hoy = new Date();
                        const filtrado = rpta.filter((item: { fecplan: string }) => {
                            const fechaItem = new Date(this.utilitariosService.formatFecha(item.fecplan));
                            return fechaItem.getDate() === hoy.getDate();
                        });
                        this.opor_pendiente = filtrado.length;
                        this.opor_total = rpta.length;
                        this.lstOportunidades.set(filtrado);
                    }
                },
                error: (err) => {
                    this.setSpinner(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error...',
                        detail: err
                    });
                },
                complete: () => {}
            });
    }

    onAccion(data: any) {
        const ref = this.dialogService.open(mAccion, {
            data: data,
            header: 'Configurar Acción',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '35%'
        });

        if (ref) {
            ref.onClose.subscribe(() => {
                this.cargarOportunidades();
            });
        }
    }

    verOportunidadMnt(dato: any) {
        this.visOportunidad = false;
        this.visMntOportunidad = true;
        this.dataOportunidad = { id: dato.id, paramReg: 'k' };
    }

    getOportunidadKanban(dato: any) {
        this.visOportunidad = true;
        this.visMntOportunidad = false;
        this.cargarOportunidades();
    }
}
