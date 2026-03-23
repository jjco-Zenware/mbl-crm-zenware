import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

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
    el = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;
    model: any[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'OPORTUNIDAD',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-gauge', routerLink: ['/dashboard/dashboard'] },
                    { label: 'Kanban', icon: 'pi pi-fw pi-objects-column', routerLink: ['/kanban/kanban'] },
                    { label: 'Oport. Pendientes', icon: 'pi pi-fw pi-list', routerLink: ['/oportunidad/oportunidad'] },
                    { label: 'Registro Lead', icon: 'pi pi-fw pi-table', routerLink: ['/lead/lead'] },
                    { label: 'Agenda', icon: 'pi pi-fw pi-calendar', routerLink: ['/agenda/agenda'] },
                    { label: 'Acciones', icon: 'pi pi-fw pi-list', routerLink: ['/accion/accion'] },
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
                                routerLink: ['/balance/balance']
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
                            {
                                label: 'Reuniones',
                                icon: 'pi pi-fw pi-chart-pie',
                                routerLink: ['/reunion/reunion']
                            },
                            {
                                label: 'Llamadas',
                                icon: 'pi pi-fw pi-phone',
                                routerLink: ['/llamada/llamada']
                            },
                            {
                                label: 'Tareas',
                                icon: 'pi pi-fw pi-check-square',
                                routerLink: ['/listatarea/listatarea']
                            },
                            {
                                label: 'Iniciativas PreVenta',
                                icon: 'pi pi-fw pi-check-square',
                                routerLink: ['/tareaspre/tareaspre']
                            }
                        ]
                    }
                ]
            }
        ];
        //this.getMenuItems();
    }
}
