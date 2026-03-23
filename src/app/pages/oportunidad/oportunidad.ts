import { ChangeDetectorRef, Component, DestroyRef, inject, signal} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I_rptaDataLogin, Users } from '../model/interfaces';
import { Subscription } from 'rxjs';
import { OportunidadService } from './oportunidad.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { constantesLocalStorage } from '../model/constantes';
import { UtilitariosService } from '../service/utilitarios.service';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mAccion } from './m-acciones/m-accion';
import { DialogService } from 'primeng/dynamicdialog';
import { CLeadReg } from '../lead/lead-reg/lead-reg';

@Component({
    selector: 'app-oportunidad',
    //imports: [ReactiveFormsModule, FormsModule, TableModule,ButtonModule,SelectModule, DatePickerModule, CProgressSpinnerComponent],
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent, CLeadReg],
    templateUrl: './oportunidad.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, DialogService,ConfirmationService],
})
export class Oportunidad {

    private readonly destroyRef = inject(DestroyRef);

    $listSubcription: Subscription[] = [];
    lstOportunidades = signal<any[]>([]);
    lstOportunidad = signal<any[]>([]);
    opor_total: number = 0;
    opor_pendiente: number = 0;
    Usuario!:I_rptaDataLogin;
    lstProveedores: any;
    idoportunidad: any = 0;
    frmDatos!: FormGroup;
    Vendedor = signal<any[]>([]);
    mensajeSpinner: string = "Cargando...!";
    blockedDocument = signal(false);
    visMntOportunidad: boolean = false;
    dataOportunidad: any;
    visOportunidad: boolean = true;

    constructor(
        private oportunidadService: OportunidadService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
        private cd: ChangeDetectorRef,
        public dialogService: DialogService,
    ) {
    }

    ngOnInit() {
        this.createFrm();
        
        //this.listaClientes();
        //this.listaVendedor();
        //this.cargarOportunidades();
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
        const objeto = {
            idrolpersona: 'CLI',
            idusuario: this.Usuario.idusuario,
        };

        const $getClientes = this.oportunidadService.ListaProveedores(objeto).subscribe({
                next: (rpta: any) => {
                    this.lstProveedores = rpta;
                    const objet = {
                        idcliente: 0,
                        nomcomercial: 'TODOS',
                    };
                    this.lstProveedores.unshift(objet);
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
        this.oportunidadService.listarUsuariosxPerfil(2).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (rpta: any) => {
                //console.info('next : ', rpta);
                this.Vendedor.set(rpta);
                this.Vendedor.update((lst) => [
                    {
                        idusuario: 0,
                        name: "TODOS",
                    } as Users,
                    ...lst
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

    cargarOportunidades() {
        const objeto  ={
            idusuario: constantesLocalStorage.idusuario ,
            fechaini: this.frmDatos.value.fechaini,
            fechafin: this.frmDatos.value.fechafin
        }
        this.setSpinner(true);
        const $OportunidadesLista = this.oportunidadService.OportunidadesLista(objeto).pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('cargarOportunidades...', rpta);
                    this.lstOportunidades.set(rpta);
                },
                error: (err) => {
                    this.setSpinner(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error...',
                        detail: err,
                    });
                },
                complete: () => { }
            });
        this.$listSubcription.push($OportunidadesLista)
    }

    onAccion(data: any) {
        console.log('onAccion', data);
        const ref = this.dialogService.open(mAccion, {
            data: data,
            header: 'Configurar Acción',
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '35%'
        });

        if (ref) {
            ref.onClose.subscribe(() => {
                this.cargarOportunidades();
            });
        }
    }

    verOportunidadMnt(dato: any) {

        this.visOportunidad = false;
        this.visMntOportunidad = true;

        const objeto = {id: dato.id, paramReg: 'k'}

        this.dataOportunidad = objeto;
    }

    getOportunidadKanban(dato: any) {
        this.visOportunidad = true;
        this.visMntOportunidad = false;
        this.cargarOportunidades();
    }
}