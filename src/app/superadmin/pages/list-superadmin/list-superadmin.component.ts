import { Component, OnInit } from '@angular/core';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../../Modelos/user.model';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Superadmin } from '../../../Modelos/superadmin.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalCrearSuperadminComponent } from '../add-superadmin/modal-crear-superadmin.component';
import { ActivatedRoute, Router } from '@angular/router';

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
  public isLoading: boolean = false;
  idSuperAdmin: number = null;

  constructor(
    private superAdminService: SuperadminService,
    public dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.cargarSuperAdmin();
  }

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

  openModal(adminId: number | null): void {
    let dialogRef: MatDialogRef<ModalCrearSuperadminComponent>;
    dialogRef = this.dialog.open(ModalCrearSuperadminComponent, {
      data: { adminId: adminId }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.cargarSuperAdmin();
    });
  }

  openModalSINId(): void {
    this.openModal(null);
  }

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

  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estadoString: 'Activo' };
    this.cargarSuperAdmin();
  }

  onEstadoChange(): void {
    this.cargarSuperAdmin();
  }

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

  canGoPrevious(): boolean {
    return this.page > 1;
  }

  canGoNext(): boolean {
    return this.page < Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}
