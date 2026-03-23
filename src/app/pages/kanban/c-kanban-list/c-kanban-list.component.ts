import { Component, OnInit, Input, ElementRef, ViewChild, EventEmitter, Output, OnDestroy, signal } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CKanbanAppComponent } from '../c-kanban.component';
import { KanbanService } from '../service/kanban.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanList, KanbanCard } from '../../model/interfaces';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../service/WebSocketService.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { OportunidadService } from '../../oportunidad/oportunidad.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../../model/constantes';
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
export class CKanbanListComponent implements OnInit, OnDestroy{

    $listSubcription: Subscription[] = [];

    @Output() actualizarKanban = new EventEmitter<string>();
    @Output() verOportunidadMnt = new EventEmitter<any>();

    @Input() list!: KanbanList;
    @Input() listIds!: string[];
    menuItems: MenuItem[] = [];
    title: string = '';
    timeout: any = null;
    isMobileDevice = signal<boolean>(false);
    @ViewChild('inputEl') inputEl!: ElementRef;
    @ViewChild('listEl') listEl!: ElementRef;
    selectedKanbanCards: KanbanCard[] = [];
    blockedDocumentk = signal<boolean>(false);
    mensajeSpinner: string = "";
    card : KanbanCard  = {id: "0", idlista:1,  title: "", idcliente: 0, description: '', monto: 0, tipocambio: 0,progress: 0, assignees: [], attachments: 0, comments: [], contactos:[], regoportunidadesext:[], preventas:[], startDate: '', dueDate: '', fecampliacion: '', completed: false , codigoproyecto: '', taskList: {title:'Untitled Task List', tasks: []}};
    lists: KanbanList[] = [];

    

    constructor(public parent: CKanbanAppComponent,
        private kanbanService: KanbanService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private oportunidadService: OportunidadService,
        private serviceSharedApp: SharedAppService,
        private wsService: WebSocketService
        ) {
           
        }

    ngOnInit(): void {
        //this.setSpinner(false);
        this.wsService.connect();
        this.isMobileDevice.set(this.kanbanService.isMobileDevice());
    }

    setSpinner(valor: boolean) {
    this.blockedDocumentk.set(valor)
    }
    onCardClick(event: Event, card: KanbanCard) {
        this.verOportunidadMnt.emit(card);
    }

    // onCardClick(event: Event, card: KanbanCard) {
    //     this.setSpinner(true);
    //     console.log('onCardClick...', card);
    //     const eventTarget = event.target as HTMLElement;
    //     if (!(eventTarget.classList.contains('p-button-icon') || eventTarget.classList.contains('p-trigger'))) {
    //         if (card.id == "0") {
    //             if (this.list.listId) {
    //                 this.kanbanService.onCardSelect(card, this.list.listId);
    //             }
    //             this.parent.sidebarVisible.set(true);
    //         }else{
    //             if (this.list.listId) {
    //                 this.mensajeSpinner = mensajesSpinner.msjRecuperaRegistro
    //                 let idoportunidad = card.id;
    //                 this.kanbanService.onCardSeleccionar(idoportunidad, this.list.listId).subscribe({
    //                     next: (rpta: any) => {
    //                     this.parent.sidebarVisible.set(true);
    //                     this.setSpinner(false);
    //                     },
    //                         error: (err) => {
    //                         console.info('error : ', err);
    //                         this.messageService.clear();
    //                         this.messageService.add({
    //                             severity: 'error',
    //                             summary: 'Error',
    //                             detail: mensajesQuestion.msgErrorGenerico,
    //                         });
    //                     },
    //                         complete: () => {
    //                     },
    //                 });
    //             }
    //         }

    //     }
    // }

    insertCard() {
        // if (this.list.listId) {
        //     //console.log('Insertar...', this.list);
         //    this.kanbanService.addCard(this.list.listId);
        //     this.parent.sidebarVisible.set(true);
        // }
        const card = {
            idlista : this.list.listId ,
            id: '0'
        }
        this.verOportunidadMnt.emit(card);
    }

    dropCard(event: CdkDragDrop<KanbanCard[]>): void {   
            console.log('dropCard', event.container); 
            console.log('event', event);

        

        if (event.previousContainer.id === event.container.id) {
            console.log('entro');
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);            
            let lstData = event.container.data;
            console.log('lstData', lstData);
            for (let i = 0; i < lstData.length; i++) {
                
                if (i === event.currentIndex) {

                    this.setSpinner(true);
                    this.mensajeSpinner = mensajesSpinner.msjProcesando;

                    const objeto = {
                        idusuario: constantesLocalStorage.idusuario,
                        idlistadestino: event.container.id,
                        idoportunidad: lstData[i].id
                    }

                    const $procesarTrxKanban = this.oportunidadService.procesarTrxKanban(objeto).subscribe({
                        next: (rpta: any) => {
                            console.log('procesarTrxKanban', rpta);
                                this.setSpinner(false);
                            if (rpta.procesoSwitch === 0) {
                               if (event.container.id === '2') {                        
                                    let msg = '100#' + lstData[i].idpreventa +'#' + lstData[i].id ;
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
                        complete: () => { 
                            
                        },
                    });
                    this.$listSubcription.push($procesarTrxKanban)
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
