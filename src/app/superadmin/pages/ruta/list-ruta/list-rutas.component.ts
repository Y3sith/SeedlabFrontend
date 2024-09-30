import { Component, OnInit } from '@angular/core';
import {
  faEye,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { RutaService } from '../../../../servicios/rutas.service';
import { Ruta } from '../../../../Modelos/ruta.modelo';
import { User } from '../../../../Modelos/user.model';
import { SwitchService } from '../../../../servicios/switch.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalAddRutaComponent } from '../modal-add-ruta/modal-add-ruta.component';
import { AlertService } from '../../../../servicios/alert.service';

@Component({
  selector: 'app-list-rutas',
  templateUrl: './list-rutas.component.html',
  styleUrls: ['./list-rutas.component.css'],
  providers: [RutaService],
})
export class ListRutasComponent implements OnInit {
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

  constructor(
    private rutaService: RutaService,
    private router: Router,
    private modalSS: SwitchService,
    public dialog: MatDialog,
    public alertService: AlertService
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
  Funcion para abrir el modal donde se podra editar la ruta
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
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
    Este método se encarga de cargar todas las rutas disponibles 
    desde el servicio de rutas y actualizar la lista de rutas en 
    el componente.
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
    Este método se ejecuta cuando hay un cambio en el estado 
    del filtro de rutas. Su propósito es recargar la lista de 
    rutas en función del nuevo estado seleccionado.
  */
  onEstadoChange(event: any): void {
    this.cargarRutas();
  }

  /*
    Este método se encarga de limpiar los filtros aplicados 
    en la lista de rutas. Reinicia el objeto `userFilter` a 
    sus valores predeterminados.
  */
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado: 'Activo', fecha_creacion: '' };
    this.cargarRutas();
  }

  /*
  Funcion para abrir el modal donde se podra crear la ruta
  */
  openModalSINId(): void {
    this.openModal(null);
  }

    /*
      Este método verifica si es posible retroceder a 
      la página anterior en el sistema de paginación.
    */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /*
    Este método verifica si es posible avanzar a 
    la siguiente página en el sistema de paginación.
  */
  canGoNext(): boolean {
    const totalItems = this.listaRutas.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return this.page < totalPages;
  }

  /*
    Este método permite cambiar la página actual 
    en el sistema de paginación. Acepta un argumento que 
    determina la nueva página a la que se debe navegar.
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
    Este método genera un array de números que 
    representan las páginas disponibles en el sistema de 
    paginación, basado en la cantidad total de elementos 
    y la cantidad de elementos por página.
  */
  getPages(): number[] {
    const totalItems = this.listaRutas.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  /*
    Este método maneja la lógica para listar actividades 
    asociadas a una ruta específica, verificando primero 
    si la ruta está activa.
  */
  listarActividad(rutaId: number, estado: any): void {
    if (estado === 'Inactivo') {
      this.alertService
        .alertainformativa(
          'No puedes editar actividades en una ruta que este inactiva, debes activar la ruta para poderla editar',
          'error'
        )
        .then((result) => {
          if (result.isConfirmed) {
          }
        });
    } else {
      this.router.navigate(['list-actividades'], {
        queryParams: { id_ruta: rutaId },
      });
    }
  }
}
