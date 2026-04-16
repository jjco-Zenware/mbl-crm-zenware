import { environment } from "@/environments/environment.development";



const webApi = environment.webAPI;

const controllerLogin: string = webApi+'Login';
const controllerSeguridad: string = webApi+'Seguridad';
const controllerCRM: string = webApi+'Crm';
const controllerMain: string = webApi+'Main';
const controllerComercial: string = webApi+'Comercial';
const controllerArchivo: string = webApi+'Archivo';
const controllerUsuario: string = webApi+'Usuario';
const controllerContabilidad: string = webApi+'Contabilidad';

export const constantesApiWeb = {
    validausuario: controllerLogin + '/validausuario',
    validaNombreUsuario: controllerLogin + '/validanombreusuario',
    validarloginAzure: controllerLogin + '/validarloginAzure',
    opcionesperfilusuario: controllerSeguridad + '/opcionesperfilusuario',
    kanbanList: controllerCRM + '/kanban4',
    kanbanCard: controllerCRM + '/oportunidadprc',
    kanbanCardLista: controllerCRM + '/oportunidadlistaprc',
    kanbanCardDelete: controllerCRM + '/oportunidaddel',

    kanbanListaClientes: controllerCRM + '/personalist/',
    kanbanListaMonedas: controllerCRM + '/monedalist',

    kanbanListaUsuarios: controllerCRM + '/usuariolist',
    kanbanListaContactos: controllerCRM + '/contactolist/',
    kanbanListaContactosOpor: controllerCRM + '/contactolistoportunidad/',

    kanbanOportunidadUno: controllerCRM + '/oportunidadtraeruno/',
    kanbanOportunidadListar: controllerCRM + '/oportunidadlist',

    listaTareas: controllerCRM + '/dashboardtareaslist',
    getDataFunnel: controllerCRM + '/oportunidadfunnnel2',
    listaTareasDia: controllerCRM + '/tarealistardashboard',
    updateTareasDia: controllerCRM + '/tareaupd',

    Listakanban: controllerCRM + '/listakan',
    ListakanbanEdit: controllerCRM + '/listakanbanprc',
    TraerUnokanban: controllerCRM + '/listakanbantraeruno/',

    PrcContactos: controllerCRM + '/contactoprc/',
    vigenciaContactos: controllerCRM + '/contactovigencia/',
    ListaClientes: controllerMain + '/personalistar',
    prcClientes: controllerMain + '/personaprc',
    procesarTrx: controllerMain + '/prctrx',
    procesarTrxKanban: controllerMain + '/prctrxkanban',

    kanbanListaPreVenta: controllerCRM + '/listaruserpreventa',
    nuevaReunion: controllerCRM + '/reunionnew',
    listarReunion: controllerCRM + '/reunionlistar/',
    listarCasoNegocio: controllerCRM + '/casonegociotraeruno/',
    procesarQuoteItem: controllerCRM + '/quoteitemupd',

    prcCotizacion: controllerComercial + '/cotizacionprc',
    lstCotizacion: controllerComercial + '/cotizacionoportunidadlist/',
    lstMarca: controllerComercial + '/marcalist',
    lstProducto: controllerComercial + '/tipoproductolist',

    uploadfile: controllerArchivo + '/uploadfile/',
    descargaradjunto: controllerArchivo + '/descargaradjunto/',
    listaArchivos: controllerArchivo + '/ListarFile/',
    eliminaradjunto: controllerArchivo + '/eliminaradjunto/',
    editarAdjunto: controllerArchivo + '/editaradjunto/',
    listarAdjuntoProc: controllerArchivo + '/listaradjuntoproc/',

    TraerDashboardIndicadores: controllerCRM + '/traerdashboardindicadores/',
    listaTipoDocumento: controllerMain + '/listaritems/',
    obtenerMonto: controllerComercial + '/CalculaTotalQuotes/',
    prcMarca: controllerComercial + '/marcaprc',
    lstCotizacionUno: controllerComercial + '/cotizaciontraeruno/',

    obtenerDataDasboard: controllerCRM + '/oportunidadlist02',
    getDataFunnel1: controllerCRM + '/oportunidadfunnnel3',
    getDataFunnel2: controllerCRM + '/oportunidadfunnnel4',
    getDataFunnel5: controllerCRM + '/oportunidadfunnnel5',

    kanbanListaUsuarioxPerfil: controllerCRM + '/listarusuariosperfil/',

    prcdashboard: controllerCRM + '/prcdashboard',
    prcdashboard2: controllerCRM + '/prcdashboard2',
    
    lstItemsTabla: controllerMain + '/listaritems/',

    fotocloudinary: controllerSeguridad + '/fotocloudinary/',
    TraerUnoUsuario: controllerUsuario + '/traerUnoUsuario/',
    GuardarUsuarioPerfil: controllerUsuario + '/actualizarUsuarioPerfilPersonal/',
    ListarNotificacion: controllerMain + '/notificacionlistar2/',
    NotificacionPrc: controllerMain + '/notificacionprc/',

    
    Cambioclaveuserapp: controllerSeguridad + '/cambioclaveuserapp/',
    newProyecto: controllerComercial + '/proyectonew',

    exportarexcelOportunidades: controllerMain + '/exportarexcelOportunidades',
    obtenerClientes: controllerCRM + '/personalist/',
    listaGestionTareas: controllerCRM + '/tareaslist',
    tareaPrc: controllerCRM + '/tareaprc',
    completarTarea: controllerCRM + '/tareacompletar',
    listarSubTareas: controllerCRM + '/listarsubtareas/',
    comentarioTareaPrc: controllerCRM + '/comentariotareaprc',
    listarComentariosTareas: controllerCRM + '/listarcomentariotareas/',
    comentarioTareaDel: controllerCRM + '/comentariotareadel',
    
    
    
    listarOportxCliente: controllerCRM + '/oportunidadporcliente',
    enviarCorreoAsignacion: controllerCRM + '/enviarcorreoasignacion/',
    gettipocambiodia: controllerContabilidad + '/gettipocambiodia/',
    listaGestionAgenda: controllerCRM + '/agendalist',

    oportunidadextList: controllerCRM + '/oportunidadextlist/',
    lstCantTareas: controllerCRM + '/listcanttareas',
    listaTareasExcel: controllerCRM + '/tareaslistexcel',
    tareaPrcActividad: controllerCRM + '/tareaprcactividad',
    tareaAsignadoPrc: controllerCRM + '/tareaasignadoprc',

    subtareasRDLC: controllerMain + '/subtareasrdlc',
    listaetapas: controllerComercial + '/etapalist',
    prcEtapa: controllerComercial + '/etapaprc',
    listatipoproducto: controllerCRM + '/tipoproductolist',
    tareaResponsablePrc: controllerCRM + '/tarearesponsableprc',

    oportunidadesporEstado: controllerCRM + '/oportunidadlist05',


    ListaProveedores: controllerMain + '/personalistar',
    OportunidadListar: controllerCRM + '/oportunidadlist06',
    OportunidadesPlanAccion: controllerCRM + '/oportunidadplanaccion',
    prcPlanAccion: controllerCRM + '/planaccionprc',

    listaGestionAcciones: controllerCRM + '/accioneslist',
    listaAccionesxMes: controllerCRM + '/accioneslistxmes',
    accionestraeruno: controllerCRM + '/accionestraeruno',
    getUserSession: controllerCRM + '/usersessionlist/',

    obtenerOportunidadNroMonto: controllerCRM + '/oportunidadnromonto',
    obtenerOportunidadNroOpor: controllerCRM + '/oportunidadnroopor',
    oportunidadReporte: controllerCRM + '/oportunidadreporte',
    oportunidadesProyectadas: controllerCRM + '/oportunidadlist07',

    prcReporteGer: controllerMain + '/rptgerencia',
    prcReporteGerGen: controllerMain + '/oportunidadreportegen',

    listaGestionTareasPrev: controllerCRM + '/tareaslistprev',


    calificaroport: controllerCRM + '/calificaroport/',
    listLeadPreventa: controllerCRM + '/oportunidadlist08',
    listTareaOport: controllerCRM + '/tareaslist09',

    tareaTraeruno: controllerCRM + '/tareastraeruno',
    listaGestionTareas10: controllerCRM + '/tareaslist10',
    listaOportunidad: controllerCRM + '/oportunidadlist09',
    listaOportunidadAccion: controllerCRM + '/oportunidadlist10',
    listaGestionTareas11: controllerCRM + '/tareaslist11',
}


