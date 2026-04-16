import { Component, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { KanbanService } from './service/kanban.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KanbanList } from '../model/interfaces';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../model/constantes';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { CKanbanListComponent } from './c-kanban-list/c-kanban-list.component';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedAppService } from '../shared/sharedApp.service';
import { CLeadReg } from '../lead/lead-reg/lead-reg';

@Component({
    selector: 'app-c-kanban',
    templateUrl: './c-kanban.component.html',
    styleUrls: ['./c-kanban.component.scss'],
    imports: [PRIMENG_MODULES, CKanbanListComponent, CProgressSpinnerComponent, CLeadReg],
    standalone: true,
    providers: [MessageService, UtilitariosService, KanbanService, ConfirmationService, DialogService, SharedAppService]
})
export class CKanbanAppComponent implements OnInit {
    $listSubcription: Subscription[] = [];
    sidebarVisible = signal<boolean>(false);
    lists: KanbanList[] = [];
    listIds: string[] = [];
    style!: HTMLStyleElement;
    isMobileDevice: boolean = false;
    visOportunidad: boolean = true;
    visMntOportunidad: boolean = false;
    frmDatos!: FormGroup;
    dataOportunidad: any;

    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = '';
    lstProveedores: any[] = [];
    lstQ = [
        { id: 0, desQ: 'TODOS' },
        { id: 1, desQ: 'Q1' },
        { id: 2, desQ: 'Q2' },
        { id: 3, desQ: 'Q3' },
        { id: 4, desQ: 'Q4' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private kanbanService: KanbanService,
        private utilitariosService: UtilitariosService,
        private confirmationService: ConfirmationService,
        public dialogService: DialogService,
        public sharedAppService: SharedAppService
    ) {
    }

    getOportunidadKanban(_dato: any) {
        this.visOportunidad = true;
        this.visMntOportunidad = false;
        this.getKanbanList();
    }

    verOportunidadMnt(dato: any) {
        this.visOportunidad = false;
        this.visMntOportunidad = true;
        this.dataOportunidad = { id: dato.id, paramReg: 'k' };
    }

    actualizarKanban() {
        this.getKanbanList();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit() {
        this.createFrm();
        this.listaProveedor();
        this.getKanbanList();
    }

    createFrm() {
        this.frmDatos = this.fb.group({
            annio: [{ value: this.utilitariosService.obtenerFechaInicioMes(), disabled: false }],
            q: [{ value: 0, disabled: false }],
            idusuario: [{ value: constantesLocalStorage.idusuario, disabled: false }],
            idproveedor: [{ value: 0, disabled: false }]
        });
    }

    dropList(event: CdkDragDrop<any[]>) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    removeLayoutResponsive() {
        this.style = document.createElement('style');
        this.style.innerHTML = `
                .layout-content {
                    width: 100%;
                }

                .layout-topbar {
                    width: 100%;
                }
            `;
        document.head.appendChild(this.style);
    }

    getKanbanList() {
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;
        const objeto = {
            ...this.frmDatos.value,
            annio: this.frmDatos.value.annio.getFullYear()
        };
        const $kanbanList = this.kanbanService.kanbanList(objeto).subscribe({
            next: (rpta: any) => {
                console.log('getKanbanList...', rpta.listas);
                this.setSpinner(false);
                this.lists = rpta.listas;
                this.listIds = this.lists.map((l) => l.listId || '');
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
                this.setSpinner(false);
            }
        });
        this.$listSubcription.push($kanbanList);
    }

    listaProveedor() {
        let tiporol = 'CLI';
        this.kanbanService.obtenerClientes(tiporol).subscribe({
            next: (rpta: any) => {
                this.lstProveedores = rpta;
                const objeto = {
                    idcliente: 0,
                    nomcomercial: 'TODOS'
                };
                this.lstProveedores.unshift(objeto);
            },
            error: (err) => {
                console.error('error : ', err);
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
}
