import { Component, ElementRef, Input } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-echart',
  template: '<div class="echart" style="width: 100%; height: 100%;"></div>',
  styleUrls: ['./echart.component.css']
})
export class EChartComponent {
  @Input() options: any; // Aceptar las opciones del gráfico como entrada
  private chartInstance: any;

  constructor(private el: ElementRef) {}

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.initChart();
  }
  /*Esta función se ejecuta automáticamente cuando hay cambios en las propiedades de entrada del componente*/
  ngOnChanges(): void {
    if (this.chartInstance) {
      this.chartInstance.setOption(this.options);
    }
  }

  private initChart(): void {
    this.chartInstance = echarts.init(this.el.nativeElement.querySelector('.echart'));
    this.chartInstance.setOption(this.options);
  }

}
