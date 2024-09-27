import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HorarioModalComponent } from '../horario-modal/horario-modal.component';
import { AsesoriaService } from '../../../servicios/asesoria.service';
import { Asesoria } from '../../../Modelos/asesoria.model';
import { AsesorService } from '../../../servicios/asesor.service';
import { forkJoin } from 'rxjs';

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
  showTrue: boolean = false;
  showFalse: boolean = true;
  token: string | null = null;
  user: any = null;
  filteredAsesorias: Asesoria[] = [];
  currentRolId: number;
  isLoading: boolean = false;
  sinHorarioCount: number = 0;
  conHorarioCount: number = 0;
  totalAsesorias: number = 0;
  page: number = 1;
  itemsPerPage: number = 8;
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
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
    Esta función obtiene la lista de asesorías asociadas a un asesor, diferenciando entre
    asesorías con y sin horario, y actualiza los contadores correspondientes.
  */
  listarAsesorias(): void {
    if (this.user && this.token) {
      this.isLoading = true;
      const idAsesor = this.user.id;
      const requestSinHorario = this.asesorService.mostrarAsesoriasAsesor(this.token, idAsesor, false);
      const requestConHorario = this.asesorService.mostrarAsesoriasAsesor(this.token, idAsesor, true);
      forkJoin([requestSinHorario, requestConHorario]).subscribe(
        ([responseSinHorario, responseConHorario]) => {

          this.asesoriasSinHorario = responseSinHorario || [];
          this.asesoriasConHorario = responseConHorario || [];

          this.sinHorarioCount = this.asesoriasSinHorario.length;
          this.conHorarioCount = this.asesoriasConHorario.length;
          this.totalAsesorias = this.asesoriasSinHorario.length + this.asesoriasConHorario.length;
          this.isLoading = false;
        },
        error => {
          console.error('Error al cargar asesorías:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.error('Usuario o token no encontrado.');
    }
  }

  /*
    Esta función permite cambiar de página en un sistema de paginación, ya sea navegando a la
    página anterior, la siguiente, o a una página específica.
  */
  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.listarAsesorias();
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.listarAsesorias();
      }
    } else {
      this.page = pageNumber as number;
      this.listarAsesorias();
    }
  }

  /*
    Esta función calcula y devuelve el número total de páginas necesarias para mostrar todas las asesorías, 
    dependiendo de si se están mostrando asesorías con o sin horario.
  */
  getTotalPages(): number {
    const list = this.showFalse ? this.asesoriasSinHorario : this.asesoriasConHorario;
    if (!list) {
      return 1; // Devuelve 1 si la lista es undefined
    }
    return Math.ceil(list.length / this.itemsPerPage);
  }

  /*
    Esta función genera un arreglo con los números de las páginas que van desde 1 hasta el total de páginas calculado.
  */
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  /*
    Esta función verifica si se puede retroceder a una página anterior en la paginación.
  */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /*
    Esta función determina si se puede avanzar a una página siguiente en la paginación.
  */
  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

  /*
    Esta función abre un modal para una asesoría específica.
  */
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
      this.listarAsesorias();
    });
  }

  /*
    Esta función actualiza el estado de la vista para mostrar asesorías "sin asignar" (sin horario).
  */
  showSinAsignar() {
    this.showTrue = false;
    this.showFalse = true;
    this.page = 1;
    this.listarAsesorias();
  }

  /*
    Esta función actualiza el estado de la vista para mostrar las asesorías "asignadas" (con horario).
  */
  showAsignadas() {
    this.showTrue = true;
    this.showFalse = false;
    this.page = 1;
    this.listarAsesorias();
  }

}
