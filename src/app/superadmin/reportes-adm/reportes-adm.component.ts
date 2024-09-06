import { Component } from '@angular/core';
import { User } from '../../Modelos/user.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReporteService } from '../../servicios/reporte.service';

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


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private reporteService: ReporteService
  ){
    this.reporteForm = this.fb.group({
      tipo_reporte:[''],
      fecha_inicio: [''],
      fecha_fin: ['']
    })
  }


  ngOnInit(): void {
    
  }

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

  mostrarReportes() {
    if (this.reporteForm.valid) {
      const { tipo_reporte, fecha_inicio, fecha_fin } = this.reporteForm.value;

      // Obtener los datos del reporte para visualización
      this.reporteService.obtenerDatosReporte(tipo_reporte, fecha_inicio, fecha_fin).subscribe(
        (data: any[]) => {
          this.reportes = data;
          this.totalItems = data.length;
          this.page = 1;
          this.updatePaginated();
          this.columnas = Object.keys(data[0] || {}); // Establece las columnas basadas en los datos
        },
        (error) => console.error('Error al obtener datos del reporte', error)
      );
    } else {
      console.error('Formulario inválido:', this.reporteForm.value);
      alert('Debe seleccionar todos los filtros');
    }
  }
  

  getReportes(){
    if(this.reporteForm.valid){
      const {tipo_reporte, fecha_inicio, fecha_fin} = this.reporteForm.value;

      this.reporteService.exportarReporte(tipo_reporte, fecha_inicio, fecha_fin).subscribe(
       (data:Blob) =>{
          
          const url = window.URL.createObjectURL(data);

          const a = document.createElement('a');
          a.href = url;
          a.download = `${tipo_reporte}_reporte.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error => {
          console.error('Error al descargar el reporte', error);
        }
      )
    }else{
      console.error('Formulario inválido:', this.reporteForm.value);
      alert('Debe seleccionar todos los filtros');
    }
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
