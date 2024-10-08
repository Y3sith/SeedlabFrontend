import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import * as echarts from 'echarts';

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
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private charts: { [key: string]: echarts.ECharts } = {};

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
  topAliados: any = [];
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
  topAliadosEchartsOptions: echarts.EChartsOption;

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
    this.getDatosDashboard(this.selectedYear);
    this.initGraficaVacia();
    this.getEmpresas();
  }

  ngAfterViewInit() {
    // Inicializa los gráficos después de que la vista ha sido inicializada
    this.initCharts();
  }

  ngOnDestroy(): void {
    // Desuscribirse de todos los observables y destruir los gráficos
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    Object.keys(this.charts).forEach(chartId => {
      if (this.charts[chartId]) {
        this.charts[chartId].dispose();
      }
    });
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      const identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        const identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId !== 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  onYearChange(year: number): void {
    if (this.selectedYear !== year) {
      this.selectedYear = year;
      this.getDatosDashboard(this.selectedYear);
    }
  }

  onSelectChange(event: any): void {
    const newTipo = event.target.value;
    if (this.selectedTipo !== newTipo) {
      this.selectedTipo = newTipo;
      this.graficaPuntajesFormulario(+this.selectedTipo);
    }
  }

  getEmpresas(): void {
    this.empresaService.getAllEmpresa(this.token)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        data => {
          this.listEmpresas = data;
          this.selectedEmpresa = this.listEmpresas.length > 0 ? this.listEmpresas[0].documento_empresa : null;
          this.graficaPuntajesFormulario(+this.selectedTipo);
          this.cdr.markForCheck();
        },
        error => {
          console.error('Error al obtener empresas:', error);
        }
      );
  }

  onEmpresaChange(selectedId: string): void {
    if (this.selectedEmpresa !== selectedId) {
      this.selectedEmpresa = selectedId;
      this.graficaPuntajesFormulario(+this.selectedTipo);
    }
  }

  getDatosDashboard(year: number): void {
    this.isLoading = true;
    forkJoin({
      dashboardData: this.dashboardService.dashboardAdmin(this.token),
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
      .subscribe(({ dashboardData, empresas }) => {
        if (dashboardData) {
          this.totalUsuarios = dashboardData;
          this.totalSuperAdmin = dashboardData.usuarios.superadmin;
          this.totalOrientador = dashboardData.usuarios.orientador;
          this.totalAliados = dashboardData.usuarios.aliado;
          this.totalAsesores = dashboardData.usuarios.asesor;
          this.totalEmprendedores = dashboardData.usuarios.emprendedor;
          this.topAliados = dashboardData.topAliados.original;
          this.isLoading = false;

          this.initEChartsBar();
          this.setupPieChart(dashboardData);
          this.setupDoughnutChart(dashboardData);
          this.setupPromedioAsesoriasChart(dashboardData);
          this.setupRegistrosChart(dashboardData);
          this.setupEmprenDeparChart(dashboardData);

          this.cdr.markForCheck();
        }
        if (empresas) {
          this.listEmpresas = empresas;
          this.selectedEmpresa = this.listEmpresas.length > 0 ? this.listEmpresas[0].documento_empresa : null;
          this.graficaPuntajesFormulario(+this.selectedTipo);
        }
      });
  }

  private initCharts(): void {
    // Inicializa todos los gráficos
    this.initChart('echarts-doughnut', this.doughnutChartOption);
    this.initChart('echarts-registros', this.registrosEchartsOptions);
    this.initChart('echarts-empXDepar', this.emprenDeparEchartsOptions);
    this.initChart('echarts-promedio-asesorias', this.promedioAsesoriasEchartsOptions);
    this.initChart('echarts-top-aliados', this.topAliadosEchartsOptions);
    this.initChart('echarts-puntajes-form', this.getPuntajesForm);
  }

  private initChart(chartId: string, options: any): void {
    const chartDom = document.getElementById(chartId);
    if (chartDom) {
      if (this.charts[chartId]) {
        this.charts[chartId].dispose();
      }
      const chart = echarts.init(chartDom);
      chart.setOption(options);
      this.charts[chartId] = chart;
    } else {
      console.error('No se encontró el contenedor del gráfico:', chartId);
    }
  }

  private setupPieChart(data: any): void {
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
            { value: +data.conteoAsesorias.original.asesoriasAsignadas, name: 'Asignadas' },
            { value: +data.conteoAsesorias.original.asesoriasSinAsignar, name: 'Sin asignar' }
          ],
        }
      ]
    };
    this.initChart('echarts-pie', this.pieChartOption);
  }

  private setupDoughnutChart(data: any): void {
    const response = data.generosEmprendedores.original;
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
            show: true,
            position: 'outside'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: formattedData
        }
      ]
    };
    this.initChart('echarts-doughnut', this.doughnutChartOption);
  }

  private setupPromedioAsesoriasChart(data: any): void {
    const meses = data.averageAsesorias.original.promedio_mensual.map(item => this.getMonthName(+item.mes));
    const promedios = data.averageAsesorias.original.promedio_mensual.map(item => +item.promedio_asesorias);
    const promedioAnual = [+data.averageAsesorias.original.promedio_anual];

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
    this.initChart('echarts-promedio-asesorias', this.promedioAsesoriasEchartsOptions);
  }

  private setupRegistrosChart(data: any): void {
    const conteoRegistros = data.conteoRegistros.original.promedios;

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
            restore: { show: true },
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
      this.initChart('echarts-registros', this.registrosEchartsOptions);
    } else {
      console.error('Los datos recibidos no tienen la estructura esperada o están vacíos', data);
    }
  }

  private setupEmprenDeparChart(data: any): void {
    const emprendedoresPorDepartamento = data.emprendedoresPorDepartamento.original.map(
      (item: { departamento: string; total_emprendedores: string }) => ({
        departamento: item.departamento,
        total_emprendedores: Number(item.total_emprendedores) || 0
      })
    );

    // Cargar el archivo geojson para el mapa de Colombia
    fetch('assets/data/COL1.geo.json')
      .then(response => response.json())
      .then(colJson => {
        echarts.registerMap('Colombia', colJson);

        const mappedData = emprendedoresPorDepartamento.map(item => ({
          name: this.normalizeName(item.departamento),
          value: item.total_emprendedores
        }));

        colJson.features.forEach(feature => {
          feature.properties.NOMBRE_DPT = this.normalizeName(feature.properties.NOMBRE_DPT);
        });

        const maxValue = Math.max(...emprendedoresPorDepartamento.map(item => item.total_emprendedores));

        this.emprenDeparEchartsOptions = {
          title: {
            text: 'Emprendedores por Departamento',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
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
        this.initChart('echarts-empXDepar', this.emprenDeparEchartsOptions);
      })
      .catch(error => console.error('Error al cargar el mapa:', error));
  }

  initEChartsBar(): void {
    if (this.topAliados && this.topAliados.length) {
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
            barGap: '10%',
          }
        ]
      };
      this.initChart('echarts-top-aliados', this.topAliadosEchartsOptions);
    } else {
      console.error('No hay datos disponibles para mostrar en la gráfica.');
    }
  }

  getColorForIndex(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A', '#FFD700', '#DC143C'];
    return colors[index % colors.length];
  }

  getMonthName(monthNumber: number): string {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthNames[monthNumber - 1];
  }

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
    this.initChart('echarts-puntajes-form', this.getPuntajesForm);
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
          this.initChart('echarts-puntajes-form', this.getPuntajesForm);
          this.cdr.markForCheck();
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

  trackById(index: number, item: any): number {
    return item.id;
  }
}
