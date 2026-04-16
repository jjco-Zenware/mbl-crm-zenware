import { Component, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Subscription } from 'rxjs';
import { constantesLocalStorage, mensajesQuestion, mensajesSpinner } from '../model/constantes';
import { LeadService } from '../lead/lead.services';
import { UtilitariosService } from '../service/utilitarios.service';
import { MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { OportunidadService } from '../oportunidad/oportunidad.service';
import { CModalAgendaComponent } from './modalagenda/c-modalagenda.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-agenda',
    imports: [CProgressSpinnerComponent, PRIMENG_MODULES, FullCalendarModule],
    templateUrl: './agenda.html',
    standalone: true,
    providers: [DialogService]
})
export class Agenda {
    $listSubcription: Subscription[] = [];
    mensajeSpinner: string = 'Cargando...!';
    blockedDocument = signal(false);
    lstAcciones = signal<any[]>([]);
    events: any;
    desde: any;
    hasta: any;
    @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
    periodo: any;

    constructor(
        private utilitariosService: UtilitariosService,
        private messageService: MessageService,
        private leadService: LeadService,
        private oportunidadService: OportunidadService,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.periodo = this.utilitariosService.obtenerFechaInicioMes();
        this.desde = this.utilitariosService.obtenerFechaInicioMes();
        this.hasta = this.utilitariosService.obtenerFechaFinMes();
        this.getBuscar();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: esLocale,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true,
        editable: true,
        showNonCurrentDates: false, // 👈 oculta días fuera del mes
        fixedWeekCount: false, // 👈 evita que siempre muestre 6 semanas
        eventClick: (info) => {
            console.log('info.description...', info.event._def.extendedProps['description']);
            console.log('info...', info.event);
            this.mostrarAccion(info.event._def.extendedProps['description']);
        },
        datesSet: (arg) => {
            this.onDateChange(arg);
        },
        displayEventTime: false
        // events: [
        //     { title: 'Reunión', date: '2026-01-10' },
        //     { title: 'Demo Zenware', date: '2026-01-12' }
        // ]
    };

    onDateChange(arg: any) {
        const start = arg.start;
        const end = arg.end;
        // Aquí puedes:
        // - Llamar a tu API
        // - Recargar eventos
        // - Actualizar filtros
        // - Ejecutar lógica de negocio

        console.log('Cambio detectado', arg);
        //this.changePeriodo(arg.start);
        this.periodo = arg.start;
    }

    ngOnDestroy() {
        if (this.$listSubcription != undefined) {
            this.$listSubcription.forEach((sub) => sub.unsubscribe());
        }
    }

    getBuscar() {
        this.setSpinner(true);
        this.mensajeSpinner = mensajesSpinner.msjRecuperaLista;
        let _eventos: any[] = [];
        this.lstAcciones.set([]);

        const objeto = {
            fechaini: this.desde,
            fechafin: this.hasta,
            idusuario: constantesLocalStorage.idusuario,
            idcliente: 0,
            idoportunidad: 0
        };

        const $listaTareas = this.oportunidadService.listaTareas10(objeto).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('rpta listaAgenda', rpta);
                this.lstAcciones.set(rpta);

                rpta.forEach((element: any) => {
                    _eventos.push({
                        title: element.descripcion,
                        start: element.fechaini,
                        //end:  element.fechafin,

                        //description: element.desplan,
                        description: element.idtarea,
                        color: element.completo ? 'green' : 'blue'
                    });
                });

                this.events = [..._eventos];
                console.log('this.events', this.events);

                // redireccionamos el calendario a la fecha seleccionada
                let calendarApi = this.calendarComponent.getApi();
                calendarApi.gotoDate(this.periodo); // recibe string 'YYYY-MM-DD' o Date
            },
            error: (err) => {
                this.setSpinner(false);
                console.error('error : ', err);
                this.messageService.clear();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: mensajesQuestion.msgErrorGenerico
                });
            },
            complete: () => {
                this.setSpinner(false);
            }
        });
        this.$listSubcription.push($listaTareas);
    }

    changePeriodo(dato: any) {
        console.log('changePeriodo', dato);

        this.desde = this.utilitariosService.obtenerFechaInicioMesPeriodo(dato);
        this.hasta = this.utilitariosService.obtenerFechaFinMesPeriodo(dato);
        this.getBuscar();

        // redireccionamos el calendario a la fecha seleccionada
        let calendarApi = this.calendarComponent.getApi();
        calendarApi.gotoDate(dato); // recibe string 'YYYY-MM-DD' o Date
    }

    mostrarAccion(data: any) {
        console.log('mostrarAccion', data);
        let objeto = this.events.filter((item: any) => item.description === data);
        const refMensaje = this.dialogService.open(CModalAgendaComponent, {
            data: objeto,
            header: 'Detalle del Plan',//objeto[0].title,
            styleClass: 'testDialog',
            closeOnEscape: false,
            closable: true,
            width: '30%'
        });
    }
}
