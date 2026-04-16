import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { constantesLocalStorage } from '../../model/constantes';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    public socket!: WebSocket;

    constructor(private messageService: MessageService) {}

    connect() {
        /*PRODUCCIÓN*/
        //this.socket = new WebSocket('wss://sigzenware.com/sok');
        
        /*DESARROLLO*/
        this.socket = new WebSocket('https://zenwareadmin-001-site3.rtempurl.com/sok');

        this.socket.onopen = () => {};

        this.socket.onmessage = (event) => {
            let data = event.data.split('-');
            if (constantesLocalStorage.idusuario === parseInt(data[0])) {
                this.messageService.add({ severity: 'info', key: 'toast', detail: 'Hola ' + constantesLocalStorage.nombreUsuario + ', se te asignó la Oportunidad N° ' + (data[1]).toString() });
            }
        };

        this.socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
        };

        this.socket.onclose = () => {};
    }

    sendMessage(message: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
    }

    close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
