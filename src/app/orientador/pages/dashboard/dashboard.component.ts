import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { DashboardsService } from '../../../servicios/dashboard.service';
import { EmpresaService } from '../../../servicios/empresa.service';
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
  totalSuperAdmin: any = {};
  totalOrientador: any = {};
  totalAliados: any = {};
  totalAsesores: any = {};
  totalEmprendedores: any = {};
  topAliados: any[] = [];
  estadisticas: any[] = [];

  pieChartOption: any;
  doughnutChartOption: any;
  registrosEchartsOptions: any;
  promedioAsesoriasEchartsOptions: any;
  getPuntajesFormOrientador: any;
  topAliadosEchartsOptions: any;

  years: number[] = [];
  selectedYear: number;
  isLoading: boolean = false;
  selectedEmpresa: string = '';
  listEmpresas: any[] = [];
  selectedTipo: string = '';

  constructor(
    private dashboardService: DashboardsService,
    private router: Router,
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.validateToken();
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (v, i) => currentYear + i);
    this.selectedYear = currentYear;
    this.initGraficaVacia();
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

      if (this.currentRolId !== 2) { // Asegúrate de que el rol del orientador es 2
        this.router.navigate(['home']);
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  onYearChange(year: number): void {
    if (this.selectedYear !== year) {
      this.selectedYear = year;
      this.loadDashboardData();
    }
  }

  onEmpresaChange(selectedId: string): void {
    if (this.selectedEmpresa !== selectedId) {
      this.selectedEmpresa = selectedId;
      this.graficaPuntajesFormulario(+this.selectedTipo);
    }
  }

  onSelectChange(event: any): void {
    const newTipo = event.target.value;
    if (this.selectedTipo !== newTipo) {
      this.selectedTipo = newTipo;
      this.graficaPuntajesFormulario(+this.selectedTipo);
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      adminData: this.dashboardService.dashboardAdmin(this.token),
      empresas: this.empresaService.getAllEmpresa(this.token)
    })
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError(error => {
          console.error('Error al obtener datos del dashboard:', error);
          this.isLoading = false;
          return [];
        })
      )
      .subscribe(({ adminData, empresas }) => {
        if (adminData) {
          // Procesar datos de adminData
          this.totalUsuarios = adminData;
          this.totalSuperAdmin = adminData.usuarios.superadmin;
          this.totalOrientador = adminData.usuarios.orientador;
          this.totalAliados = adminData.usuarios.aliado;
          this.totalAsesores = adminData.usuarios.asesor;
          this.totalEmprendedores = adminData.usuarios.emprendedor;
          this.topAliados = adminData.topAliados;

          this.setupEstadisticas();
          this.setupTopAliadosChart();
          this.setupPromedioAsesoriasChart(adminData);
          this.setupDoughnutChart(adminData);
          this.setupRegistrosChart(adminData);
        }

        if (empresas) {
          this.listEmpresas = empresas;
          this.selectedEmpresa = this.listEmpresas.length > 0 ? this.listEmpresas[0].documento_empresa : null;
          this.graficaPuntajesFormulario(+this.selectedTipo);
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  private setupEstadisticas(): void {
    this.estadisticas = [
      {
        id: 1,
        titulo: 'Super Admins',
        activos: this.totalSuperAdmin['activos'],
        inactivos: this.totalSuperAdmin['inactivos'],
        bgColor: 'bg-orange-500'
      },
      {
        id: 2,
        titulo: 'Orientadores',
        activos: this.totalOrientador['activos'],
        inactivos: this.totalOrientador['inactivos'],
        bgColor: 'bg-green-500'
      },
      {
        id: 3,
        titulo: 'Aliados',
        activos: this.totalAliados['activos'],
        inactivos: this.totalAliados['inactivos'],
        bgColor: 'bg-red-500'
      },
      {
        id: 4,
        titulo: 'Asesores',
        activos: this.totalAsesores['activos'],
        inactivos: this.totalAsesores['inactivos'],
        bgColor: 'bg-blue-500'
      },
      {
        id: 5,
        titulo: 'Emprendedores',
        activos: this.totalEmprendedores['activos'],
        inactivos: this.totalEmprendedores['inactivos'],
        bgColor: 'bg-purple-500'
      }
    ];
  }

  private setupTopAliadosChart(): void {
    this.topAliadosEchartsOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
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
        type: 'value',
        name: 'Asesorías',
        min: 0,
        axisLabel: {
          formatter: '{value}'
        }
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
          barGap: '10%',
        }
      ]
    };
  }

  private setupPromedioAsesoriasChart(data: any): void {
    const meses = data.averageAsesorias.promedio_mensual.map(item => this.getMonthName(+item.mes));
    const promedios = data.averageAsesorias.promedio_mensual.map(item => +item.promedio_asesorias);
    const promedioAnual = [+data.averageAsesorias.promedio_anual];

    this.promedioAsesoriasEchartsOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Promedio Mensual', `Promedio ${this.selectedYear}`],
        left: 'left',
        top: 10,
        itemGap: 20
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: meses
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Promedio Mensual',
          type: 'bar',
          data: promedios,
          itemStyle: {
            color: '#73c0de'
          }
        },
        {
          name: `Promedio ${this.selectedYear}`,
          type: 'line',
          data: promedioAnual,
          itemStyle: {
            color: '#ff7f50'
          }
        }
      ]
    };
  }

  private setupDoughnutChart(data: any): void {
    const response = data.generosEmprendedores;

    const formattedData = response.map(item => ({
      value: +item.total,
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

  private setupRegistrosChart(data: any): void {
    const conteoRegistros = data.conteoRegistros;

    if (Array.isArray(conteoRegistros) && conteoRegistros.length > 0) {
      const emprendedoresData = conteoRegistros.map(item => +item.emprendedores);
      const aliadosData = conteoRegistros.map(item => +item.aliados);
      const meses = conteoRegistros.map(item => this.getMonthName(+item.mes));

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
  }

  initGraficaVacia(): void {
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
              value: [0, 0, 0, 0, 0],
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

    this.dashboardService.graficaFormulario(this.token, this.selectedEmpresa, tipo)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
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
                      +data.info_general || 0,
                      +data.info_tecnica || 0,
                      +data.info_trl || 0,
                      +data.info_mercado || 0,
                      +data.info_financiera || 0
                    ],
                    name: `Empresa ${this.selectedEmpresa}`
                  }
                ]
              }
            ]
          };
          this.cdr.markForCheck();
        },
        error => {
          console.error('Error al obtener los puntajes del formulario:', error);
          this.initGraficaVacia();
        }
      );
  }

  getColorForIndex(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length];
  }

  getMonthName(monthNumber: number): string {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[monthNumber - 1];
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
