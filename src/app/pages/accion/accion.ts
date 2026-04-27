import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I_rptaDataLogin, Users } from '../model/interfaces';
import { Subscription } from 'rxjs';
import { UtilitariosService } from '../service/utilitarios.service';
import { constantesLocalStorage } from '../model/constantes';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { MessageService, MenuItem } from 'primeng/api';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { LeadService } from '../lead/lead.services';
import { mAccion } from '../oportunidad/m-acciones/m-accion';
import { DialogService } from 'primeng/dynamicdialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-accion',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES],
    templateUrl: './accion.html',
    standalone: true,
    providers: [MessageService, DialogService, OportunidadService, UtilitariosService, LeadService]
})
export class Accion {
    $listSubcription: Subscription[] = [];
    lstOportunidad = signal<any[]>([]);
    Usuario!: I_rptaDataLogin;
    lstProveedores = signal<any[]>([]);
    idoportunidad: any = 0;
    frmDatos!: FormGroup;
    Vendedor = signal<any[]>([]);
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal(false);
    listaAcciones = signal<any[]>([]);
    semanaItems: MenuItem[] = [];

    private readonly destroyRef = inject(DestroyRef);
    constructor(
        private oportunidadService: OportunidadService,
        private fb: FormBuilder,
        private utilitariosService: UtilitariosService,
        private messageService: MessageService,
        private leadService: LeadService,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.createFrm();
        //this.Usuario = JSON.parse(localStorage.getItem('ZENWARE_OPOR')!);
        this.listaClientes();
        this.listaVendedor();
        this.buildSemanaItems();
        this.getBuscar();
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

    listaClientes() {
        const $getClientes = this.leadService.obtenerClientes('CLI').subscribe({
            next: (rpta: any) => {
                this.lstProveedores.set(rpta);
                const objet = {
                    idcliente: 0,
                    nomcomercial: 'TODOS'
                };
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error...',
                    detail: ''
                });
            },
            complete: () => {}
        });
        this.$listSubcription.push($getClientes);
    }

    listarOportunidades() {
        this.lstOportunidad.set([]);
        if (this.frmDatos.value.idcliente > 0) {
            const objeto = {
                idcliente: this.frmDatos.value.idcliente
            };

            const $getClientes = this.oportunidadService
                .listarOportxCliente(objeto)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (rpta: any) => {
                        this.lstOportunidad.set(rpta);
                        const objet = {
                            id: 0,
                            titulo: 'TODOS'
                        };
                        //this.lstOportunidad.update((lst) => [objet, ...lst]);
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error...',
                            detail: ''
                        });
                    },
                    complete: () => {}
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
                        name: 'TODOS'
                    } as Users
                ]);
            },
            error: (err) => {
                console.info('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error...',
                    detail: ''
                });
            },
            complete: () => {}
        });
    }

    getBuscar() {
        this.setSpinner(true);
        const objeto = {
            ...this.frmDatos.getRawValue()
            //idusuario: 0,
        };

        const $listaAcciones = this.oportunidadService
            .listaTareas10(objeto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (rpta: any) => {
                    this.setSpinner(false);
                    console.log('rpta listaTareas10', rpta);
                    this.listaAcciones.set(rpta);
                },
                error: (err) => {
                    this.setSpinner(false);
                    console.error('error : ', err);
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err
                    });
                },
                complete: () => {}
            });
        this.$listSubcription.push($listaAcciones);
    }

    buildSemanaItems() {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = hoy.getMonth();
        const primerDia = new Date(year, month, 1);
        const ultimoDia = new Date(year, month + 1, 0);

        const dayOfWeek = primerDia.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        let weekStart = new Date(primerDia);
        weekStart.setDate(primerDia.getDate() + diffToMonday);

        this.semanaItems = [
            {
                label: 'Todo el mes',
                icon: 'pi pi-calendar-plus',
                command: () => {
                    this.frmDatos.patchValue({ fechaini: new Date(primerDia), fechafin: new Date(ultimoDia) });
                    this.getBuscar();
                }
            },
            { separator: true }
        ];
        let semanaNum = 1;

        while (weekStart <= ultimoDia) {
            const start = new Date(weekStart);
            const end = new Date(weekStart);
            end.setDate(weekStart.getDate() + 6);
            const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
            this.semanaItems.push({
                label: `Semana ${semanaNum}  (${fmt(start)} - ${fmt(end)})`,
                icon: 'pi pi-calendar',
                command: () => {
                    this.frmDatos.patchValue({ fechaini: new Date(start), fechafin: new Date(end) });
                    this.getBuscar();
                }
            });
            weekStart.setDate(weekStart.getDate() + 7);
            semanaNum++;
        }
    }

    setThisWeek() {
        const today = new Date();
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        this.frmDatos.patchValue({ fechaini: monday, fechafin: sunday });
        this.getBuscar();
    }

    exportarExcel() {
        const data = this.listaAcciones();
        const groups: { [key: string]: any[] } = {};
        data.forEach(item => {
            const key = `${item.cliente}||${item.oportunidad}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        const rows: any[][] = [];
        Object.keys(groups).forEach(key => {
            const [cliente, oportunidad] = key.split('||');
            rows.push([`Cliente: ${cliente}`]);
            rows.push([`Oportunidad: ${oportunidad}`]);
            rows.push(['N°', 'Fecha', 'Prioridad', 'Plan de Acción', 'Resultado', 'Estado']);
            groups[key].forEach((item, idx) => {
                rows.push([idx + 1, item.s_fechaini, item.desprioridad, item.descripcion, item.resultado, item.nomestado]);
            });
            rows.push([]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Acciones');
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'acciones.xlsx');
    }

    getSeverity(nomestado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (nomestado) {
            case 'COMPLETADO': return 'success';
            case 'HOY': return 'warn';
            case 'PENDIENTE': return 'info';
            case 'VENCIDO': return 'danger';
            default: return 'info';
        }
    }

     onAccion(data: any) {
        data.tipopro = 2
            const ref = this.dialogService.open(mAccion, {
                data: data,
                header: 'Editar Acción',
                styleClass: 'testDialog',
                closeOnEscape: false,
                closable: true,
                width: '35%'
            });
    
            if (ref) {
                ref.onClose.subscribe(() => {
                    this.getBuscar();
                });
            }
        }
}
