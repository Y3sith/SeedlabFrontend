import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';


import { AsesoriaService } from '../../../../servicios/asesoria.service';
import { CrearAsesoriaModalComponent } from '../crear-asesoria-modal/crear-asesoria-modal.component';


import { Asesoria } from '../../../../Modelos/asesoria.model';

@Component({
  selector: 'app-list-asesoria',
  templateUrl: './list-asesoria-emprendedor.component.html',
  styleUrls: ['./list-asesoria-emprendedor.component.css'],
})
export class ListAsesoriaEmprendedorComponent implements OnInit {
  asesoriasTrue: Asesoria[] = [];
  asesoriasFalse: Asesoria[] = [];
  showTrue: boolean = false; // Set to false by default to show "Sin Asignar"
  showFalse: boolean = true; // Set to true by default to show "Sin Asignar"
  token: string;
  documento: string | null = null;
  user: any = null;
  currentRolId: number;
  sinAsignarCount: number = 0;
  asignadasCount: number = 0;
  busqueda: string = '';
  asesorias: any[] = []; // Tus datos
  resultadosBusqueda: any[] = []; //

  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;
  isLoading: boolean = false;
  
  page: number = 1; // Inicializa la página actual
  totalAsesorias: number = 0; // variable para almacenar el total de asesorias
  itemsPerPage: number = 6; // Número de asesorias por página

  constructor(
    private asesoriaService: AsesoriaService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.listarAsesorias();
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

        if (this.currentRolId != 5) {
          this.router.navigate(['home']);
        } else {
          this.documento = this.user.emprendedor.documento;
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }


  listarAsesorias(): void {
    if (this.documento && this.token) {
      this.isLoading = true; // Empieza a cargar
  
      const bodyTrue = {
        documento: this.documento,
        asignacion: true
      };
  
      const bodyFalse = {
        documento: this.documento,
        asignacion: false
      };
  
      // Solicitud para asesorías asignadas
      this.asesoriaService.getMisAsesorias(this.token, bodyTrue).subscribe(
        response => {
          this.asesoriasTrue = response;
          this.asignadasCount = this.asesoriasTrue.length; // Actualiza el contador
          this.totalAsesorias = this.asesoriasTrue.length + (this.asesoriasFalse?.length || 0); // Actualiza el total de asesorías
          this.checkLoadingComplete();
        },
        error => {
          console.error('Error al obtener asesorías asignadas:', error);
          this.checkLoadingComplete();
        }
      );
  
      // Solicitud para asesorías sin asignar
      this.asesoriaService.getMisAsesorias(this.token, bodyFalse).subscribe(
        response => {
          this.asesoriasFalse = response;
          this.sinAsignarCount = this.asesoriasFalse.length; // Actualiza el contador
          this.totalAsesorias = this.asesoriasTrue?.length + this.asesoriasFalse.length; // Actualiza el total de asesorías
          this.checkLoadingComplete();
        },
        error => {
          console.error('Error al obtener asesorías sin asignar:', error);
          this.checkLoadingComplete();
        }
      );
    } else {
      console.error('Documento o token no encontrado en el localStorage');
    }
  }
  
  // Método para comprobar si ambos datos están cargados
  checkLoadingComplete(): void {
    if (this.asesoriasTrue !== undefined && this.asesoriasFalse !== undefined) {
      this.isLoading = false; // Termina la carga cuando ambos datos están disponibles
    }
  }
  

  // Código para la paginación
  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.listarAsesorias(); // Carga las asesorias de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.listarAsesorias(); // Carga las asesorias de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.listarAsesorias(); // Carga las asesorias de la página seleccionada
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

  openCrearAsesoriaModal() {
    const dialogRef = this.dialog.open(CrearAsesoriaModalComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Asesoría creada:', result);
        this.listarAsesorias();
      }
    });
  }

  showSinAsignar() {
    this.showTrue = false;
    this.showFalse = true;
  }

  showAsignadas() {
    this.showTrue = true;
    this.showFalse = false;
  }
  manejarCambio(event: Event) {
    this.busqueda = (event.target as HTMLInputElement).value;

    // Lógica de búsqueda
    if (this.busqueda) {
      this.resultadosBusqueda = this.asesorias.filter(asesoria =>
        asesoria.Nombre_sol.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    } else {
      this.resultadosBusqueda = this.asesorias;
    }
  }

}
