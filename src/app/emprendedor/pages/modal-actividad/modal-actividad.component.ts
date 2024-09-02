import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';

import { environment } from '../../../../environment/env';

@Component({
  selector: 'app-modal-actividad',
  templateUrl: './modal-actividad.component.html',
  styleUrl: './modal-actividad.component.css'
})
export class ModalActividadComponent implements OnInit {
  @Input() actividad: any;
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  imagenError: boolean = false;
  imagenUrl: string;

  constructor (private cdr: ChangeDetectorRef){}

  ngOnInit() {
    console.log('ngOnInit ejecutado');
    if (this.actividad && this.actividad.fuente) {
      // Remover '/api' si está presente en environment.apiUrl
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      
      // Asegurarse de que la fuente no comience con '/'
      const fuenteAjustada = this.actividad.fuente.startsWith('/') 
        ? this.actividad.fuente.slice(1) 
        : this.actividad.fuente;
      
      this.imagenUrl = `${baseUrl}/${fuenteAjustada}`;
      console.log("URL de la imagen ajustada:", this.imagenUrl);
    } else {
      console.log('No hay actividad o fuente', this.actividad);
    }
  }

  

  cerrarModal() {
    this.close.emit();
  }

  irAModulo() {
    // Implementa la lógica para ir al módulo aquí
    console.log('Ir al módulo de:', this.actividad.nombre);
  }

  manejarErrorImagen() {
    this.imagenError = true;
    console.error('Error al cargar la imagen:', this.actividad.fuente);
  }

}