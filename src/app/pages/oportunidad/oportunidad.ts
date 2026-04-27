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
import { lAcciones } from './l-acciones/l-acciones';

@Component({
    selector: 'app-oportunidad',
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent, CLeadReg],
    templateUrl: './oportunidad.html',
    styleUrls: ['./oportunidad.scss'],
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

                    console.log('cargarOportunidades...', rpta);

                    this.setSpinner(false);
                    if (rpta !== null) {
                        const hoy = new Date();
                        const filtrado = rpta.filter((item: { fecplan: string }) => {
                            const fechaItem = new Date(this.utilitariosService.formatFecha(item.fecplan));
                            return fechaItem.getDate() === hoy.getDate();
                        });
                        this.opor_pendiente = filtrado.length;
                        this.opor_total = rpta.length;
                        const sorted = [...rpta].sort((a: any, b: any) => {
                            const aHoy = this.isHoy(a.fecplan) ? 0 : 1;
                            const bHoy = this.isHoy(b.fecplan) ? 0 : 1;
                            return aHoy - bHoy;
                        });
                        this.lstOportunidades.set(sorted);
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

    onAccion(data: any, tipo: number) {
        console.log('data...', data);
        data.tipopro = tipo;
        if (tipo === 1) {
            data.idtarea = 0
        }

        console.log('onAccion...', data.idtarea);

        const ref = this.dialogService.open(mAccion, {
            data: data,
            header: tipo === 1 ? 'Gestionar Acción' : 'Culminar Acción',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '35%'
        });

        if (ref) {
            ref.onClose.subscribe((rpta: any) => {
                this.cargarOportunidades();
                console.log('onClose', rpta);
                // if (rpta != undefined) {
                //     ref.onClose.subscribe(() => {
                //         this.cargarOportunidades();
                //     });
                // }
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

    isHoy(fecplan: string): boolean {
        if (!fecplan) return false;
        const hoy = new Date();
        const fecha = new Date(this.utilitariosService.formatFecha(fecplan));
        return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
    }

    verAcciones(dato: any) {
        console.log('verAcciones', dato);
        const ref = this.dialogService.open(lAcciones, {
            data: dato,
            header: dato.title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '25%'
        });

        if (ref) {
            ref.onClose.subscribe(() => {
                //this.cargarOportunidades();
            });
        }
    }

    //  onNuevo() {
        
    // }
}
