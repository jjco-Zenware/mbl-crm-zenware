import { Injectable, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, from, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilitariosService {
  fechaActual: Date;
  clipboardData: string[][] | undefined;

  constructor(
    private ngZone: NgZone
  ) {
    this.fechaActual = this.obtenerFechaActual();
  }

  obtenerFechaActual(): Date {
    return new Date();
  }

  obtenerFechaActualFormat() {
    let fecha = new Date();
    let fechaFormat =  `${fecha.getDate()}/${('0'+(fecha.getMonth()+1)).slice(-2)}/${fecha.getFullYear()}`;

        return fechaFormat;
  }

  obtenerFechaInicioMes(): Date {
    return new Date(
      this.fechaActual.getFullYear(),
      this.fechaActual.getMonth(),
      1
    );
  }

  obtenerFechaFinMes(): Date {
    return new Date(
      this.fechaActual.getFullYear(),
      this.fechaActual.getMonth() + 1,
      0
    );
  }

  obtenerFechaFinMesTotal(): Date {
    return new Date(
      this.fechaActual.getFullYear(),
      this.fechaActual.getMonth()+1,
      1
    );
  }

  obtenerMinimoFecha(fecha?: Date): Date {
    fecha =
      fecha !== null && fecha !== undefined ? fecha : this.fechaActual;
    const month = fecha.getMonth();
    const year = fecha.getFullYear();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = prevMonth === 11 ? year - 1 : year;

    let minDate = new Date();
    minDate.setMonth(prevMonth);
    minDate.setFullYear(prevYear);

    return minDate;
  }

  obtenerMaximoFecha(fecha?: Date): Date {
    fecha =
      fecha !== null && fecha !== undefined ? fecha : this.fechaActual;
    const month = fecha.getMonth();
    const year = fecha.getFullYear();
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = nextMonth === 0 ? year + 1 : year;

    let maxDate = new Date();
    maxDate.setMonth(nextMonth);
    maxDate.setFullYear(nextYear);

    return maxDate;
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

  obtenerFechaFormateado(fecha?:any): string {

    let dateOpt: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    if (fecha == null )
      return new Date().toLocaleDateString('es-PE', dateOpt);
    else
      return  new Date(Date.parse(fecha)).toLocaleDateString('es-PE', dateOpt);
  }

  obtenerHora() {
    return (
      this.obtenerFechaActual().getHours() +
      ':' +
      this.obtenerFechaActual().getMinutes()
    );
  }

  isValidFormGroup(formGroup: FormGroup): boolean {
    let n: number = 0;
    Object.values(formGroup.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
        n++;
      }
    });
    return n == 0 ? true : false;
  }

  descargarPDF(archivo: any, nombreArchivo: string) {
    const mediaType = 'application/pdf';
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

  obtenerFechaValidaRango(fecha?:any): string {

    let dateOpt: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    if (fecha == null )
      return new Date().toLocaleDateString('es-PE', dateOpt);
    else
      return  new Date(Date.parse(fecha)).toLocaleDateString('es-PE', dateOpt);
  }

  isMarkDirtyCampo(formGroup: FormGroup, control: string) {
    formGroup.controls[control].markAsDirty();
    formGroup.controls[control].updateValueAndValidity({ onlySelf: true });
  }

  soloNumeros(dato:string){
    //console.log("numerosss : ", dato)
    if (dato !== null){
      for (let index = 0; index < dato.length; index++) {
        const element = dato.charCodeAt(index);
        if (element < 48 || element > 57){
          return false;
        }
      }
    }
    return true;
  }

  eliminarLetra(dato:string):string{
    //console.log("eliminarLetra : ", dato)
    let valor:string='';
    if (dato !== null){
      for (let index = 0; index < dato.length; index++) {
        const element = dato.charCodeAt(index);
        if (element < 48 || element > 57){
          valor = dato.slice(0, index) + dato.slice(index + 1, dato.length)
        }
      }
    }
    return valor;
  }

  soloNumerosDecimales(dato:string){
    //console.log("numerosss : ", dato)
    if (dato !== null){
      for (let index = 0; index < dato.length; index++) {
        const element = dato.charCodeAt(index);
        if (element < 48 || element > 57){
          if (element != 46){
            return false;
          }
        }
      }
    }
    return true;
  }

  truncateString(dato:string, cantidad:number):string{
    return dato.length > cantidad
    ? `${dato.substring(0, cantidad)}…`
    : dato
  }

  eliminarCaracter(dato:string):string{
    let valor:string='';
    if (dato !== null){
      for (let index = 0; index < dato.length; index++) {
        valor = dato.slice(0, index) + dato.slice(index + 1, dato.length)
      }
    }
    return valor;
  }

  obtenerDatosClipboard(): Observable<string[][]> {
    return from(
      this.ngZone.runOutsideAngular(() => navigator.clipboard.readText())
    ).pipe(
      map((data) => this.actualizaDesdeClipboard(data)),
      catchError((error) => this.errorClipboard(error))
    );
  }

  private actualizaDesdeClipboard(data: string) {
    return this.ngZone.run(() => {
      this.clipboardData = this.formatearData(data);
      return this.clipboardData;
    });
  }

  formatearData(data: string): string[][] {
    const filas = data.split('\n');
    const resultado: string[][] = filas.map(fila => {
      const columnas = fila.split('\t').map(columna => columna.replace(/\r$/, ''));
      return columnas;
    });
    return resultado;
  }

  private errorClipboard(error: any) {
    return throwError(error);
  }

  formatFecha(fecha: string) {
    let mes = fecha.substring(3,5);
    let dia = fecha.substring(0,2);
    let anio = fecha.substring(6,10);

    let _fecha = anio+'/'+mes+'/'+dia;
    return _fecha;
  }

   obtenerFechaFormateadoDMA(fecha?:any){

    let dateOpt: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };


    if (fecha == null )
      return new Date().toLocaleDateString('es-PE', dateOpt);
    else
      return  new Date(Date.parse(fecha)).toLocaleDateString('es-PE', dateOpt);
  }

  getPrimerDiaDelMes(): Date {
  const year = new Date().getFullYear();
    return new Date(year, 0, 1);
}

obtenerFechaInicioMesPeriodo(fecha: Date): Date {
    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      1
    );
  }

  obtenerFechaFinMesPeriodo(fecha: Date): Date {
    return new Date(
      fecha.getFullYear(),
      fecha.getMonth() + 1,
      0
    );
  }

}
