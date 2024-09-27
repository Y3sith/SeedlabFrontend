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
  showAsignadasFlag: boolean = false; // Flag to indicate which list is being shown
  isLoading: boolean = false;
  fullHeightIndices: number[] = [];

  page: number = 1; // Inicializa la página actual
  totalAsesorias: number = 0; // variable para almacenar el total de asesorias
  itemsPerPage: number = 8; // Número de asesorias por página

  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.validateToken();
    this.loadAllAsesorias(); // Carga las asesorías correctas al iniciar la página
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

  loadAllAsesorias(): void {
    this.isLoading = true;
    
    // Load unassigned asesorías
    this.asesoriaService.postAsesoriasOrientador(this.token, true).subscribe(
      data => {
        this.asesoriasSinAsesor = data;
        this.sinAsignarCount = this.asesoriasSinAsesor.length;
        this.updateTotalCount();
      },
      error => {
        console.error('Error al obtener las asesorías sin asignar:', error);
      }
    );
  
    // Load assigned asesorías
    this.asesoriaService.postAsesoriasOrientador(this.token, false).subscribe(
      data => {
        this.asesoriasConAsesor = data;
        this.asignadasCount = this.asesoriasConAsesor.length;
        this.updateTotalCount();
      },
      error => {
        console.error('Error al obtener las asesorías asignadas:', error);
      }
    );
  }

  updateTotalCount(): void {
    this.totalAsesorias = this.sinAsignarCount + this.asignadasCount;
    this.isLoading = false;
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
    if (this.asesoriasSinAsesor.length >= 2 && this.showAsignadasFlag == false) {
      return Math.ceil(this.asesoriasSinAsesor.length / this.itemsPerPage);
    }else{
      return Math.ceil(this.asesoriasConAsesor.length / this.itemsPerPage);
    }
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

  loadCurrentPage(): void {
    if (this.showAsignadasFlag) {
      this.loadAsignadas(); // Carga asesorías asignadas
    } else {
      this.loadSinAsignar(); // Carga asesorías sin asignar
    }
  }

  openModal(asesoria: Asesoria): void {
    const dialogRef = this.dialog.open(DarAliadoAsesoriaModalComponent, {
      width: '400px',
      data: asesoria
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllAsesorias();
      }
    });
  }

loadSinAsignar(): void {
  this.showAsignadasFlag = false;
  this.page = 1;
  // Use the already loaded asesoriasSinAsesor data
}

loadAsignadas(): void {
  this.showAsignadasFlag = true;
  this.page = 1;
  // Use the already loaded asesoriasConAsesor data
}
}
