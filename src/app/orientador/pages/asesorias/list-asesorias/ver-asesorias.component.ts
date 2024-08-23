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
  Nombre_sol: string | null = null;
  nombre_sol: string | null = null;
  showAsignadasFlag: boolean = false; // Flag to indicate which list is being shown
  filteredAsesorias: Asesoria[] = [];
  fullHeightIndices: number[] = [];
  
  allAsesoriasSinAsesor: Asesoria[] = [];
  allAsesoriasConAsesor: Asesoria[] = [];
  searchTerm: string = '';
  
  userFilter: any = { Nombre_sol: '' };
  
  page: number = 1; // Inicializa la página actual
  totalAsesorias: number = 0; // variable para almacenar el total de asesorias
  itemsPerPage: number = 6; // Número de asesorias por página

  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.validateToken();
    this.loadCurrentPage(); // Carga las asesorías correctas al iniciar la página
    // Load both on init to ensure counts are accurate
  }

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

  loadAsesorias(pendiente: boolean): void {
    this.asesoriaService.postAsesoriasOrientador(this.token, pendiente).subscribe(
      data => {
        if (pendiente) {
          this.asesoriasSinAsesor = data;
          this.sinAsignarCount = this.asesoriasSinAsesor.length;
          this.totalAsesorias = data.length; // Actualiza el total de asesorias
        } else {
          this.asesoriasConAsesor = data;
          this.asignadasCount = this.asesoriasConAsesor.length;
          this.totalAsesorias = data.length; // Actualiza el total de asesorias
        }
      },
      error => {
        console.error('Error al obtener las asesorías orientador:', error);
      }
    );
  }

  loadCurrentPage(): void {
    if (this.showAsignadasFlag) {
      this.loadAsignadas(); // Carga asesorías asignadas
    } else {
      this.loadSinAsignar(); // Carga asesorías sin asignar
    }
  }

  // Código para la paginación
  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.loadCurrentPage(); // Carga las asesorias de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.loadCurrentPage(); // Carga las asesorias de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.loadCurrentPage(); // Carga las asesorias de la página seleccionada
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalAsesorias / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  canGoPrevious(): boolean {
    return this.page > 1;
  }

  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

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

  loadSinAsignar(): void {
    this.showAsignadasFlag = false;
    this.loadAsesorias(true);
  }

  loadAsignadas(): void {
    this.showAsignadasFlag = true;
    this.loadAsesorias(false);
  }


}
