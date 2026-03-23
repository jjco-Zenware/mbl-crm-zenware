import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-c-progress-spinner',
  templateUrl: './c-progress-spinner.component.html',
  styleUrls: ['./c-progress-spinner.component.scss']
})
export class CProgressSpinnerComponent {
  @Input() IS_mensaje: string = 'Cargando...';

}
