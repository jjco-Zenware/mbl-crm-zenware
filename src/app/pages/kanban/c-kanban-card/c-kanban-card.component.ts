import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
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

    constructor(
        private kanbanService: KanbanService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.subscription = this.kanbanService.lists$.subscribe(() => {
            this.generateMenu();
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
        let mes = fechacierre.substring(3, 5);
        let dia = fechacierre.substring(0, 2);
        let anio = fechacierre.substring(6, 10);
        let fecha = mes + '/' + dia + '/' + anio;
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
            message: '¿Estás seguro de Eliminar la Oportunidad ' + '<b>' + this.card.title + '</b>' + '?',
            accept: () => {
                this.onDelete();
            }
        });
    }

    onDelete() {
        const $updateCard = this.kanbanService.deleteCard(this.card.id, this.listId)
            .subscribe({
                next: (rpta: any) => {
                    if (rpta.resultProceso == "0") {
                        this.kanbanService.deleteCardLista(this.card.id, this.listId);
                    }
                },
                error: (err) => {
                    console.error('error : ', err);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensajesQuestion.msgErrorGenerico
                    });
                }
            });
    }

    onCopy() {
        this.kanbanService.copyCard(this.card, this.listId);
    }

    generateMenu() {
        this.menuItems = [
            { label: 'Copiar Oportunidad', command: () => this.onCopy() },
            { label: 'Eliminar Oportunidad', command: () => this.eliminarCard() },
        ];
    }

    generateTaskInfo() {
        let total = this.card.taskList.tasks.length;
        let completed = this.card.taskList.tasks.filter((t) => t.completed).length;
        return `${completed} / ${total}`;
    }
}
