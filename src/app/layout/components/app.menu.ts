import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { constantesLocalStorage } from '@/app/pages/model/constantes';

@Component({
    selector: '[app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu" #menuContainer>
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu {
    verPreventa = signal<boolean>(false);
    verComercial = signal<boolean>(false);
    idperfil: number = 0;
    model: any[] = [];

    ngOnInit() {
        this.idperfil = constantesLocalStorage.idperfil;

        if (this.idperfil === 3) {
            this.verPreventa.set(true);
        }
        if (this.idperfil === 4) {
            this.verComercial.set(true);
        }
        
        this.model = [
            {
                label: 'OPORTUNIDAD',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-gauge', routerLink: ['/dashboard/dashboard'] },
                    { label: 'Kanban', icon: 'pi pi-fw pi-objects-column', routerLink: ['/kanban/kanban'] },
                    { label: 'Acciones Pendientes', icon: 'pi pi-fw pi-list', routerLink: ['/oportunidad/oportunidad'] },
                    { label: 'Registro Lead', icon: 'pi pi-fw pi-table', routerLink: ['/lead/lead'], visible: this.idperfil === 4 },
                    { label: 'Oportunidades', icon: 'pi pi-fw pi-list', routerLink: ['/listaopor/listaopor'] },
                    { label: 'Agenda', icon: 'pi pi-fw pi-calendar', routerLink: ['/agenda/agenda'] },
                    { label: 'Plan de Acción', icon: 'pi pi-fw pi-list', routerLink: ['/accion/accion'], visible: this.idperfil === 4  },
                    { label: 'Tareas', icon: 'pi pi-fw pi-list', routerLink: ['/listatarea/listatarea'], visible: this.idperfil === 3 },
                    {
                        label: 'Reportes',
                        icon: 'pi pi-fw pi-chart-pie',
                        path: '/reporte',
                        items: [
                            {
                                label: 'Reportes Gerencia',
                                icon: 'pi pi-fw pi-chart-pie',
                                routerLink: ['/reportgerencia/reportgerencia']
                            },
                            {
                                label: 'Graficos',
                                icon: 'pi pi-fw pi-chart-line',
                                routerLink: ['/grafico/grafico']
                            },
                            {
                                label: 'Balance Actividades',
                                icon: 'pi pi-fw pi-chart-bar',
                                routerLink: ['/balance/balance']
                            }
                        ]
                    },
                    {
                        label: 'Actividades',
                        icon: 'pi pi-fw pi-file-edit',
                        path: '/actividad',
                        items: [
                            // {
                            //     label: 'Reuniones',
                            //     icon: 'pi pi-fw pi-chart-pie',
                            //     routerLink: ['/reunion/reunion']
                            // },
                            // {
                            //     label: 'Llamadas',
                            //     icon: 'pi pi-fw pi-phone',
                            //     routerLink: ['/llamada/llamada']
                            // },
                            // {
                            //     label: 'Tareas',
                            //     icon: 'pi pi-fw pi-check-square',
                            //     routerLink: ['/listatarea/listatarea']
                            // },
                            {
                                label: 'Iniciativas PreVenta',
                                icon: 'pi pi-fw pi-check-square',
                                routerLink: ['/tareaspre/tareaspre'], 
                                visible: this.idperfil === 3
                            }
                        ]
                    }
                ]
            }
        ];
        //this.getMenuItems();
    }
}
