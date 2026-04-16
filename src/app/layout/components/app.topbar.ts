import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ConfirmationService, MegaMenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { Ripple } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MegaMenuModule } from 'primeng/megamenu';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadge } from 'primeng/overlaybadge';
import { ImageModule } from 'primeng/image';
import { constantesLocalStorage } from '@/app/pages/model/constantes';
import { LocalStorageService } from '@/app/pages/service/localStorage.service';
import { PRIMENG_MODULES } from '@/app/pages/shared/primeng_modules';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [PRIMENG_MODULES],
    providers: [ ConfirmationService],
    //imports: [RouterModule, CommonModule, StyleClassModule, FormsModule, Ripple, ButtonModule, MegaMenuModule, BadgeModule, OverlayBadge, ImageModule],
    template: `
        <div class="layout-topbar-start">
             <p-image src="/demo/images/logo/logo_sin_fondo_principal.png" class="w-30 h-30 "/>

            
            <!-- <span class="layout-sidebar-logo align-items-center text-xl ml-2 font-light">
                Zenware
            </span> -->
            <a #menuButton class="layout-menu-button" (click)="onMenuButtonClick()">
                <i class="pi pi-chevron-right"></i>
            </a>

            <button class="app-config-button app-config-mobile-button" (click)="toggleConfigSidebar()">
                <i class="pi pi-cog"></i>
            </button>

            <a #mobileMenuButton class="layout-topbar-mobile-button" (click)="onTopbarMenuToggle()">
                <i class="pi pi-ellipsis-v"></i>
            </a>
        </div>

        <div class="layout-topbar-end">
            <div class="layout-topbar-actions-start">
                <span class="text-xl"><i class="pi pi-slack mr-2"></i>
                CRM - Customer Relationship Management System</span>
                <!-- <p-megamenu [model]="model" styleClass="layout-megamenu" breakpoint="0px"></p-megamenu> -->
            </div>
            <div class="layout-topbar-actions-end">
                <ul class="layout-topbar-items">
                    <!-- <li class="layout-topbar-search">
                        <a pStyleClass="@next" enterFromClass="!hidden" enterActiveClass="animate-scalein" leaveToClass="!hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true" [hideOnEscape]="true" (click)="focusSearchInput()">
                            <i class="pi pi-search"></i>
                        </a>

                        <div class="layout-search-panel !hidden p-input-filled">
                            <i class="pi pi-search"></i>
                            <input #searchInput type="text" pInputText placeholder="Search" />
                            <button pButton pRipple type="button" icon="pi pi-times" rounded text pStyleClass=".layout-search-panel" leaveToClass="!hidden" leaveActiveClass="animate-fadeout"></button>
                        </div>
                    </li> -->
                    <!-- <li>
                        <button class="app-config-button" (click)="toggleConfigSidebar()">
                            <i class="pi pi-cog"></i>
                        </button>
                    </li> -->
                    <li>
                        <a pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" >
                            <p-overlay-badge severity="warn">
                                <i class="pi pi-bell align-middle!"></i>
                            </p-overlay-badge>
                        </a>
                        <div class="hidden">
                            <ul class="list-none p-0 m-0">
                                <li class="px-4 py-1">
                                    <span>You have <b>4</b> new notifications</span>
                                </li>
                                <li class="p-4">
                                    <div class="flex items-center">
                                        <img src="/demo/images/avatar/avatar-1.png" />
                                        <div class="flex flex-col ml-4 flex-1">
                                            <div class="flex items-center justify-between mb-1">
                                                <span class="font-bold">Jerome Bell</span>
                                                <small>42 mins ago</small>
                                            </div>
                                            <span class="text-sm leading-normal">How to write content about your photographs?</span>
                                        </div>
                                    </div>
                                </li>
                                <li class="p-4">
                                    <div class="flex items-center">
                                        <img src="/demo/images/avatar/avatar-2.png" />
                                        <div class="flex flex-col ml-4 flex-1">
                                            <div class="flex items-center justify-between mb-1">
                                                <span class="fs-small font-bold">Cameron Williamson</span>
                                                <small>48 mins ago</small>
                                            </div>
                                            <span class="text-sm leading-normal">Start a blog to reach your creative peak.</span>
                                        </div>
                                    </div>
                                </li>
                                <li class="p-4">
                                    <div class="flex items-center">
                                        <img src="/demo/images/avatar/avatar-3.png" />
                                        <div class="flex flex-col ml-4 flex-1">
                                            <div class="flex items-center justify-between mb-1">
                                                <span class="fs-small font-bold">Anna Miles</span>
                                                <small>1 day ago</small>
                                            </div>
                                            <span class="text-sm leading-normal">Caring is the new marketing</span>
                                        </div>
                                    </div>
                                </li>
                                <li class="p-4">
                                    <div class="flex items-center">
                                        <img src="/demo/images/avatar/avatar-4.png" />
                                        <div class="flex flex-col ml-4 flex-1">
                                            <div class="flex items-center justify-between mb-1">
                                                <span class="fs-small font-bold">Arlene Mccoy</span>
                                                <small>4 day ago</small>
                                            </div>
                                            <span class="text-sm leading-normal">Starting your traveling blog with Vasco.</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <!-- <li>
                        <a pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                            <i class="pi pi-table"></i>
                        </a>
                        <div class="hidden">
                            <div class="flex flex-wrap">
                                <div class="w-4/12 flex flex-col items-center p-4">
                                    <button pButton pRipple rounded class="mb-2" icon="pi pi-image dark:text-black"></button>
                                    <span>Products</span>
                                </div>
                                <div class="w-4/12 flex flex-col items-center p-4">
                                    <button pButton pRipple rounded class="mb-2" severity="success" icon="pi pi-file-pdf dark:text-black"></button>
                                    <span>Reports</span>
                                </div>
                                <div class="w-4/12 flex flex-col items-center p-4">
                                    <button pButton pRipple rounded class="mb-2" severity="contrast" icon="pi pi-dollar dark:text-black"></button>
                                    <span>Balance</span>
                                </div>
                                <div class="w-4/12 flex flex-col items-center p-4">
                                    <button pButton pRipple rounded class="mb-2" severity="warn" icon="pi pi-cog dark:text-black"></button>
                                    <span>Settings</span>
                                </div>
                                <div class="w-4/12 flex flex-col items-center p-4">
                                    <button pButton pRipple rounded class="mb-2" severity="help" icon="pi pi-key dark:text-black"></button>
                                    <span>Credentials</span>
                                </div>
                                <div class="w-4/12 flex flex-col items-center p-4">
                                    <button pButton pRipple rounded class="mb-2" severity="info" icon="pi pi-sitemap dark:text-black"></button>
                                    <span>Sitemap</span>
                                </div>
                            </div>
                        </div>
                    </li> -->
                    <li>
                        <a pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" 
                        [hideOnOutsideClick]="true">
                            <!-- <img src="/demo/images/avatar/amyelsner.png" alt="avatar" class="w-8 h-8" /> -->
                            <img [src]="logoUsuario" alt="avatar" class="w-8 h-8">
                        </a>
                        <div class="hidden">
                            <ul class="list-none p-0 m-0">
                                <!-- <li>
                                    <a class="cursor-pointer flex items-center hover:bg-emphasis duration-150 transition-all px-4 py-2" pRipple>
                                        <i class="pi pi-cog mr-2"></i>
                                        <span>Settings</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="cursor-pointer flex items-center hover:bg-emphasis duration-150 transition-all px-4 py-2" pRipple>
                                        <i class="pi pi-file-o mr-2"></i>
                                        <span>Terms of Usage</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="cursor-pointer flex items-center hover:bg-emphasis duration-150 transition-all px-4 py-2" pRipple>
                                        <i class="pi pi-compass mr-2"></i>
                                        <span>Support</span>
                                    </a>
                                </li> -->
                                <li>
                                    <a (click)="logOff()" class="cursor-pointer flex items-center hover:bg-emphasis duration-150 transition-all px-4 py-2" 
                                  >
                                        <i class="pi pi-power-off mr-2"></i>
                                        <span>Logout</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                    </li>
                    <span class="text-xl ml-1 mt-2">{{nomUsuario}}</span>
                    <!-- <li>
                        <a (click)="onRightMenuButtonClick()">
                            <i class="pi pi-arrow-left"></i>
                        </a>
                    </li> -->
                </ul>
            </div>
        </div>
        <p-confirmDialog header="Confirmation" key="confirm1" [style]="{width: '450px'}"></p-confirmDialog>
    `,
    host: {
        class: 'layout-topbar'
    },
    styles: `
        :host ::ng-deep .p-overlaybadge .p-badge {
            outline-width: 0px;
        }
    `
})
export class AppTopbar {
    layoutService = inject(LayoutService);

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    @ViewChild('menuButton') menuButton!: ElementRef<HTMLButtonElement>;

