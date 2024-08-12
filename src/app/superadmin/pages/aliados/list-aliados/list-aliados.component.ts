import { Component, OnInit } from '@angular/core';
import { faEye, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { AliadoService } from '../../../../servicios/aliado.service';
import { Aliado } from '../../../../Modelos/aliado.model';
import { User } from '../../../../Modelos/user.model';
import { Router } from '@angular/router';

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

  constructor(
    private aliadoService: AliadoService,
    private router: Router,
  ) { }

  /* Inicializa con esas funciones al cargar la página */
  ngOnInit(): void {
    this.validateToken();
    this.cargarAliados(1); /* Cargar inicialmente con estado 'Activo' */
  }

  cargarAliados(estado: number): void {
    if (this.token) {
      this.aliadoService.getinfoAliado(this.token, estado).subscribe(
        (data: Aliado[]) => {
          this.listaAliado = data.map((item: any) => {
            const aliado = new Aliado(
              item.id,
              item.nombre,
              item.descripcion,
              item.logo,
              item.ruta_multi,
              item.id_tipo_dato,
              item.email,
              item.password,
              item.estado
            );
            aliado['estadoString'] = this.mapEstado(item.estado);
            return aliado;
          });
          console.log(data);
          this.updatePaginatedData(); // Inicializa los datos paginados
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        },
        (err) => {
          console.log(err);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        }
      );
    } else {
      console.error('Token is not available');
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
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
        console.log(this.currentRolId);
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
    var estado = event.target.value;
    if (estado == "Activo") {
      this.cargarAliados(1);
    } else {
      this.cargarAliados(0);
    }
  }

  /* Limpia el filtro de búsqueda, volviendo a retornar los aliados activos */
  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estadoString: 'Activo' };
    this.cargarAliados(1);
  }

  /* Función para filtrar aliados por nombre, ignorando mayúsculas/minúsculas */
  buscarAliados(): Aliado[] {
    const filterText = this.userFilter.nombre.toLowerCase(); // Convierte el texto del filtro a minúsculas
    return this.listaAliado.filter(aliado => {
      const nombreLower = aliado.nombre.toLowerCase(); // Convierte el nombre del aliado a minúsculas
      return nombreLower.includes(filterText);
    });
  }

  editarAliado(id: number): void {
    this.aliadoService.setAliadoId(id);
    this.router.navigate(['edit-aliados']);
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
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAliados = this.buscarAliados().slice(startIndex, endIndex);
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
