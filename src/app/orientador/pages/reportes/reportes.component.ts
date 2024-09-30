import { Component } from '@angular/core';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { User } from '../../../Modelos/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReporteService } from '../../../servicios/reporte.service';
import { AlertService } from '../../../servicios/alert.service';



@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent {
  faPrint = faPrint;

  token = '';
  user: User | null = null;
  id: number | null = null;
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


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private reporteService: ReporteService,
    private alertService: AlertService
  ) {
    this.reporteForm = this.fb.group({
      tipo_reporte: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required]
    })
  }


  ngOnInit(): void {
    this.validateToken();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

//Función para mostrar los reportes en la tabla
  mostrarReportes() {
    if (this.reporteForm.valid) {
      const { tipo_reporte, fecha_inicio, fecha_fin } = this.reporteForm.value;
      this.isDataReady = false;
      // Obtener los datos del reporte para visualización
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
        },
        (error) => console.error('Error al obtener datos del reporte', error)
      );
    } else {
      console.error('Formulario inválido');
      this.alertService.errorAlert('Error', 'Debe seleccionar todos los filtros');
    }
  }

  //Función para descargar los reportes
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

  //Función para descargar reporte de formulario emprendedor
  getReporteFormulario(id_emprendedor: string) {
    this.reporteService.getReporteFormulario(id_emprendedor).subscribe(
      (data: Blob) => {
        if(data.size > 0){
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Reporte_Formulario.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }else {
          this.isReporteDisponible = false; // Si no hay datos, ocultar el botón
          this.alertService.errorAlert('Error', 'No ha realizado el formulario.');
        }
      },
      error => {
        console.error('Error al descargar el reporte del formulario', error);
        this.isReporteDisponible = false;
      }
    )
  }

  onTipoReporteChange(event: any) {
    this.tipoReporteSeleccionado = event.target.value;
  }

  updatePaginated(): void {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedReportes = this.reportes.slice(start, end);

  }

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

  canGoPrevious(): boolean {
    return this.page > 1;
  }

  canGoNext(): boolean {
    return this.page < Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}
