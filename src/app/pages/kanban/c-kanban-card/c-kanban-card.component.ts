import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
//import { KanbanCard } from 'src/app/demo/api/kanban';
import { KanbanService } from '../service/kanban.service';
import { Subscription } from 'rxjs';
import { KanbanCard } from '../../model/interfaces';
import { mensajesQuestion } from '../../model/constantes';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { UtilitariosService } from '../../service/utilitarios.service';

@Component({
    selector: 'c-kanban-card',
    templateUrl: './c-kanban-card.component.html',
    styleUrls: ['./c-kanban-card.component.scss'],
    imports: [PRIMENG_MODULES],
        standalone: true,
        providers: [MessageService, UtilitariosService, ConfirmationService]
})
export class CKanbanCardComponent implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];

    @Input() card!: KanbanCard;

    @Input() listId!: string;

    menuItems: MenuItem[] = [];

    subscription: Subscription;
    //@Output() actualizarKanbanList = new EventEmitter<string>();

    constructor(private kanbanService: KanbanService,private messageService: MessageService,
        private confirmationService: ConfirmationService) {
        this.subscription = this.kanbanService.lists$.subscribe((data) => {
            let subMenu = data.map((d) => ({
                id: d.listId,
                label: d.title,
                //command: () => this.onMove(d.listId),
            }));
            this.generateMenu(subMenu);
        });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.$listSubcription != null) {
            this.$listSubcription.forEach((sub) => {
                sub.unsubscribe();
            });
        }
    }

    parseDate(fechacierre: string) {
        //console.log(fechacierre);
        let mes = fechacierre.substring(3,5);
        let dia = fechacierre.substring(0,2);
        let anio = fechacierre.substring(6,10);

        let fecha = mes+'/'+dia+'/'+anio;
        //console.log(fecha);
        return new Date(fecha)
            .toDateString()
            .split(' ')
            .slice(1, 3)
            .join(' ');
    }

    eliminarCard() {
        this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            //target: event.target || new EventTarget,
            message: '¿Estás seguro de Eliminar la Oportunidad '+ '<b>'+this.card.title +'</b>'+ '?',
            //icon: 'pi pi-exclamation-triangle text-6xl',
            accept: () => {
                this.onDelete();
            }
        });
    }

    onDelete() {

        const $updateCard = this.kanbanService.deleteCard(this.card.id, this.listId)
            .subscribe({
                next: (rpta:any) => {
                   console.log("rpta delete------Card : ", rpta.resultProceso);
                   if (rpta.resultProceso == "0"){
                    console.log("resultProceso------Card : ", rpta.resultProceso);
                    this.kanbanService.deleteCardLista(this.card.id, this.listId);
                    //this.actualizarKanbanList.emit();
                   }
                },
                error:(err)=>{
                    console.error('error : ',err)
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensajesQuestion.msgErrorGenerico
                    })
                },
                complete:() => {
                    console.log("rpta delete-----Card complete ");
                 }
            });
    }

    onCopy() {
        console.log('Copiar Oportunidad...', this.card.id, this.listId);
        this.kanbanService.copyCard(this.card, this.listId);
    }

    onMove(listId: string) {
        console.log('Mover Oportunidad...', this.card, listId, this.listId);
        this.kanbanService.moveCard(this.card, listId, this.listId);
    }

    generateMenu(subMenu: any) {
        this.menuItems = [
            { label: 'Copiar Oportunidad', command: () => this.onCopy() },
            //{ label: 'Mover Oportunidad', items: subMenu },
            { label: 'Eliminar Oportunidad', command: () => this.eliminarCard() },
        ];
    }

    generateTaskInfo() {
        let total = this.card.taskList.tasks.length;
        let completed = this.card.taskList.tasks.filter(
            (t) => t.completed
        ).length;
        return `${completed} / ${total}`;
    }
}
