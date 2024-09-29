import { Component, AfterViewInit } from '@angular/core';
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
export class DashboardComponent implements AfterViewInit {
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
  getPuntajesForm: echarts.EChartsOption;

  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
    private empresaService: EmpresaService
  ) { }

/* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.getRegistrosMensuales();
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (v, i) => currentYear + i);
    this.selectedYear = currentYear;
    this.promedioAsesoriasMesAnio(this.selectedYear);
    this.getEmpresas();
    this.initGraficaVacia();
    
  }

/*
  Este método permite que los datos necesarios estén listos y 
  disponibles justo después de que la vista del componente se haya 
  renderizado.
  */
  ngAfterViewInit() {
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.getRegistrosMensuales();
    this.promedioAsesoriasMesAnio(this.selectedYear);
    
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
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        console.log(this.currentRolId);
        if (this.currentRolId != 2) { 
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
  Actualiza el año seleccionado y carga el promedio de asesorías para el año correspondiente.
*/

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.promedioAsesoriasMesAnio(this.selectedYear);
  }

  /*
  Obtiene la lista de empresas y selecciona la primera empresa disponible.
  Luego, carga la gráfica de puntajes según el tipo seleccionado.
*/

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

/*
  Maneja el cambio de empresa seleccionada y actualiza la gráfica de puntajes 
  según el tipo seleccionado.
*/
  onEmpresaChange(selectedId: string): void {
    this.selectedEmpresa = selectedId;
    this.graficaPuntajesFormulario(+this.selectedTipo);
  }

/*
  Calcula el promedio de asesorías mensuales y anuales para el año seleccionado,
  actualizando las opciones del gráfico de ECharts.
*/
  promedioAsesoriasMesAnio(year: number): void {
    this.dashboardService.dashboardAdmin(this.token, this.selectedYear).subscribe(
      data => {
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
        this.initEchartsPromedioAsesorias();
      },
      error => {
        console.error('Error al obtener promedio de asesorías:', error);
      }
    );
  }

/*
  Inicializa el gráfico de ECharts para mostrar el promedio de asesorías
  mensuales y anuales, utilizando las opciones configuradas.
*/
  initEchartsPromedioAsesorias() {
    const chartDom = document.getElementById('promedio-asesorias');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.promedioAsesoriasEchartsOptions);
    } else {
      console.error('No se pudo encontrar el elemento con id "promedio-asesorias"');
    }
  }

/*
  Obtiene los datos del dashboard para la administración, incluyendo el total de usuarios por rol,
  los aliados destacados y la configuración de la gráfica de asesorías. Al finalizar, desactiva
  el indicador de carga.
*/
  getDatosDashboard(): void {
    this.isLoading = true;
    this.dashboardService.dashboardAdmin(this.token).subscribe(
      data => {
        this.totalUsuarios = data;
        this.totalSuperAdmin = data.usuarios.superadmin;
        this.totalOrientador = data.usuarios.orientador;
        this.totalAliados = data.usuarios.aliado;
        this.totalAsesores = data.usuarios.asesor;
        this.totalEmprendedores = data.usuarios.emprendedor;
        this.topAliados = data.topAliados.original;

        this.pieChartOption = {
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
          },
          series: [
            {
              name: 'Asesorías',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: false,
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: data.conteoAsesorias.original.asesoriasAsignadas, name: 'Asignadas' },
                { value: data.conteoAsesorias.original.asesoriasSinAsignar, name: 'Sin asignar' }
              ],
            }
          ]
        };

        this.graficaTopAliados();
        this.isLoading = false;
      },
      error => {
        console.log(error);
        this.isLoading = false; 
      }
    );
  }

/*
  Configura y renderiza la gráfica de barras para mostrar el top de aliados destacados,
  incluyendo la rotación de etiquetas y la personalización de colores por aliado.
*/
  graficaTopAliados(): void {
    const chartDom = document.getElementById('echarts-bar');
    console.log(this.topAliados);
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        title: {},
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['Top Aliados']
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
        xAxis: [
          {
            type: 'category',
            data: this.topAliados.map(aliado => aliado.nombre),
            axisLabel: {
              interval: 0,
              rotate: 30,
              formatter: function (value: string) {
                return value.length > 10 ? value.substring(0, 10) + '...' : value;
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Top Aliados',
            type: 'bar',
            data: this.topAliados.map((aliado, index) => ({
              value: aliado.asesoria,
              itemStyle: {
                color: this.getColorForIndex(index)
              }
            })),
            label: {
              show: true,
              position: 'top',
              color: '#000',
              formatter: '{c}',
              fontSize: 12
            },
            markLine: {
              data: [{ type: 'average', name: 'Avg' }]
            },
            barGap: '10%'
          }
        ]
      };

      myChart.setOption(option);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-bar"');
    }
  }

