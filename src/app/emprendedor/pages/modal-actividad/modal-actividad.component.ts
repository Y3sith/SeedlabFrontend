import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-actividad',
  templateUrl: './modal-actividad.component.html',
  styleUrl: './modal-actividad.component.css'
})
export class ModalActividadComponent {
  @Input() actividad: any;
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  imagenError: boolean = false;

  cerrarModal() {
    this.close.emit();
  }

  irAModulo() {
    // Implementa la lógica para ir al módulo aquí
    console.log('Ir al módulo de:', this.actividad.nombre);
  }

  manejarErrorImagen() {
    this.imagenError = true;
    console.error('Error al cargar la imagen:', this.actividad.imagen);
  }
}