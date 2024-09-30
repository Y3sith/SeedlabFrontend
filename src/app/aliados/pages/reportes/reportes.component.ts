import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { ReporteService } from '../../../servicios/reporte.service';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
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
  falupa = faCircleQuestion;



  constructor(
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
    this.validateToken();
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
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }
  /*
    Este método muestra los reportes generados basados en los criterios establecidos en el formulario `reporteForm`.
  */
  mostrarReportes() {
    if (this.reporteForm.valid) {
      const { tipo_reporte, fecha_inicio, fecha_fin } = this.reporteForm.value;

      const id_aliado = this.user.id ? this.user.id : null;

      if (!id_aliado) {
        console.error('El ID del aliado no está disponible.');
        return;
      }

      // Obtener los datos del reporte para visualización
      this.reporteService.obtenerDatosAsesoriaAliado(tipo_reporte, id_aliado, fecha_inicio, fecha_fin).subscribe(
        (data: any[]) => {
          this.reportes = data;
          this.totalItems = data.length;
          this.page = 1;
          this.updatePaginated();
          this.columnas = Object.keys(data[0] || {}); // Establece las columnas basadas en los datos
          if (data.length === 0) {
            this.alertService.successAlert('Info', 'No hay datos para mostrar');
          }
        },
        (error) => console.error('Error al obtener datos del reporte', error)
      );
    } else {
      console.error('Formulario inválido:', this.reporteForm.value);
      this.alertService.errorAlert('Error', 'Debe seleccionar todos los filtros');
    }
  }


  /*
    Este método se encarga de exportar un reporte en el formato especificado.
  */
  getReportes(formato: string) {
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
    Este método permite la exportación de reportes basados en los datos ingresados en el formulario `reporteForm`.
  */
  getReporteFormulario(id_emprendedor: string) {
    this.reporteService.getReporteFormulario(id_emprendedor).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte_Formulario.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error al descargar el reporte del formulario', error);
      }
    )
  }

  /*
    Este método maneja los cambios en el campo de selección `tipoReporte` del formulario.
  */
  onTipoReporteChange(event: any) {
    this.tipoReporteSeleccionado = event.target.value;
  }


  /*
    Este método actualiza la lista de reportes paginados.
  */
  updatePaginated(): void {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedReportes = this.reportes.slice(start, end);
  }

  /*
    Este método permite cambiar la página actual 
    en el sistema de paginación. Acepta un argumento que 
    determina la nueva página a la que se debe navegar.
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
    return this.page < Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /*
      Este método genera un array de números que 
      representan las páginas disponibles en el sistema de 
      paginación, basado en la cantidad total de elementos 
      y la cantidad de elementos por página.
  */
  getPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

}
