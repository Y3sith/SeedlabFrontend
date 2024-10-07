import { Component, OnInit } from '@angular/core';
import { RutaService } from '../../../servicios/rutas.service';
import { Router } from '@angular/router';
import { Ruta } from '../../../Modelos/ruta.modelo';
import { FormBuilder } from '@angular/forms';

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
  isLoading: boolean = true;
  alertadeactividad: boolean = false;
  encuestademaduracion: boolean = false;
  mostrarruta: boolean = false;
  laruta: boolean = false;

  actividadForm = this.fb.group({
    id: [null],
    nombre: [''],
    descripcion: [''],
    ruta_multi: [''],
    id_tipo_dato: [''],
    id_asesor: [''],
    id_aliado: ['']
  });

  constructor(
    private rutaService: RutaService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

/* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateTokenAndLoadData();
  }

  /*
    Valida el token y el rol del usuario; redirige si el usuario no tiene permisos y carga la funcon idRespuesta.
  */
    private validateTokenAndLoadData(): void {
      this.token = localStorage.getItem("token");
      const identityJSON = localStorage.getItem('identity');
  
      if (!this.token || !identityJSON) {
        this.router.navigate(['home']);
        return;
      }
  
      const identity = JSON.parse(identityJSON);
      this.user = identity;
      this.currentRolId = this.user.id_rol;
  
      if (this.currentRolId !== 5 && this.currentRolId !== 1 && this.currentRolId !== 2) {
        this.router.navigate(['home']);
        return;
      }
  
      this.idRespuesta();
    }

  /*
    Obtiene el ID de respuesta del usuario y muestra la ruta si hay respuestas activas.
  */
  idRespuesta(): void {
    this.isLoading = true;
    this.rutaService.idRespuestas(this.token).subscribe(
      data => {
        this.listRespuestaId = data;
        if (this.currentRolId != 1 && this.currentRolId != 2) {
          if (this.listRespuestaId && this.listRespuestaId.length > 0 && this.listRespuestaId[0].id !== 0) {
            this.ishidden = false;
            this.listarRutaActiva();
          } else {
            this.isLoading = false;
            this.laruta = true;
          }
        } else {
          this.ishidden = false;
          this.listarRutaActiva();
        }
      },
      error => {
        this.isLoading = false;
        console.error('Error al obtener el ID de respuestas:', error);
      }
    );
  }

  /*
    Lista la ruta activa del usuario.
  */
  listarRutaActiva(): void {
    if (this.token) {
      this.rutaService.rutasmejorado(this.token).subscribe(
        data => {
          this.rutaList = data;
          if (this.rutaList.length > 0) {
            const primeraRuta = this.rutaList[0];
            this.rutaId = primeraRuta.id;
            this.listarRutas();
          } else {
            this.isLoading = false;
          }
        },
        err => {
          console.error('Error al obtener rutas:', err);
        }
      );
    }
  }

  /*
    Lista las actividades completadas por ruta.
  */
  listarRutas(): void {
    this.rutaService.actividadCompletaxruta(this.token, this.rutaId).subscribe(
      data => {
        this.rutaLista = data;
        this.isLoading = false;
        if (this.rutaList.length > 0 && this.rutaLista.length === 0) {
          this.alertadeactividad = true;
        }
      },
      err => {
        this.isLoading = false;
        if (this.rutaList.length > 0 && this.rutaLista.length === 0) {
          this.alertadeactividad = true;
        }
      });
  }

  /*
    Determina la clase CSS del ítem en función de su posición.
  */
  getItemClass(index: number): string {
    if (index === 0) return 'item-single';
    if ((index - 1) % 3 === 0) return 'item-mid';
    if ((index - 2) % 3 === 0) return 'item-mid';
    return 'item-single';
  }

  /*
    Determina el orden visual de los ítems.
  */
  getOrder(index: number): number {
    return Math.floor(index / 3) * 3 + (index % 3);
  }

  /*
    Asigna un color a los ítems según su posición.
  */
  getItemColor(index: number): string {
    const colors = ['#F4384B', '#FFA300', '#80981A', '#683466', '#F42CCF', '#FFCE00', '#00BF9E', '#FF5F27', '#0E54A8'];
    return colors[index % colors.length];
  }

  /*
    Determina la posición del círculo en función del índice.
  */
  getCirclePositionClass(index: number): string {
    const group = Math.floor(index / 6);
    const positionInGroup = index % 6;
    return [0, 1, 4].includes(positionInGroup) ? 'circle-right' : 'circle-left';
  }

  /*
    Abre un modal con los detalles de la actividad seleccionada.
  */
  openModal(actividad: any, index: number): void {
    this.selectedActividad = { ...actividad, colorIndex: index };
    this.modalVisible = true;
  }

  /*
    Navega al módulo de la actividad seleccionada.
  */
  handleIrAModulo(actividad: any) {
    this.router.navigate(['curso-ruta-emprendedor'], { state: { actividad: actividad } });
  }

  /*
    Cierra el modal de la actividad.
  */
  closeModal(): void {
    this.modalVisible = false;
    this.selectedActividad = null;
  }
}
