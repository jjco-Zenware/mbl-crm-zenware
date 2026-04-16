import { Injectable } from '@angular/core';
import { I_rptaDataLogin } from '../model/interfaces';
import { constantesLocalStorage } from '../model/constantes';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setearLocalStorage(respuestaData: I_rptaDataLogin) {
    console.log('setearLocalStorage', respuestaData );

    localStorage.setItem('ZENWARE_OPOR', JSON.stringify(respuestaData));

    // Sincronizar el singleton en memoria para que todos los componentes
    // que usen constantesLocalStorage reflejen los datos del login actual
    constantesLocalStorage.nombreUsuario = respuestaData.nombreUsuario ?? '';
    constantesLocalStorage.login         = respuestaData.login ?? '';
    constantesLocalStorage.token         = respuestaData.token ?? '';
    constantesLocalStorage.idusuario     = respuestaData.idusuario ?? 0;
    constantesLocalStorage.estado        = respuestaData.estado ?? 0;
    constantesLocalStorage.mensaje       = respuestaData.mensaje ?? '';
    constantesLocalStorage.tipoacceso    = respuestaData.tipoacceso ?? '';
    constantesLocalStorage.imagen        = respuestaData.imagen ?? '';
    constantesLocalStorage.idperfil      = respuestaData.idperfil ?? 0;
    constantesLocalStorage.nomperfil     = respuestaData.nomperfil ?? '';
    
    console.log('constantesLocalStorage', constantesLocalStorage );
  }

  rehydrate() {
    const data = localStorage.getItem('ZENWARE_OPOR');
    if (data) {
      this.setearLocalStorage(JSON.parse(data));
    }
  }

  limpiar() {
    localStorage.removeItem('ZENWARE_OPOR');
  }

  obtenerDataGeneral():I_rptaDataLogin{
    const ZW:any = JSON.parse(localStorage.getItem('ZENWARE_OPOR')!);
    return ZW;
  }

  obtenerUsuario(): string {
    return this.obtenerDataGeneral().nombreUsuario??'';
    //return 'ZenWare';
  }

  obtenerLogin(): string {
    return this.obtenerDataGeneral().login ?? '';
  }

  obtenerToken():string {
    return this.obtenerDataGeneral().token??'';
  }

  estaLogueado():boolean {
    let nombUser: string = this.obtenerUsuario();
    let _tokUser: string = this.obtenerToken();
    return (nombUser != null && nombUser.length > 0 && _tokUser != null && _tokUser.length > 5) ? true : false;
  }

}
