import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilitariosService } from '@/app/pages/service/utilitarios.service';
import { ListatareasService } from '../../service/listatareas.service';
import { SharedAppService } from '@/app/pages/shared/sharedApp.service';
import { constantesLocalStorage } from '@/app/pages/model/constantes';
import { CProgressSpinnerComponent } from '@/app/pages/shared/c-progress-spinner/c-progress-spinner.component';
import { PRIMENG_MODULES } from '@/app/pages/shared/primeng_modules';
@Component({
  selector: 'app-c-modalcoment',
  templateUrl: './c-modalcoment.component.html',
  imports: [PRIMENG_MODULES, CProgressSpinnerComponent],
      standalone: true,
      providers: [MessageService, UtilitariosService, ConfirmationService, DialogService]
})
export class CModalComentarioComponent implements OnInit, OnDestroy {
  $listSubcription: Subscription[] = [];
  param: any;
  headerTitle?: string;
   comentarios: any[] = [];
    comentario: any;
    newComment: any = {
        idcomentario: 0,
        name: constantesLocalStorage.nombreUsuario,
        comentario: '',
        image: constantesLocalStorage.imagen,
        fechareg: '',
        idtarea: 0,
        indvig: true,
        idusuario: constantesLocalStorage.idusuario
    };
    idTarea: any;
    blockedDocument = signal<boolean>(false);
    mensajeSpinner: string = '';

  constructor(
    public refDatoItem: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private serviceSharedApp: SharedAppService,
    private serviceUtilitario: UtilitariosService,
    private listatareasService: ListatareasService,
    private confirmationService: ConfirmationService
  ) { }



  ngOnInit(): void {
    this.param = this.config.data;
    console.log('this.param...', this.param);
    this.idTarea = this.param.idtarea;
    this.listarComentarios();
  }

  ngOnDestroy() {
    if (this.$listSubcription != undefined) {
      this.$listSubcription.forEach((sub) => sub.unsubscribe());
    }
  }

 setSpinner(valor: boolean) {
        this.blockedDocument.set(valor);
    }

  onComment(event: any) {
    this.setSpinner(true);
                      this.mensajeSpinner="Cargando...!";
        console.log('onComment...', event);
        const desdeStr = this.serviceUtilitario.obtenerFechaActualFormat();
        event.preventDefault();
        if (this.comentario.trim().length > 0) {
            this.newComment = {
                ...this.newComment,
                comentario: this.comentario,
                fechareg: desdeStr,
                idtarea: this.idTarea,
            };

            const $comentarioTareaPrc = this.listatareasService
                .comentarioTareaPrc(this.newComment)
                .subscribe({
                    next: (rpta: any) => {
                        console.log('comentarioTareaPrc...', rpta);
                        this.comentario = '';
                        this.listarComentarios();
                    },
                    error: (err) => {
                        this.setSpinner(false);
                        this.serviceSharedApp.messageToast();
                    },
                    complete: () => {},
                });
            this.$listSubcription.push($comentarioTareaPrc);
        }
    }

     delComentario(dato:any){
      console.log('delComentario...', dato);
      dato.idusuario = constantesLocalStorage.idusuario;
       this.confirmationService.confirm({
            key: 'confirm1',
            header: 'Confirmación',
            message: '¿Desea Eliminar Comentario ' +
                '<b>' +
                dato.comentario +
                '</b>' +
                '?',
            accept: () => {
                      
                 this.listatareasService.comentarioTareaDel(dato).subscribe({
                  next: (rpta: any) => {
                      this.setSpinner(false);
                      console.log('rpta...', rpta);
                      this.listarComentarios();
                  },
                  error: (err) => {
                      this.setSpinner(false);
                      this.serviceSharedApp.messageToast();
                  },
                  complete: () => {},
              });
            },
        });       
    }

  cerrar(data:any) {
    const objeto = {
      ...data
    }
    this.refDatoItem.close({objeto});
  }

   listarComentarios() {
      this.setSpinner(true);
                      this.mensajeSpinner="Cargando...!";
        const $agregarSubTarea = this.listatareasService
            .listarComentariosTareas(this.idTarea)
            .subscribe({
                next: (rpta: any) => {
                  this.setSpinner(false);
                    console.log('listarComentarios...', rpta);
                    this.comentarios = rpta;
                },
                error: (err) => {
                    this.setSpinner(false);
                    this.serviceSharedApp.messageToast();
                },
                complete: () => {},
            });
        this.$listSubcription.push($agregarSubTarea);
    }

 
}
