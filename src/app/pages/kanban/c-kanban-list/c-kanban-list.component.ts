import { Component, OnInit, Input, ElementRef, ViewChild, EventEmitter, Output, OnDestroy, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CKanbanAppComponent } from '../c-kanban.component';
import { KanbanService } from '../service/kanban.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanList, KanbanCard } from '../../model/interfaces';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../service/WebSocketService.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { constantesLocalStorage, mensajesSpinner } from '../../model/constantes';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';
import { CKanbanCardComponent } from '../c-kanban-card/c-kanban-card.component';

@Component({
    selector: 'c-kanban-list',
    templateUrl: './c-kanban-list.component.html',
    styleUrls: ['./c-kanban-list.component.scss'],
    imports: [PRIMENG_MODULES, CKanbanCardComponent, CProgressSpinnerComponent],
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService]
})
export class CKanbanListComponent implements OnInit, OnDestroy {

    $listSubcription: Subscription[] = [];

    @Output() actualizarKanban = new EventEmitter<string>();
    @Output() verOportunidadMnt = new EventEmitter<any>();

    @Input() list!: KanbanList;
    @Input() listIds!: string[];
    isMobileDevice = signal<boolean>(false);
    @ViewChild('listEl') listEl!: ElementRef;
    blockedDocumentk = signal<boolean>(false);
    mensajeSpinner: string = "";
    card: KanbanCard = { id: "0", idlista: 1, title: "", idcliente: 0, description: '', monto: 0, tipocambio: 0, progress: 0, assignees: [], attachments: 0, comments: [], contactos: [], regoportunidadesext: [], preventas: [], startDate: '', dueDate: '', fecampliacion: '', completed: false, codigoproyecto: '', taskList: { title: 'Untitled Task List', tasks: [] } };

    constructor(
        public parent: CKanbanAppComponent,
        private kanbanService: KanbanService,
        private messageService: MessageService,
        private oportunidadService: OportunidadService,
        private serviceSharedApp: SharedAppService,
        private wsService: WebSocketService
    ) {}

    ngOnInit(): void {
        this.wsService.connect();
        this.isMobileDevice.set(this.kanbanService.isMobileDevice());
    }

    setSpinner(valor: boolean) {
        this.blockedDocumentk.set(valor);
    }

    onCardClick(_event: Event, card: KanbanCard) {
        this.verOportunidadMnt.emit(card);
    }

    insertCard() {
        const card = {
            idlista: this.list.listId,
            id: '0'
        };
        this.verOportunidadMnt.emit(card);
    }

    dropCard(event: CdkDragDrop<KanbanCard[]>): void {
        if (event.previousContainer.id === event.container.id) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            let lstData = event.container.data;
            for (let i = 0; i < lstData.length; i++) {
                if (i === event.currentIndex) {
                    this.setSpinner(true);
                    this.mensajeSpinner = mensajesSpinner.msjProcesando;

                    const objeto = {
                        idusuario: constantesLocalStorage.idusuario,
                        idlistadestino: event.container.id,
                        idoportunidad: lstData[i].id
                    };

                    console.log('procesarTrxKanban...', event.container);

                    const $procesarTrxKanban = this.oportunidadService.procesarTrxKanban(objeto).subscribe({
                        next: (rpta: any) => {
                            this.setSpinner(false);
                            if (rpta.procesoSwitch === 0) {
                                if (event.container.id === '2') {
                                    let msg = '100#' + lstData[i].idpreventa + '#' + lstData[i].id;
                                    this.wsService.sendMessage(msg);
                                }
                            }
                            this.actualizarKanban.emit();
                            this.serviceSharedApp.messageToast({
                                severity: rpta.procesoSwitch == "0" ? 'success' : 'warn',
                                summary: rpta.procesoSwitch == "0" ? 'Exito' : 'Warning',
                                detail: rpta.mensaje
                            });
                        },
                        error: (err) => {
                            console.error('error : ', err);
                            this.serviceSharedApp.messageToast();
                        },
                        complete: () => {}
                    });
                    this.$listSubcription.push($procesarTrxKanban);
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }
}
