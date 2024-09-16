import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsesoriasComponent } from './pages/asesorias/asesorias.component';
import { HorarioModalComponent } from './pages/horario-modal/horario-modal.component';
import { PerfilAsesorComponent } from './pages/perfil-asesor/perfil-asesor.component';
import { SharedModule } from '../shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { AsesorRoutingModule } from './asesor-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';


import { FilterPipeModule } from 'ngx-filter-pipe';
import { ListRutaComponent } from './pages/list-ruta/list-ruta.component';
import { ListActividadesComponent } from './pages/list-actividades/list-actividades.component';
import { RutaAsesorComponent } from './pages/ruta-asesor/ruta-asesor.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    AsesoriasComponent,
    HorarioModalComponent,
    PerfilAsesorComponent,
    ListRutaComponent,
    ListActividadesComponent,
    RutaAsesorComponent,
  ],
  imports: [
    CommonModule,
    AsesorRoutingModule,
    SharedModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FormsModule,
    FilterPipeModule,
    RouterModule
  ]
})
export class AsesorModule { }
