import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AsignarAsesorModalComponent } from '../asignar-asesor-modal/asignar-asesor-modal.component';
import { AsesoriaService } from '../../../servicios/asesoria.service';
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
  id_aliado: number;
  currentRolId: number;
  mensaje: string | null = null;
  @ViewChild('sinAsignarButton') sinAsignarButton!: ElementRef;
  userFilter: any = { Nombre_sol: '' };
  Nombre_sol: string | null = null;
  tiempoEspera = 1800;
  isLoading: boolean = false;
  page: number = 1;
  totalAsesorias: number = 0;
  itemsPerPage: number = 8;
  showAsignadasFlag: boolean = false;

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
        this.id_aliado = this.user.id;
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    } else {
      this.loadAsesorias(this.id_aliado, [0, 1]);

    }
  }

  /*
    Este método carga las asesorías basándose en el rol 
    del usuario y los estados seleccionados. 
  */
  loadAsesorias(rol: number, estados: number[]): void {
    this.isLoading = true;
    this.asesorias = []; // Reiniciar las asesorías

    estados.forEach(estado => {
      this.asesoriaService.getAsesoriasPorRolYEstado(this.token, rol, estado).subscribe(
        data => {
          this.asesorias = this.asesorias.concat(data); // Combinar resultados
          this.separarAsesorias();
          this.showSinAsignar(); // Mostrar asesorías "Sin asignar" por defecto
          this.totalAsesorias = this.asesorias.length; // Actualiza el total de asesorías
          // this.isLoading = false;
        },
        error => {
          console.error('Error al obtener las asesorías:', error);
          this.isLoading = false;
        }
      );
    });
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
  }

  /*
    Este método calcula el número total de páginas necesarias 
    para mostrar las asesorías, dependiendo de si se están 
    mostrando asesorías "Sin Asesor" o "Con Asesor". 
  */
  getTotalPages(): number {
    if (this.asesoriasSinAsesor.length >= 2 && this.showAsignadasFlag == false) {
      return Math.ceil(this.asesoriasSinAsesor.length / this.itemsPerPage);
    } else {
      return Math.ceil(this.asesoriasConAsesor.length / this.itemsPerPage);
    }
  }

  /*
    Este método genera un array de números que 
    representan las páginas disponibles en el sistema de 
    paginación, basado en la cantidad total de elementos 
    y la cantidad de elementos por página.
  */
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }
  /*
      Este método verifica si es posible retroceder a 
      la página anterior en el sistema de paginación.
    */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /*
    Este método verifica si es posible avanzar a 
    la siguiente página en el sistema de paginación.
  */
  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

  /*
    Este método separa las asesorías en dos categorías:
    "Con Asesor" y "Sin Asesor".
  */

  separarAsesorias(): void {
    this.asesoriasConAsesor = this.asesorias.filter(asesoria => asesoria.Asesor);
    this.asesoriasSinAsesor = this.asesorias.filter(asesoria => !asesoria.Asesor);

    if (this.asesorias.length === 0) {
      this.mensaje = "No hay asesorías disponibles para mostrar.";
    } else {
      this.mensaje = null;
    }
  }

  /*
  Este método abre un modal para asignar un asesor a una 
  asesoría específica. Utiliza el componente 
  `AsignarAsesorModalComponent` para la interacción.
*/
  openModal(asesoria: Asesoria): void {
    const dialogRef = this.dialog.open(AsignarAsesorModalComponent, {
      width: '400px',
      data: { asesoria: asesoria }
    });

    dialogRef.componentInstance.asesoriaAsignada.subscribe(() => {
      this.loadAsesorias(this.id_aliado, [0, 1]);
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /*
    Este método maneja la lógica para rechazar una asesoría 
    específica. 
  */
  rechazarAsesoria(asesoria: Asesoria): void {
    if (asesoria && asesoria.id_asesoria) {
      this.alertService.alertaActivarDesactivar("¿Estás seguro de rechazar la asesoría?", 'question').then((result) => {
        if (result.isConfirmed) {
          this.asesoriaService.rechazarAsesoria(this.token, asesoria.id_asesoria, 'rechazar').subscribe(
            data => {
              this.loadAsesorias(this.currentRolId!, [1]);
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
  /*
    Este método se encarga de mostrar las asesorías que no 
    han sido asignadas.
  */
  showSinAsignar(): void {
    this.isLoading = true;

    /*
      Este bloque de código establece un temporizador para realizar 
      varias acciones después de un retraso de 300 milisegundos.
    */
    setTimeout(() => {
      this.showAsignadasFlag = false;
      this.asesorias = this.asesoriasSinAsesor;
      this.page = 1;
      if (this.asesoriasSinAsesor.length === 0) {
        this.mensaje = "No hay asesorías esperando por asignación.";
      } else {
        this.mensaje = null;
      }
      this.isLoading = false;
    }, 300);

  }

  /*
    Este método se encarga de mostrar las asesorías que si 
    han sido asignadas.
  */
  showAsignadas(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.showAsignadasFlag = true;
      this.asesorias = this.asesoriasConAsesor;
      this.page = 1;
      if (this.asesoriasConAsesor.length === 0) {
        this.mensaje = "Aún no has asignado ninguna asesoría.";
      } else {
        this.mensaje = null;
      }
      this.isLoading = false;
    }, 300);
  }

  /*
    Este método permite a los asesores 
    localizar rápidamente asesorías específicas basándose en 
    el nombre del solicitante.
  */
  filtrarAsesorias(): void {
    const filtro = this.Nombre_sol?.trim().toLowerCase();
    if (filtro) {
      this.asesorias = this.asesorias.filter(asesoria =>
        asesoria.nombre_sol.toLowerCase().includes(filtro)
      );
    } else {
      this.separarAsesorias();
    }
  }
}
