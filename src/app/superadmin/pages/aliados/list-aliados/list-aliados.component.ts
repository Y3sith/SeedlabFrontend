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

  /*
  Este método se encarga de cargar la lista de aliados.
*/
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
    const filterText = this.userFilter.nombre.trim();
    return this.listaAliado.filter(aliado => {
      if (typeof aliado.nombre === 'string') {
        return aliado.nombre.includes(filterText);
      } else {
        // Handle the case where aliado.nombre is not a string
        return false;
      }
    });
  }

  /*
  Direcciona a la pagina para editar el aliado
  */
  editarAliado(id: any): void {
    this.router.navigateByUrl("edit-aliados/" + id);
  }

  /*
    Este método permite cambiar la página actual 
    en el sistema de paginación. Acepta un argumento que 
    determina la nueva página a la que se debe navegar.
  */
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

  /* 
  Actualiza los datos paginados de aliados según el número de página, la cantidad de ítems por página, 
  y el filtro aplicado por nombre y estado. Filtra los aliados según el texto ingresado y estado seleccionado, 
  luego recorta los resultados para mostrar solo la porción correspondiente a la página actual.
  */
  updatePaginatedData(): void {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const filterText = this.userFilter.nombre.trim();
  
    this.paginatedAliados = this.listaAliado
      .filter(aliado => {
        if (typeof aliado.nombre === 'string') {
          return aliado.nombre.includes(filterText) && aliado.estado.toString() === this.userFilter.estadoString;
        } else {
          // Handle the case where aliado.nombre is not a string
          return false;
        }
      })
      .slice(start, end);
  }

  /* 
  Calcula el número total de páginas según el número total de aliados filtrados y la cantidad de ítems por página.
  */
  getTotalPages(): number {
    return Math.ceil(this.buscarAliados().length / this.itemsPerPage);
  }

  /* 
  Genera un arreglo de números que representan las páginas disponibles, comenzando desde 1 hasta el número total de páginas.
  */
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  /* 
  Verifica si es posible ir a la página anterior, devolviendo 'true' si la página actual es mayor que 1.
  */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /* 
  Verifica si es posible ir a la página siguiente, devolviendo 'true' si la página actual es menor al total de páginas.
  */
  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }
}
