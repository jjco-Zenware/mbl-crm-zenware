import { Component, OnInit, signal } from '@angular/core';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { MessageService } from 'primeng/api';
import { CAuthUsuario } from '../c-auth-usuario/c-auth-usuario';
import { CAuthClave } from '../c-auth-clave/c-auth-clave';

@Component({
  selector: 'app-c-auth',
  templateUrl: './c-auth.html',
  imports: [PRIMENG_MODULES, CAuthUsuario, CAuthClave],
    standalone: true,
    providers: [MessageService]
})
export class CAuth implements OnInit {
  visibleNombre = signal<boolean>(false);
  nombreUsuario:string = '';

  ngOnInit(): void { }

  getPasoPass(dato:any){
    this.visibleNombre.set(true);
  }

  getUsuario(usuario:string){
    console.log('getUsuario', usuario);
    this.nombreUsuario = usuario
  }
}
