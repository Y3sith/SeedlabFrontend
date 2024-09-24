import { Component, AfterViewInit } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';

import { DashboardsService } from '../../../servicios/dashboard.service';
import { EmpresaService } from '../../../servicios/empresa.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
  emprenDeparEchartsOptions: echarts.EChartsOption;
  getPuntajesForm: echarts.EChartsOption;
  years: number[] = [];
  selectedYear: number;
  isLoading: boolean = false;
  listEmpresas = [];
  selectedEmpresa: string = '';
  selectedTipo: string = '';
  chart: any;

  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
    private empresaService: EmpresaService
  ) { }

  ngOnInit() {
    this.validateToken();
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.getRegistrosMensuales();
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (v, i) => currentYear + i);
    this.selectedYear = currentYear;
    this.getEmpresas();
    this.promedioAsesoriasMesAnio(this.selectedYear);
    this.emprendedorPorDepartamento();
    this.initGraficaVacia();
  }

  ngAfterViewInit() {
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.getRegistrosMensuales();
    this.promedioAsesoriasMesAnio(this.selectedYear);
    this.emprendedorPorDepartamento();
    //this.graficaPuntajesFormulario();

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
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  //
  onYearChange(year: number): void {
    this.selectedYear = year;
    this.promedioAsesoriasMesAnio(this.selectedYear);
  }

  onSelectChange(event: any): void {
    this.selectedTipo = event.target.value;

    if (this.selectedTipo) {
      this.graficaPuntajesFormulario(+this.selectedTipo); // Convierte el valor a número y llama a la función
    }
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

  initChart(chartId: string, chartOptions: any): void {
    const chartDom = document.getElementById(chartId);
    this.chart = echarts.init(chartDom); // Inicializa el gráfico y lo almacena en this.chart
    this.chart.setOption(chartOptions);
  }

  onEmpresaChange(selectedId: string): void {
    this.selectedEmpresa = selectedId;
    this.graficaPuntajesFormulario(+this.selectedTipo);
  }



  promedioAsesoriasMesAnio(year: number): void {
    this.dashboardService.promedioAsesorias(this.token, this.selectedYear).subscribe(
      data => {
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
        this.initChart('promedio-asesorias', this.promedioAsesoriasEchartsOptions);
      },
      error => {
        console.error('Error al obtener promedio de asesorías:', error);
      }
    );
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
        this.topAliados = data.topAliados.original;

        // Configuración para la gráfica de Asesorías
        this.initEChartsBar();

        // Configuración para la gráfica de Asesorías
        this.pieChartOption = {
          tooltip: {
            trigger: 'item'
          },
          toolbox: {
            feature: {
              dataView: { show: true, readOnly: false },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          legend: {
            orient: 'vertical',
            left: 'left',
          },
          series: [
            {
              name: 'Asesorías',
              type: 'pie',
              radius: ['80%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
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

        // Inicializar el gráfico de Asesorías
        this.initChart('echarts-pie', this.pieChartOption);
      },
      error => {
        console.log(error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  initEChartsBar(): void {
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
            type: 'line',
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

        this.initChart('echarts-doughnut', this.doughnutChartOption);
      },
      error => {
        console.log(error);
      }
    );
  }




  getRegistrosMensuales(): void {
    this.dashboardService.contarRegistrosMensual(this.token).subscribe(
      data => {
        if (Array.isArray(data) && data.length > 0) {
          const emprendedoresData = data.map(item => parseInt(item.emprendedores));
          const aliadosData = data.map(item => parseInt(item.aliados));
          const meses = data.map(item => this.getMonthName(item.mes));

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
              data: ['Emprendedor', 'Aliados'],
              left: 'center',  // Centrar la leyenda en PC
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
          // Usar setTimeout para asegurarse de que el DOM esté listo
          this.initChart('echarts-registros', this.registrosEchartsOptions);
        } else {
          console.error('Los datos recibidos no tienen la estructura esperada', data);
        }
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


  emprendedorPorDepartamento() {
    this.dashboardService.emprendedoresPorDepartamento(this.token).subscribe(
      (data: { departamento: string; total_emprendedores: number }[]) => {
        fetch('assets/data/COL1.geo.json')
          .then(response => response.json())
          .then(colJson => {
            echarts.registerMap('Colombia', colJson);

            const mappedData = data.map(item => ({
              name: this.normalizeName(item.departamento),
              value: Number(item.total_emprendedores) || 0
            }));

            colJson.features.forEach(feature => {
              feature.properties.NOMBRE_DPT = this.normalizeName(feature.properties.NOMBRE_DPT);
            });
            const maxValue = Math.max(...data.map(item => item.total_emprendedores));

            this.emprenDeparEchartsOptions = {
              title: {
                text: 'Emprendedores por Departamento',
                left: 'center'
              },
              tooltip: {
                trigger: 'item',
                formatter: function (params) {
                  return `
                    Departamento: ${params.name}<br>
                    Valor: ${isNaN(params.value) ? 0 : params.value}<br>
                  `;
                }
              },
              visualMap: {
                min: 0,
                max: maxValue,
                left: 'left',
                top: 'bottom',
                text: ['Alta', 'Baja'],
                calculable: true
              },
              series: [
                {
                  name: 'Emprendedores',
                  type: 'map',
                  map: 'Colombia',
                  roam: true,
                  data: mappedData,
                  nameProperty: 'NOMBRE_DPT',
                  emphasis: {
                    label: {
                      show: true
                    },
                    itemStyle: {
                      areaColor: '#eee'
                    }
                  },
                  select: {
                    label: {
                      show: true
                    },
                    itemStyle: {
                      color: 'rgb(255, 215, 0)'
                    }
                  }
                }
              ]
            };

            this.initChart('echarts-empXDepar', this.emprenDeparEchartsOptions);
          })
          .catch(error => console.error('Error al cargar el mapa:', error));
      },
      error => console.error('Error al obtener datos de emprendedores:', error)
    );
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
        this.initChart('echarts-formulario', this.getPuntajesForm);
      },
      error => {
        console.error('Error al obtener los puntajes del formulario:', error);
        this.initGraficaVacia();
      }

    );
  }




  normalizeName(name: string): string {
    return name.toUpperCase()
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/\s+/g, ' ')
      .trim();
  }


}
