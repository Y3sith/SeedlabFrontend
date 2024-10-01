import { AfterViewInit, Component } from '@angular/core';
import { ReporteService } from '../../../servicios/reporte.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { EmpresaService } from '../../../servicios/empresa.service';
import * as echarts from 'echarts';
import { DashboardsService } from '../../../servicios/dashboard.service';
import { AlertService } from '../../../servicios/alert.service';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements AfterViewInit {
  reporteForm: FormGroup;
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  reportes: any[] = [];
  columnas: string[] = [];
  empresas: any[] = [];
  empresaSeleccionada: string = '';
  getPuntajesForm: echarts.EChartsOption;
  chart: any;

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService,
    private router: Router,
    private empresaService: EmpresaService,
    private dashboardService: DashboardsService,
    private alertService: AlertService
  ) {
    this.reporteForm = this.fb.group({
      tipo_reporte: ['', Validators.required],
      empresa: [, Validators.required]
    })
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.obtenerEmpresasPorEmprendedor();
    this.initGraficaVacia();
  }

  /*
    Inicializa el gráfico después de que la vista se ha inicializado.
    Se llama a la función para configurar el gráfico.
  */
  ngAfterViewInit() {
    this.initChart('echarts-formulario', this.getPuntajesForm);

  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
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
  /*
    Obtiene la lista de empresas asociadas al emprendedor.
    Se utiliza el documento del emprendedor para realizar la solicitud al servicio.
  */
  obtenerEmpresasPorEmprendedor(): void {
    const doc_emprendedor = this.user.emprendedor.documento;
    this.empresaService.obtenerEmpresasPorEmprendedor(this.token, doc_emprendedor).subscribe(
      data => {
        this.empresas = data;
      },
      error => {
        console.error('Error al obtener las empresas:', error);
      }
    );
  }

  /*
    Muestra los datos del reporte basado en el tipo de reporte y la empresa seleccionados.
    Se obtiene el documento del emprendedor y se llama al servicio para obtener los datos.
  */
  mostrarDatosReporte(): void {
    if (this.reporteForm.valid) {
      const { tipo_reporte, empresa } = this.reporteForm.value;
      const doc_emprendedor = this.user.emprendedor.documento;

      if (tipo_reporte && doc_emprendedor) {
        this.graficaPuntajesFormulario(tipo_reporte, empresa);
        this.reporteService.obtenerDatosFormEmp(tipo_reporte, doc_emprendedor, empresa).subscribe(
          data => {
            this.reportes = data;
            this.columnas = Object.keys(data[0] || {});
            if (data.length === 0) {
              this.alertService.successAlert('Info', 'No hay datos para mostrar');
            }
          },
          error => console.error('Error al obtener datos del reporte:', error)
        );
      } else {
        console.error('Debe seleccionar un tipo de reporte y una empresa');
        this.alertService.errorAlert('Error', 'No se encontraron datos de este reporte');
      }
    } else {
      console.error('Formulario inválido:', this.reporteForm.value);
      this.alertService.errorAlert('Error', 'Debe seleccionar todos los filtros');
    }
  }

  /*
    Descarga el reporte del formulario como un archivo Excel.
    Utiliza el documento del emprendedor y la empresa seleccionada para obtener el reporte.
  */
  getReporteFormulario() {
    if (this.reporteForm.valid) {
      const id_emprendedor = this.user.emprendedor.documento;
      const { empresa } = this.reporteForm.value;

      this.reporteService.getReporteFormulario(id_emprendedor, empresa).subscribe({
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
    Inicializa un gráfico ECharts en el contenedor especificado.
  */
  initChart(chartId: string, chartOptions: any): void {
    const chartDom = document.getElementById(chartId);
    this.chart = echarts.init(chartDom);
    this.chart.setOption(chartOptions);
  }

  /*
  Configura e inicializa un gráfico de radar vacío con puntajes predeterminados en cero.
  */
  initGraficaVacia(): void {
    this.getPuntajesForm = {
      title: {
        text: 'Puntajes por Formulario (Sin datos)',
        left: 'center'
      },
      radar: {
        indicator: [
          { name: 'General', max: 100 },
          { name: 'Técnica', max: 100 },
          { name: 'TRL', max: 9 },
          { name: 'Mercado', max: 100 },
          { name: 'Financiera', max: 100 }
        ]
      },
      series: [
        {
          name: 'Puntajes',
          type: 'radar',
          data: [
            {
              value: [0, 0, 0, 0, 0],
              name: 'Sin Empresa Seleccionada'
            }
          ]
        }
      ]
    };
    this.initChart('echarts-formulario', this.getPuntajesForm);
  }

  /*
    Genera y muestra un gráfico de radar con los puntajes del formulario de una empresa.
    Obtiene los datos desde el servicio 'dashboardService' y actualiza el gráfico.
  */
  graficaPuntajesFormulario(tipo: number, documentoEmpresa: string): void {
    this.dashboardService.graficaFormulario(this.token, documentoEmpresa, tipo).subscribe(
      data => {
        this.getPuntajesForm = {
          title: {
            text: 'Puntajes por Formulario',
            left: 'center'
          },
          radar: {
            indicator: [
              { name: 'General', max: 100 },
              { name: 'Técnica', max: 100 },
              { name: 'TRL', max: 9 },
              { name: 'Mercado', max: 100 },
              { name: 'Financiera', max: 100 }
            ]
          },
          series: [
            {
              name: 'Puntajes',
              type: 'radar',
              data: [
                {
                  value: [
                    parseFloat(data.info_general) || 0,
                    parseFloat(data.info_tecnica) || 0,
                    parseFloat(data.info_trl) || 0,
                    parseFloat(data.info_mercado) || 0,
                    parseFloat(data.info_financiera) || 0
                  ],
                  name: `Empresa ${documentoEmpresa}`
                }
              ]
            }
          ]
        };
        if (this.chart) {
          this.chart.dispose();
        }
        this.initChart('echarts-formulario', this.getPuntajesForm);
      },
      error => { 
        console.error('Error al obtener los puntajes del formulario:', error);
        this.alertService.errorAlert('Error', 'No se encontraron datos');
        location.reload();
       }
    );
  }




}
