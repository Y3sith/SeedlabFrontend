import { Component, OnInit } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';

import { DashboardsService } from '../../../servicios/dashboard.service';
import { EmpresaService } from '../../../servicios/empresa.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
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
  emprenDeparEchartsOptions: echarts.EChartsOption;
  getPuntajesForm: echarts.EChartsOption;
  years: number[] = [];
  selectedYear: number;
  isLoading: boolean = false;
  listEmpresas = [];
  selectedEmpresa: string = '';
  selectedTipo: string = '';
  chart: any;
  topAliadosEchartsOptions: echarts.EChartsOption;


  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
    private empresaService: EmpresaService,
  ) { }

  ngOnInit() {
    this.validateToken();
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (v, i) => currentYear + i);
    this.selectedYear = this.years[0];
    this.selectedYear = currentYear;
    this.getDatosDashboard(this.selectedYear);
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
        if (this.currentRolId != 1) {
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

  onSelectChange(event: any): void {
    this.selectedTipo = event.target.value;

    if (this.selectedTipo) {
      this.graficaPuntajesFormulario(+this.selectedTipo); 
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

  initChart(chartId: string, options: any): void {
    setTimeout(() => {
      const chartDom = document.getElementById(chartId);
      if (chartDom) {
        const chart = echarts.init(chartDom);
        chart.setOption(options);
      } else {
        console.error('No se encontró el contenedor del gráfico:', chartId);
      }
    }, 100); // Retraso de 100ms para asegurarse de que el DOM esté listo
  }


  onEmpresaChange(selectedId: string): void {
    this.selectedEmpresa = selectedId;
    this.graficaPuntajesFormulario(+this.selectedTipo);
  }

  getDatosDashboard(year): void {
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
        this.isLoading = false;

        // Configuración para la gráfica de barras (Top Aliados)
        this.initEChartsBar();
        // Configuración para la gráfica de pastel (Asesorías)
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

        //Data promedio asesorias
        const meses = data.averageAsesorias.original.promedio_mensual.map(item => this.getMonthName(item.mes));
        const promedios = data.averageAsesorias.original.promedio_mensual.map(item => parseFloat(item.promedio_asesorias));
        const promedioAnual = data.averageAsesorias.original.promedio_anual; // Asegurarse de convertir a número

        //Grafico de promedios
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
              data: promedioAnual,  // Convertir el promedio anual en un array para la gráfica
              type: 'bar',
            }
          ]
        };

        //Data y grafica generos
        const response = data.generosEmprendedores.original;

        // Formatear los datos para el gráfico
        const formattedData = response.map(item => ({
          value: Number(item.total), // Convertir total a número
          name: item.genero
        }));

        // Configuración de la opción del gráfico
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
                show: true, // Mostrar etiquetas
                position: 'outside' // Posición afuera
              },
              emphasis: {
                label: {
                  show: true, // Mostrar etiqueta en énfasis
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: true // Mostrar líneas de etiqueta
              },
              data: formattedData // Usar los datos formateados
            }
          ]
        };

        // Inicializar el gráfico
        this.initChart('echarts-doughnut', this.doughnutChartOption);

        //Dato y grafica registros 

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
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            legend: {
              data: ['Emprendedor', 'Aliados'],
              left: 'center',
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

          // Inicializamos el gráfico
          this.initChart('echarts-registros', this.registrosEchartsOptions);
        } else {
          console.error('Los datos recibidos no tienen la estructura esperada o están vacíos', data);
        }

        //Data y grafica de emprendedor por departamento

        // Obtener los emprendedores por departamento desde el JSON
        const emprendedoresPorDepartamento = data.emprendedoresPorDepartamento.original.map(
          (item: { departamento: string; total_emprendedores: string }) => ({
            departamento: item.departamento,
            total_emprendedores: Number(item.total_emprendedores) || 0 // Convertir a número
          })
        );

        // Usamos setTimeout para dar tiempo antes de cargar el gráfico
        setTimeout(() => {
          // Cargar el archivo geojson para el mapa de Colombia
          fetch('assets/data/COL1.geo.json')
            .then(response => response.json())
            .then(colJson => {
              // Registrar el mapa de Colombia en ECharts
              echarts.registerMap('Colombia', colJson);

              // Normalizar nombres y mapear los datos a formato requerido por ECharts
              const mappedData = emprendedoresPorDepartamento.map(item => ({
                name: this.normalizeName(item.departamento),
                value: item.total_emprendedores
              }));

              // Normalizar los nombres de los departamentos en el archivo geojson
              colJson.features.forEach(feature => {
                feature.properties.NOMBRE_DPT = this.normalizeName(feature.properties.NOMBRE_DPT);
              });

              // Calcular el valor máximo de emprendedores por departamento
              const maxValue = Math.max(...emprendedoresPorDepartamento.map(item => item.total_emprendedores));

              // Configuración del gráfico ECharts
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
                      Emprendedores: ${isNaN(params.value) ? 0 : params.value}<br>
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

              // Inicializar el gráfico con el archivo geojson y la configuración de ECharts
              this.initChart('echarts-empXDepar', this.emprenDeparEchartsOptions);
            })
            .catch(error => console.error('Error al cargar el mapa:', error));
        }, 1000); // Retardo de 1 segundo para cargar el gráfico


        
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
    if (this.topAliados && this.topAliados.length) {
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
            interval: 0, // Muestra todas las etiquetas
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
    } else {
      console.error('No hay datos disponibles para mostrar en la gráfica.');
    }
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
