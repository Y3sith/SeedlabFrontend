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
  showTrue: boolean = false;
  showFalse: boolean = true;
  token: string;
  documento: string | null = null;
  user: any = null;
  currentRolId: number;
  sinAsignarCount: number = 0;
  asignadasCount: number = 0;
  busqueda: string = '';
  asesorias: any[] = [];
  resultadosBusqueda: any[] = [];
  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;
  isLoading: boolean = false;
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

/*
  Lista las asesorías asignadas y sin asignar del usuario, utilizando su documento y token.
*/
  listarAsesorias(): void {
    if (this.documento && this.token) {
      this.isLoading = true;
  
      const bodyTrue = {
        documento: this.documento,
        asignacion: true
      };
  
      const bodyFalse = {
        documento: this.documento,
        asignacion: false
      };
  
      this.asesoriaService.getMisAsesorias(this.token, bodyTrue).subscribe(
        response => {
          this.asesoriasTrue = response;
          this.asignadasCount = this.asesoriasTrue.length;
          this.totalAsesorias = this.asesoriasTrue.length + (this.asesoriasFalse?.length || 0);
          this.checkLoadingComplete();
        },
        error => {
          console.error('Error al obtener asesorías asignadas:', error);
          this.checkLoadingComplete();
        }
      );
  
      this.asesoriaService.getMisAsesorias(this.token, bodyFalse).subscribe(
        response => {
          this.asesoriasFalse = response;
          this.sinAsignarCount = this.asesoriasFalse.length;
          this.totalAsesorias = this.asesoriasTrue?.length + this.asesoriasFalse.length;
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
      this.isLoading = false; 
    }
  }
  

  // Código para la paginación
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
  Calcula el número total de páginas según la cantidad de asesorías y el valor de showFalse.
*/
  getTotalPages(): number {
    if(this.asesoriasFalse.length >= 2 && this.showFalse == true){
      return Math.ceil(this.asesoriasFalse.length / this.itemsPerPage);
    }else{
      return Math.ceil(this.asesoriasTrue.length / this.itemsPerPage);
    }
  }

/*
  Genera un arreglo con el número de páginas basado en el total calculado.
*/
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

/*
  Verifica si es posible retroceder de página.
*/
  canGoPrevious(): boolean {
    return this.page > 1;
  }

/*
  Verifica si es posible avanzar de página.
*/
  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

  /*
  Abre un modal para crear una nueva asesoría y lista las asesorías tras cerrarlo.
*/
  openCrearAsesoriaModal() {
    const dialogRef = this.dialog.open(CrearAsesoriaModalComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listarAsesorias();
      }
    });
  }

/*
  Muestra asesorías sin asignar y reinicia la paginación.
*/
  showSinAsignar() {
    this.showTrue = false;
    this.showFalse = true;
    this.page = 1;
    this.listarAsesorias();
  }

/*
  Muestra asesorías asignadas y reinicia la paginación.
*/
  showAsignadas() {
    this.showTrue = true;
    this.showFalse = false;
    this.page = 1;
    this.listarAsesorias();
  }

/*
  Maneja cambios en la búsqueda y filtra asesorías.
*/
  manejarCambio(event: Event) {
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda) {
      this.resultadosBusqueda = this.asesorias.filter(asesoria =>
        asesoria.Nombre_sol.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    } else {
      this.resultadosBusqueda = this.asesorias;
    }
  }
}
