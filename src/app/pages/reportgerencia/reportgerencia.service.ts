import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constantesApiWeb } from '../model/apiVariables';

@Injectable({
  providedIn: 'root'
})
export class ReportGerenciaService {

  constructor(private http: HttpClient) { }

    obtenerFunnel(objeto:any) {
        const url = `${constantesApiWeb.getDataFunnel}`;
        return  this.http.post<any>(url, objeto)
    }

    updateTareasDia(objeto:any) {
        const url = `${constantesApiWeb.updateTareasDia}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerUsuarios() {
        const url = `${constantesApiWeb.kanbanListaUsuarios}`;
        return this.http.get<any>(url);
    }

    prcReunion(objeto:any) {
        const url = `${constantesApiWeb.nuevaReunion}`;
            return  this.http.post<any>(url, objeto)
    }

    listarReunion(codigo:number) {
        const url = `${constantesApiWeb.listarReunion}${codigo}`;
        return  this.http.get<any>(url)
    }
    //TraerDashboardIndicadores

    TraerDashboardIndicadores(codigo:number) {
        const url = `${constantesApiWeb.TraerDashboardIndicadores}${codigo}`;
        return  this.http.get<any>(url)
    }

    obtenerDataDasboard(objeto:any) {
        const url = `${constantesApiWeb.obtenerDataDasboard}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerFunnel1(objeto:any) {
        const url = `${constantesApiWeb.getDataFunnel1}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerFunnel2(objeto:any) {
        const url = `${constantesApiWeb.getDataFunnel2}`;
        return  this.http.post<any>(url, objeto)
    }

    prcDashboard(objeto:any) {
        const url = `${constantesApiWeb.prcdashboard}`;
        return  this.http.post<any>(url, objeto)
    }

    prcDashboard2(objeto:any) {
        const url = `${constantesApiWeb.prcdashboard2}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerOportunidadNroMonto(objeto:any) {
        const url = `${constantesApiWeb.obtenerOportunidadNroMonto}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerOportunidadNroOpor(objeto:any) {
        const url = `${constantesApiWeb.obtenerOportunidadNroOpor}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerOportunidadReporte(objeto:any) {
        const url = `${constantesApiWeb.oportunidadReporte}`;
        return  this.http.post<any>(url, objeto)
    }

     oportunidadesProyectadas(objeto:any) {
        const url = `${constantesApiWeb.oportunidadesProyectadas}`;
        return  this.http.post<any>(url, objeto)
    }

    prcDocumentoDet(objeto:any) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          });

          const url = `${constantesApiWeb.prcReporteGer}`;
          return this.http.post(url,objeto, {
            headers: headers,
            observe: 'response',
            responseType: 'blob'
          })
    }

    prcDocumentoDetGen(objeto:any) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          });

          const url = `${constantesApiWeb.prcReporteGerGen}`;
          return this.http.post(url,objeto, {
            headers: headers,
            observe: 'response',
            responseType: 'blob'
          })
    }
}
