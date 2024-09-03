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




@NgModule({
  declarations: [
    AsesoriasComponent,
    HorarioModalComponent,
    PerfilAsesorComponent
  ],
  imports: [
    CommonModule,
    AsesorRoutingModule,
    SharedModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FormsModule,
    FilterPipeModule
  ]
})
export class AsesorModule { }
