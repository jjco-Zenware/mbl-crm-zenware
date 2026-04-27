import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LeadService } from '../lead.services';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../../shared/c-progress-spinner/c-progress-spinner.component';
import { ShareService } from '../../service/serviceShare.service';
import { UtilitariosService } from '../../service/utilitarios.service';
import { SharedAppService } from '../../shared/sharedApp.service';
import { globalVariable, mensajesQuestion, respuestaProceso } from '../../model/constantes';
import { I_RespuestaProceso } from '../../model/interfaces';

@Component({
    selector: 'app-c-listado-file',
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    templateUrl: './c-listado-file.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, ShareService, SharedAppService]
})
export class CListadoFile implements OnInit, OnDestroy {
    @Input() I_CodCotiza: number = 0;
    @Input() I_Quote: number = 0;
    $listSubcription: Subscription[] = [];
    data: any;
    listadoArchivos = signal<any[]>([]);
    files: any = [];
    descripcion: FormControl = new FormControl({ value: null, disabled: false });
    tipodoc: FormControl = new FormControl({ value: null, disabled: false });
    disabUpload = signal<boolean>(true);
    ocultarDiv = signal<boolean>(true);
    lstTipoDocumento = signal<any[]>([]);

    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = 'Cargando...';
    nomTarea: string = '';

