import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../Modelos/user.model';
import { RutaService } from '../../../servicios/rutas.service';
import { FormBuilder } from '@angular/forms';
import { ActividadService } from '../../../servicios/actividad.service';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-list-actividades',
  templateUrl: './list-actividades.component.html',
  styleUrl: './list-actividades.component.css'
})
export class ListActividadesComponent {

  userFilter: any = { nombre: '', estado: 'Activo', };
  public page: number = 1;
  token: string | null = null;
  rutaId: number | null = null;
  ActividadId: any;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  listAcNiLeCo: any[] = [];
  isActive: boolean = true;
  boton = true;
  isLoading: boolean = false;
  idAliado: any;
  idAsesor: any;
  todasLasActividades: any[] = [];

  actividadForm = this.fb.group({
    estado: [true],
  })

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private rutaService: RutaService,
    private actividadService: ActividadService,
    private alertService: AlertService,
  ) { }


  /* Inicializa con esas funciones al cargar la pagina */

  ngOnInit(): void {
    this.validateToken();
    this.route.queryParams.subscribe((params) => {
      this.rutaId = +params['id_ruta'];
    });
    this.ver();
  }

  /*
        Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
        formulario o cualquier otra parte de la aplicación.
  */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.idAsesor = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
    Método que se encarga de cargar las actividades asociadas a una ruta específica para un asesor.
  */
  ver(): void {
    this.isLoading = true;
    if (this.rutaId !== null) {
      this.rutaService.activadadxAsesor(this.token, this.rutaId, this.idAsesor, this.userFilter.estado).subscribe(
        (data) => {
          this.listAcNiLeCo = [data];
          this.todasLasActividades = this.listAcNiLeCo.flatMap(ruta => (ruta as any).actividades || []);
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
          this.isLoading = false;
        }
      );
    }
  }

  /*
    Método que se ejecuta cuando el estado cambia en el componente.
  */
  onEstadoChange(event: any): void {
    this.ver();
  }

  /*
    Método que determina si se puede navegar a la página anterior en la paginación.
  */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /*
    Método que determina si se puede navegar a la siguiente página en la paginación.
  */
  canGoNext(): boolean {
    const totalItems = this.todasLasActividades.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return this.page < totalPages;
  }

  /*
    Método para cambiar la página actual en la paginación.
  */
  changePage(page: number | 'previous' | 'next'): void {
    if (page === 'previous' && this.canGoPrevious()) {
      this.page--;
    } else if (page === 'next' && this.canGoNext()) {
      this.page++;
    } else if (typeof page === 'number') {
      this.page = page;
    }
  }

  /*
    Método para obtener un arreglo de números que representan las páginas disponibles en la paginación.
  */
  getPages(): number[] {
    const totalItems = this.todasLasActividades.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  /*
    Método para gestionar la edición de una actividad.
  */

  EditarActividad(ActividadId: number, rutaId: number, isEditing: boolean, estado: any): void {
    if (estado === 'Inactivo') {
      this.alertService.alertainformativa('No puedes editar actividades cuando la actividad este inactiva.', 'error').then((result) => {
        if (result.isConfirmed) {
        }
      });
    } else {
      this.router.navigate(['Ruta-asesor'], { queryParams: { id_actividad: ActividadId, id_ruta: rutaId, isEditing: isEditing } });
    }
  }
}
