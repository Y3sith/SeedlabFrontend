import { Component, AfterViewInit } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { AliadoService } from '../../../servicios/aliado.service';
import { Router } from '@angular/router';
import * as echarts from 'echarts';

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

  constructor(
    private superAdminService: SuperadminService,
    private aliadoService: AliadoService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.validateToken();
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
  }

  ngAfterViewInit() {
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
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  getDatosDashboard(): void {
    this.superAdminService.dashboardAdmin(this.token).subscribe(
      data => {
        this.totalUsuarios = data;
        this.totalSuperAdmin = data.superadmin;
        this.totalOrientador = data.orientador;
        this.totalAliados = data.aliado;
        this.totalAsesores = data.asesor;
        this.totalEmprendedores = data.emprendedor;
        this.topAliados = data.topAliados;

        // Configuración para la gráfica de Top Aliados
        this.initEChartsBar();

        // Configuración para la gráfica de Asesorías
        this.pieChartOption = {
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center'
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
                  show: true,
                  fontSize: 40,
                  fontWeight: 'bold'
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
        this.initEChartsPie();

        console.log(data);
      },
      error => {
        console.log(error);
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




  initEChartsPie(): void {
    const chartDom = document.getElementById('echarts-pie');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.pieChartOption);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-pie"');
    }
  }

  getDatosGenerosGrafica(): void {
    this.aliadoService.graficaDatosGeneros(this.token).subscribe(
      data => {
        console.log('data generos', data);
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
                  show: true,
                  fontSize: 40,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: data.map(item => ({ value: item.total, name: item.genero }))
            }
          ]
        };

        // Inicializa el gráfico aquí después de obtener los datos
        this.initEChartsDoughnut();
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  initEChartsDoughnut(): void {
    const chartDom = document.getElementById('echarts-doughnut');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.doughnutChartOption);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-doughnut"');
    }
  }
}
