import { Routes } from '@angular/router';
import { Oportunidad } from './oportunidad/oportunidad';


export default [
    { path: 'oportunidad', component: Oportunidad },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
