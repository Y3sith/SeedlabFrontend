import { Component, OnInit } from '@angular/core';
import { RutaService } from '../../../servicios/rutas.service';
import { Router } from '@angular/router';
import { Ruta } from '../../../Modelos/ruta.modelo';
import { FormBuilder } from '@angular/forms';
import { data } from 'jquery';

@Component({
  selector: 'app-ruta-emprendedor',
  templateUrl: './ruta-emprendedor.component.html',
  styleUrls: ['./ruta-emprendedor.component.css']
})
export class RutaEmprendedorComponent implements OnInit {
  token: string | null = null;
  documento: string | null;
  user: any = null;
  currentRolId: number;
  idRuta: number | null;
  rutaList: Ruta[] = [];
  rutaLista: Ruta[] = [];
  modalVisible: boolean = false;
  selectedActividad: any = null;
  selectedRutaId: any = null;
  nombre: any = null;
  rutaId: number;
  ultimoElemento: any;
  listRespuestaId: any[] = [];
  ishidden: boolean = true;

  actividadForm = this.fb.group({
    id: [null],
    nombre: [''],
    descripcion: [''],
    ruta_multi: [''],
    id_tipo_dato: [''],
    id_asesor: [''],
    id_aliado: ['']
  })

  constructor(
    private rutaService: RutaService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.idRespuesta();
  }

  validateToken(): void {
    this.token = localStorage.getItem("token");
    let identityJSON = localStorage.getItem('identity');

    if (identityJSON) {
      let identity = JSON.parse(identityJSON);
      this.user = identity;
      this.currentRolId = this.user.id_rol;

      if (this.currentRolId != 5) {
        this.router.navigate(['home']);
      } else {
        this.documento = this.user.emprendedor.documento;
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  idRespuesta(): void {
    this.rutaService.idRespuestas(this.token).subscribe(
      data => {
        this.listRespuestaId = data;
        // Verifica si la lista de respuestas es válida y si el ID no es 0, null o undefined
        if (this.listRespuestaId && this.listRespuestaId.length > 0 && this.listRespuestaId[0].id !== 0) {
          // Llamar a las demás funciones solo si el ID es válido
          this.ishidden = false;
          this.listarRutaActiva();
        } else {
          console.log('ID de respuesta es 0, vacío o nulo, no se ejecutan las demás funciones.');
        }
      },
      error => {
        console.error('Error al obtener el ID de respuestas:', error);
      }
    );
  }

  listarRutaActiva(): void {
    if (this.token) {
      this.rutaService.ruta(this.token).subscribe(
        data => {
          this.rutaList = data;
          if (this.rutaList.length > 0) {
            const primeraRuta = this.rutaList[0];
            this.rutaId = primeraRuta.id;
            // Si quieres llamar otra función después de recibir el ID
            this.listarRutas();
          }
        },
        err => {
          console.error('Error al obtener rutas:', err);
        }
      );
    } else {
      console.log('No hay token disponible');
    }
  }

  listarRutas(): void {
    this.rutaService.actividadCompletaxruta(this.token, this.rutaId).subscribe(
      data => {
        this.rutaLista = data;
      },
      err => {
        console.error(err);
      });
  }

  getItemClass(index: number): string {
    if (index === 0) return 'item-single';
    if ((index - 1) % 3 === 0) return 'item-mid';
    if ((index - 2) % 3 === 0) return 'item-mid';
    return 'item-single';
  }

  getOrder(index: number): number {
    return Math.floor(index / 3) * 3 + (index % 3);
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

  getCirclePositionClass(index: number): string {
    const group = Math.floor(index / 6);
    const positionInGroup = index % 6;
    return [0, 1, 4].includes(positionInGroup) ? 'circle-right' : 'circle-left';
  }

  openModal(actividad: any, index: number): void {
    this.selectedActividad = actividad;
    this.selectedActividad = { ...actividad, colorIndex: index };
    //this.selectedRutaId = this.rutaList[Math.floor(index / this.rutaList[0].actividades.length)].id;
    this.modalVisible = true;
  }

  handleIrAModulo(actividad: any) {
    // Usa un servicio de estado o el router para pasar la actividad
    this.router.navigate(['curso-ruta-emprendedor'], { state: { actividad: actividad } });
  }

  closeModal(): void {
    this.modalVisible = false;
    this.selectedActividad = null;
  }
}

