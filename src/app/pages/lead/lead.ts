import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { constantesLocalStorage } from '../model/constantes';
import { UtilitariosService } from '../service/utilitarios.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { I_rptaDataLogin } from '../model/interfaces';
import { Subscription } from 'rxjs';
import { LeadService } from './lead.services';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { CLeadReg } from './lead-reg/lead-reg';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mAccion } from '../oportunidad/m-acciones/m-accion';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-lead',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, CLeadReg],

    templateUrl: './lead.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ConfirmationService, DialogService],
    styleUrls: ['./lead.scss']
})
export class Lead {
    $listSubcription: Subscription[] = [];
    ///lstOportunidades: any[] = [];
    vistaLista = signal<boolean>(true);
    visDetalle = signal<boolean>(false);
    tituloDetalle!: string;
    dataPrc: any;
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal<boolean>(false);
    frmDatos!: FormGroup;
    Usuario!: I_rptaDataLogin;

    lstOportunidades = signal<any[]>([]);

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private leadService: LeadService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public dialogService: DialogService,
    ) {}

    ngOnInit() {
        this.createFrm();
        this.getBuscar();
        //this.Usuario = JSON.parse(localStorage.getItem('ZENWARE_OPOR')!);
    }

    onEditar(data: any) {
        console.log('onEditar...', data);
        this.dataPrc = {
            id: data.id,
            paramReg: 'E'
        };
        this.tituloDetalle = 'EDITAR LEAD ';
        this.vistaLista.set(false);
        this.visDetalle.set(true);
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    createFrm() {
        this.frmDatos = this.fb.group({
            fechaini: [
                {
                    value: this.utilitariosService.obtenerFechaInicioMes(),
                    disabled: false
                }
            ],
            fechafin: [
                {
                    value: this.utilitariosService.obtenerFechaFinMes(),
                    disabled: false
                }
            ],
            idusuario: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false
                }
            ],
            idcliente: [
                {
                    value: 0,
                    disabled: false
                }
            ],
            idoportunidad: [
                {
                    value: 0,
                    disabled: false
                }
            ],
            idvendedor: [
                {
                    value: constantesLocalStorage.idusuario,
                    disabled: false
                }
            ]
        });
    }

    getBack() {
        this.vistaLista.set(true);
        this.visDetalle.set(false);
        this.getBuscar();
    }

    onNuevo() {
        this.tituloDetalle = 'REGISTRAR LEAD';
        this.dataPrc = {
            id: '0',
            paramReg: 'N'
        };
        this.vistaLista.set(false);
        this.visDetalle.set(true);
    }

    getBuscar() {
        this.lstOportunidades.set([]);
        const objeto = {
            idusuario: constantesLocalStorage.idusuario,
            fechaini: this.frmDatos.value.fechaini,
            fechafin: this.frmDatos.value.fechafin
        };
        this.mensajeSpinner = 'Cargando...!';
        this.setSpinner(true);

        this.leadService
            .OportunidadesLista(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    //   if (!rpta.success || !rpta.data) {
                    //     this.serviceSwal.showInfo(rpta.message);
                    //     return;
                    //   }
                    this.setSpinner(false);
                    console.log('cargarOportunidades...', rpta);
                    this.lstOportunidades.set(rpta.filter((item: any) => item.idlistafiltro === 0));
                    // this.lstOportunidades = rpta.map((item: any) => ({
                    //     startDate: item.startDate,
                    //     id: item.id,
                    //     title: item.title,
                    //     razonsocial: item.razonsocial,
                    //     simbmoneda: item.simbmoneda,
                    //     monto: item.monto,
                    //     dueDate: item.dueDate,
                    //     nomlista: item.nomlista
                    // }));
                },
                error: () => {
                    this.setSpinner(false);
                },
                complete() {}
            });
    }

    agregarAccion(data: any, tipo: number) {
            console.log('data...', data);
            data.tipopro = tipo;
            data.idtarea = 0;    
            data.idoportunidad = data.id;        
    
            console.log('onAccion...', data.idtarea);
    
            const ref = this.dialogService.open(mAccion, {
                data: data,
                header: 'Agregar Acción',
                styleClass: 'testDialog',
                closeOnEscape: false,
                closable: true,
                width: '35%'
            });
    
            if (ref) {
                ref.onClose.subscribe((rpta: any) => {
                    //this.cargarOportunidades();
                    console.log('onClose', rpta);
                    if (rpta !== undefined) {
                        ref.onClose.subscribe(() => {
                            this.getBuscar();
                        });
                    }
                });
            }
        }
}
