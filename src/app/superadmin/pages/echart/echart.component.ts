import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-echart',
  template: '<div class="echart" style="width: 100%; height: 100%;"></div>',
  styleUrls: ['./echart.component.css']
})
export class EChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() options: any; // Aceptar las opciones del gráfico como entrada
  private chartInstance: any;

  constructor(private el: ElementRef) {}

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.initChart();
  }
  /*Esta función se ejecuta automáticamente cuando hay cambios en las propiedades de entrada del componente*/
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.chartInstance) {
      this.chartInstance.setOption(this.options, true);
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  private initChart(): void {
    const element = this.el.nativeElement.querySelector('.echart');
    this.chartInstance = echarts.init(element);
    if (this.options) {
      this.chartInstance.setOption(this.options);
    }
  }

}
