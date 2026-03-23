import { Component, DestroyRef, inject, signal} from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { I_rptaDataLogin, Users } from '../model/interfaces';
import { Subscription } from 'rxjs';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage } from '../model/constantes';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { MessageService } from 'primeng/api';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { LeadService } from '../lead/lead.services';

@Component({
    selector: 'app-accion',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    templateUrl: './accion.html',
    standalone: true,
    providers: [MessageService],
})
export class Accion {

    $listSubcription: Subscription[] = [];
    lstOportunidad = signal<any[]>([]);
    Usuario!:I_rptaDataLogin;
    lstProveedores = signal<any[]>([]);
    idoportunidad: any = 0;
    frmDatos!: FormGroup;
    Vendedor= signal<any[]>([]);
    mensajeSpinner: string = "Cargando...!";
    blockedDocument = signal(false);
    listaAcciones = signal<any[]>([]);

    private readonly destroyRef = inject(DestroyRef);
    constructor(
        private oportunidadService: OportunidadService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
        private messageService: MessageService,
        private leadService: LeadService,
    ) {
        
    }

    ngOnInit() {
        this.createFrm();
        //this.Usuario = JSON.parse(localStorage.getItem('ZENWARE_OPOR')!);
        this.listaClientes();
        this.listaVendedor();
    }

    setSpinner(valor: boolean) {
            this.blockedDocument.set(valor);
    }

    createFrm() {
        this.frmDatos = this.fb.group({
            fechaini: [
                {
                    value: this.utilitariosService.obtenerFechaInicioMes(),
                    disabled: false,
                },
            ],
            fechafin: [
                {
                    value: this.utilitariosService.obtenerFechaFinMes(),
                    disabled: false,
                },
            ],
            idusuario: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false,
                },
            ],
            idcliente: [
                {
                    value: 0,
                    disabled: false,
                },
            ],
            idoportunidad: [
                {
                    value: 0,
                    disabled: false,
                },
            ],
            idvendedor: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false,
                },
            ],
        });
    }

    listaClientes() {

        const $getClientes = this.leadService.obtenerClientes('CLI').subscribe({
                next: (rpta: any) => {
                    this.lstProveedores.set(rpta);
                    const objet = {
                        idcliente: 0,
                        nomcomercial: 'TODOS',
                    };
                    
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error...',
                        detail: '',
                    });
                },
                complete: () => { },
            });
        this.$listSubcription.push($getClientes);
    }

    listarOportunidades() {
this.lstOportunidad.set([]);
        if (this.frmDatos.value.idcliente > 0) {
             
            const objeto = {
                idcliente: this.frmDatos.value.idcliente,
            };

            const $getClientes = this.oportunidadService
                .listarOportxCliente(objeto).pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (rpta: any) => {
                        this.lstOportunidad.set(rpta);
                        const objet = {
                            id: 0,
                            titulo: 'TODOS',
                        };
                        //this.lstOportunidad.update((lst) => [objet, ...lst]);
                    },
                    error: (err) => {
                        this.messageService.add({
                        severity: 'error',
                        summary: 'Error...',
                        detail: '',
                    });
                    },
                    complete: () => { },
                });
            this.$listSubcription.push($getClientes);
        }
    }

    listaVendedor() {
        this.oportunidadService.listarUsuariosxPerfil(2).subscribe({
            next: (rpta: any) => {
                //console.info('next : ', rpta);
                this.Vendedor.set(rpta);
                this.Vendedor.update((lst) => [
                    ...lst,
                    {
                        idusuario: 0,
                        name: "TODOS",
                    } as Users
                ]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error...',
                    detail: '',
                });
            },
            complete: () => { },
        });
    }

     getBuscar() {
        this.setSpinner(true);
        const objeto = {
            ...this.frmDatos.getRawValue(),
            //idusuario: 0,
        };

        const $listaAcciones = this.oportunidadService
            .listaAcciones(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('rpta listaAcciones', rpta);
                    this.listaAcciones.set(rpta);

                },
                error: (err) => {
                    this.setSpinner(false);
                    console.error('error : ', err);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err,
                    });
                },
                complete: () => {
                },
            });
        this.$listSubcription.push($listaAcciones);
    }

    getSeverity(data:any) {
      if (data.completo) {
        return 'success';
      }else{
        return 'warning';
      }
    }

}