    _idnroproceso: number = 0;
    _codtipoproc: number = 0;
    _idoportunidad: number = 0;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private leadService: LeadService,
        private messageService: MessageService,
        private serviceSharedApp: SharedAppService
    ) {
        leadService.$emitter.subscribe(() => {
            this.receiveMessage();
        });
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    ngOnInit(): void {
        //console.log('this.I_CodCotiza...',this.I_CodCotiza);
        console.log('this.I_Quote...', this.I_Quote);

        // console.log('this.config.data...',this.config.data);
        this.data = this.config.data;
        console.log('this.config.data...',this.data);

        this._idnroproceso = this.data.idnroproceso;

        if (this.I_Quote === 2) {
            this.data.codtipoproc = 2;
            this.data.idoportunidad = this.data.data.idoportunidad;
            this.data.idnroproceso = this.data.data.idcotiza;
            this.data.parametro = 'B';
            this._idnroproceso = this.data.data.idcotiza
        }

        if (this.data.idindicador === 3) {
            this.ocultarDiv.set(false);
        }

        this.getValueDescrip();
        this.listaTipoDocumento();
        this.nomTarea = 'Titulo: ' + this.data.texto;
        console.log('this.data...', this.data);
        this.Listar();
    }

    Listar() {
        console.log('Parametros para listar adjuntos', this.data.codtipoproc);
        if (this.data.codtipoproc === 1) {
            this.getListaArchivos();
        } else {
            this.getListaArchivosProc();
        }
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    getListaArchivos() {
        this.setSpinner(true);
        const $listarArchivos = this.leadService.listarArchivos(this.data.idoportunidad).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                let dataTmp: any[] = [];
                rpta.forEach((item: any) => {
                    const { nombre, extension } = this.separarNombreYExtension(item.nomasset.trim());
                    const tipoArchivoLowerCase = extension.toLowerCase();
                    const extensiones = this.extensionesPorTipo[tipoArchivoLowerCase];
                    dataTmp.push({
                        ...item,
                        nombreFile: nombre,
                        extensionFile: this.asignarIconArchivo(extension),
                        colorExtFile: this.colorIconArchivo(extension)
                    });
                });
                this.listadoArchivos.set(dataTmp);
            },
            error: (err) => {
                this.setSpinner(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
        this.$listSubcription.push($listarArchivos);
    }

    getListaArchivosProc() {
        this.setSpinner(true);

        if (this.data.codtipoproc === 2) {
            // console.log('this.data.idoportunidad', globalVariable.oportunidadId);
            // console.log('this.data.codtipoproc', this.data.codtipoproc);
            // console.log('globalVariable.codigoId', globalVariable.codigoId);
            // console.log('idindicador', this.data.idindicador);

            //this.data.idoportunidad = globalVariable.oportunidadId;
            //this._idnroproceso = globalVariable.codigoId;
        }

        const objeto = {
            //idmovasset: data.idmovasset,
            idoportunidad: this.data.idoportunidad,
            codtipoproc: this.data.codtipoproc, //this.I_Quote,
            idnroproceso: this._idnroproceso //this.I_CodCotiza
        };
            console.log('getListaArchivosProc', objeto);

        const $listarArchivos = this.leadService.ListarAdjuntoProc(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                let dataTmp: any[] = [];
                rpta.forEach((item: any) => {
                    const { nombre, extension } = this.separarNombreYExtension(item.nomasset.trim());
                    const tipoArchivoLowerCase = extension.toLowerCase();
                    const extensiones = this.extensionesPorTipo[tipoArchivoLowerCase];
                    dataTmp.push({
                        ...item,
                        nombreFile: nombre,
                        extensionFile: this.asignarIconArchivo(extension),
                        colorExtFile: this.colorIconArchivo(extension)
                    });
                });
                this.listadoArchivos.set(dataTmp);
            },
            error: (err) => {
                this.setSpinner(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {}
        });
        this.$listSubcription.push($listarArchivos);
    }

    async deleteArchivo(idmovasset: number) {
        const rpta = await this.serviceSharedApp.confirmDialog({ message: '¿Desea Eliminar Adjunto?' });
        if (!rpta) return;

        const $eliminarArchivo = this.leadService.eliminarArchivo({ idmovasset }).subscribe({
            next: (rpta: I_RespuestaProceso) => {
                this.serviceSharedApp.messageToast({
                    severity: rpta.procesoSwitch == respuestaProceso.ConExito ? 'success' : 'info',
                    summary: rpta.procesoSwitch == respuestaProceso.ConExito ? 'Exito' : 'Aviso',
                    detail: rpta.mensaje
                });
                this.Listar();
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($eliminarArchivo);
    }

    async download(dato: any) {
        const rpta = await this.serviceSharedApp.confirmDialog({ message: '¿Desea Descargar Adjunto?' });
        if (!rpta) return;

        const objeto = {
            idoportunidad: dato.idoportunidad,
            urlasset: dato.urlasset
        };
        const $downloadArchivo = this.leadService.downloadArchivo(objeto).subscribe({
            next: (rpta: any) => {
                const blob = new Blob([rpta.body], { type: rpta.body.type || 'application/octet-stream' });
                const filename = dato.nomasset;

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($downloadArchivo);
    }

    onUpload(event: any, fubauto: any) {
        const formData = new FormData();
        const fechaActual = new Date();

        const dia = fechaActual.getDate().toString().padStart(2, '0');
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const año = fechaActual.getFullYear();
        const fechaFormateada = `${año}/${mes}/${dia}`;

        if (this.data.codtipoproc === 2) {
            //this._idnroproceso = globalVariable.codigoId;
        }

        this._codtipoproc = this.data.codtipoproc;
        this._idoportunidad = this.data.idoportunidad;

        console.log('this._codtipoproc...', this._codtipoproc);
        console.log('this._idnroproceso...', this._idnroproceso);
        console.log('this._idoportunidad...', this._idoportunidad);

        event.files.forEach((file: any) => {
            formData.append('idasset', '0');
            formData.append('file', file);
            formData.append('nomasset', file.name);
            formData.append('idnroproceso', this._idnroproceso.toString());
            formData.append('codtipoproc', this._codtipoproc.toString());
            formData.append('idoportunidad', this._idoportunidad.toString());
            formData.append('codtipodoc', this.tipodoc.value);
            formData.append('nrodoc', '');
            formData.append('fechadoc', fechaFormateada);
            formData.append('idusuario', '0');
            formData.append('descripcion', this.descripcion.value);
        });
        fubauto.clear();
        console.log('onUpload', formData);
        this.setSpinner(true);
        this.leadService.subirArchivo(formData).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                this.descripcion.setValue('');
                this.Listar();
                //this.getListaArchivos();
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }

    separarNombreYExtension(nombreArchivo: string): { nombre: string; extension: string } {
        const lastDotIndex = nombreArchivo.lastIndexOf('.');
        const nombre = lastDotIndex !== -1 ? nombreArchivo.substring(0, lastDotIndex) : nombreArchivo;
        const extension = lastDotIndex !== -1 ? nombreArchivo.substring(lastDotIndex + 1).toLowerCase() : '';
        return { nombre, extension };
    }

    iconosArchivo: { [key: string]: string } = {
        pdf: 'pi-file-pdf',
        excel: 'pi-file-excel',
        image: 'pi-image',
        word: 'pi-file-word',
        archive: 'pi-server',
        question: 'pi-question'
    };

    colorIconExtension: { [key: string]: string } = {
        pdf: '#D32F2F',
        excel: '#217346',
        image: '#4CAF50',
        word: '#2B579A',
        archive: '#757575',
        question: '#FFC107'
    };

    extensionesPorTipo: { [key: string]: string[] } = {
        pdf: ['pdf'],
        excel: ['xls', 'xlsx', 'xlsm', 'xlsb', 'csv'],
        image: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'],
        word: ['doc', 'docx', 'rtf'],
        archive: ['zip', 'rar', '7z', 'tar']
    };

    asignarIconArchivo(extension: string): string {
        const tipoArchivo = Object.keys(this.extensionesPorTipo).find((tipo) => this.extensionesPorTipo[tipo].includes(extension));

        if (tipoArchivo) {
            return this.iconosArchivo[tipoArchivo] || '';
        }

        return this.iconosArchivo['question'] || '';
    }

    colorIconArchivo(extension: string): string {
        const tipoArchivo = Object.keys(this.extensionesPorTipo).find((tipo) => this.extensionesPorTipo[tipo].includes(extension));

        if (tipoArchivo) {
            return this.colorIconExtension[tipoArchivo] || '';
        }

        return this.colorIconExtension['question'] || '';
    }

    getValueDescrip() {
        this.descripcion.valueChanges.subscribe((value) => {
            if (value.length > 4) {
                this.disabUpload.set(false);
            }
        });
    }

    listaTipoDocumento() {
        let idtabla = 101;
        const $listaTipo = this.leadService.obtenerTipoDocumento(idtabla).subscribe({
            next: (rpta: any) => {
                console.log('listaTipoDocumento...', rpta);
                this.lstTipoDocumento.set(rpta);
            },
            error: (err) => {
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
        this.$listSubcription.push($listaTipo);
    }

    editarRegistro(data: any) {
        this.mensajeSpinner = 'Actualizando...';
        console.log('editarRegistro...', data);
        this.setSpinner(true);

        let object = {
            idmovasset: data.idmovasset,
            detalleasset: data.descripcion
        };
        this.leadService.editarArchivo(object).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta...', rpta);
                this.descripcion.setValue('');
                //this.getListaArchivos();
                this.Listar();
            },
            error: (err) => {
                this.setSpinner(false);
                this.serviceSharedApp.messageToast();
            },
            complete: () => {}
        });
    }

    receiveMessage() {
        console.log('receiveMessage :  ', globalVariable.codigoId);
        this._idnroproceso = globalVariable.codigoId;
    }
}
