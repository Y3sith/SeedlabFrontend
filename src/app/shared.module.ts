import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { EChartComponent } from './superadmin/pages/echart/echart.component';


@NgModule({
  declarations: [
    HeaderComponent,
    EChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    HeaderComponent,
    EChartComponent
  ]
})
export class SharedModule { }
