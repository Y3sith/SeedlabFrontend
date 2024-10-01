import { Component } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReporteService } from '../../../servicios/reporte.service';
import { AlertService } from '../../../servicios/alert.service';
import { faCircleQuestion, } from '@fortawesome/free-solid-svg-icons';
import { RespuestasService } from '../../../servicios/respuestas.service';


@Component({
  selector: 'app-reportes-adm',
  templateUrl: './reportes-adm.component.html',
  styleUrl: './reportes-adm.component.css'
})
export class ReportesAdmComponent {
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  reporteForm: FormGroup;
  reportes: any[] = [];
  columnas: string[] = [];
  public page: number = 1;
  public itemsPerPage: number = 5;
  public totalItems: number = 0;
  public paginatedReportes: string[] = [];
  tipoReporteSeleccionado: string = '';
  isReporteDisponible: boolean = false;
  isDataReady: boolean = false;
  falupa = faCircleQuestion;



  constructor(
    private respuestaService: RespuestasService,
    private fb: FormBuilder,
    private router: Router,
    private reporteService: ReporteService,
    private alertService: AlertService
  ) {
    this.reporteForm = this.fb.group({
      tipo_reporte: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
    })
  }

/* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {

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
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
  Valida que el formulario sea correcto y, si lo es, llama al servicio para obtener datos de un reporte en 
  función de los filtros seleccionados (tipo de reporte, fecha de inicio y fecha fin).
  Luego, actualiza la lista de reportes y su paginación. 
  Si no hay datos, muestra una alerta de que no hay resultados.
  */
  mostrarReportes() {
    if (this.reporteForm.valid) {
      const { tipo_reporte, fecha_inicio, fecha_fin } = this.reporteForm.value;
      // Obtener los datos del reporte para visualización
      this.isDataReady = false;
      this.reporteService.obtenerDatosReporte(tipo_reporte, fecha_inicio, fecha_fin).subscribe(
        (data: any[]) => {
          this.isDataReady = true;
          this.reportes = data;
          this.totalItems = data.length;
          this.page = 1;
          this.updatePaginated();
          this.columnas = Object.keys(data[0] || {}); // Establece las columnas basadas en los datos
          if (data.length === 0) {
            this.alertService.successAlert('Info', 'No hay datos para mostrar');
          }
        }, (error) => console.error('Error al obtener datos del reporte', error)
      );
    } else {
      console.error('Formulario inválido:', this.reporteForm.value);
      this.alertService.errorAlert('Error', 'Debe seleccionar todos los filtros');
    }
  }

/*
 Valida el formulario y, si es correcto, descarga un archivo (PDF o Excel) con los datos del reporte
  basado en el tipo de reporte y el rango de fechas seleccionado. Crea un enlace temporal para 
  descargar el archivo y luego lo elimina.
*/
  getReportes(formato:string) {
    if (this.reporteForm.valid) {
      const { tipo_reporte, fecha_inicio, fecha_fin } = this.reporteForm.value;

      this.reporteService.exportarReporte(tipo_reporte, fecha_inicio, fecha_fin, formato).subscribe({
        next: (data) => {
          if (data) { // Verifica si data no es null
            if (data.size > 0) { // Verifica si el tamaño es mayor a 0
              const url = window.URL.createObjectURL(data);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Reporte_${tipo_reporte}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            } else {
              this.alertService.errorAlert('Error', 'No hay datos disponibles para el reporte especificado.');
            }
          } else {
            // Se maneja el caso donde data es null
            this.alertService.errorAlert('Info', 'No se recibió ningún archivo para descargar.');
          }
        },
        error: (error) => {
          console.error('Error al descargar el reporte', error);
          this.alertService.errorAlert('Error', 'Error al procesar la solicitud de reporte.');
        }
      });
    } else {
      console.error('Formulario inválido:', this.reporteForm.value);
      this.alertService.errorAlert('Error', 'Debe seleccionar todos los filtros');
    }
  }

  /*
  Descarga un archivo Excel con un reporte específico de un emprendedor usando su ID. Crea un enlace temporal para descargar el archivo y luego lo elimina.
  */
  getReporteFormulario(id_emprendedor: number, empresa: string,tipo_reporte: string) {
    console.log(this.paginatedReportes)
    if (this.reporteForm.valid) {

      this.reporteService.getReporteFormulario(id_emprendedor, empresa,tipo_reporte).subscribe({
        next: (data: Blob) => {
          if (data) { // Verifica si data no es null
            if (data.size > 0) { // Verifica si el tamaño es mayor a 0
              const url = window.URL.createObjectURL(data);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Reporte_Formulario.xlsx';
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            } else {
              // Mostrar alerta si el archivo está vacío
              this.alertService.errorAlert('Error', 'No hay datos disponibles para el reporte especificado.');
            }
          } else {
            // Se maneja el caso donde data es null
            this.alertService.errorAlert('Info', 'No se recibió ningún archivo para descargar.');
          }
        },
        error: (error) => {
          console.error('Error al descargar el reporte del formulario', error);
          this.alertService.errorAlert('Error', 'Error al procesar la solicitud de reporte.');
        }
      });
    } else {
      console.error('Formulario inválido:', this.reporteForm.value);
      this.alertService.errorAlert('Error', 'Debe seleccionar todos los filtros');
    }
  }

  

  /*
  Captura el cambio de selección en el tipo de reporte y, si el tipo seleccionado es "emprendedor", automáticamente llama la función getReportes('excel') para generar un reporte en formato Excel.
  */
  onTipoReporteChange(event: any) {
    this.tipoReporteSeleccionado = event.target.value;
  }

  /*
  Actualiza la lista paginada de reportes, calculando qué elementos mostrar según la página actual y el número de elementos por página.
  */
  updatePaginated(): void {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedReportes = this.reportes.slice(start, end);

  }

  /*
  Cambia de página dentro de la lista de reportes paginados. Puede ir a la página anterior, siguiente, o a una página específica, actualizando la lista visible en consecuencia.
  */
  changePage(page: number | string): void {
    if (page === 'previous') {
      if (this.canGoPrevious()) {
        this.page--;
        this.updatePaginated();
      }
    } else if (page === 'next') {
      if (this.canGoNext()) {
        this.page++;
        this.updatePaginated();
      }
    } else {
      this.page = page as number;
      this.updatePaginated();
    }
  }

  /*
  Verifica si es posible retroceder a una página anterior en la lista de reportes paginados.
  */
  canGoPrevious(): boolean {
    return this.page > 1;
  }

  /*
  Verifica si es posible avanzar a una página siguiente en la lista de reportes paginados.
  */
  canGoNext(): boolean {
    return this.page < Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /*
  Calcula el número total de páginas basado en la cantidad total de elementos y el número de elementos por página,
  devolviendo una lista de números de página para mostrar en la interfaz.
  */
  getPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }


}
