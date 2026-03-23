// por ejemplo en un servicio Angular
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { constantesLocalStorage } from '../../model/constantes';

@Injectable({
  providedIn: 'root'
})

export class WebSocketService {
  public socket!: WebSocket;
 

  constructor( private messageService: MessageService) {
    
  }

  connect() {
    // Cambia la URL a la de tu servidor WS (ws:// o wss:// para SSL) ws://sigzenware.com/sok

    /*PRODUCCIÓN*/
    this.socket = new WebSocket('https://sigzenware.com/sok');

    /*DESARROLLO*/
    //this.socket = new WebSocket('https://zenwareadmin-001-site3.rtempurl.com/sok');

    //this.socket = new WebSocket('wss://localhost:7241/');

    // Evento cuando se abre la conexión
    this.socket.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      //this.sendMessage('hola');
    };

    // Evento cuando llega un mensaje
    this.socket.onmessage = (event) => {
      console.log('Mensaje recibido:', event.data);
      let data = event.data.split('-');
      console.log('.idusuario:', constantesLocalStorage.idusuario);
      if (constantesLocalStorage.idusuario === parseInt(data[0])) {
        this.messageService.add({severity: 'info',key: 'toast', detail: 'Hola ' + constantesLocalStorage.nombreUsuario + ', se te asignó la Oportunidad N° ' + (data[1]).toString()});
      }
    };

    // Evento cuando hay error
    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    // Evento cuando se cierra la conexión
    this.socket.onclose = () => {
      console.log('Conexión cerrada');
    };
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
