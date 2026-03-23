import { Component, DestroyRef, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { ShareService } from '../../service/serviceShare.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { LeadService } from '../../lead/lead.services';

@Component({
    selector: 'app-m-proceso',
    imports: [PRIMENG_MODULES],
    templateUrl: './m-proceso.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ShareService, ConfirmationService, SharedAppService]
})
export class mProceso implements OnInit {
    $listSubcription: Subscription[] = [];
    data: any;
    lstContactosDeci= signal<any[]>([]);


    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private leadService: LeadService,
        private messageService: MessageService,
    ) {}

  

    ngOnInit(): void {
        console.log('this.config...', this.config.data);
        this.lstContactosDeci.set(this.config.data);
    }


    // cargarPlanAccion() {
    //     this.data = this.config.data;
        
    //     const objeto = {
    //         idoportunidad: this.data.id
    //     };
    //     const $OportunidadesLista = this.leadService
    //         .OportunidadesPlanAccion(objeto)
    //         .pipe(takeUntilDestroyed(this.destroyRef))
    //         .subscribe({
    //             next: (rpta: any) => {
    //                 console.log('cargarPlanAccion...', rpta);
    //                 const maxItem = rpta.reduce((prev: any, current: any) => (current.idplan > prev.idplan ? current : prev));

    //                 console.log('maxItem...',maxItem);
    //                 this.frmAccion.patchValue({
    //                     nomoportunidad: this.data.title,
    //                     fecplan_ant: maxItem.fecha,
    //                     fecplan_ant2: maxItem.fecha,
    //                     desplan_ant: maxItem.desplan,
    //                     idprioridad_ant: maxItem.idprioridad
    //                 });
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

}
