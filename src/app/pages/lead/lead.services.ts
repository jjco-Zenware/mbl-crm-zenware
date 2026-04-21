import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, EventEmitter } from '@angular/core';
import { constantesApiWeb } from '../model/apiVariables';
import { constantesLocalStorage } from '../model/constantes';
import { I_RespuestaProceso } from '../model/interfaces';

@Injectable({ providedIn: 'root' })
export class LeadService {
    constructor(@Inject(HttpClient) private http: HttpClient) {}

    $emitter = new EventEmitter();

    obtenerClientes(tipoRol: string) {
        const url = `${constantesApiWeb.kanbanListaClientes}${tipoRol}`;
        return this.http.get<any>(url);
    }

    OportunidadesLista(objeto: any) {
        const url = `${constantesApiWeb.OportunidadListar}`;
        return this.http.post<any>(url, objeto);
    }

    obtenerItemsTabla(id: number) {
        const url = `${constantesApiWeb.lstItemsTabla}${id}`;
        return this.http.get<any>(url);
    }

    newProyecto(objeto: any) {
        const url = `${constantesApiWeb.newProyecto}`;
        return this.http.post<any>(url, objeto);
    }

    oportunidadTraeruno(idportunidad: string) {
        const url = `${constantesApiWeb.kanbanOportunidadUno}${idportunidad}`;
        return this.http.get<any>(url);
    }

    listarTipoProducto() {
        const url = `${constantesApiWeb.listatipoproducto}`;
        return this.http.get<any>(url);
    }

    obtenerMonedas() {
        const url = `${constantesApiWeb.kanbanListaMonedas}`;
        return this.http.get<any>(url);
    }

    listarPreventa() {
        const url = `${constantesApiWeb.kanbanListaPreVenta}`;
        return this.http.get<any>(url);
    }

    obtenerMarcas() {
        const url = `${constantesApiWeb.lstMarca}`;
        return this.http.get<any>(url);
    }

    obtenerUsuarios() {
        const url = `${constantesApiWeb.kanbanListaUsuarios}`;
        return this.http.get<any>(url);
    }

    obtenerContactos(idCliente: string) {
        const url = `${constantesApiWeb.kanbanListaContactosOpor}${idCliente}`;
        return this.http.get<any>(url);
    }

    prcClientes(objeto: any) {
        console.log('prcClientes : ', objeto);
        const url = `${constantesApiWeb.prcClientes}`;
        return this.http.post<any>(url, objeto);
    }

    prcCard(objeto: any, listId: string) {
        let objectParam = {
            oportunidad: objeto,
            idusuario: constantesLocalStorage.idusuario,
            idlista: listId
        };
        console.log('Registrando...', objectParam, 'IdLista', listId);
        const url = `${constantesApiWeb.kanbanCard}`;
        console.log('updateCard : ', url);
        return this.http.post<any>(url, objectParam);
    }

    enviarCorreoAsignacion(idportunidad: string) {
        const url = `${constantesApiWeb.enviarCorreoAsignacion}${idportunidad}`;
        return this.http.get<any>(url);
    }

    listarArchivos(idOportunidad: string) {
        const url = `${constantesApiWeb.listaArchivos}${idOportunidad}`;
        return this.http.get<any>(url);
    }

    subirArchivo(objeto: any) {
        console.log('subirArchivo...', objeto);
        const url = `${constantesApiWeb.uploadfile}`;
        return this.http.post<any>(url, objeto);
    }

    ListarAdjuntoProc(objeto: any) {
        const url = `${constantesApiWeb.listarAdjuntoProc}`;
        return this.http.post<any>(url, objeto);
    }

    eliminarArchivo(objeto: any) {
        const url = `${constantesApiWeb.eliminaradjunto}`;
        return this.http.post<I_RespuestaProceso>(url, objeto);
    }

    downloadArchivo(objeto: any) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8'
            //Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = `${constantesApiWeb.descargaradjunto}`;
        return this.http.post(url, objeto, {
            headers: headers,
            observe: 'response',
            responseType: 'blob'
        });
    }

    obtenerTipoDocumento(idtabla: number) {
        const url = `${constantesApiWeb.listaTipoDocumento}${idtabla}`;
        return this.http.get<any>(url);
    }

    editarArchivo(objeto: any) {
        const url = `${constantesApiWeb.editarAdjunto}`;
        return this.http.post<any>(url, objeto);
    }

    OportunidadesPlanAccion(objeto: any) {
        const url = `${constantesApiWeb.OportunidadesPlanAccion}`;
        return this.http.post<any>(url, objeto);
    }

    prcPlanAccion(objeto: any) {
        const url = `${constantesApiWeb.prcPlanAccion}`;
        return this.http.post<any>(url, objeto);
    }

    gettipocambiodia(objeto: any) {
        const url = `${constantesApiWeb.gettipocambiodia}`;
        return this.http.post<any>(url, objeto);
    }

    calificaroport(id: number) {
        const url = `${constantesApiWeb.calificaroport}${id}`;
        return this.http.get<any>(url);
    }

    listLeadPreventa(objeto: any) {
        const url = `${constantesApiWeb.listLeadPreventa}`;
        return this.http.post<any>(url, objeto);
    }

    listTareaOport(objeto: any) {
        const url = `${constantesApiWeb.listTareaOport}`;
        return this.http.post<any>(url, objeto);
    }

    tareaPrc(objeto: any) {
        const url = `${constantesApiWeb.tareaPrc}`;
        return this.http.post<any>(url, objeto);
    }

    completarTarea(objeto: any) {
        const url = `${constantesApiWeb.completarTarea}`;
        return this.http.post<any>(url, objeto);
    }

    tareaPrcAsignado(objeto: any) {
        const url = `${constantesApiWeb.tareaPrcAsignado}`;
        return this.http.post<any>(url, objeto);
    }
}
