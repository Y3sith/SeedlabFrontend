import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { DashboardsService } from '../../../servicios/dashboard.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  token: string | null = null;
  user: User = null;
  id: number;
  currentRolId: number = null;
  totalUsuarios: any[] = [];
  totalEmprendedores: any = {};
  totalAsesoresActivos: number = 0;
  totalAsesoresInactivos: number = 0;
  topAliados: any[] = [];
  topAliadosChartOption: any;
  doughnutChartOption: any;
  pendientesFinalizadasLabels: string[] = ['Pendientes', 'Finalizadas', 'Sin Asignar', 'Asignadas'];
  pendientesFinalizadasData: number[] = [0, 0, 0, 0];
  asesoriasChartOption: any;
  isLoading: boolean = false;
  estadisticas: any[] = [];

  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.validateToken();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  validateToken(): void {
    this.token = localStorage.getItem('token');
    const identityJSON = localStorage.getItem('identity');

    if (identityJSON) {
      const identity = JSON.parse(identityJSON);
      this.user = identity;
      this.id = this.user.id;
      this.currentRolId = this.user.id_rol;
      if (this.currentRolId !== 3) {
        this.router.navigate(['home']);
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      adminData: this.dashboardService.dashboardAdmin(this.token),
      aliadoData: this.dashboardService.getDashboard(this.token, this.id)
    })
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError(error => {
          console.error('Error al obtener datos del dashboard:', error);
          this.isLoading = false;
          return [];
        })
      )
      .subscribe(({ adminData, aliadoData }) => {
        // Procesar adminData
        if (adminData) {
          this.totalUsuarios = adminData;
          this.totalEmprendedores = adminData.usuarios.emprendedor;
          this.topAliados = adminData.topAliados;

          // Configurar opciones para el gráfico de Top Aliados
          this.setupTopAliadosChart();
          // Configurar opciones para el gráfico de Géneros
          this.setupDoughnutChart(adminData);

          // Configurar estadísticas
          this.setupEstadisticas();
        }

        // Procesar aliadoData
        if (aliadoData) {
          this.totalAsesoresActivos = aliadoData['Asesores Activos'] || 0;
          this.totalAsesoresInactivos = aliadoData['Asesores Inactivos'] || 0;

          // Asignar los datos a la estructura de chart
          this.pendientesFinalizadasData = [
            aliadoData['Asesorias Pendientes'] || 0,
            aliadoData['Asesorias Finalizadas'] || 0,
            aliadoData['Asesorias Sin Asignar'] || 0,
            aliadoData['Asesorias Asignadas'] || 0
          ];

          // Configurar opciones para el gráfico de Asesorías
          this.setupAsesoriasChart();
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  private setupTopAliadosChart(): void {
    this.topAliadosChartOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        orient: 'horizontal',
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
          rotate: 30,
          formatter: (value: string) => {
            return value.length > 10 ? value.substring(0, 10) + '...' : value;
          }
        }
      },
      yAxis: {
        type: 'value'
      },
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
  }

  private setupDoughnutChart(data: any): void {
    const response = data.generosEmprendedores;

    const formattedData = response.map(item => ({
      value: Number(item.total),
      name: item.genero
    }));

    this.doughnutChartOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '2%',
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
  }

  private setupAsesoriasChart(): void {
    this.asesoriasChartOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '2%',
        left: 'left'
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
            value: this.pendientesFinalizadasData[index],
            name: label
          }))
        }
      ]
    };
  }

  private setupEstadisticas(): void {
    this.estadisticas = [
      {
        id: 1,
        titulo: 'Asesores',
        activos: this.totalAsesoresActivos,
        inactivos: this.totalAsesoresInactivos,
        bgColor: 'bg-orange-500'
      },
      {
        id: 2,
        titulo: 'Emprendedores',
        activos: this.totalEmprendedores['activos'],
        inactivos: this.totalEmprendedores['inactivos'],
        bgColor: 'bg-purple-500'
      }
    ];
  }

  getColorForIndex(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length];
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
