import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HorarioModalComponent } from '../horario-modal/horario-modal.component';
import { AsesoriaService } from '../../../servicios/asesoria.service';
import { Asesoria } from '../../../Modelos/asesoria.model';
import { AsesorService } from '../../../servicios/asesor.service';
import { forkJoin } from 'rxjs'; // Asegúrate de importar forkJoin desde RxJS

@Component({
  selector: 'app-asesorias',
  templateUrl: './asesorias.component.html',
  styleUrls: ['./asesorias.component.css'],
  providers: [AsesorService]
})
export class AsesoriasComponent implements OnInit {
  asesorias: Asesoria[] = [];
  asesoriasConHorario: any[] = [];
  asesoriasSinHorario: any[] = [];
  showTrue: boolean = false; // Inicializa en false para no mostrar asesorías con horario al principio
  showFalse: boolean = true; // Inicializa en true para mostrar asesorías sin horario al principio
  token: string | null = null;
  user: any = null;
  filteredAsesorias: Asesoria[] = [];
  currentRolId: number;
  isLoading: boolean = false;

  sinHorarioCount: number = 0;
  conHorarioCount: number = 0;
  totalAsesorias: number = 0; // variable para almacenar el total de asesorias
  page: number = 1;
  itemsPerPage: number = 8; // Puedes ajustar este valor según la cantidad de ítems por página

  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;



  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router,
    private asesorService: AsesorService
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.listarAsesorias()
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  listarAsesorias(): void {
    if (this.user && this.token) {
      this.isLoading = true; // Empieza a cargar

      const idAsesor = this.user.id;

      // Agrega paginación a las solicitudes
      const requestSinHorario = this.asesorService.mostrarAsesoriasAsesor(this.token, idAsesor, false);
      const requestConHorario = this.asesorService.mostrarAsesoriasAsesor(this.token, idAsesor, true);

      // Ejecutar ambas solicitudes en paralelo
      forkJoin([requestSinHorario, requestConHorario]).subscribe(
        ([responseSinHorario, responseConHorario]) => {

          this.asesoriasSinHorario = responseSinHorario || [];
          this.asesoriasConHorario = responseConHorario || [];

          this.sinHorarioCount = this.asesoriasSinHorario.length;
          this.conHorarioCount = this.asesoriasConHorario.length;
          this.totalAsesorias = this.asesoriasSinHorario.length + this.asesoriasConHorario.length; // Calcula el total de asesorías

          this.isLoading = false; // Finaliza la carga
        },
        error => {
          console.error('Error al cargar asesorías:', error);
          this.isLoading = false; // Finaliza la carga en caso de error
        }
      );
    } else {
      console.error('Usuario o token no encontrado.');
    }
  }

  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.listarAsesorias(); // Carga las asesorías de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.listarAsesorias(); // Carga las asesorías de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.listarAsesorias(); // Carga las asesorías de la página seleccionada
    }
  }

  getTotalPages(): number {
    const list = this.showFalse ? this.asesoriasSinHorario : this.asesoriasConHorario;
    if (!list) {
      return 1; // Devuelve 1 si la lista es undefined
    }
    return Math.ceil(list.length / this.itemsPerPage);
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

  openModal(asesoria: any): void {
    if (!asesoria || !asesoria.id) {
      console.error('ID de asesoria no encontrado');
      return;
    }

    const dialogRef = this.dialog.open(HorarioModalComponent, {
      width: '400px',
      data: { asesoria }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Recargar las asesorías después de cerrar el modal
      this.listarAsesorias();
    });
  }

  showSinAsignar() {
    this.showTrue = false;
    this.showFalse = true;
    this.page = 1;
    this.listarAsesorias(); // Esto asegurará que se carguen las asesorías sin horario
  }

  showAsignadas() {
    this.showTrue = true;
    this.showFalse = false;
    this.page = 1;
    this.listarAsesorias(); // Esto asegurará que se carguen las asesorías con horario
  }

}
