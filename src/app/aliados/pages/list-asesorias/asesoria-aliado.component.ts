import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AsignarAsesorModalComponent } from '../asignar-asesor-modal/asignar-asesor-modal.component';
import { AsesoriaService } from '../../../servicios/asesoria.service';
import { HeaderComponent } from '../../../header/header.component';
import { Asesoria } from '../../../Modelos/asesoria.model';
import { AlertService } from '../../../servicios/alert.service';
import { Rol } from '../../../Modelos/rol.model';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-asesoria-aliado',
  templateUrl: './asesoria-aliado.component.html',
  styleUrls: ['./asesoria-aliado.component.css'],
  providers: [AsesoriaService, AlertService]
})
export class AsesoriaAliadoComponent implements OnInit {
  asesorias: Asesoria[] = [];
  asesoriasConAsesor: any[] = [];
  asesoriasSinAsesor: any[] = [];
  token: string | null = null;
  user: any = null;
  id_aliado: number;
  currentRolId: number;
  mensaje: string | null = null;
  @ViewChild('sinAsignarButton') sinAsignarButton!: ElementRef;
  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;
  tiempoEspera = 1800;
  isLoading: boolean = false;


  page: number = 1; // Inicializa la página actual
  totalAsesorias: number = 0; // variable para almacenar el total de asesorias
  itemsPerPage: number = 6; // Número de asesorias por página
  sinAsesorCount: number = 0;
  conAsesorCount: number = 0;
  showTrue: boolean = false; // Inicializa en false para no mostrar asesorías con horario al principio
  showFalse: boolean = true; // Inicializa en true para mostrar asesorías sin horario al principio

  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router,
    private alertService: AlertService,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.loadAsesorias();
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
        this.id_aliado = this.user.id;
        console.log("IIIIIIIIIIIIIIIII",this.id_aliado);
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }


  loadAsesorias(): void {
    if (this.user && this.token) {
      this.isLoading = true; // Empieza a cargar

      const idAliado = this.user.id;

      const requestConAsesor = this.asesoriaService.getAsesoriasPorRolYEstado(this.token, idAliado, true);
      const requestSinAsesor = this.asesoriaService.getAsesoriasPorRolYEstado(this.token, idAliado, false);

      forkJoin([requestSinAsesor, requestConAsesor]).subscribe(
        ([responseSinAsesor, responseConAsesor]) => {

          console.log('Response Sin Asesor', responseSinAsesor);
          console.log('Response Con Asesor', responseConAsesor);

          // Asignar correctamente las asesorías según corresponda
          this.asesoriasSinAsesor = Array.isArray(responseSinAsesor) ? responseSinAsesor : [];
          this.asesoriasConAsesor = Array.isArray(responseConAsesor) ? responseConAsesor : [];

          this.sinAsesorCount = this.asesoriasSinAsesor.length;
          this.conAsesorCount = this.asesoriasConAsesor.length;
          this.totalAsesorias = this.asesoriasSinAsesor.length + this.asesoriasConAsesor.length;

          console.log('Asesorias sin Asesor', this.asesoriasSinAsesor);
          console.log('Asesorias con Asesor', this.asesoriasConAsesor);

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

   // Código para la paginación
   changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.loadAsesorias(); // Carga las asesorias de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.loadAsesorias(); // Carga las asesorias de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.loadAsesorias(); // Carga las asesorias de la página seleccionada
    }
  }

  getTotalPages(): number {
    const list = this.showFalse ? this.asesoriasSinAsesor : this.asesoriasConAsesor;
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

  openModal(asesoria: Asesoria): void {
    const dialogRef = this.dialog.open(AsignarAsesorModalComponent, {
      width: '400px',
      data: { asesoria: asesoria }
    });

    dialogRef.componentInstance.asesoriaAsignada.subscribe(() => {
      this.loadAsesorias(); // Recargar las asesorías
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }


  rechazarAsesoria(asesoria: Asesoria): void {
    if (asesoria && asesoria.id_asesoria) {
        this.alertService.alertaActivarDesactivar("¿Estás seguro de rechazar la asesoría?", 'question').then((result) => {
            if (result.isConfirmed) {
                this.asesoriaService.rechazarAsesoria(this.token, asesoria.id_asesoria, 'rechazar').subscribe(
                    data => {
                        this.loadAsesorias(); // Pasa un array con el estado 1
                        this.alertService.successAlert('Éxito', data.message);
                        setTimeout(() => {
                            location.reload();
                        }, this.tiempoEspera);
                    },
                    error => {
                        this.alertService.errorAlert('Error', error.error.message);
                        console.error('Error al rechazar asesoría:', error);
                    }
                );
            }
        });
    }
}

// Mostrar asesorías sin asignar
showSinAsignar(): void {
  this.showFalse = true;
  this.showTrue = false;
  this.page = 1; // Reinicia la página al cambiar de vista
  this.loadAsesorias();
}

// Mostrar asesorías asignadas
showAsignadas(): void {
  this.showTrue = true;
  this.showFalse = false;
  this.page = 1; // Reinicia la página al cambiar de vista
  this.loadAsesorias();
}

  filtrarAsesorias(): void {
    const filtro = this.Nombre_sol?.trim().toLowerCase(); // Utiliza Nombre_sol
    if (filtro) {
      this.asesorias = this.asesorias.filter(asesoria =>
        asesoria.nombre_sol.toLowerCase().includes(filtro) // Utiliza Nombre_sol
      );
    } else {
      // Si el filtro está vacío, restaura las asesorías originales
      this.loadAsesorias();
    }
  }
}
