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
  page: number = 1; // Inicializa la página actual
  token: string | null = null;
  isLoading: boolean = true; // Variable para gestionar el estado de carga
  userFilter: any = { nombre: '' };
  falupa = faMagnifyingGlass;
  user: any = null;
  currentRolId: number;
  totalEmpresas: number = 0; // Variable para almacenar el total de empresas
  itemsPerPage: number = 5; // Número de empresas por página
  empresaId: number;

  constructor(
    private emprendedorService: EmprendedorService,
    private router: Router,
    private alertService: AlertService,
    private respuestaService: RespuestasService
  ) {
    
  }

  ngOnInit(): void {
    this.validarToken();
    this.cargarEmpresas();
    
  }

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

  cargarEmpresas(): void {
    this.isLoading = true;
    if (this.token) {
      this.emprendedorService.getEmpresas(this.token, this.documento).subscribe(
        (data) => {
          setTimeout(() => {
            this.listaEmpresas = data;
            this.totalEmpresas = data.length; // Actualiza el total de empresas
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

  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.cargarEmpresas(); // Carga las empresas de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.cargarEmpresas(); // Carga las empresas de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.cargarEmpresas(); // Carga las empresas de la página seleccionada
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalEmpresas / this.itemsPerPage);
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

  editEmpresa(id_emprendedor: string ,documento: string): void {
    // Implementa la lógica para editar una empresa
    this.router.navigate(['add-empresa', id_emprendedor, documento ]);
  }


  checkFormStatusAndShowAlert(documento: string): void {
    this.respuestaService.verificarEstadoForm(this.token, documento)  
        .subscribe(
            (response: any) => {
                let mensaje: string;
                // Establece el mensaje dependiendo del contador
                if (response.contador === 1) {
                    mensaje = "Esta es la primera vez que completas el formulario. Asegúrate de guardar tu progreso.";
                } else if (response.contador === 2) {
                    mensaje = "Esta es la segunda vez que completas el formulario. Recuerda que este es tu último intento para realizar el formulario.";
                }

                // Muestra la alerta con el mensaje correspondiente
                this.alertService.infoAlert("Indicaciones del formulario", mensaje)
                    .then((result) => {
                        if (result.isConfirmed) {
                            // Si el usuario confirma, lo redirige al formulario
                            this.router.navigate(['/encuesta', documento]);
                        }
                    });
            },
            (error) => {
                console.log('Error al verificar el estado del formulario', error);
                this.alertService.errorAlert("Error", "No se pudo verificar el estado del formulario.");
            }
        );
}


}
