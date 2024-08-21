import { Component } from '@angular/core';
import { AliadoService } from '../../../servicios/aliado.service';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { DashboardsService } from '../../../servicios/dashboards.service';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
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
  pendientesFinalizadasLabels: string[] = ['Pendientes', 'Finalizadas', 'Sin Asignar', 'Asignadas'];
  pendientesFinalizadasData: { data: number[] }[] = [{ data: [0, 0, 0, 0] }];
  barAsesoriasTotales: echarts.EChartsOption;



  constructor(
    private dashboardService: DashboardsService,
    private aliadoService: AliadoService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.validateToken();
    this.getDatosDashboard();
    this.getDatosGenerosGrafica();
    this.asesoriasTotales();
    this.loadChartData();
  };


  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        console.log(this.id);
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  getDatosDashboard(): void {
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
        this.initEChartsPie();

        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  initEChartsBarAsesoriasTotales(): void {
    const chartDom = document.getElementById('echarts-barAsesorias');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      myChart.setOption(this.barAsesoriasTotales);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-doughnut"');
    }
  }

  asesoriasTotales(): void {
    this.dashboardService.asesoriasXMesAliados(this.token, this.id).subscribe(
      data => {
        console.log('asesorias totales', data);
        const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const totals = new Array(12).fill(0);

        data.forEach(item => {
          // `item.mes` debe ser un número entre 1 y 12
          // Ajustamos el índice para que sea 0-based
          if (item.mes >= 1 && item.mes <= 12) {
              totals[item.mes - 1] = item.total;
          }
      });

        this.barAsesoriasTotales = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['Asesorias'],
            left: 'left',
            top: '5%'
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
          calculable: true,
          xAxis: [
            {
              type: 'category',
              data: meses
            },
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series:[
            {
              name:'Asesorias',
              type: 'bar',
              data: totals
            }
          ],
          markPoint:{
            data: [
              { type:'max', name: 'Max' },
              { type:'min', name: 'Min' },
            ],
          },
          markLine: {
            data: [
              { type: 'average', name: 'Avg' }
            ]
          }
        };
        this.initEChartsBarAsesoriasTotales();
      },
      error => {
        console.log(error);
      }
    )
  }



  getColorForIndex(index: number): string {
    // Lista de colores que se asignarán a las barras
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length]; // Asigna un color a cada barra, y repite si hay más barras que colores
  }


  getDatosGenerosGrafica(): void {
    this.dashboardService.graficaDatosGeneros(this.token).subscribe(
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

  loadChartData() {
    this.dashboardService.getDashboard(this.token, this.id).subscribe(
      data => {
        console.log(data);
        this.pendientesFinalizadasData[0].data = [
          data['Asesorias Pendientes'] || 0,
          data['Asesorias Finalizadas'] || 0,
          data['Asesorias Sin Asignar'] || 0,
          data['Asesorias Asignadas'] || 0
        ];

        // Inicializar la gráfica con los datos cargados
        this.initEChartsPie();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  initEChartsPie() {
    const chartDom = document.getElementById('echarts-pie');
    if (chartDom) {
      echarts.dispose(chartDom); // Destruye la instancia anterior si existe
      const myChart = echarts.init(chartDom);
      const option = {
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
                show: false,
              }
            },
            labelLine: {
              show: false
            },
            data: this.pendientesFinalizadasLabels.map((label, index) => ({
              value: this.pendientesFinalizadasData[0].data[index],
              name: label
            }))
          }
        ]
      };
      myChart.setOption(option);
    } else {
      console.error('No se pudo encontrar el elemento con id "echarts-pie"');
    }
  }



}
