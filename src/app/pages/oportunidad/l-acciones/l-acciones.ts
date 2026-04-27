import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { ShareService } from '../../service/serviceShare.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { constantesLocalStorage } from '../../model/constantes';
import { OportunidadService } from '../oportunidad.service';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';

@Component({
    selector: 'app-l-acciones',
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    templateUrl: './l-acciones.html',
    standalone: true,
    providers: [MessageService, OportunidadService, ShareService, ConfirmationService, SharedAppService]
})
export class lAcciones implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
    data: any;
    listaAcciones= signal<any[]>([]);
    blockedDocument = signal(false);
    mensajeSpinner: string = 'Cargando...!';

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService,
        private oportunidadService: OportunidadService
    ) {}

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit(): void {
        console.log('this.config...', this.config.data);
        this.getBuscar();
    }
    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    getBuscar() {
        this.setSpinner(true);
        const objeto = {
            idoportunidad: this.config.data.id,
            idusuario: constantesLocalStorage.idusuario
        };

        const $listaAcciones = this.oportunidadService
            .listaTareas12(objeto)
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('rpta listaTareas12', rpta);
                    this.listaAcciones.set(rpta);
                },
                error: (err) => {
                    this.setSpinner(false);
                    console.error('error : ', err);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err
                    });
                },
                complete: () => {}
            });
        this.$listSubcription.push($listaAcciones);
    }
    
    getSeverity(nomestado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (nomestado) {
            case 'COMPLETADO': return 'success';
            case 'HOY': return 'warn';
            case 'PENDIENTE': return 'info';
            case 'VENCIDO': return 'danger';
            default: return 'info';
        }
    }
}
