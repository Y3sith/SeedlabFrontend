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

  obtenerReportesDisponibles() {
    this.reporteService.obtenerReportes().subscribe(
      (data: any) => {
        this.reportes = data;
      },
      (error) => console.error('Error al obtener los reportes', error)
    );
  }

  getReportes(){
    if(this.reporteForm.valid){
      const {tipo_reporte, fecha_inicio, fecha_fin} = this.reporteForm.value;

      this.reporteService.getReporteRole(tipo_reporte, fecha_inicio, fecha_fin).subscribe(
        data =>{
          this.reportes = data;
          // const url = window.URL.createObjectURL(data);

          // const a = document.createElement('a');
          // a.href = url;
          // a.download = 'Reporte_Roles.xlsx';
          // a.click();
          // window.URL.revokeObjectURL(url);
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

  
}
