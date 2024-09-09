import { Component, AfterViewInit } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { DashboardsService } from '../../../servicios/dashboard.service';


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

  constructor(
    private dashboardService: DashboardsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.validateToken();
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.getRegistrosMensuales();
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (v, i) => currentYear + i);
    this.selectedYear = currentYear;
    this.promedioAsesoriasMesAnio(this.selectedYear);
  }

  ngAfterViewInit() {
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.getRegistrosMensuales();
    this.promedioAsesoriasMesAnio(this.selectedYear);

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
        console.log(this.currentRolId);
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
    this.promedioAsesoriasMesAnio(this.selectedYear);
  }



  promedioAsesoriasMesAnio(year: number): void {
    this.dashboardService.promedioAsesorias(this.token, this.selectedYear).subscribe(
      data => {
        console.log('Promedio de asesorías:', data);

        const meses = data.promedio_mensual.map(item => this.getMonthName(item.mes));
        const promedios = data.promedio_mensual.map(item => parseFloat(item.promedio_asesorias));

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
              data: data.promedio_anual,
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

    initEchartsPromedioAsesorias() {
    const chartDom = document.getElementById('promedio-asesorias');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.promedioAsesoriasEchartsOptions);
    } else {
      console.error('No se pudo encontrar el elemento con id "promedio-asesorias"');
    }
  }


  getDatosDashboard(): void {
    this.isLoading = true;
    this.dashboardService.dashboardAdmin(this.token).subscribe(
      data => {
        this.totalUsuarios = data;
        this.totalSuperAdmin = data.superadmin;
        this.totalOrientador = data.orientador;
        this.totalAliados = data.aliado;
        this.totalAsesores = data.asesor;
        this.totalEmprendedores = data.emprendedor;
        this.topAliados = data.topAliados;

        // Configuración para la gráfica de Asesorías
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
                { value: data.conteoAsesorias.asesoriasAsignadas, name: 'Asesorías asignadas' },
                { value: data.conteoAsesorias.asesoriasSinAsignar, name: 'Asesorías sin asignar' }
              ]
            }
          ]
        };

        // Inicializar el gráfico de Asesorías
        this.graficaTopAliados();

        console.log(data);

        // Mover el isLoading aquí después de la inicialización de gráficos
        this.isLoading = false;
      },
      error => {
        console.log(error);
        this.isLoading = false; // Mover aquí también en caso de error
      }
    );
  }


  graficaTopAliados(): void {
    const chartDom = document.getElementById('echarts-bar');
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
              interval: 0, // Muestra todas las etiquetas
              rotate: 30,  // Rota las etiquetas para mejor legibilidad
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
              value: aliado.asesorias,
              itemStyle: {
                color: this.getColorForIndex(index)
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
            barGap: '10%' // Ajusta el espacio entre las barras
          }
        ]
      };

      myChart.setOption(option);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-bar"');
    }
  }

  getColorForIndex(index: number): string {
    // Lista de colores que se asignarán a las barras
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length]; // Asigna un color a cada barra, y repite si hay más barras que colores
  }

  


  getDatosGenerosGrafica(): void {
    this.dashboardService.graficaDatosGeneros(this.token).subscribe(
      data => {
        console.log('Datos de géneros recibidos:', data); // Verifica los datos aquí
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
                  borderRadius: 20
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
                data: data.map(item => ({ value: item.total, name: item.genero }))
              }
            ]
          };

          console.log('Configuración del gráfico de género:', this.doughnutChartOption);
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

  initEChartsDoughnut(): void {
    const chartDom = document.getElementById('echarts-doughnut');
    if (chartDom) {
      console.log('Inicializando el gráfico de géneros en el contenedor:', chartDom);
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.doughnutChartOption);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-doughnut".');
    }
  }

  initEchartsRegistrosMenusales(): void {
    const chartDom = document.getElementById('echarts-registros');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.registrosEchartsOptions);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-doughnut"');
    }
  }


  getRegistrosMensuales(): void {
    this.dashboardService.contarRegistrosMensual(this.token).subscribe(
      data => {
        console.log('data meses', data);


        const emprendedoresData = data?.map(item => parseInt(item.emprendedores));
        const aliadosData = data?.map(item => parseInt(item.aliados));
        const meses = data?.map(item => this.getMonthName(item.mes)); // Transforma el número del mes en nombre

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
              name: 'Emprendedor',
              min: 0,
              max: Math.max(...emprendedoresData, ...aliadosData) + 10,
              interval: 500,
              axisLabel: {
                formatter: '{value} '
              }
            },
            {
              type: 'value',
              name: 'Aliados',
              min: 0,
              max: Math.max(...emprendedoresData, ...aliadosData) + 10,
              interval: 500,
              axisLabel: {
                formatter: '{value} '
              }
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

        this.initEchartsRegistrosMenusales();
      },
      error => {
        console.error('Error al obtener los registros mensuales', error);
      }
    );
  }


  getMonthName(monthNumber: number): string {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[monthNumber - 1];
  }
}
