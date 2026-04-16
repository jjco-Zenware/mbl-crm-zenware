import { Routes } from '@angular/router';
import { AppLayout } from '@/app/layout/components/app.layout';
import { CAuth } from './app/pages/auth/c-auth/c-auth';

export const appRoutes: Routes = [
    { path: 'auth', component: CAuth},
    { path: '', redirectTo: 'auth', pathMatch:'full' },
    
    {
        path: '',
        component: AppLayout,
        
        children: [
           { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'dashboard', data: { breadcrumb: 'Oportunidad > Dashboard' }, loadChildren: () => import('./app/pages/dashboard/dashboard.routes') },
            { path: 'oportunidad', data: { breadcrumb: 'Oportunidad > Acciones Pendientes' }, loadChildren: () => import('./app/pages/oportunidad/oportunidad.routes')},
            { path: 'lead', data: { breadcrumb: 'Oportunidad > Leads' }, loadChildren: () => import('./app/pages/lead/lead.routes') },
            { path: 'accion', data: { breadcrumb: 'Oportunidad > Acciones' }, loadChildren: () => import('./app/pages/accion/accion.routes') },
            { path: 'agenda', data: { breadcrumb: 'Oportunidad > Agenda' }, loadChildren: () => import('./app/pages/agenda/agenda.routes') },
            { path: 'balance', data: { breadcrumb: 'Oportunidad > Balance de Actividades' }, loadChildren: () => import('./app/pages/balance/balance.routes') },
            { path: 'listatarea', data: { breadcrumb: 'Oportunidad > Actividad > Tareas' }, loadChildren: () => import('./app/pages/listatarea/listatarea.routes') },
            { path: 'kanban', data: { breadcrumb: 'Oportunidad > Kanban (Oportunidades)' }, loadChildren: () => import('./app/pages/kanban/kanban.routes')},
            { path: 'reportgerencia', data: { breadcrumb: 'Oportunidad > Reporte de Gerencia' }, loadChildren: () => import('./app/pages/reportgerencia/reportgerencia.routes') },
            { path: 'tareaspre', data: { breadcrumb: 'Oportunidad > Actividad > Iniciativa Preventa' }, loadChildren: () => import('./app/pages/tareaspre/tareaspre.routes') },
            { path: 'grafico', data: { breadcrumb: 'Oportunidad > Reportes > Graficos' }, loadChildren: () => import('./app/pages/grafico/grafico.routes') },
            { path: 'listaopor', data: { breadcrumb: 'Oportunidad > Lista de Oportunidades' }, loadChildren: () => import('./app/pages/lista-opor/lista-opor.routes') },
          
        ]

    },
    
];
