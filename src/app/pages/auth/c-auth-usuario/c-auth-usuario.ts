import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, Subscription, filter, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthenticationResult, InteractionStatus, PopupRequest, EventMessage, EventType } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { LocalStorageService } from '../../service/localStorage.service';
import { mensajesGenericos, mensajesQuestion, moduloAPP, tipoAcceso } from '../../model/constantes';
import { I_rptaDataLogin } from '../../model/interfaces';

@Component({
    selector: 'app-c-auth-usuario',
    templateUrl: './c-auth-usuario.html',
    imports: [PRIMENG_MODULES],
    standalone: true,
    providers: [MessageService]
})
export class CAuthUsuario implements OnInit, OnDestroy {
    $listSubcription: Subscription[] = [];
    @Output() OB_pass = new EventEmitter<boolean>();
    @Output() OS_nombreUser = new EventEmitter<string>();
    loginUser: FormControl = new FormControl({ value: null, disabled: false }, [Validators.required]);
    isLoading = signal<boolean>(false);
    msalInstance: any;
    _homeAccountId: string = '';

    isIframe = false;
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();

    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,

        protected router: Router,
        private authService: AuthService,
        private messageService: MessageService,
        private msalService: MsalService,
        private msalBroadcastService: MsalBroadcastService,
        private localStorage: LocalStorageService
    ) {}

    ngOnInit(): void {
        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                const activeAccount = this.msalService.instance.getActiveAccount();

                if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
                    this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
                }
            });
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }

    setLoginDisplay() {
            this.loginDisplay = this.msalService.instance.getAllAccounts().length > 0;
        }
    
        checkAndSetActiveAccount() {
            /**
             * If no active account set but there are accounts signed in, sets first account to active account
             * To use active account set here, subscribe to inProgress$ first in your component
             * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
             */
            let activeAccount = this.msalService.instance.getActiveAccount();
    
            if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
                let accounts = this.msalService.instance.getAllAccounts();
                this.msalService.instance.setActiveAccount(accounts[0]);
            }
        }
    
        validaNombreUsuario(): void {
            this.isLoading.set(true);
    
            const $validaNombreUsuario = this.authService.validaNombreUsuario({ loginUser: this.loginUser.value, moduloAPP }).subscribe({
                next: (rpta: I_rptaDataLogin) => {
                    console.log('validaNombreUsuario : ', rpta);
                    this.isLoading.set(false);
                    if (rpta.estado != 1) {
                        this.messageService.clear();
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Acceso denegado',
                            detail: rpta.mensaje
                        });
                        return;
                    }
                    //this.isLoading = false;
                    if (rpta.tipoacceso == tipoAcceso.azure) {
                        this.loginAzure();
                    } else {
                        this.OB_pass.emit(true);
                        this.OS_nombreUser.emit(this.loginUser.value);
                    }
                    //this.isLoading = false;
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensajesGenericos.msgErrorGenerico
                    });
                },
                complete: () => {}
            });
            this.$listSubcription.push($validaNombreUsuario);
        }
    
        async loginAzure() {
            if (this.isLoading()) return;
            this.isLoading.set(true);
    
            try {
                // 1️⃣ Login
                const loginResult = await this.msalService
                    .loginPopup({
                        scopes: ['openid', 'profile', 'email', 'User.Read']
                    })
                    .toPromise();
    
                if (!loginResult) {
                    throw new Error('Login failed: no result returned');
                }
    
                this.msalService.instance.setActiveAccount(loginResult.account);
    
                // 2️⃣ Token silencioso
                const tokenResult = await this.msalService
                    .acquireTokenSilent({
                        scopes: ['openid', 'profile', 'email', 'User.Read'],
                        account: loginResult.account!
                    })
                    .toPromise();
    
                const account = tokenResult!.account!;
                const { homeAccountId, name, username } = account;
    
                this._homeAccountId = homeAccountId;
    
                // 3️⃣ Validación backend
                this.validarloginAzure(name, username);
            } catch (error) {
                console.error('Login Azure error:', error);
                this.isLoading.set(false);
            }
        }
    
        // async loginAzure() {
        //   this.msalInstance = new PublicClientApplication({
        //     auth: {
        //       clientId: 'b65e275c-ca73-4aac-b3e3-fd74c0658fd8',
        //       authority: 'https://login.microsoftonline.com/02157777-a391-40f4-b293-125e2aee9f72',
        //     },
        //     system: {
        //        loggerOptions: {
        //         logLevel: LogLevel.Info,
        //         piiLoggingEnabled: false
        //       }
        //     },
        //     cache: {
        //       cacheLocation: "sessionStorage",
        //       storeAuthStateInCookie: true,
        //     }
        //   });
    
        //   try {
        //     await this.msalInstance.initialize();
        //     const _login = await this.msalInstance.loginPopup();
        //     console.log("_login : ", _login);
        //     this.msalInstance.setActiveAccount(_login.account);
        //     const _acquireToken = await this.msalInstance.acquireTokenSilent({
        //       scopes: ["email", "openid", "profile", "User.Read"]
        //     });
        //     console.log("_acquireToken : ", _acquireToken);
    
        //     const cuentaUsuario: AccountInfo = this.msalInstance.getAccountByHomeId(_acquireToken.account.homeAccountId)!;
        //     const {idToken, homeAccountId, name, username} = cuentaUsuario;
    
        //     console.log("cuentaUsuario : ", cuentaUsuario);
    
        //     this._homeAccountId = homeAccountId
        //     this.validarloginAzure(name, username);
        //   } catch (error) {
        //     console.log("error : ", error);
        //   }
        // }
    
        validarloginAzure(nombreUser: string | undefined, emailUser: string) {
            const $validarloginAzure = this.authService.validarloginAzure({ loginUser: this.loginUser.value, nombreUser: nombreUser, emailUser: emailUser, moduloAPP }).subscribe({
                next: (rpta: I_rptaDataLogin) => {
                    this.isLoading.set(false);
                    if (rpta.estado != 1) {
                        this.messageService.clear();
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Acceso denegado',
                            detail: rpta.mensaje
                        });
                        this.logoutAzure();
                        return;
                    }
                    if (rpta.idusuario == 0) {
                        this.messageService.clear();
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Usuario/Email denegado',
                            detail: rpta.mensaje
                        });
                        this.logoutAzure();
                        return;
                    }
                    rpta.nombreUsuario = this.loginUser.value;
                    this.localStorage.setearLocalStorage(rpta);
                    this.isLoading.set(false);
                    this.router.navigate(['/pages/oportunidad']);
                },
                error: (err) => {
                    this.logoutAzure();
                    this.isLoading.set(false);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensajesGenericos.msgErrorGenerico
                    });
                },
                complete: () => {}
            });
            this.$listSubcription.push($validarloginAzure);
        }
    
        logoutAzure() {
            const account = this.msalService.instance.getActiveAccount();
    
            if (!account) return;
    
            this.msalService.logoutPopup({
                account: account
            });
        }
}
