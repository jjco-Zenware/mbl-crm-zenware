import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class SwalService {
  public async confirmarQuestion(text: string): Promise<boolean> {
    const result = await Swal.fire({
      title: "Estimado usuario.",
      text,
      icon: "warning",
      backdrop: true,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No",
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
    return result.isConfirmed;
  }

  public showInfo(message: string): void {
    Swal.fire({
      title: 'Aviso',
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      },
      buttonsStyling: true,
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      allowEnterKey: true
    });
  }

  public showSuccess(message: string): void {
    Swal.fire({
      title: 'Exito',
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
  }

  public showWarning(message: string): void {
    Swal.fire({
      title: 'Aviso',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
  }

  public showError(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
  }

  async confirmarInput(message: string): Promise<string | null> {
    const result = await Swal.fire({
      title: message,
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  }

  /**
   * Muestra un modal de carga con título y texto personalizable
   */
  public mostrarModalCarga(titulo: string = 'Procesando...', texto: string = 'Por favor espere...'): void {
    Swal.fire({
      title: titulo,
      text: texto,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      },
      didOpen: () => Swal.showLoading()
    });
  }

  /**
   * Muestra un modal de verificación de campo con contenido HTML
   */
  public async mostrarModalVerificacionCampo(): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Verificación de Campo',
      html: `
        <div class="text-left">
          <p class="mb-3">🎯 <strong>Modo de alta precisión activado</strong></p>
          <p class="mb-2">📱 Se requiere dispositivo móvil con GPS</p>
          <p class="mb-2">🔍 Precisión objetivo: ±15 metros</p>
          <p class="mb-2">🔄 Hasta 3 intentos automáticos</p>
          <p class="text-yellow-600">⚠️ Manténgase en exterior para mejor precisión</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Iniciar Verificación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      allowOutsideClick: false,
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
    return result.isConfirmed;
  }

  /**
   * Muestra un modal de progreso para verificación de campo
   */
  public mostrarModalProgresoVerificacion(tienePermisos: boolean): void {
    const textoEstado = tienePermisos ?
      '🔍 Verificando ubicación con máxima precisión...' : 
      '🔍 Esperando permisos de ubicación...';
    
    Swal.fire({
      title: 'Verificación de Campo',
      html: `
        <div class="text-center">
          <div class="mb-4">
            <div class="inline-flex items-center px-4 py-2 bg-green-100 rounded-lg">
              <span class="text-green-800">${textoEstado}</span>
            </div>
          </div>
          <p class="text-sm text-gray-600">Intento <span id="attempt-counter">1</span> de 3</p>
          ${!tienePermisos ? '<p class="text-xs text-orange-600 mt-2">Se solicitarán permisos de ubicación</p>' : ''}
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Muestra información detallada con formato HTML
   */
  public mostrarInformacionDetallada(titulo: string, contenidoHtml: string, icono: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    Swal.fire({
      title: titulo,
      html: contenidoHtml,
      icon: icono,
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
  }

  /**
   * Muestra resultado de verificación de campo exitosa
   */
  public mostrarExitoVerificacionCampo(
    latitud: number, 
    longitud: number, 
    precision: number, 
    nivel: string, 
    intentos: number
  ): void {
    const nivelTexto = this.obtenerTextoNivelVerificacion(nivel);
    
    Swal.fire({
      title: '🎯 Verificación Exitosa',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>📍 Coordenadas:</strong> ${latitud}, ${longitud}</p>
          <p class="mb-2"><strong>📏 Precisión:</strong> ±${Math.round(precision)} metros</p>
          <p class="mb-2"><strong>🎚️ Nivel:</strong> ${nivelTexto}</p>
          <p class="mb-2"><strong>🔄 Intentos:</strong> ${intentos}</p>
          <p class="text-green-600 text-sm mt-3">✅ Ubicación verificada para trabajo de campo</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#10b981',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
  }

  /**
   * Muestra resultado de verificación de campo fallida
   */
  public mostrarErrorVerificacionCampo(mensaje: string, precision?: number, intentos?: number): void {
    let contenidoHtml = `<p class="mb-3">${mensaje}</p>`;
    
    if (precision && intentos) {
      contenidoHtml += `
        <div class="text-left text-sm text-gray-600">
          <p><strong>Mejor precisión obtenida:</strong> ±${Math.round(precision)} metros</p>
          <p><strong>Intentos realizados:</strong> ${intentos}</p>
        </div>
      `;
    }
    
    contenidoHtml += `
      <div class="mt-4 p-3 bg-orange-50 rounded-lg">
        <p class="text-sm text-orange-800">
          💡 <strong>Sugerencias:</strong><br>
          • Usar dispositivo móvil con GPS<br>
          • Salir al exterior para mejor señal<br>
          • Verificar que GPS esté activado
        </p>
      </div>
    `;

    Swal.fire({
      title: '⚠️ Verificación Incompleta',
      html: contenidoHtml,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      customClass: {
        container: 'swal-overlay',
        popup: 'swal-modal'
      }
    });
  }

  /**
   * Cierra cualquier modal de SweetAlert2 que esté abierto
   */
  public cerrarModal(): void {
    Swal.close();
  }

  /**
   * Obtiene texto descriptivo del nivel de verificación
   */
  private obtenerTextoNivelVerificacion(nivel: string): string {
    const niveles: Record<string, string> = {
      'excellent': '🟢 Excelente (≤5m)',
      'good': '🟡 Bueno (≤15m)',
      'acceptable': '🟠 Aceptable (≤30m)',
      'poor': '🔴 Pobre (>30m)',
      'failed': '❌ Fallido'
    };
    return niveles[nivel] || nivel;
  }

}