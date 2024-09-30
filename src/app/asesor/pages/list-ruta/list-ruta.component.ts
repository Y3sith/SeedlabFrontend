import { Component, OnInit } from '@angular/core';
import {
  faEye,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { RutaService } from '../../../servicios/rutas.service';
import { Ruta } from '../../../Modelos/ruta.modelo';
import { User } from '../../../Modelos/user.model';
import { SwitchService } from '../../../servicios/switch.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalAddRutaComponent } from '../../../superadmin/pages/ruta/modal-add-ruta/modal-add-ruta.component';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-list-ruta',
  templateUrl: './list-ruta.component.html',
  styleUrl: './list-ruta.component.css'
})
export class ListRutaComponent {
  userFilter: any = { nombre: '', estado: 'Activo', fecha_creacion: '' };

  public page: number = 1;
  listaRutas: Ruta[] = [];
  fax = faXmark;
  falupa = faMagnifyingGlass;
  faeye = faEye;
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  modalSwitch: boolean;
  listaRutasFiltrada: Ruta[] = [];
  isLoading: boolean = false;
  rutaId: any;
  idAliado: any;
  idAsesor: any;

  constructor(
    private rutaService: RutaService,
    private router: Router,
    private modalSS: SwitchService,
    public dialog: MatDialog,
    public alertService: AlertService,
  ) { }


  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.cargarRutas();
    this.modalSS.$modal.subscribe((valor) => {
      this.modalSwitch = valor;
    });
  }

  /*
    Método para abrir un modal de adición o edición de ruta.
  */
  openModal(rutaId: number | null): void {
    let dialogRef: MatDialogRef<ModalAddRutaComponent>;
    dialogRef = this.dialog.open(ModalAddRutaComponent, {
      data: { rutaId: rutaId },
    });
    dialogRef.afterClosed().subscribe((result) => { });
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
    Método para cargar todas las rutas desde el servicio.
  */
  cargarRutas(): void {
    this.isLoading = true;
    if (this.token) {
      this.isLoading = true;
      this.rutaService
        .getAllRutas(this.token, this.userFilter.estado)
        .subscribe(
          (data) => {
            this.listaRutas = data;
            this.isLoading = false;
          },
          (err) => {
            console.log(err);
            this.isLoading = false;
          }
        );
    } else {
      console.error('Token is not available');
    }
  }

  /*
     Método que se ejecuta cuando el estado cambia en el componente.
   */
  onEstadoChange(event: any): void {
    this.cargarRutas();
  }

  /*
    Método para limpiar los filtros de usuario y recargar las rutas.
  */
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado: 'Activo', fecha_creacion: '' };
    this.cargarRutas();
  }

  /*
    Método para abrir un modal sin un ID específico.
  */
  openModalSINId(): void {
    this.openModal(null);
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
    const totalItems = this.listaRutas.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return this.page < totalPages;
  }

  /*
    Cambia la página actual de la vista.
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
    Obtiene una lista de números de página basada en la cantidad total de elementos.
  */
  getPages(): number[] {
    const totalItems = this.listaRutas.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  /*
    Lista las actividades de una ruta específica, dependiendo del estado de la ruta.
  */
  listarActividad(rutaId: number, estado: any): void {
    if (estado === 'Inactivo') {
      this.alertService.alertainformativa('No puedes editar actividades en una ruta que este inactiva, debes activar la ruta para poderla editar', 'error').then((result) => {
        if (result.isConfirmed) {

        }
      });
    } else {
      this.router.navigate(['list-actividades-asesor'], {
        queryParams: { id_ruta: rutaId },
      });
    }
  }
}

