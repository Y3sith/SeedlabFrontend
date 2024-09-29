import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalCrearOrientadorComponent } from '../add-orientador/modal-crear-orientador.component';
import { OrientadorService } from '../../../../servicios/orientador.service';
import { Orientador } from '../../../../Modelos/orientador.model';
import { User } from '../../../../Modelos/user.model';

@Component({
  selector: 'app-list-orientador',
  templateUrl: './list-orientador.component.html',
  styleUrls: ['./list-orientador.component.css'],
  providers: [OrientadorService]
})
export class ListOrientadorComponent implements OnInit {
  userFilter: any = { nombre: '', estado_usuario: 'Activo' };
  faeye = faEye;
  falupa = faMagnifyingGlass;
  fax = faXmark;
  public page: number = 1; // Initialize page number
  public itemsPerPage: number = 5; // Define how many items per page
  listaOrientador: Orientador[] = [];
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  faPen = faPenToSquare;
  faPlus = faPlus;
  modalCrearOrientador: boolean = false;
  isEditing: boolean = false;
  estado: boolean | null = null;
  id: number | null = null;
  selectedOrientadorId: number | null = null;
  boton: boolean;
  isLoading: boolean = false; // Define the property isLoading
  //
  idOrientador: number = null;

  private ESTADO_MAP: { [key: string]: string } = {
    "true": 'Activo',
    "false": 'Inactivo'
  };

  constructor(
    private orientadorService: OrientadorService,
    public dialog: MatDialog,
    private router: Router,
  ) { }
  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.cargarOrientador(1);
    this.nose();
  }
   /*Verifica si hay un token almacenado localmente. Si no lo encuentra, redirige al usuario a la página de inicio de sesión.*/
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 1 && this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }
  /*Esta función carga la lista de orientadores basándose en un estado (activo o inactivo).
  Se muestra un indicador de carga (isLoading) mientras se realiza la solicitud.
  Si hay un token presente, se llama al servicio mostrarOrientador, que obtiene los orientadores y los asigna a listaOrientador. */
  cargarOrientador(estado: number): void {
    this.isLoading = true; // Set isLoading to true when starting to load
    if (this.token) {
      this.orientadorService.mostrarOrientador(this.token, estado).subscribe(
        (data: any) => {
          this.listaOrientador = data;
          this.isLoading = false; // Set isLoading to false when loading is complete
        },
        (err) => {
          console.log(err);
          this.isLoading = false; // Set isLoading to false even if there is an error
        }
      );
    }
  }
  /*Se activa al cambiar el estado en la interfaz de usuario. Dependiendo del valor del estado (Activo o Inactivo), se llama a cargarOrientador con el correspondiente valor numérico (1 o 0).*/
  onEstadoChange(event: any): void {
    const estado = event.target.value;
    this.isLoading = true; // Set isLoading to true when starting to change state
    if (estado === 'Activo') {
      this.cargarOrientador(1);
    } else {
      this.cargarOrientador(0);
    }
  }
  /*Restablece los filtros de búsqueda a sus valores predeterminados (nombre vacío y estado de usuario a 'Activo') y vuelve a cargar la lista de orientadores con el estado activo.*/
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado_usuario: 'Activo' };
    this.cargarOrientador(1);
  }
  /*Abre un modal para crear o editar un orientador. Se pasa el orientadorId al componente del modal y se subscriben a los eventos de cierre del modal para manejar el resultado, si es necesario.*/
  openModal(orientadorId: number | null): void {
    let dialogRef: MatDialogRef<ModalCrearOrientadorComponent>;
    dialogRef = this.dialog.open(ModalCrearOrientadorComponent, {
      data: { orientadorId: orientadorId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result if needed
    });
  }
 /*Llama a openModal pero sin un orientadorId, lo que indica que se abrirá un modal para crear un nuevo orientador.*/
  openModalSINId(): void {
    this.openModal(null);
  }
  /*Filtra la lista de orientadores en base al nombre, apellido, celular o correo electrónico, utilizando los criterios de búsqueda definidos en userFilter. Devuelve una lista filtrada.*/
  buscarOrientadores(): Orientador[] {
    return this.listaOrientador.filter(orientador =>
      orientador.nombre.toLowerCase().includes(this.userFilter.nombre.toLowerCase()) ||
      orientador.apellido.toLowerCase().includes(this.userFilter.nombre.toLowerCase()) ||
      orientador.celular.includes(this.userFilter.nombre) ||
      orientador.email.toLowerCase().includes(this.userFilter.nombre.toLowerCase())
    );
  }
  /*Establece la variable boton a true.*/
  nose(): void {
    this.boton = true;
  }

  /*Calcula y devuelve un arreglo con el número total de páginas necesarias para la paginación, basado en la cantidad total de orientadores filtrados y el número de elementos por página (itemsPerPage).*/
  getPages(): number[] {
    const totalItems = this.buscarOrientadores().length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  /*Verifica si es posible navegar a la página anterior en la paginación (es decir, si la página actual es mayor que 1).*/
  canGoPrevious(): boolean {
    return this.page > 1;
  }
  /*Verifica si es posible avanzar a la siguiente página en la paginación (es decir, si la página actual es menor que el número total de páginas).*/
  canGoNext(): boolean {
    return this.page < this.getPages().length;
  }
  /*Cambia la página actual hacia adelante o hacia atrás, o establece una página específica. Comprueba las condiciones de navegación antes de cambiar.*/
  changePage(direction: 'previous' | 'next' | number): void {
    if (direction === 'previous' && this.canGoPrevious()) {
      this.page--;
    } else if (direction === 'next' && this.canGoNext()) {
      this.page++;
    } else if (typeof direction === 'number') {
      this.page = direction;
    }
  }
  /*Reinicia la página actual a 1 cuando se realiza una búsqueda o un cambio en los filtros, asegurando que los resultados comiencen desde la primera página.*/
  updatePaginatedOrientador(): void {
    this.page = 1; // Reset to first page on search or filter change
  }
  /*Devuelve una lista paginada de orientadores, calculando el índice de inicio y final basado en la página actual y el número de elementos por página.
  Utiliza la función buscarOrientadores para obtener la lista filtrada y luego la segmenta según la paginación.*/
  getPaginatedOrientadores(): Orientador[] {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.buscarOrientadores().slice(startIndex, endIndex);
  }
}
