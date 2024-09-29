import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DarAliadoAsesoriaModalComponent } from '../dar-aliado-asesoria-modal/dar-aliado-asesoria-modal.component';
import { AsesoriaService } from '../../../../servicios/asesoria.service';
import { Asesoria } from '../../../../Modelos/asesoria.model';

@Component({
  selector: 'app-ver-asesorias',
  templateUrl: './ver-asesorias.component.html',
  styleUrls: ['./ver-asesorias.component.css'],
  providers: [AsesoriaService]
})
export class VerAsesoriasComponent implements OnInit {
  asesorias: Asesoria[] = [];
  asesoriasSinAsesor: Asesoria[] = [];
  asesoriasConAsesor: Asesoria[] = [];
  token: string | null = null;
  user: any = null;
  currentRolId: number;
  sinAsignarCount: number = 0;
  asignadasCount: number = 0;
  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;
  showAsignadasFlag: boolean = false;
  isLoading: boolean = false;
  fullHeightIndices: number[] = [];
  page: number = 1;
  totalAsesorias: number = 0;
  itemsPerPage: number = 8;

  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router
  ) { }


/* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.loadCurrentPage();
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
        if (this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

/*
  Carga las asesorías desde el servicio dependiendo del estado (pendiente o asignada) y actualiza los conteos correspondientes.
*/
  loadAsesorias(pendiente: boolean): void {
    this.isLoading = true;
    this.asesoriaService.postAsesoriasOrientador(this.token, pendiente).subscribe(
      data => {
        if (pendiente) {
          this.asesoriasSinAsesor = data;
          this.sinAsignarCount = this.asesoriasSinAsesor.length;
        } else {
          this.asesoriasConAsesor = data;
          this.asignadasCount = this.asesoriasConAsesor.length;
        }
        this.totalAsesorias = this.asesoriasSinAsesor.length + this.asesoriasConAsesor.length;

        this.isLoading = false;
      },
      error => {
        console.error('Error al obtener las asesorías:', error);
        this.isLoading = false;
      }
    );
  }

/*
  Cambia la página actual según el número de página proporcionado y carga los datos de la página correspondiente.
*/
  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.loadCurrentPage();
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.loadCurrentPage();
      }
    } else {
      this.page = pageNumber as number;
      this.loadCurrentPage();
    }
  }

/*
  Calcula el número total de páginas en función de la cantidad de asesorías sin asignar o asignadas.
*/

  getTotalPages(): number {
    if (this.asesoriasSinAsesor.length >= 2 && this.showAsignadasFlag == false) {
      return Math.ceil(this.asesoriasSinAsesor.length / this.itemsPerPage);
    }else{
      return Math.ceil(this.asesoriasConAsesor.length / this.itemsPerPage);
    }
  }

/*
  Genera un arreglo de números que representa las páginas disponibles.
*/
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }
  
/*
  Verifica si hay una página anterior disponible.
*/
  canGoPrevious(): boolean {
    return this.page > 1;
  }

/*
  Verifica si hay una página siguiente disponible.
*/
  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

/*
  Carga la página actual de asesorías, 
  ya sea asignadas o sin asignar, según el estado del flag.
*/
  loadCurrentPage(): void {
    if (this.showAsignadasFlag) {
      this.loadAsignadas(); // Carga asesorías asignadas
    } else {
      this.loadSinAsignar(); // Carga asesorías sin asignar
    }
  }

/*
  Abre un modal para asignar un aliado a una asesoría específica. 
  Recibe como parámetro la asesoría que se va a modificar.
*/
  openModal(asesoria: Asesoria): void {
    const dialogRef = this.dialog.open(DarAliadoAsesoriaModalComponent, {
      width: '400px',
      data: asesoria
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAsesorias(true);
        this.loadAsesorias(false);
      }
    });
  }

/*
  Carga las asesorías sin asignar y restablece la página actual a 1.
*/
  loadSinAsignar(): void {
    this.showAsignadasFlag = false;
    this.loadAsesorias(true);
    this.page = 1;
  }
  
/*
  Carga las asesorías asignadas y restablece la página actual a 1.
*/
  loadAsignadas(): void {
    this.showAsignadasFlag = true;
    this.loadAsesorias(false);
    this.page = 1;
  }
}
