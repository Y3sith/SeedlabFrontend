import { AfterViewInit, Component } from '@angular/core';
import { ReporteService } from '../../../servicios/reporte.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { EmpresaService } from '../../../servicios/empresa.service';
import * as echarts from 'echarts';
import { DashboardsService } from '../../../servicios/dashboard.service';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements AfterViewInit{
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
    private dashboardService: DashboardsService
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

  ngAfterViewInit() {
    this.initChart('echarts-formulario', this.getPuntajesForm);

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
    const { tipo_reporte, empresa } = this.reporteForm.value;
    const doc_emprendedor = this.user.emprendedor.documento;
    

    console.log('Formulario:', this.reporteForm.value);
    console.log('Documento Emprendedor:', doc_emprendedor);

    if (tipo_reporte && doc_emprendedor) {
      this.graficaPuntajesFormulario(tipo_reporte, empresa);
      this.reporteService.obtenerDatosFormEmp(tipo_reporte, doc_emprendedor, empresa).subscribe(
        data => {
          console.log('Datos del reporte:', data);
          this.reportes = data;
          this.columnas = Object.keys(data[0] || {});
        },
        error => console.error('Error al obtener datos del reporte:', error)
      );
    } else {
      console.error('Debe seleccionar un tipo de reporte y una empresa');
    }
  }


  getReporteFormulario() {
    const id_emprendedor = this.user.emprendedor.documento;
    const { empresa } = this.reporteForm.value;
    this.reporteService.getReporteFormulario(id_emprendedor, empresa).subscribe(
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

  initChart(chartId: string, chartOptions: any): void {
    const chartDom = document.getElementById(chartId);
    this.chart = echarts.init(chartDom); // Inicializa el gráfico y lo almacena en this.chart
    this.chart.setOption(chartOptions);
  }

  initGraficaVacia(): void {
    // Configuración de la gráfica vacía
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
              value: [0, 0, 0, 0, 0], // Valores vacíos
              name: 'Sin Empresa Seleccionada'
            }
          ]
        }
      ]
    };

    // Renderiza la gráfica vacía al cargar la página
    this.initChart('echarts-formulario', this.getPuntajesForm);
  }


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

        // Actualiza la gráfica con los nuevos datos
        if (this.chart) {
          this.chart.dispose(); // Destruye el gráfico anterior
        }
        this.initChart('echarts-formulario', this.getPuntajesForm);
      },
      error => console.error('Error al obtener los puntajes del formulario:', error)
    );
  }




}
