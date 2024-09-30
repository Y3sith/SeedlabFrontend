import { Component, OnInit } from '@angular/core';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../../Modelos/user.model';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Superadmin } from '../../../Modelos/superadmin.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalCrearSuperadminComponent } from '../add-superadmin/modal-crear-superadmin.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-superadmin',
  templateUrl: './list-superadmin.component.html',
  styleUrls: ['./list-superadmin.component.css'],
  providers: [SuperadminService]
})
export class ListSuperadminComponent implements OnInit {
  faPen = faPenToSquare;
  fax = faXmark;
  falupa = faMagnifyingGlass;
  faPlus = faPlus;
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  estado: boolean | null = null;
  id: number | null = null;
  listaAdmins: Superadmin[] = [];
  modalCrearSuperadmin: boolean;
  isEditing: boolean;
  userFilter: any = { nombre: '', estadoString: 'Activo' }; // Ajuste aquí
  public page: number = 1;
  public itemsPerPage: number = 5;
  public totalItems: number = 0;
  public paginatedAdmins: Superadmin[] = [];
  isLoading: boolean = false;
  idSuperAdmin: number = null;

  constructor(
    private superAdminService: SuperadminService,
    public dialog: MatDialog,
    private router: Router,
  ) { }
  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.cargarSuperAdmin();
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
  /*Abre un modal (ventana emergente) para crear o editar un superadministrador. Si se pasa un adminId, el modal se usa para editar; si no, es para crear uno nuevo. */
  openModal(adminId: number | null): void {
    let dialogRef: MatDialogRef<ModalCrearSuperadminComponent>;
    dialogRef = this.dialog.open(ModalCrearSuperadminComponent, {
      data: { adminId: adminId }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.cargarSuperAdmin();
    });
  }
  /*Abre el modal sin pasar un adminId, lo que significa que siempre se abrirá el modal para crear un nuevo superadministrador.*/
  openModalSINId(): void {
    this.openModal(null);
  }
  /*Carga la lista de superadministradores desde el backend usando un servicio superAdminService.getAdmins(). Mientras se espera la respuesta, muestra un indicador de carga (isLoading)*/
  cargarSuperAdmin(): void {
    this.isLoading = true;
    if (this.token) {
      this.superAdminService.getAdmins(this.token, this.userFilter.estadoString).subscribe(
        (data) => {
          this.listaAdmins = data;
          this.totalItems = data.length; // Actualiza el total de items
          this.page = 1; // Reinicia la página a 1
          this.updatePaginatedAdmins(); // Actualiza los datos paginados
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
          this.isLoading = false;
        }
      );
    }
  }
  /*Limpia el filtro de búsqueda, restableciendo los valores a nombre: '' y estadoString: 'Activo'. Luego, recarga la lista de superadministradores llamando a cargarSuperAdmin().*/
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estadoString: 'Activo' };
    this.cargarSuperAdmin();
  }
  /*Se ejecuta cuando cambia el filtro de estado. Vuelve a cargar la lista de superadministradores y activa el indicador de carga (isLoading = true)*/
  onEstadoChange(): void {
    this.cargarSuperAdmin();
    this.isLoading = true;
  }
  /*Divide la lista completa de administradores (listaAdmins) en páginas según el número de elementos por página (itemsPerPage).
  Aplica un filtro de búsqueda por nombre y estado, luego muestra los administradores correspondientes a la página actual*/
  updatePaginatedAdmins(): void {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    const filterText = this.userFilter.nombre.toLowerCase(); // Convierte el texto del filtro a minúsculas

    this.paginatedAdmins = this.listaAdmins
      .filter(admin => {
        const nombreLower = admin.nombre.toLowerCase(); // Convierte el nombre del admin a minúsculas
        return nombreLower.includes(filterText) &&
          admin.estado.toString() === this.userFilter.estadoString; // Ajuste aquí
      })
      .slice(start, end);
  }
  /*Cambia la página actual. Puede recibir un número de página o una acción especial como 'previous' (anterior) o 'next' (siguiente).*/
  changePage(page: number | string): void {
    if (page === 'previous') {
      if (this.canGoPrevious()) {
        this.page--;
        this.updatePaginatedAdmins();
      }
    } else if (page === 'next') {
      if (this.canGoNext()) {
        this.page++;
        this.updatePaginatedAdmins();
      }
    } else {
      this.page = page as number;
      this.updatePaginatedAdmins();
    }
  }
  /*Verifica si es posible retroceder a una página anterior. Retorna true si la página actual es mayor que 1.*/
  canGoPrevious(): boolean {
    return this.page > 1;
  }
  /*Verifica si es posible avanzar a la siguiente página. Retorna true si la página actual es menor que el número total de páginas.*/
  canGoNext(): boolean {
    return this.page < Math.ceil(this.totalItems / this.itemsPerPage);
  }
  /*Genera un array de números que representan las páginas disponibles, basado en el número total de ítems y los ítems por página.*/
  getPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}
