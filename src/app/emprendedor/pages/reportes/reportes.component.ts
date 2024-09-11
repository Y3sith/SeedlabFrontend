import { Component } from '@angular/core';
import { ReporteService } from '../../../servicios/reporte.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { EmpresaService } from '../../../servicios/empresa.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {
  reporteForm: FormGroup;
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  reportes: any[] = [];
  columnas: string[] = [];
  empresas: any[] = [];
  empresaSeleccionada: string = ''; 

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService,
    private router: Router,
    private empresaService: EmpresaService,
  ) {
    this.reporteForm = this.fb.group({
      tipo_reporte: ['', Validators.required],
      empresa: [, Validators.required]
    })
  }

  ngOnInit(): void {
    this.validateToken();
    this.obtenerEmpresasPorEmprendedor();

  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        console.log(this.user);
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 5) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  obtenerEmpresasPorEmprendedor(): void {
    const doc_emprendedor = this.user.emprendedor.documento;
    this.empresaService.obtenerEmpresasPorEmprendedor(this.token, doc_emprendedor).subscribe(
      data => {
        this.empresas = data; 
       
        console.log(this.empresas);  
      },
      error => {
        console.error('Error al obtener las empresas:', error);
      }
    );
  }

 

  mostrarDatosReporte(): void {
    if (this.reporteForm.valid) {
      const { tipo_reporte, empresa } = this.reporteForm.value;
      const doc_emprendedor = this.user.emprendedor.documento; 
      console.log(this.reporteForm.value);
      this.reporteService.obtenerDatosFormEmp(tipo_reporte, doc_emprendedor, empresa).subscribe(
        data => {
          console.log(data); 
          this.reportes = data; 
          this.columnas = Object.keys(data[0] || {}); 
        },
        error => console.error('Error al obtener datos del reporte:', error)
      );
    }
  }

  getReporteFormulario() {
    const id_emprendedor = this.user.emprendedor.documento; 
    const { empresa } = this.reporteForm.value;
    this.reporteService.getReporteFormulario(id_emprendedor,empresa).subscribe(
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
    );
  }
  
  


}
