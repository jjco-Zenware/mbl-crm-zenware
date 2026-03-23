import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { constantesApiWeb } from '../../model/apiVariables';
import { I_RespuestaProceso } from '../../model/interfaces';

@Injectable({ providedIn: 'root' })
export class ListatareasService {

    constructor(@Inject(HttpClient) private http: HttpClient) { }

  listaTareas(objeto:any) {
    const url = `${constantesApiWeb.listaGestionTareas}`;
      return  this.http.post<any>(url, objeto)
  }

  obtenerClientes(tipoRol:string) {
        const url = `${constantesApiWeb.obtenerClientes}${tipoRol}`;
        return this.http.get<any>(url);
    }
  
  tareaPrc(objeto:any) {
    const url = `${constantesApiWeb.tareaPrc}`;
      return  this.http.post<any>(url, objeto)
  }

  listarSubTareas(tipoRol:any) {
        const url = `${constantesApiWeb.listarSubTareas}${tipoRol}`;
        return this.http.get<any>(url);
    }

  comentarioTareaPrc(objeto:any) {
    const url = `${constantesApiWeb.comentarioTareaPrc}`;
      return  this.http.post<any>(url, objeto)
  }

  listarComentariosTareas(tipoRol:any) {
        const url = `${constantesApiWeb.listarComentariosTareas}${tipoRol}`;
        return this.http.get<any>(url);
    }
  
  comentarioTareaDel(objeto:any) {
  const url = `${constantesApiWeb.comentarioTareaDel}`;
    return  this.http.post<any>(url, objeto)
  }

  ListarAdjuntoProc(objeto: any) {
        const url = `${constantesApiWeb.listarAdjuntoProc}`;
        return this.http.post<any>(url, objeto);
    }

    listarArchivos(codigo:any) {
        const url = `${constantesApiWeb.listaArchivos}${codigo}`;
        return this.http.get<any>(url);
    }

    eliminarArchivo(objeto: any) {
        const url = `${constantesApiWeb.eliminaradjunto}`;
        return this.http.post<I_RespuestaProceso>(url, objeto);
    }

    downloadArchivo(objeto: any) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          });

          const url = `${constantesApiWeb.descargaradjunto}`;
          return this.http.post(url,objeto, {
            headers: headers,
            observe: 'response',
            responseType: 'blob'
          })
    }

    subirArchivo(objeto: any) {
        const url = `${constantesApiWeb.uploadfile}`;
        return this.http.post<any>(url, objeto);
    }

    editarArchivo(objeto: any) {
        const url = `${constantesApiWeb.editarAdjunto}`;
        return this.http.post<any>(url, objeto);
    }

     ListaProveedores(objeto: any) {
        const url = `${constantesApiWeb.ListaProveedores}`;
        return this.http.post<any>(url, objeto)
    }

    listarOportxCliente(objeto: any) {
        const url = `${constantesApiWeb.listarOportxCliente}`;
        return this.http.post<any>(url, objeto)
    }

    listaAgenda(objeto:any) {
    const url = `${constantesApiWeb.listaGestionAgenda}`;
      return  this.http.post<any>(url, objeto)
  }

  listarUsuariosxPerfil(idperfil:any) {
        const url = `${constantesApiWeb.kanbanListaUsuarioxPerfil}${idperfil}`;
        return this.http.get<any>(url);
    }

  listaTareasExcel(objeto:any) {
    const url = `${constantesApiWeb.listaTareasExcel}`;
      return  this.http.post<any>(url, objeto)
  }

  tareaPrcActividad(objeto:any) {
    const url = `${constantesApiWeb.tareaPrcActividad}`;
      return  this.http.post<any>(url, objeto)
  }

   obtenerUsuarios() {
        const url = `${constantesApiWeb.kanbanListaUsuarios}`;
        return this.http.get<any>(url);
    }

     listaPreVentas() {
        const url = `${constantesApiWeb.kanbanListaPreVenta}`;
        return this.http.get<any>(url);
    }

    tareaAsignadoPrc(objeto:any) {
    const url = `${constantesApiWeb.tareaAsignadoPrc}`;
      return  this.http.post<any>(url, objeto)
  }

  subtareasRDLC(objeto:any) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          });

          const url = `${constantesApiWeb.subtareasRDLC}`;
          return this.http.post(url,objeto, {
            headers: headers,
            observe: 'response',
            responseType: 'blob'
          })
    }

    obtenerEtapas() {
        const url = `${constantesApiWeb.listaetapas}`;
        return this.http.get<any>(url);
    }

    prcEtapa(objeto:any) {
        const url = `${constantesApiWeb.prcEtapa}`;
            return  this.http.post<any>(url, objeto)
    }

    tareaResponsablePrc(objeto:any) {
    const url = `${constantesApiWeb.tareaResponsablePrc}`;
      return  this.http.post<any>(url, objeto)
  }

  listaTareasPrev(objeto:any) {
    const url = `${constantesApiWeb.listaGestionTareasPrev}`;
      return  this.http.post<any>(url, objeto)
  }

  tareaTraeruno(objeto:any) {
    const url = `${constantesApiWeb.tareaTraeruno}`;
      return  this.http.post<any>(url, objeto)
  }
}
