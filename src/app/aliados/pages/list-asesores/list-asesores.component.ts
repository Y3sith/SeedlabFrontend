import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { faEye, faMagnifyingGlass, faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalAddAsesoresComponent } from '../add-asesores/modal-add-asesores.component';
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
  idAsesor: number = null;
  userFilter: any = { nombre: '', estado: 'Activo' };

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private aliadoService: AliadoService
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.cargarAsesores();
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

/*
  Este método se encarga de cargar la lista de asesores 
  asociados al usuario actual, utilizando un token de autenticación.
*/
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
/*
  Este método se ejecuta cuando hay un cambio en el estado 
  del filtro de asesores. Su principal función es recargar 
  la lista de asesores para reflejar los cambios realizados 
  en el filtro.
*/
  onEstadoChange(): void {
    this.cargarAsesores();
  }

/*
  Este método se encarga de restablecer los filtros aplicados 
  para la búsqueda de asesores. Específicamente, reinicia 
  los valores de los filtros a sus configuraciones por defecto.
*/
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado: 'Activo' };
    this.cargarAsesores();
  }

/*
  Este método maneja la apertura de un modal para agregar o 
  editar información sobre un asesor. 
*/
  openModal(asesorId: number | null): void {
    let dialogRef: MatDialogRef<ModalAddAsesoresComponent>;

    dialogRef = this.dialog.open(ModalAddAsesoresComponent, {
      data: { asesorId: asesorId }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.cargarAsesores();
    });
  }

 /*
    Este método genera un array de números que 
    representan las páginas disponibles en el sistema de 
    paginación, basado en la cantidad total de elementos 
    y la cantidad de elementos por página.
  */
  getPages(): number[] {
    const totalItems = this.listaAsesores.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
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
    const totalItems = this.listaAsesores.length;
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
}
