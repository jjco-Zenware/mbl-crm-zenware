import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';


export default [
    { path: 'dashboard', component: Dashboard },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
