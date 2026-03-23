import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PRIMENG_MODULES } from '../../shared/primeng_modules';

@Component({
  selector: 'app-c-porcentajeopor',
  templateUrl: './c-porecentajeopo.component.html',
  styleUrls: ['./c-porecentajeopo.component.scss'],
  imports: [PRIMENG_MODULES]
})
export class CPorcentajeOpoComponent implements OnInit {

  
  lista:any[]=[];
  btnBuscar: boolean = false;
sumtareas: number = 0;
totmonto: number = 0;
totproyectado: number = 0;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    console.log(this.config.data);
    let lstPorEstado = this.config.data
    this.lista = lstPorEstado.sort((a: { porcentaje_est: number; }, b: { porcentaje_est: number; }) => b.porcentaje_est - a.porcentaje_est)
    
    this.sumtareas = Math.round(this.lista.reduce((acc: number, x: any) => acc + x.porcentaje_est, 0));
    this.totmonto = Math.round(this.lista.reduce((acc: number, x: any) => acc + x.monto, 0));
    this.totproyectado = Math.round(this.lista.reduce((acc: number, x: any) => acc + x.proyectoacerrar, 0));
  }

 
}
