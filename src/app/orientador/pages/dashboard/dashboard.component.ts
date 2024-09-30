import { Component, AfterViewInit, OnInit } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { DashboardsService } from '../../../servicios/dashboard.service';
import { EmpresaService } from '../../../servicios/empresa.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  token: string | null = null;
  user: User = null;
  id: number;
  currentRolId: number = null;
  totalUsuarios: any[] = [];
  totalSuperAdmin: any = {};
  totalOrientador: any = {};
  totalAliados: any = {};
  totalAsesores: any = {};
  totalEmprendedores: any = {};
  topAliados: any = {};
  pieChartOption: echarts.EChartsOption;
  doughnutChartOption: echarts.EChartsOption;
  registrosEchartsOptions: echarts.EChartsOption;
  promedioAsesoriasEchartsOptions: echarts.EChartsOption;
  pendientesFinalizadasLabels: string[] = ['Pendientes', 'Finalizadas', 'Sin Asignar', 'Asignadas'];
  pendientesFinalizadasData: { data: number[] }[] = [{ data: [0, 0, 0, 0] }];
  years: number[] = [];
  selectedYear: number;
  isLoading: boolean = false;
  selectedEmpresa: string = '';
  listEmpresas = [];
  selectedTipo: string = '';
  chart: any;
  getPuntajesFormOrientador: echarts.EChartsOption;
  topAliadosEchartsOptions: echarts.EChartsOption;

  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
    private empresaService: EmpresaService
  ) { }

  ngOnInit() {
    this.validateToken();
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (v, i) => currentYear + i);
    this.selectedYear = this.years[0];
    this.selectedYear = currentYear;
    this.getDatosDashboard(this.selectedYear);
    this.getEmpresas();
    this.initGraficaVacia();
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

        if (this.currentRolId != 2) { // Asegúrate de que el rol del orientador es 2
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.getDatosDashboard(this.selectedYear);
  }

  getEmpresas() {
    this.empresaService.getAllEmpresa(this.token).subscribe(
      data => {
        this.listEmpresas = data;
        this.selectedEmpresa = this.listEmpresas.length > 0 ? this.listEmpresas[0].documento_empresa : null;
        this.graficaPuntajesFormulario(+this.selectedTipo);
      },
      error => {
        console.error('Error al obtener empresas:', error);
      }
    )
  }

  onEmpresaChange(selectedId: string): void {
    this.selectedEmpresa = selectedId;
    this.graficaPuntajesFormulario(+this.selectedTipo);
  }


  getDatosDashboard(year: number): void {
    this.isLoading = true;
    this.dashboardService.dashboardAdmin(this.token).subscribe(
      data => {
        // Asignar los datos devueltos a las variables correspondientes
        this.totalUsuarios = data;
        this.totalSuperAdmin = data.usuarios.superadmin;
        this.totalOrientador = data.usuarios.orientador;
        this.totalAliados = data.usuarios.aliado;
        this.totalAsesores = data.usuarios.asesor;
        this.totalEmprendedores = data.usuarios.emprendedor;
        this.topAliados = data.topAliados.original;


        // Configuración para la gráfica de pastel (Asesorías)
        this.topAliadosEchartsOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow' // Mostrar puntero de tipo sombra para mejor visualización
            }
          },
          legend: {
            orient: 'horizontal', // Cambiar a horizontal para una mejor distribución
            left: 'left',
            data: ['Top Aliados'],
          },
          toolbox: {
            show: true,
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          xAxis: {
            type: 'category',
            data: this.topAliados.map(aliado => aliado.nombre),
            axisLabel: {
              interval: 0, 
              rotate: 30, // Rota las etiquetas para mejor legibilidad
              formatter: (value: string) => {
                return value.length > 10 ? value.substring(0, 10) + '...' : value;
              }
            }
          },
          yAxis: {
            type: 'value',
            name: 'Asesorías',
            min: 0, // Valor mínimo en el eje Y
            axisLabel: {
              formatter: '{value}' // Muestra el valor en el eje Y
            }
          },
          series: [
            {
              name: 'Top Aliados',
              type: 'bar', // Cambiar a 'bar' si quieres barras
              data: this.topAliados.map((aliado, index) => ({
                value: aliado.asesoria,
                itemStyle: {
                  color: this.getColorForIndex(index) // Asignar colores
                }
              })),
              label: {
                show: true,
                position: 'top',
                color: '#000',
                formatter: '{c}', // Muestra el valor de la barra
                fontSize: 12
              },
              markLine: {
                data: [{ type: 'average', name: 'Avg' }]
              },
              barGap: '10%', // Ajusta el espacio entre las barras
            }
          ]
        };

        //data y grafica promedio asesorias
        const meses = data.averageAsesorias.original.promedio_mensual.map(item => this.getMonthName(item.mes));
        const promedios = data.averageAsesorias.original.promedio_mensual.map(item => parseFloat(item.promedio_asesorias));
        const promedioAnual = data.averageAsesorias.original.promedio_anual;

        this.promedioAsesoriasEchartsOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
          },
          yAxis: {
            type: 'category',
            data: meses
          },
          series: [
            {
              name: `Promedio Mensual`,
              data: promedios,
              type: 'bar',
              itemStyle: {
                color: '#73c0de'
              }
            },
            {
              name: `Promedio ${this.selectedYear}`,
              data: promedioAnual,
              type: 'bar',
            }
          ],
        };

        //Data y grafica Generos
        const response = data.generosEmprendedores.original;
        console.log('Datos originales:', response); // Verificar los datos originales

        // Verificar si la respuesta contiene datos
        if (response && response.length > 0) {
          // Mapear los datos formateados
          const formattedData = response.map(item => ({
            value: Number(item.total), // Asegúrate de que total se convierte correctamente a número
            name: item.genero // Usar el nombre del género
          }));

          console.log('Datos formateados para la gráfica:', formattedData); // Verificar datos formateados

          if (formattedData.length > 0) {
            // Configuración de la gráfica Doughnut
            this.doughnutChartOption = {
              tooltip: {
                trigger: 'item'
              },
              legend: {
                top: '5%',
                left: 'center'
              },
              series: [
                {
                  name: 'Géneros',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10
                  },
                  label: {
                    show: false,
                    position: 'outside'
                  },
                  emphasis: {
                    label: {
                      show: false,
                    }
                  },
                  labelLine: {
                    show: false
                  },
                  data: formattedData
                }
              ]
            };
          } else {
            console.error('Datos formateados vacíos para el gráfico de géneros.');
          }
        } else {
          console.error('No se recibieron datos válidos para el gráfico de géneros.');
        }

        //Data y grafica de registros mensuales
        const conteoRegistros = data.conteoRegistros.original.promedios; // Accedemos correctamente a los "promedios"

        if (Array.isArray(conteoRegistros) && conteoRegistros.length > 0) {
          const emprendedoresData = conteoRegistros.map(item => parseInt(item.emprendedores, 10)); // Aseguramos que sea entero
          const aliadosData = conteoRegistros.map(item => parseInt(item.aliados, 10));
          const meses = conteoRegistros.map(item => this.getMonthName(item.mes));

          const maxValue = Math.max(...emprendedoresData, ...aliadosData);

          // Configuración del gráfico ECharts
          this.registrosEchartsOptions = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                crossStyle: {
                  color: '#999'
                }
              }
            },
            toolbox: {
              feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                saveAsImage: { show: true }
              }
            },
            legend: {
              data: ['Emprendedor', 'Aliados'],
              left: 'left',
              top: 10,
              itemGap: 20
            },
            grid: {
              top: 60,
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: [
              {
                type: 'category',
                data: meses,
                axisPointer: {
                  type: 'shadow'
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                name: 'Cantidad',
                min: 0,
                max: maxValue + 5,
                interval: Math.ceil(maxValue / 5)
              }
            ],
            series: [
              {
                name: 'Emprendedor',
                type: 'bar',
                data: emprendedoresData
              },
              {
                name: 'Aliados',
                type: 'bar',
                data: aliadosData
              }
            ]
          };
        } else {
          console.error('Los datos recibidos no tienen la estructura esperada o están vacíos', data);
        }
      },
      error => {
        console.log(error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  getColorForIndex(index: number): string {
    // Lista de colores que se asignarán a las barras
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length]; // Asigna un color a cada barra, y repite si hay más barras que colores
  }

  getMonthName(monthNumber: number): string {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[monthNumber - 1];
  }

  initGraficaVacia(): void {
    // Configuración de la gráfica vacía
    this.getPuntajesFormOrientador = {
      title: {
        text: 'Puntajes por Formulario (Sin datos)',
        left: 'center',

      },
      radar: {
        center: ['50%', '60%'],
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
    this.initChart('echarts-formulario', this.getPuntajesFormOrientador);
  }

  graficaPuntajesFormulario(tipo: number): void {
    if (!this.selectedEmpresa || !tipo) {
      this.initGraficaVacia();
      return;
    }

    this.dashboardService.graficaFormulario(this.token, this.selectedEmpresa, tipo).subscribe(
      data => {
        this.getPuntajesFormOrientador = {
          title: {
            text: tipo === 1 ? 'Puntajes por Formulario (Primera vez)' : 'Puntajes por Formulario (Segunda vez)',
            left: 'left'
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
                  name: `Empresa ${this.selectedEmpresa}` // Cambia si es necesario
                }
              ]
            }
          ]
        };

        // Actualizar la gráfica con los nuevos datos
        if (this.chart) {
          this.chart.dispose(); // Destruye el gráfico anterior antes de crear uno nuevo
        }
        //this.initChart('echarts-formulario', this.getPuntajesFormOrientador);
      },
      error => {
        console.error('Error al obtener los puntajes del formulario:', error);
        this.initGraficaVacia();
      }

    );
  }

  initChart(chartId: string, chartOptions: any): void {
    const chartDom = document.getElementById(chartId);
    this.chart = echarts.init(chartDom); // Inicializa el gráfico y lo almacena en this.chart
    this.chart.setOption(chartOptions);
  }



}
