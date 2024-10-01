import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faMagnifyingGlass, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { EmprendedorService } from '../../../../servicios/emprendedor.service';
import { Empresa } from '../../../../Modelos/empresa.model';
import { User } from '../../../../Modelos/user.model';
import { AlertService } from '../../../../servicios/alert.service';
import { RespuestasService } from '../../../../servicios/respuestas.service';


@Component({
  selector: 'app-list-empresas',
  templateUrl: './list-empresas.component.html',
  styleUrls: ['./list-empresas.component.css'],
  providers: [EmprendedorService],
})
export class ListEmpresasComponent implements OnInit {
  faPen = faPenToSquare;
  listaEmpresas: Empresa[] = [];
  listaUser: User[] = [];
  documento: string | null;
  page: number = 1;
  token: string | null = null;
  isLoading: boolean = true;
  userFilter: any = { nombre: '' };
  falupa = faMagnifyingGlass;
  user: any = null;
  currentRolId: number;
  totalEmpresas: number = 0;
  itemsPerPage: number = 5;
  empresaId: number;

  constructor(
    private emprendedorService: EmprendedorService,
    private router: Router,
    private alertService: AlertService,
    private respuestaService: RespuestasService
  ) {

  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validarToken();
    this.cargarEmpresas();

  }

  /* Valida el token del login */
  validarToken(): void {
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
  Método para cargar la lista de empresas. 
*/
  cargarEmpresas(): void {
    this.isLoading = true;
    if (this.token) {
      this.emprendedorService.getEmpresas(this.token, this.documento).subscribe(
        (data) => {
          setTimeout(() => {
            this.listaEmpresas = data;
            this.totalEmpresas = data.length;
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
    }
  }

  /*
    Método para cambiar la página de la lista de empresas. 
  */
  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.cargarEmpresas();
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.cargarEmpresas();
      }
    } else {
      this.page = pageNumber as number;
      this.cargarEmpresas();
    }
  }

  /*
    Método para calcular el total de páginas basándose en el número total de empresas 
    y la cantidad de elementos por página.
  */
  getTotalPages(): number {
    return Math.ceil(this.totalEmpresas / this.itemsPerPage);
  }

  /*
    Método para generar un arreglo de números que representa las páginas disponibles. 
    Crea un array del tamaño total de páginas y lo llena con números secuenciales.
  */
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  /*
    Método para determinar si se puede navegar a la página anterior. 
    Retorna true si la página actual es mayor que 1; de lo contrario, retorna false.
  */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /*
    Método para determinar si se puede navegar a la siguiente página. 
    Retorna true si la página actual es menor que el total de páginas; 
    de lo contrario, retorna false.
  */
  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

  /*
    Método para navegar a la página de edición de una empresa. 
    Redirige a 'add-empresa' pasando el ID del emprendedor y el documento como parámetros.
  */
  editEmpresa(id_emprendedor: string, documento: string): void {
    this.router.navigate(['add-empresa', id_emprendedor, documento]);
  }

  /*
    Método para verificar el estado de un formulario y mostrar un mensaje de alerta. 
  */
  checkFormStatusAndShowAlert(documento: string): void {
    this.respuestaService.verificarEstadoForm(this.token, documento)
      .subscribe(
        (response: any) => {
          let mensaje: string;
          if (response.contador === 1) {
            mensaje = "Esta es la primera vez que completas el formulario. Asegúrate de guardar tu progreso.";
          } else if (response.contador === 2) {
            mensaje = "Esta es la segunda vez que completas el formulario. Recuerda que este es tu último intento para realizar el formulario.";
          }
          this.alertService.infoAlert("Indicaciones del formulario", mensaje)
            .then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/encuesta', documento]);
              }
            });
        },
        (error) => {
          if (error.status === 403) {
            this.alertService.errorAlert('Error', 'El formulario ya fue llenado dos veces');
            this.router.navigate(['/list-empresa']);
          }else{
            console.log('Error al verificar el estado del formulario', error);
            this.alertService.errorAlert("Error", "No se pudo verificar el estado del formulario.");
          }
        }
      );
  }

}
