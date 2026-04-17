
import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { I_ConfirmDialog, I_MessageToast } from '../model/interfaces';
import { mensajesToast } from '../model/constantes';

@Injectable({
  providedIn: 'root'
})
export class SharedAppService {

  constructor(
    private serviceConfirmation: ConfirmationService,
    private serviceMessage: MessageService
  ) { }

  async confirmDialog(objeto: I_ConfirmDialog): Promise<boolean> {
    return new Promise<boolean>((resolve)=>{
      this.serviceConfirmation.confirm({
        message: objeto.message??'¿Desea guardar el registro?',
        header: objeto.header??'Aviso',
        rejectButtonStyleClass: objeto.rejectButtonStyleClass??'p-button p-button-danger',
        acceptButtonStyleClass: objeto.acceptButtonStyleClass??'p-button p-button-info surface-border', //'modalBtnGreen',
        acceptLabel: objeto.acceptLabel??'Si',
        acceptIcon: objeto.acceptIcon??"pi pi-check-circle",
        rejectLabel: objeto.rejectLabel??'No',
        rejectIcon: objeto.rejectIcon??"pi pi-times-circle",

        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    })
  }

  messageToast(objeto?: I_MessageToast) {
    this.serviceMessage.clear();
    this.serviceMessage.add({
      severity: objeto?.severity??'error',
      summary: objeto?.summary??'Error',
      detail: objeto?.detail??mensajesToast.msgErrorGenerico
    });
  }
}
