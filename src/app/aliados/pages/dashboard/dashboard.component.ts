import { Component, OnInit } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { DashboardsService } from '../../../servicios/dashboard.service';




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
  topAliadosChartOption: echarts.EChartsOption;
  doughnutChartOption: echarts.EChartsOption;
  pendientesFinalizadasLabels: string[] = ['Pendientes', 'Finalizadas', 'Sin Asignar', 'Asignadas'];
  pendientesFinalizadasData: { data: number[] }[] = [{ data: [0, 0, 0, 0] }];
  asesoriasCharOption:echarts.EChartsOption;
  isLoading: boolean = false;



  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.getDatosDashboard();
    this.loadAsesoriasData();
  };

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
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
    Este método es responsable de obtener y procesar 
    los datos necesarios para mostrar en el panel de dashboard. Este método utiliza el servicio `dashboardService` 
    para recuperar los datos relacionados con los usuarios y las 
    asesorías.
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

        // Configuración para la gráfica de Top Aliados
        this.topAliadosChartOption = {
            title: {},
            tooltip: {
              trigger: 'axis'
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
          
        //Data y grafica generos
        const response = data.generosEmprendedores.original;
        
        const formattedData = response.map(item => ({
          value: Number(item.total), 
          name: item.genero
        }));

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

  loadAsesoriasData() {
    this.dashboardService.getDashboard(this.token, this.id).subscribe(
      data => {
        this.pendientesFinalizadasData[0].data = [
          data['Asesorias Pendientes'] || 0,
          data['Asesorias Finalizadas'] || 0,
          data['Asesorias Sin Asignar'] || 0,
          data['Asesorias Asignadas'] || 0
        ];

        this.asesoriasCharOption ={
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
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
}
