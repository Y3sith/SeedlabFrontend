import { Component, OnInit } from '@angular/core';
import { faEye, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { AliadoService } from '../../../../servicios/aliado.service';
import { Aliado } from '../../../../Modelos/aliado.model';
import { User } from '../../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-list-aliados',
  templateUrl: './list-aliados.component.html',
  styleUrls: ['./list-aliados.component.css'],
  providers: [AliadoService],
})
export class ListAliadosComponent implements OnInit {
  userFilter: any = { nombre: '', estadoString: 'Activo' };
  faeye = faEye;
  falupa = faMagnifyingGlass;
  fax = faXmark;
  public page: number = 1; // Inicializa la página en 1
  public itemsPerPage: number = 5; // Cambia según tus necesidades
  public totalAliados: number = 0; // Número total de aliados, inicializado en 0
  listaAliado: Aliado[] = [];
  paginatedAliados: Aliado[] = []; // Agrega esta propiedad para la paginación
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  isLoading: boolean = true;
  nombre: string | null = null;
  public totalItems: number = 0;
  id: string | null;

  constructor(
    private aliadoService: AliadoService,
    private router: Router,
    private aRoute: ActivatedRoute
  ) { this.id = this.aRoute.snapshot.paramMap.get('id');}

  /* Inicializa con esas funciones al cargar la página */
  ngOnInit(): void {
    this.validateToken();
    this.cargarAliados(); /* Cargar inicialmente con estado 'Activo' */
  }

  cargarAliados(): void {
    this.isLoading = true;
    if (this.token) {
      this.aliadoService.getAliadosparalistarbien(this.token, this.userFilter.estadoString).subscribe(
        (data) => {
          this.listaAliado = data;
          console.log(this.listaAliado);
          this.totalItems = data.length; // Actualiza el total de items
          this.page = 1; // Reinicia la página a 1
          this.updatePaginatedData(); // Actualiza los datos paginados
          this.isLoading = false;
        },
        (error) => {
          console.log(error);
          this.isLoading = false;
        }
      );
    }
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 1 && this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  private mapEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  /* Retorna los aliados dependiendo de su estado, normalmente en activo */
  onEstadoChange(event: any): void {
      this.cargarAliados();
  }

  /* Limpia el filtro de búsqueda, volviendo a retornar los aliados activos */
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estadoString: 'Activo' };
    this.cargarAliados();
  }

  /* Función para filtrar aliados por nombre, ignorando mayúsculas/minúsculas */
  buscarAliados(): Aliado[] {
    const filterText = this.userFilter.nombre.toLowerCase(); // Convierte el texto del filtro a minúsculas
    return this.listaAliado.filter(aliado => {
      const nombreLower = aliado.nombre.toLowerCase(); // Convierte el nombre del aliado a minúsculas
      return nombreLower.includes(filterText);
    });
  }

  editarAliado(id: any): void {
    this.router.navigateByUrl("edit-aliados/" + id);
  }

  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
      }
    } else {
      this.page = pageNumber as number;
    }
    // Actualiza el array con los ítems que se deben mostrar en la página actual
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    const filterText = this.userFilter.nombre.toLowerCase(); // Convierte el texto del filtro a minúsculas

    this.paginatedAliados = this.listaAliado
      .filter(aliado => {
        const nombreLower = aliado.nombre.toLowerCase(); // Convierte el nombre del admin a minúsculas
        return nombreLower.includes(filterText) &&
        aliado.estado.toString() === this.userFilter.estadoString; // Ajuste aquí
      })
      .slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.buscarAliados().length / this.itemsPerPage);
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
}
