import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { LocalStorageService } from '../../service/localStorage.service';
import { I_rptaDataLogin } from '../../model/interfaces';
import { mensajesQuestion, moduloAPP } from '../../model/constantes';

@Component({
    selector: 'app-c-auth-clave',
    templateUrl: './c-auth-clave.html',
    imports: [PRIMENG_MODULES],
    standalone: true,
    providers: [MessageService]
})
export class CAuthClave implements OnInit, OnDestroy {
    @Input() IS_nombreUser: string = '';
    $listSubcription: Subscription[] = [];
    claveUser: FormControl = new FormControl({ value: null, disabled: false }, [Validators.required]);
    isLoading: boolean = false;

    constructor(
        protected router: Router,
        private messageService: MessageService,
        private authService: AuthService,
        private localStorage: LocalStorageService
    ) {}

    ngOnInit(): void {}

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    validaLogin(): void {
        this.isLoading = true;

        const $validausuario = this.authService.validausuario({ loginUser: this.IS_nombreUser, claveUser: this.claveUser.value, moduloAPP }).subscribe({
            next: (rpta: I_rptaDataLogin) => {
                this.isLoading = false;
                if (rpta.estado != 1) {
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Acceso denegado',
                        detail: rpta.mensaje
                    });
                    return;
                }
                //rpta.nombreUsuario = this.IS_nombreUser
                console.log('validaLogin');
                this.localStorage.setearLocalStorage(rpta);
                this.isLoading = false;
                this.router.navigate(['/pages/dashboard']);
                //this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
        this.$listSubcription.push($validausuario);
    }
}
