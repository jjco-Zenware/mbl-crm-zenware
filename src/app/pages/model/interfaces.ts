export interface I_loginUsuario {
    nombreUsuario: string;
    clave: string;
}

export interface I_respuestaLogin {
    estado: boolean;
    mensaje: string;
    respuestaData: I_rptaDataLogin;
}

export interface I_rptaDataLogin {
    nombreUsuario: string;
    login: string;
    imagen:string;
    estado: number;
    idusuario: number;
    mensaje: string;
    token: string;
    tipoacceso: string;
    idperfil: number;
    nomperfil: string;
}

export interface I_Menu {
    label:    string;
    icon:    string;
    routerLink: string;
    items:    any;
}

export interface I_respuestaGeneral {
    estado: boolean;
    mensaje: string;
    respuestaData: any;
}

export interface I_ConfirmDialog {
    message?: string;
    header?: string;
    rejectButtonStyleClass?: string;
    acceptButtonStyleClass?: string;
    acceptLabel?: string;
    acceptIcon?: string;
    rejectLabel?: string;
    rejectIcon?: string;
}

export interface I_MessageToast {
    severity?: string;
    summary?: string;
    detail?: string;
}


export interface I_RespuestaProceso{
    procesoSwitch: number
    errorNumero:number;
    errorSeveridad:number;
    errorEstado:number;
    errorProcedimiento:string;
    errorLinea:number;
    mensaje:string;
    resultProceso:string;
}

export interface Users {
    idusuario: number;
    name?: string;
    image?: string;
    indvig?: boolean;
    fechaini?: string;
    fechafin?: string;
    nomusuario?: string ;
    url1?: string ;
    email?: string ;
}

export interface KanbanCard {
    id: string ;
    title?: string;
    description?: string;
    startDate?: string;
    dueDate: string;
    completed?: boolean;
    progress?: number;
    idcliente?:number;
    assignees?: Assignees[];
    comments?: Comments[];
    contactos?: Contacto[];
    priority?: object;
    attachments?: number;
    taskList: TaskList;
    monto: number;
    idlista?: number;
    razonsocial?: string;
    simbmoneda?: string;
    idmoneda?:number;
    nroasignados?: number;
    nrocontactos?: number;
    nrotareas?: number;
    nroadjuntos?: number;
    nomlista?: string;
    idpreventa?:number;
    acciones?: Acciones[]|undefined;
    bgcolor?: string;
    bgicon?: string;
    tipocambio: number;
    nomcreador?: string;
    tipoproducto?: undefined;
    nommoneda?: string;
    indestado_qu?: boolean;
    indestado_bc?: boolean;
    nomestado_qu?: string;
    nomestado_bc?: string;
    montodolar?: number;
    nomcomercial?: string;
    nompreventa?: string;
    nomproveedor?: string;
    idproveedor?:number;
    idmarca?:number;
    regoportunidadesext?: RegOportunidadExt[];
    idtrx?: number;
    preventas?: Assignees[];
    idnotifica?: number;
    codigoproyecto?: string;
    fecampliacion?: string;
    justificacion?: string;
    fechacierre?: string;
    prcannio?: number;
    decisores?: Contacto[];
    idcompetencia?: number;
    fecoportunidad?: string;
    desproblema?: string;
    despersona?: string;
    desproyecto?: string;
    despresupuesto?: string;
    desprioridad?: string;
    desplazos?: string;
    desproceso?: string;
    descompetencia?: string;
    //planes?: Plan[];
    idtipoprod?: number;
    idorigenopor?: number;
    idsectorind?: number;
    idestadopresu? : number;
    idprioridad? : number;
    feciniprio?: string;
    feccieprio?: string;
    idetapaproc? : number;
    idtiempoproc?: number;
    desstakeholders? : string;
    descompetidor? : string;
    desfodacompetidor? : string;
    idusuario?: number;
    idusuarioprev?: number;
}

export interface Plan{
    idplan: number;
    idoportunidad: number;
    descripcion?: string;
    fecha: string;
    indvig?: boolean;
    completo?: boolean;
    codplan?: number;
}

export interface RegOportunidadExt{
    idregoportunidadext: number;
    idoportunidad: string;
    numregoportunidad: string;
    fechavence: string;
    idusuario: number;
    idproveedor?:number;
    idmarca?:number;
    nommarca?: string;
    nomproveedor?: string;
}


export interface KanbanList {
    map: any;
    //listId: number;
    listId: string;
    title?: string;
    cards: KanbanCard[];
    nroorden: number;
    indvig: boolean;
    bgcolor: string;
    bgicon: string;
    creaOportunidad: number;
    porcentaje?: string;
    codigoproyecto?: string;
}

export interface Acciones {
    idtrx: number;
    nomtrx?: string;
    nomtrxbtn?: string;
}
export interface Comments {
    idcomentario: number;
    name: string;
    image?: string;
    text: string;
    fechareg: string;
}