/*
  Devuelve un color específico según el índice, utilizando una paleta predefinida
  que se repite si el índice supera la cantidad de colores disponibles.
*/
  getColorForIndex(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length]; // Asigna un color a cada barra, y repite si hay más barras que colores
  }

/*
  Obtiene y procesa los datos de géneros de emprendedores para graficar en un
  gráfico de dona, utilizando la respuesta del servicio y configurando las opciones
  del gráfico.
*/
  getDatosGenerosGrafica(): void {
    this.dashboardService.dashboardAdmin(this.token).subscribe(
      response => {

        const data = response.generosEmprendedores.original;

        const formattedData = data.map(item => ({
          value: Number(item.total),
          name: item.genero
        }));

        if (data && data.length > 0) {
          const dataGenero = data.map(item => item.total);

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
                  show: true,
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

          this.initEChartsDoughnut();
        } else {
          console.error('No se recibieron datos válidos para el gráfico de géneros.');
        }
      },
      error => {
        console.error('Error al obtener los datos de géneros:', error);
      }
    );
  }

/*
  Inicializa el gráfico de dona con los datos y configuraciones previamente establecidas.
  Verifica si el elemento DOM con el id 'echarts-doughnut' existe antes de inicializar el gráfico.
*/
  initEChartsDoughnut(): void {
    const chartDom = document.getElementById('echarts-doughnut');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.doughnutChartOption);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-doughnut".');
    }
  }

/*
  Inicializa el gráfico de registros mensuales utilizando los datos configurados previamente.
  Verifica si el elemento DOM con el id 'echarts-registros' existe antes de inicializar el gráfico.
*/
  initEchartsRegistrosMenusales(): void {
    const chartDom = document.getElementById('echarts-registros');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.registrosEchartsOptions);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-doughnut"');
    }
  }

/*
  Obtiene los registros mensuales de emprendedores y aliados a través del servicio de dashboard.
  Configura las opciones para el gráfico ECharts usando los datos recibidos y luego inicializa el gráfico.
*/
  getRegistrosMensuales(): void {
    this.dashboardService.dashboardAdmin(this.token).subscribe(
      data => {
        const conteoRegistros = data.conteoRegistros.original;

        if (Array.isArray(conteoRegistros) && conteoRegistros.length > 0) {
          const emprendedoresData = conteoRegistros.map(item => parseInt(item.emprendedores));
          const aliadosData = conteoRegistros.map(item => parseInt(item.aliados));
          const meses = conteoRegistros.map(item => this.getMonthName(item.mes));

          const maxValue = Math.max(...emprendedoresData, ...aliadosData);
          
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
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            legend: {
              orient: 'horizontal',
              left: 'left',
              data: ['Emprendedor', 'Aliados']
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
        }

        this.initEchartsRegistrosMenusales();
      },
      error => {
        console.error('Error al obtener los registros mensuales', error);
      }
    );
  }

/*
  Devuelve el nombre del mes correspondiente al número de mes dado (1 a 12).

*/
  getMonthName(monthNumber: number): string {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[monthNumber - 1];
  }


/*
  Inicializa un gráfico de radar vacío con indicadores predefinidos.
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
  Actualiza y grafica los puntajes de un formulario según el tipo (primera o segunda vez) 
  para la empresa seleccionada.
*/
  graficaPuntajesFormulario(tipo: number): void {
    if (!this.selectedEmpresa || !tipo) {
      this.initGraficaVacia();
      return;
    }

    this.dashboardService.graficaFormulario(this.token, this.selectedEmpresa, tipo).subscribe(
      data => {
        this.getPuntajesForm = {
          title: {
            text: tipo === 1 ? 'Puntajes por Formulario (Primera vez)' : 'Puntajes por Formulario (Segunda vez)',
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
                  name: `Empresa ${this.selectedEmpresa}`
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
        this.initGraficaVacia();
      }

    );
  }

/*
  Inicializa un gráfico ECharts en el elemento con el ID especificado 
  y configura sus opciones utilizando el objeto proporcionado.
*/
  initChart(chartId: string, chartOptions: any): void {
    const chartDom = document.getElementById(chartId);
    this.chart = echarts.init(chartDom);
    this.chart.setOption(chartOptions);
  }
}
