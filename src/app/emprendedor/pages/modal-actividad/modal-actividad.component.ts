import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';

import { environment } from '../../../../environment/env';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-actividad',
  templateUrl: './modal-actividad.component.html',
  styleUrl: './modal-actividad.component.css'
})
export class ModalActividadComponent implements OnInit {
  @Input() actividad: any;
  @Input() visible: boolean = false;
  @Input() rutaId: number;
  @Output() close = new EventEmitter<void>();
  @Output() irAModuloClicked = new EventEmitter<number>();

  imagenError: boolean = false;
  imagenUrl: string;
  colorIndex?: number;

  constructor (private cdr: ChangeDetectorRef,
    private router: Router,
  ){}

  ngOnInit() {
    if (this.actividad && this.actividad.fuente) {
      // Remover '/api' si está presente en environment.apiUrl
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      
      // Asegurarse de que la fuente no comience con '/'
      const fuenteAjustada = this.actividad.fuente.startsWith('/') 
        ? this.actividad.fuente.slice(1) 
        : this.actividad.fuente;
      
      this.imagenUrl = `${baseUrl}/${fuenteAjustada}`;
     // console.log("URL de la imagen ajustada:", this.imagenUrl);
    } else {
      //console.log('No hay actividad o fuente', this.actividad);
    }
  }

  getItemColor(index: number): string {
    const colors = [
      '#F4384B', // Rojo
      '#FFA300', // Amarillo oscuro
      '#80981A', // Verde
      '#683466', // Morado
      '#F42CCF', // Fucsia
      '#FFCE00', // Amarillo
      '#00BF9E', // Agua marina
      '#FF5F27', // Naranja
      '#0E54A8'  // Azul oscuro
    ];
    return colors[index % colors.length];
  }
  
  getColor(): string {
    return this.actividad.colorIndex !== undefined 
      ? this.getItemColor(this.actividad.colorIndex) 
      : '#FA7D00'; // Color por defecto si no hay índice
  }

  getTextColor(): string {
    const color = this.getColor();
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  }

  cerrarModal() {
    this.close.emit();
  }

  irAModulo() {
    this.irAModuloClicked.emit(this.actividad);
  }

  manejarErrorImagen() {
    this.imagenError = true;
    console.error('Error al cargar la imagen:', this.actividad.fuente);
  }

}