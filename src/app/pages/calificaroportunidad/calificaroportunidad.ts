import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { PRIMENG_MODULES } from '../shared/primeng_modules';
import { CProgressSpinnerComponent } from '../shared/c-progress-spinner/c-progress-spinner.component';
import { mensajesSpinner } from '../model/constantes';
import { UtilitariosService } from '../service/utilitarios.service';
import { LeadService } from '../lead/lead.services';

@Component({
    selector: 'app-calificaroportunidad',
    imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
    templateUrl: './calificaroportunidad.html',
    standalone: true,
    providers: [MessageService, UtilitariosService, LeadService]
})
export class CalOportunidad implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    @Input() IS_Data: any;
    @Output() OB_back = new EventEmitter<boolean>();

    blockedDocument = signal(false);
    mensajeSpinner = mensajesSpinner.msjRecuperaLista;

    notas: Record<string, string> = {
        problema: '',
        proyecto: '',
        presupuesto: '',
        prioridad: '',
        plazos: '',
        proceso: '',
        competencia: ''
    };

    fec_decision: Date | null = null;
    fec_inicio: Date | null = null;
    fec_fin: Date | null = null;

    personas = signal<any[]>([]);
    personaEditando: any = null;
    dlgPersona = false;

    rolesOpciones = [
        { label: 'Decisor', value: 'Decisor' },
        { label: 'Usuario', value: 'Usuario' },
        { label: 'Recomendador Técnico', value: 'RT Recomen. Tecnico' },
        { label: 'Influenciador', value: 'Influenciador' },
        { label: 'Sponsor', value: 'Sponsor' },
        { label: 'Coach', value: 'Coach' }
    ];

    consignas: Record<string, { preguntas: string[] }> = {
        problema: {
            preguntas: ['¿Cuál es el problema/desafío de negocios del cliente que está resolviendo con la solución presentada?', '¿Realmente lo conozco? ¿Estamos seguros?']
        },
        personas: {
            preguntas: ['¿Cuáles son los Roles involucrados que usted conoce en este proyecto?', 'Roles: Decisor, Usuario, Recomendador Técnico, Influenciador, Sponsor, Coach']
        },
        proyecto: {
            preguntas: ['¿Hay una RFI, RFQ, RFP?', '¿Hay algún instrumento oficial del Cliente (nota, presentación, comunicación) que soporte esta iniciativa?']
        },
        presupuesto: {
            preguntas: ['¿El cliente ha asignado presupuesto al proyecto?', '¿Conocemos cuánto dinero tienen destinado? ¿Lo suponemos?', 'Si no existe: ¿se lo puede obtener? ¿Hay autorización para gastarlo?']
        },
        prioridad: {
            preguntas: ['¿Cuál es el impacto en el negocio del cliente SI SE IMPLEMENTA esta solución? (Cuantitativos y/o Cualitativos)', '¿Cuál es el impacto en el negocio del cliente si NO se implementa ninguna solución?']
        },
        plazos: {
            preguntas: ['¿Cuándo se va a tomar una decisión por este proyecto? ¿Usted hizo la pregunta directa?', '¿Cuándo se va a implementar? ¿Está la información verificada?', '¿Cuándo debe estar funcionando? ¿Tiene la información verificada?']
        },
        proceso: {
            preguntas: ['¿Cómo se resuelve internamente la decisión de cada proyecto que estamos analizando?', 'Revisar los Roles y el Organigrama. ¿Tiene acceso al Decisor?']
        },
        competencia: {
            preguntas: [
                '¿Con quiénes competimos? ¿Es un cliente nuevo o existente?',
                '¿Sabemos cómo se mueve la competencia? ¿Sabemos a qué niveles se está moviendo?',
                '¿Cuáles son nuestros diferenciadores? ¿Cuáles son los diferenciadores de la competencia?'
            ]
        }
    };
    nomoportunidad!: string;
    nomcliente!: string;
    oportunidad: any;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private leadService: LeadService,
    ) {}

    ngOnInit() {
        this.oportunidad = this.IS_Data.dato;
        console.log('this.oportunidad...', this.oportunidad);
        this.nomoportunidad = this.oportunidad.title;
        this.nomcliente = this.oportunidad.razonsocial;
        // this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        //     this.idoportunidad = +params['idoportunidad'] || 0;
        //     this.nomOportunidad = params['nomoportunidad'] || '';
        //     if (this.idoportunidad > 0) {
        //         this.cargarDatos();
        //     }
        // });
        this.oportunidadTraerUno();
    }

    setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

    cargarDatos() {
        // TODO: cargar datos N1 desde API
    }

    guardarSeccion(seccion: string) {
        // TODO: llamar API para guardar sección
        this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: `Sección guardada correctamente`
        });
    }

    abrirDlgPersona(persona?: any) {
        this.personaEditando = persona ? { ...persona } : { idpersona: 0, nombre: '', cargo: '', rol: '', perfil: '', agenda_personal: '' };
        this.dlgPersona = true;
    }

    confirmarPersona() {
        if (!this.personaEditando) return;
        const lista = [...this.personas()];
        if (this.personaEditando.idpersona === 0) {
            this.personaEditando.idpersona = Date.now();
            lista.push({ ...this.personaEditando });
        } else {
            const idx = lista.findIndex((p) => p.idpersona === this.personaEditando.idpersona);
            if (idx >= 0) lista[idx] = { ...this.personaEditando };
        }
        this.personas.set(lista);
        this.dlgPersona = false;
        this.personaEditando = null;
    }

    eliminarPersona(persona: any) {
        this.personas.set(this.personas().filter((p) => p.idpersona !== persona.idpersona));
    }

    getBack() {
        this.OB_back.emit(true);
    }

    oportunidadTraerUno() {
        this.setSpinner(true);
        this.mensajeSpinner = 'Cargando información de la oportunidad...!';

        this.leadService.oportunidadTraeruno(this.oportunidad.id).subscribe({
            next: (rpta: any) => {
                this.setSpinner(false);
                console.log('oportunidadTraerUno', rpta);

                this.notas['problema'] = rpta.description;
                this.personas.set(rpta.contactos);
                this.notas['proyecto'] = rpta.justificacion;
                this.notas['prioridad'] = rpta.desprioridad;
                this.notas['proceso'] = rpta.desproceso;
                this.notas['competencia'] = rpta.descompetencia;
            },
            error: (err) => {
                this.setSpinner(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error...',
                    detail: err.message
                });
            },
            complete() {}
        });
    }
}
