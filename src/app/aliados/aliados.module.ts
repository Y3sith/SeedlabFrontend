import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAsesoresComponent } from './pages/list-asesores/list-asesores.component';
import { AsesoriaAliadoComponent } from './pages/list-asesorias/asesoria-aliado.component';
import { ModalAddAsesoresComponent } from './pages/add-asesores/modal-add-asesores.component';
import { AsignarAsesorModalComponent } from './pages/asignar-asesor-modal/asignar-asesor-modal.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SharedModule } from '../shared.module';
import { AliadosRoutingModule } from './aliados-routing.module';
import { SafePipe } from './pages/modal-aliados/modal-aliados.component';


import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';


import { NgChartsModule } from 'ng2-charts';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PerfilAliadoComponent } from './pages/perfil-aliado/perfil-aliado.component';
import { AddBannerComponent } from './pages/add-banner/add-banner.component';

import { ReportesComponent } from './pages/reportes/reportes.component';
import { TodosLosAliadosComponent } from './pages/todos-los-aliados/todos-los-aliados.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { RutaAliadoComponent } from './pages/ruta-aliado/ruta-aliado.component';
import { ModalAliadosComponent } from './pages/modal-aliados/modal-aliados.component';
import { ListRutaComponent } from './pages/list-ruta/list-ruta.component';
import { ListActividadesComponent } from './pages/list-actividades/list-actividades.component';







@NgModule({
  declarations: [
    ListAsesoresComponent,
    AsesoriaAliadoComponent,
    ModalAddAsesoresComponent,
    AsignarAsesorModalComponent,
    DashboardComponent,
    PerfilAliadoComponent,
    AddBannerComponent,
    ReportesComponent,
    TodosLosAliadosComponent,
    RutaAliadoComponent,
    ModalAliadosComponent,
    SafePipe,
    ListRutaComponent,
    ListActividadesComponent,
  ],
  imports: [
    CommonModule,
    AliadosRoutingModule,
    ReactiveFormsModule,
    FilterPipeModule,
    NgxPaginationModule,
    FormsModule,
    MatIconModule,
    SharedModule,
    FontAwesomeModule,
    NgChartsModule,
    MatTooltipModule,
    RouterModule,
    MatToolbarModule

  ]
})
export class AliadosModule { }
