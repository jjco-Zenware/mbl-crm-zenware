import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { KanbanCard, KanbanList } from '../../model/interfaces';
import { constantesApiWeb } from '../../model/apiVariables';
import { constantesLocalStorage } from '../../model/constantes';

@Injectable()
export class KanbanService {

    private _lists: KanbanList[] = [];
    private lists = new BehaviorSubject<KanbanList[]>(this._lists);
    private listNames = new Subject<any[]>();
    lists$ = this.lists.asObservable();
    private selectedCard = new Subject<KanbanCard>();
    private selectedListId = new Subject<string>();
    selectedCard$ = this.selectedCard.asObservable();
    selectedListId$ = this.selectedListId.asObservable();
    listNames$ = this.listNames.asObservable();

    constructor(private http: HttpClient) {}

    isMobileDevice() {
        return (/iPad|iPhone|iPod/.test(navigator.userAgent)) || (/(android)/i.test(navigator.userAgent));
    }

    private updateLists(data: any[]) {
        this._lists = data;
        let small = data.map(l => ({ listId: l.listId, title: l.title, cards: l.cards }));
        this.listNames.next(small);
        this.lists.next(data);
    }

    kanbanList(objeto: any) {
        const url = `${constantesApiWeb.kanbanList}`;
        return this.http
            .post<KanbanList>(url, objeto)
            .pipe(
                tap((data: any) => {
                    this.updateLists(data.listas);
                }),
            );
    }

    addCard(listId: string) {
        const cardId = "0";
        const newCard = { id: cardId, idlista: 1, idcliente: 0, description: '', monto: 0, tipocambio: 0, progress: 0, assignees: [], attachments: 0, comments: [], contactos: [], regoportunidadesext: [], preventas: [], startDate: '', dueDate: '', fecampliacion: '', codigoproyecto: '', completed: false, taskList: { title: 'Untitled Task List', tasks: [] } };
        this.onCardSelect(newCard, listId);
    }

    prcCard(objeto: any, listId: string) {
        let objectParam = {
            oportunidad: objeto,
            idusuario: constantesLocalStorage.idusuario,
            idlista: listId
        };
        const url = `${constantesApiWeb.kanbanCard}`;
        return this.http.post<any>(url, objectParam);
    }

    updateCardLista(idoportunidad: string, listId: string) {
        const objectParam = {
            idoportunidad: idoportunidad,
            idusuario: constantesLocalStorage.idusuario,
            idlista: listId
        };
        const url = `${constantesApiWeb.kanbanCardLista}`;
        return this.http.post<any>(url, objectParam);
    }

    deleteList(id: string) {
        this._lists = this._lists.filter(l => l.listId !== id);
        this.lists.next(this._lists);
    }

    deleteCard(cardId: string, listId: string) {
        let objectParam = {
            idoportunidad: cardId,
            idlista: listId,
            idusuario: constantesLocalStorage.idusuario
        };
        const url = `${constantesApiWeb.kanbanCardDelete}`;
        return this.http.post<any>(url, objectParam);
    }

    deleteCardLista(cardId: string, listId: string) {
        let lists = [];
        for (let i = 0; i < this._lists.length; i++) {
            let list = this._lists[i];
            if (list.listId === listId && list.cards) {
                list.cards = list.cards.filter(c => c.id !== cardId);
            }
            lists.push(list);
        }
        this.updateLists(lists);
    }

    copyCard(card: KanbanCard, listId: string) {
        let lists = [];
        for (let i = 0; i < this._lists.length; i++) {
            let list = this._lists[i];
            if (list.listId === listId && list.cards) {
                let cardIndex = list.cards.indexOf(card) + 1;
                let newId = '0';
                let newCard = { ...card, id: newId, title: 'Copia de Oportunidad' };
                list.cards.splice(cardIndex, 0, newCard);
            }
            lists.push(list);
        }
        this.updateLists(lists);
    }

    moveCard(card: KanbanCard, targetListId: string, sourceListId: string) {
        if (card.id) {
            this.deleteCard(card.id, sourceListId);
            let lists = this._lists.map(l => l.listId === targetListId ? ({ ...l, cards: [...l.cards || [], card] }) : l);
            this.updateLists(lists);
        }
    }

    onCardSeleccionar(idportunidad: string, listId: string) {
        const url = `${constantesApiWeb.kanbanOportunidadUno}${idportunidad}`;
        return this.http.get<any>(url)
            .pipe(
                tap((data: any) => {
                    this.selectedCard.next(data);
                    this.selectedListId.next(listId);
                }),
            );
    }

    onCardSelect(card: KanbanCard, listId: string) {
        this.selectedCard.next(card);
        this.selectedListId.next(listId);
    }

    generateId() {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    oportunidadTraeruno(idportunidad: string) {
        const url = `${constantesApiWeb.kanbanOportunidadUno}${idportunidad}`;
        return this.http.get<any>(url);
    }

    obtenerClientes(tipoRol: string) {
        const url = `${constantesApiWeb.kanbanListaClientes}${tipoRol}`;
        return this.http.get<any>(url);
    }

    obtenerMonedas() {
        const url = `${constantesApiWeb.kanbanListaMonedas}`;
        return this.http.get<any>(url);
    }

    obtenerUsuarios() {
        const url = `${constantesApiWeb.kanbanListaUsuarios}`;
        return this.http.get<any>(url);
    }

    obtenerContactos(idCliente: string) {
        const url = `${constantesApiWeb.kanbanListaContactosOpor}${idCliente}`;
        return this.http.get<any>(url);
    }

    prcClientes(objeto: any) {
        const url = `${constantesApiWeb.prcClientes}`;
        return this.http.post<any>(url, objeto);
    }

    listarUsuarios() {
        const url = `${constantesApiWeb.kanbanListaPreVenta}`;
        return this.http.get<any>(url);
    }

    listarUsuariosxPerfil(idperfil: any) {
        const url = `${constantesApiWeb.kanbanListaUsuarioxPerfil}${idperfil}`;
        return this.http.get<any>(url);
    }

    listaPreVentas() {
        const url = `${constantesApiWeb.kanbanListaPreVenta}`;
        return this.http.get<any>(url);
    }

    enviarCorreoAsignacion(idportunidad: string) {
        const url = `${constantesApiWeb.enviarCorreoAsignacion}${idportunidad}`;
        return this.http.get<any>(url);
    }

    gettipocambiodia(objeto: any) {
        const url = `${constantesApiWeb.gettipocambiodia}`;
        return this.http.post<any>(url, objeto);
    }

    listarTipoProducto() {
        const url = `${constantesApiWeb.listatipoproducto}`;
        return this.http.get<any>(url);
    }

    getUserSession(objeto: any) {
        const url = `${constantesApiWeb.getUserSession}`;
        return this.http.post<any>(url, objeto);
    }

    ListaKanban() {
        const url = `${constantesApiWeb.Listakanban}`;
        return this.http.get<any>(url);
    }

    lstCantTareas(objeto: any) {
        const url = `${constantesApiWeb.lstCantTareas}`;
        return this.http.post<any>(url, objeto);
    }

    ListarNotificacion(codigo: number) {
        const url = `${constantesApiWeb.ListarNotificacion}${codigo}`;
        return this.http.get<any>(url);
    }
}
