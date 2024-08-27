import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAliadosComponent } from './pages/aliados/add-aliados/add-aliados.component';
import { ListAliadosComponent } from './pages/aliados/list-aliados/list-aliados.component';
import { ListOrientadorComponent } from './pages/orientador/list-orientador/list-orientador.component';
import { ListSuperadminComponent } from './pages/list-superadmin/list-superadmin.component';
import { ModalCrearSuperadminComponent } from './pages/add-superadmin/modal-crear-superadmin.component';
import { PerfilSuperadminComponent } from './pages/perfil-superadmin/perfil-superadmin.component';
import { PersonalizacionesComponent } from './pages/personalizaciones/personalizaciones.component';
import { ListRutasComponent } from './pages/ruta/list-ruta/list-rutas.component';
import { ModalAddRutaComponent } from './pages/ruta/modal-add-ruta/modal-add-ruta.component';
import { AddActividadComponent } from './pages/ruta/add-actividad/add-actividad.component';
import { SuperadminRoutingModule } from './superadmin-routing.module';
import { ModalCrearOrientadorComponent } from './pages/orientador/add-orientador/modal-crear-orientador.component';
import { ActnivlecComponent } from './pages/ruta/actnivlec/actnivlec.component';


import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';


import { NgChartsModule } from 'ng2-charts';
import { EditarActRutaComponent } from './pages/editar-act-ruta/editar-act-ruta.component';
import { MatTooltipModule} from '@angular/material/tooltip';
import { ReportesAdmComponent } from './reportes-adm/reportes-adm.component';
import { AddBannerModalComponent } from './pages/aliados/add-banner-modal/add-banner-modal.component';






@NgModule({
  declarations: [
    AddAliadosComponent,
    ListAliadosComponent,
    ListOrientadorComponent,
    ListSuperadminComponent,
    ModalCrearSuperadminComponent,
    PerfilSuperadminComponent,
    PersonalizacionesComponent,
    ListRutasComponent,
    ModalAddRutaComponent,
    AddActividadComponent,
    ModalCrearOrientadorComponent,
    ActnivlecComponent,
    DashboardComponent,
    EditarActRutaComponent,
    ReportesAdmComponent,
    AddBannerModalComponent,
    
  ],
  imports: [
    CommonModule,
    SuperadminRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    FilterPipeModule,
    FontAwesomeModule,
    SharedModule,
    ColorPickerModule,
    MatIconModule,
    RouterModule,
    NgChartsModule,
    MatTooltipModule
  ]
})
export class SuperadminModule { }
