import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { constantesApiWeb } from '../model/apiVariables';

@Injectable({ providedIn: 'root' })
export class ShareService {

    constructor(@Inject(HttpClient) private http: HttpClient) { }

  ListaProveedores(objeto: any) {
        const url = `${constantesApiWeb.ListaProveedores}`;
        return this.http.post<any>(url, objeto)
    }

    obtenerItemsTabla(id:number) {
        const url = `${constantesApiWeb.lstItemsTabla}${id}`;
        return this.http.get<any>(url);
    }
    
}