export interface TaskList {
    id?: number;
    title: string;
    tasks: Tasks[];    
}

export interface Tasks {
    idtarea: number;
    sidtarea: string;
    text: string;
    completed: boolean;
    fechafin: string;
    asignados: TareaAsignado[];
    asignados_str?: string;
    nroorden: number;
    fechaini: string;
    nomasignados?: string;
    horafin?: string;
    horaini?: string;
    descripcion?: string;
}


export interface Assignees {
    idasignado: number;
    name: string;
    image: string;
}

export interface TareaAsignado {
    idasignado: number;
    name: string;
    image: string;
    idtarea: number;
}

export interface Priority {
    color?: string;
    title?: string;
}

export interface Contacto {
    idcontacto: number;
    idcliente?: number;
    nombrecontacto?: string;
    cargo?: string;
    email?: string;
    telefono?: string;
    image?: string;
    idcotiza?: number;
    tiporol?: number;
    nomtiporol?: string;
    tipocontacto?: string;
}


export interface Moneda {
    idmoneda: number;
    desmoneda?: string;
    simbmoneda?: string;
}

export interface TipoDocumento{
    iditem: number;
    valoritem: string;
}

export interface ListName {
    listId?: string;
    title: string;
    card: KanbanCard[];
}

export interface Cliente {
    idcliente: number;
    idrolpersona?: string;
    tipopersona?: string;
    tipoalta?: string;
    indnacionalidad?: string;
    idpais?: string;
    idtipodoc?: string;
    nrodocumento: string;
    appaterno?: string;
    apmaterno?: string;
    apcasada?: string;
    nombres?: string;
    razonsocial?: string;
    nomcomercial?: string;
    direcresumen?: string;
    telefresumen?: string;
    email?: string;
    paginaweb?: string;
    facebook?: string;
    youtube?: string;
    indmigrado?: boolean;
    indestado?: string;
    indvig?: boolean;
    fechareg?: Date;
    iduserreg?: number;
    fechaact?: Date;
    iduseract?: number;
    idpersona?: number;
    nomtipopersona?: string;
}

export interface Marca{
    idmarca: number;
    nommarca: string;
}

export interface CotizacionItem{
    idcotizaitem?: number;
    idcotiza?: number;
    idtipoprod: number;
    idprod?: number;
    descripcion?: string;
    cantidad: number;
    codunidad?: string;
    preciocosto : number;
    descuento?:number;
    margen? :number;
    precioventa :number;
    indvig ?:boolean;
    iduserreg?:number;
    fecreg ?:Date;
    iduseract? :number;
    fecact ?:Date;
    coditem ?:string;
    idmarca?: number;
    nomprod?: string;
    nommarca?: string;
    preciocostototal: number;
    precioventatotal: number;
    preprofit: number;
    nomtipoprod?: string;
    nomproveedor?: string;
    badgeColor?: string;
    idnvoitem:number;
    nroindex:number;
    nrocontrato?: string;
    nromeses:number;
    sku?: string;
    serialnumber?: string;
    idproveedor?: number;
}

export interface CasoNegocio{
    descripcion: string;
    desmoneda: string;
    fecfinoportunidad: string;
    fecoportunidad: string;
    idcliente: number;
    idmoneda: number;
    idoportunidad: number;
    monto: number;
    razonsocial: string;
    secciones: Secciones[];
    acciones: Acciones[];
    simbmoneda: string;
    titulo: string;
    tipocambio: number;
    margen: number;
    profit: number;
    nomcreador: string;
    nomusuariocomercial:string;
    nomusuariopreventa:string;
    ventatotal: number;
}

export interface Secciones{
    idtipoprod: number;
    nomtipoproducto: string;
    badgeColor: string;
    itemsQuote:CotizacionItem[];
}

export interface Cotizacion {
    idcotiza: number;
    idrequerimiento: number;
    idoportunidad: number;
    codtipodoc?: string;
    idmoneda: number;
    monto: number;
    costo: number;
    idproveedor: number;
    fechaingreso ?: Date;
    horaingreso ?: Date;
    fechacompleto ?: Date;
    horacompleto ?: Date;
    fechaaprobacio?: Date;
    horaaprobacion?: Date;
    estado: string;
    idusercompleto: number;
    iduseraprueba: number;
    idproveedor_original: number;
    fechareg?: Date;
    iduserreg?: number;
    fechaact?: Date;
    iduseract?: number;
    tiempoentrega: number;
    codformapago?: string;
    validezoferta: number;
    lugarentrega?: string;
    observacion?: string;
    garantia: number;
    nrodocumentoadd?: string;
    idusuario?: number;
    items:CotizacionItem[];
    nomempresa: string;
    s_monto: string;
    simbmoneda: string;
    condicionescomerciales: string;
    contactos: Contacto[];
}
