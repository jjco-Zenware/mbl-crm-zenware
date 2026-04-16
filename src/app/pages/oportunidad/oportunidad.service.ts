import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, EventEmitter } from '@angular/core';
import { constantesApiWeb } from '../model/apiVariables';
import { globalVariable } from '../model/constantes';

@Injectable({ providedIn: 'root' })
export class OportunidadService {
    constructor(@Inject(HttpClient) private http: HttpClient) {}
    $emitter = new EventEmitter();

    ListaProveedores(objeto: any) {
        const url = `${constantesApiWeb.ListaProveedores}`;
        return this.http.post<any>(url, objeto);
    }

    listarOportxCliente(objeto: any) {
        const url = `${constantesApiWeb.listarOportxCliente}`;
        return this.http.post<any>(url, objeto);
    }

    listarUsuariosxPerfil(idperfil: any) {
        const url = `${constantesApiWeb.kanbanListaUsuarioxPerfil}${idperfil}`;
        return this.http.get<any>(url);
    }

    listaOportunidad(objeto: any) {
        const url = `${constantesApiWeb.listaOportunidad}`;
        return this.http.post<any>(url, objeto);
    }

    listaTareas(objeto: any) {
        const url = `${constantesApiWeb.listaGestionTareas}`;
        return this.http.post<any>(url, objeto);
    }

    listaAcciones(objeto: any) {
        const url = `${constantesApiWeb.listaGestionAcciones}`;
        return this.http.post<any>(url, objeto);
    }

    listaAccionesxMes(objeto: any) {
        const url = `${constantesApiWeb.listaAccionesxMes}`;
        return this.http.post<any>(url, objeto);
    }

    TraerUnoAcciones(objeto: any) {
        const url = `${constantesApiWeb.accionestraeruno}`;
        return this.http.post<any>(url, objeto);
    }

     procesarTrxKanban(objeto:any) {
        const url = `${constantesApiWeb.procesarTrxKanban}`;
            return  this.http.post<any>(url, objeto)
    }

     obtenerMarcas() {
        const url = `${constantesApiWeb.lstMarca}`;
        return this.http.get<any>(url);
    }

    newProyecto(objeto:any) {
        const url = `${constantesApiWeb.newProyecto}`;
        return  this.http.post<any>(url, objeto)
    }

     obtenerItemsTabla(id:number) {
        const url = `${constantesApiWeb.lstItemsTabla}${id}`;
        return this.http.get<any>(url);
    }

    listarCasoNegocio(objeto: any) {
        const url = `${constantesApiWeb.listarCasoNegocio}`;
        return this.http.post<any>(url, objeto);
    }

    procesarQuoteItem(objeto:any) {
        const url = `${constantesApiWeb.procesarQuoteItem}`;
            return  this.http.post<any>(url, objeto)
    }

    listarCotizacionUno(idcotiza:number) {
        const url = `${constantesApiWeb.lstCotizacionUno}${idcotiza}`;
        return this.http.get<any>(url);
    }

    ListaClientes(objeto: any) {
        const url = `${constantesApiWeb.ListaClientes}`;
        return this.http.post<any>(url, objeto)
    }

    obtenerMonedas() {
        const url = `${constantesApiWeb.kanbanListaMonedas}`;
        return this.http.get<any>(url);
    }

    prcDashboard2(objeto:any) {
        const url = `${constantesApiWeb.prcdashboard2}`;
        return  this.http.post<any>(url, objeto)
    }

    listarCotizaciones(idOportunidad:string) {
        const url = `${constantesApiWeb.lstCotizacion}${idOportunidad}`;
        return this.http.get<any>(url);
    }

    
    obtenerMontoOportunidad(idOportunidad:string) {
        const url = `${constantesApiWeb.obtenerMonto}${idOportunidad}`;
        return this.http.get<any>(url);
    }

    procesarCotizacion(objeto:any) {
        const url = `${constantesApiWeb.prcCotizacion}`;
            return  this.http.post<any>(url, objeto)
    }

     emitirEvento(dato:any) {
        console.log('emitirEvento...', dato);

        globalVariable.codigoId =  dato;
        this.$emitter.emit(dato);
    }

    obtenerTipoProducto() {
        const url = `${constantesApiWeb.lstProducto}`;
        return this.http.get<any>(url);
    }

    procesarMarca(objeto:any) {
        const url = `${constantesApiWeb.prcMarca}`;
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

    obtenerFunnel(objeto:any) {
        const url = `${constantesApiWeb.getDataFunnel}`;
        return  this.http.post<any>(url, objeto)
    }

    oportunidadesporEstado(objeto:any) {
        const url = `${constantesApiWeb.oportunidadesporEstado}`;
        return  this.http.post<any>(url, objeto)
    }

    obtenerDataDasboard(objeto:any) {
        const url = `${constantesApiWeb.obtenerDataDasboard}`;
        return  this.http.post<any>(url, objeto)
    }

    prcDashboard(objeto:any) {
        const url = `${constantesApiWeb.prcdashboard}`;
        return  this.http.post<any>(url, objeto)
    }

     descargarExcel(archivo: any, nombreArchivo: string) {
        const mediaType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([archivo], {
          type: mediaType,
        });
        const fileName = nombreArchivo;
    
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.target = '_blank';
        a.click();
    
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      }

      exportarexcelOportunidades(objeto:any) {
        const url = `${constantesApiWeb.exportarexcelOportunidades}`;
        return  this.http.post<any>(url, objeto)
    }

     oportunidadextList(codigo:number, usuario:number) {
        const url = `${constantesApiWeb.oportunidadextList}${codigo}/${usuario}`;
        return this.http.get<any>(url)
    }

    listaTareas10(objeto: any) {
        const url = `${constantesApiWeb.listaGestionTareas10}`;
        return this.http.post<any>(url, objeto);
    }

    obtenerFunnel5(objeto:any) {
        const url = `${constantesApiWeb.getDataFunnel5}`;
        return  this.http.post<any>(url, objeto)
    }

    listaOportunidadAccion(objeto: any) {
        const url = `${constantesApiWeb.listaOportunidadAccion}`;
        return this.http.post<any>(url, objeto);
    }
}
