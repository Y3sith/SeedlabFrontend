import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-curso-ruta-emprendedor',
  templateUrl: './curso-ruta-emprendedor.component.html',
  styleUrl: './curso-ruta-emprendedor.component.css'
})
export class CursoRutaEmprendedorComponent {
  actividad: any;
  niveles: any[] = [];

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.actividad = navigation.extras.state['actividad'];
      this.niveles = this.actividad.nivel || [];
    }
  }

  ngOnInit() {
    if (this.actividad) {
      console.log('Actividad recibida:', this.actividad);
      // Aquí puedes usar this.actividad.nombre, this.actividad.nivel, etc.
    } else {
      console.error('No se recibió información de la actividad');
      // Manejar el caso en que no se recibió la actividad
    }
  }

  toggleNivel(index: number) {
    this.niveles[index].expanded = !this.niveles[index].expanded;
  }

  selectLeccion(leccion: any) {
    console.log('Lección seleccionada:', leccion);
    // Aquí puedes implementar la lógica para mostrar el contenido de la lección
  }

  handleIrAModulo(rutaId: number) {
    console.log('Ir a módulos de la ruta con ID:', rutaId);
    // Aquí puedes implementar la lógica para manejar el ID de la ruta
    // Por ejemplo, navegar a una nueva página o cargar datos específicos
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
}
