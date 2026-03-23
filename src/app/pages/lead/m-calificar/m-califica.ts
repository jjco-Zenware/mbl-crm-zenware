import { Component, computed, signal } from '@angular/core';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ShareService } from '../../service/serviceShare.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LeadService } from '../lead.services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-c-calificacion',
    templateUrl: './m-califica.html',
    imports: [PRIMENG_MODULES],
    standalone: true,
    providers: [MessageService, ShareService, ConfirmationService, SharedAppService]
})
export class CalificacionOport {

    $listSubcription: Subscription[] = [];    
    lstCalificacion = signal<any[]>([]);
    estaCalificada = signal<boolean>(false);
    score  = signal<number>(0);
    
    verProblema = signal<boolean>(false);
    verPersona = signal<boolean>(false);
    verProyecto = signal<boolean>(false);
    verPresupuesto = signal<boolean>(false);
    verPrioridad = signal<boolean>(false);
    verPlazo = signal<boolean>(false);
    verProceso = signal<boolean>(false);
    verCompetencia = signal<boolean>(false);

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private leadService: LeadService,
        private messageService: MessageService,
    ) {}

  

    ngOnInit(): void {
        console.log('this.config...', this.config.data);
        this.mostrarCalificacion();
    }

    mostrarCalificacion() {
        this.lstCalificacion.set([]);
        const $OportunidadesLista = this.leadService
            .calificaroport(this.config.data)
            .subscribe({
                next: (rpta: any) => {
                    console.log('lstSectorInd...', rpta);
                    console.log('lstSectorInd...', rpta[0]);
                    console.log('lstSectorInd...', rpta[0].faltantes);
                    this.lstCalificacion.set(rpta);

                    this.score.set(rpta[0].score);
                    this.verProblema.set(rpta[0].problema);
                    this.verPersona.set(rpta[0].persona);
                    this.verProyecto.set(rpta[0].proyecto);
                    this.verPresupuesto.set(rpta[0].presupuesto);
                    this.verPrioridad.set(rpta[0].prioridad);
                    this.verPlazo.set(rpta[0].plazo);
                    this.verProceso.set(rpta[0].proceso);
                    this.verCompetencia.set(rpta[0].competencia);
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
    
}
