import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { faEye, faMagnifyingGlass, faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalAddAsesoresComponent } from '../modal-add-asesores/modal-add-asesores.component';
import { User } from '../../../Modelos/user.model';
import { Asesor } from '../../../Modelos/asesor.model';
import { AliadoService } from '../../../servicios/aliado.service';

@Component({
  selector: 'app-list-asesores',
  templateUrl: './list-asesores.component.html',
  styleUrls: ['./list-asesores.component.css'],
  providers: [AliadoService]
})
export class ListAsesoresComponent implements OnInit {
  asesor: Asesor[] = [];
  faPen = faPenToSquare;
  faeye = faEye;
  fax = faXmark;
  falupa = faMagnifyingGlass;
  public page: number = 1;
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  estado: boolean | null = null;
  id: number | null = null;
  nombre: string | null = null;
  listaAsesores: Asesor[] = [];
  selectedAsesorId: number | null = null;
  isLoading: boolean = false;

  userFilter: any = { nombre: '', estado: 'Activo' };

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private aliadoService: AliadoService
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.cargarAsesores();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  cargarAsesores() {
    if (this.token) {
      this.isLoading = true;
      this.aliadoService.getinfoAsesor(this.token, this.user.id, this.userFilter.estado).subscribe(
        (data) => {
          this.listaAsesores = data;
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
    }
  }

  onEstadoChange(): void {
    this.cargarAsesores();
  }

  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado: 'Activo' };
    this.cargarAsesores();
  }

  openModal(asesorId: number | null): void {
    let dialogRef: MatDialogRef<ModalAddAsesoresComponent>;

    dialogRef = this.dialog.open(ModalAddAsesoresComponent, {
      data: { asesorId: asesorId }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.cargarAsesores();
    });
  }

  getPages(): number[] {
    const totalItems = this.listaAsesores.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  canGoPrevious(): boolean {
    return this.page > 1;
  }

  canGoNext(): boolean {
    const totalItems = this.listaAsesores.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return this.page < totalPages;
  }

  changePage(page: number | 'previous' | 'next'): void {
    if (page === 'previous' && this.canGoPrevious()) {
      this.page--;
    } else if (page === 'next' && this.canGoNext()) {
      this.page++;
    } else if (typeof page === 'number') {
      this.page = page;
    }
  }
}
