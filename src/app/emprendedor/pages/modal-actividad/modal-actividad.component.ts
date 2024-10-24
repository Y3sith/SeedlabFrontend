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

  constructor(private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    if (this.actividad && this.actividad.fuente) {
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      let fuenteAjustada = this.actividad.fuente;
      // Si la ruta tiene doble "storage", eliminar una
      if (fuenteAjustada.includes('/storage/storage/')) {
        fuenteAjustada = fuenteAjustada.replace('/storage/storage/', '/storage/');
      }
      this.imagenUrl = `${baseUrl}${fuenteAjustada}`;
      console.log(this.imagenUrl);
    }
  }

  /*
    Devuelve un color basado en el índice proporcionado, seleccionando de una lista predefinida.
  */
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

  /*
    Devuelve un color basado en el índice de color de la actividad, o un color por defecto si no está definido.
  */
  getColor(): string {
    return this.actividad.colorIndex !== undefined
      ? this.getItemColor(this.actividad.colorIndex)
      : '#FA7D00';
  }

  /*
    Calcula el color de texto (blanco o negro) según el brillo del color de fondo.
    Devuelve 'black' si el fondo es claro y 'white' si es oscuro.
  */

  getTextColor(): string {
    const color = this.getColor();
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  }

  /*
    Cierra el modal emitiendo un evento de cierre.
  */
  cerrarModal() {
    this.close.emit();
  }

  /*
    Emite el evento para navegar al módulo correspondiente.
  */
  irAModulo() {
    this.irAModuloClicked.emit(this.actividad);
  }

  /*
    Maneja el error al cargar una imagen y establece una bandera de error.
  */
  manejarErrorImagen() {
    this.imagenError = true;
    console.error('Error al cargar la imagen');
  }

}