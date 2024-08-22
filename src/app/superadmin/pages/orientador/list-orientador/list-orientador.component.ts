import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalCrearOrientadorComponent } from '../modal-crear-orientador/modal-crear-orientador.component';
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
  isLoading: boolean = true; // Define the property isLoading

  private ESTADO_MAP: { [key: string]: string } = {
    "true": 'Activo',
    "false": 'Inactivo'
  };

  constructor(
    private orientadorService: OrientadorService,
    public dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.cargarOrientador(1);
    this.nose();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        console.log(this.currentRolId);
        if (this.currentRolId != 1 && this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

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

  onEstadoChange(event: any): void {
    const estado = event.target.value;
    this.isLoading = true; // Set isLoading to true when starting to change state
    if (estado === 'Activo') {
      this.cargarOrientador(1);
    } else {
      this.cargarOrientador(0);
    }
  }

  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado_usuario: 'Activo' };
    this.cargarOrientador(1);
  }

  openModal(orientadorId: number | null): void {
    let dialogRef: MatDialogRef<ModalCrearOrientadorComponent>;
    dialogRef = this.dialog.open(ModalCrearOrientadorComponent, {
      data: { orientadorId: orientadorId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result if needed
    });
  }

  openModalSINId(): void {
    this.openModal(null);
  }

  buscarOrientadores(): Orientador[] {
    return this.listaOrientador.filter(orientador =>
      orientador.nombre.toLowerCase().includes(this.userFilter.nombre.toLowerCase()) ||
      orientador.apellido.toLowerCase().includes(this.userFilter.nombre.toLowerCase()) ||
      orientador.celular.includes(this.userFilter.nombre) ||
      orientador.email.toLowerCase().includes(this.userFilter.nombre.toLowerCase())
    );
  }

  nose(): void {
    this.boton = true;
  }

  // Pagination logic
  getPages(): number[] {
    const totalItems = this.buscarOrientadores().length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  canGoPrevious(): boolean {
    return this.page > 1;
  }

  canGoNext(): boolean {
    return this.page < this.getPages().length;
  }

  changePage(direction: 'previous' | 'next' | number): void {
    if (direction === 'previous' && this.canGoPrevious()) {
      this.page--;
    } else if (direction === 'next' && this.canGoNext()) {
      this.page++;
    } else if (typeof direction === 'number') {
      this.page = direction;
    }
  }

  updatePaginatedAdmins(): void {
    this.page = 1; // Reset to first page on search or filter change
  }

  getPaginatedOrientadores(): Orientador[] {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.buscarOrientadores().slice(startIndex, endIndex);
  }
}
