import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AsignarAsesorModalComponent } from '../asignar-asesor-modal/asignar-asesor-modal.component';
import { AsesoriaService } from '../../../servicios/asesoria.service';
import { HeaderComponent } from '../../../header/header.component';
import { Asesoria } from '../../../Modelos/asesoria.model';
import { AlertService } from '../../../servicios/alert.service';


@Component({
  selector: 'app-asesoria-aliado',
  templateUrl: './asesoria-aliado.component.html',
  styleUrls: ['./asesoria-aliado.component.css'],
  providers: [AsesoriaService, AlertService]
})
export class AsesoriaAliadoComponent implements OnInit {
  asesorias: Asesoria[] = [];
  asesoriasConAsesor: Asesoria[] = [];
  asesoriasSinAsesor: Asesoria[] = [];
  token: string | null = null;
  user: any = null;
  currentRolId: number;
  mensaje: string | null = null;
  @ViewChild('sinAsignarButton') sinAsignarButton!: ElementRef;
  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;
  tiempoEspera = 1800;

  page: number = 1; // Inicializa la página actual
  totalAsesorias: number = 0; // variable para almacenar el total de asesorias
  itemsPerPage: number = 6; // Número de asesorias por página

  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router,
    private alertService: AlertService,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.separarAsesorias();
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
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    } else {
      this.loadAsesorias(1, 0);
    }
  }

  loadAsesorias(rol: number, estado: number): void {
    this.asesoriaService.getAsesoriasPorRolYEstado(this.token, rol, estado).subscribe(
      data => {
        this.asesorias = data;
        this.separarAsesorias();
        this.showSinAsignar(); // Show "Sin asignar" asesorias by default
        this.totalAsesorias = data.length; // Actualiza el total de asesorias
      },
      error => {
        console.error('Error al obtener las asesorías:', error);
      }
    );
  }

   // Código para la paginación
   changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.separarAsesorias(); // Carga las asesorias de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.separarAsesorias(); // Carga las asesorias de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.separarAsesorias(); // Carga las asesorias de la página seleccionada
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

  separarAsesorias(): void {
    this.asesoriasConAsesor = this.asesorias.filter(asesoria => asesoria.Asesor);
    this.asesoriasSinAsesor = this.asesorias.filter(asesoria => !asesoria.Asesor);

    if (this.asesorias.length === 0) {
      this.mensaje = "No hay asesorías disponibles para mostrar.";
    } else if (this.asesoriasSinAsesor.length === 0) {
      this.mensaje = "No hay asesorías esperando por asignación.";
    } else if (this.asesoriasConAsesor.length === 0) {
      this.mensaje = "Aún no has asignado ninguna asesoría.";
    } else {
      this.mensaje = null;
    }
  }

  openModal(asesoria: Asesoria): void {
    const dialogRef = this.dialog.open(AsignarAsesorModalComponent, {
      width: '400px',
      data: { asesoria: asesoria }
    });

    dialogRef.componentInstance.asesoriaAsignada.subscribe(() => {
      this.loadAsesorias(1, 0); // Recargar las asesorías
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  rechazarAsesoria(asesoria: Asesoria): void {
    if (asesoria && asesoria.id_asesoria) {
      this.alertService.alertaActivarDesactivar("¿Estas seguro de rechazar la asesoria?", 'question',).then((result) => {
        if (result.isConfirmed) {
          this.asesoriaService.rechazarAsesoria(this.token, asesoria.id_asesoria, 'rechazar').subscribe(
            data => {
              this.loadAsesorias((this.currentRolId!), 1);
              this.alertService.successAlert('Exito', data.message);
              setTimeout(function () {
                location.reload();
              }, this.tiempoEspera);
            },
            error => {
              this.alertService.errorAlert('Error', error.error.message);
              console.error('Error al rechazar asesoría:', error);
            }
          );
        }

      })
    }
  }

  showSinAsignar(): void {
    this.asesorias = this.asesoriasSinAsesor;
    this.mensaje = this.asesorias.length === 0 ? "No hay asesorías esperando por asignación." : null;
  }

  showAsignadas(): void {
    this.asesorias = this.asesoriasConAsesor;
    this.mensaje = this.asesorias.length === 0 ? "Aún no has asignado ninguna asesoría." : null;
  }

  filtrarAsesorias(): void {
    const filtro = this.Nombre_sol?.trim().toLowerCase(); // Utiliza Nombre_sol
    if (filtro) {
      this.asesorias = this.asesorias.filter(asesoria =>
        asesoria.nombre_sol.toLowerCase().includes(filtro) // Utiliza Nombre_sol
      );
    } else {
      // Si el filtro está vacío, restaura las asesorías originales
      this.separarAsesorias();
    }
  }
}