    @ViewChild('mobileMenuButton') mobileMenuButton!: ElementRef<HTMLButtonElement>;

    model: MegaMenuItem[] = [
        {
            label: 'UI KIT',
            items: [
                [
                    {
                        label: 'UI KIT 1',
                        items: [
                            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: '/uikit/formlayout' },
                            { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: '/uikit/input' },
                            { label: 'Timeline', icon: 'pi pi-fw pi-bookmark', routerLink: '/uikit/timeline' },
                            { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: '/uikit/button' },
                            { label: 'File', icon: 'pi pi-fw pi-file', routerLink: '/uikit/file' }
                        ]
                    }
                ],
                [
                    {
                        label: 'UI KIT 2',
                        items: [
                            { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: '/uikit/table' },
                            { label: 'List', icon: 'pi pi-fw pi-list', routerLink: '/uikit/list' },
                            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: '/uikit/tree' },
                            { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: '/uikit/panel' },
                            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: '/uikit/charts' }
                        ]
                    }
                ],
                [
                    {
                        label: 'UI KIT 3',
                        items: [
                            { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: '/uikit/overlay' },
                            { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: '/uikit/media' },
                            { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: '/uikit/menu' },
                            { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: '/uikit/message' },
                            { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: '/uikit/misc' }
                        ]
                    }
                ]
            ]
        },
        {
            label: 'UTILITIES',
            items: [
                [
                    {
                        label: 'UTILITIES 1',
                        items: [
                            {
                                label: 'Buy Now',
                                icon: 'pi pi-fw pi-shopping-cart',
                                url: 'https://www.primefaces.org/store',
                                target: '_blank'
                            },
                            {
                                label: 'Documentation',
                                icon: 'pi pi-fw pi-info-circle',
                                routerLink: '/documentation'
                            }
                        ]
                    }
                ]
            ]
        }
    ];
    nomUsuario!: string;
    nomImagen!: string;
    logoUsuario!: string;

    constructor(
        private confirmationService: ConfirmationService,
        private localStorageService: LocalStorageService,
        protected router: Router,
    ) {}

    ngOnInit() {
    this.nomUsuario = constantesLocalStorage.nombreUsuario;
        this.nomImagen = constantesLocalStorage.imagen;
        this.logoUsuario = constantesLocalStorage.imagen;
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onRightMenuButtonClick() {
        this.layoutService.openRightMenu();
    }

    toggleConfigSidebar() {
        if (this.layoutService.isSidebarActive()) {
            this.layoutService.layoutState.update((prev) => ({
                ...prev,
                overlayMenuActive: false,
                staticMenuMobileActive: false,
                menuHoverActive: false,
                configSidebarVisible: true
            }));
        } else {
            this.layoutService.toggleConfigSidebar();
        }
    }

    focusSearchInput() {
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        }, 150);
    }

    onTopbarMenuToggle() {
        this.layoutService.layoutState.update((val) => ({ ...val, topbarMenuActive: !val.topbarMenuActive }));
    }

     logOff() {
        this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            message: '¿Estás seguro de Cerrar sesión?',
            acceptLabel: 'Si',
            rejectLabel: 'No',
            rejectButtonStyleClass:'modalBtnRed',
            acceptButtonStyleClass:'modalBtnGreen',
            accept: () => {
                this.localStorageService.limpiar();
                this.router.navigate(['/']);
            }
        });
    }
}
