import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearAsesoriaModalComponent } from './pages/asesorias/crear-asesoria-modal/crear-asesoria-modal.component';
import { ListAsesoriaEmprendedorComponent } from './pages/asesorias/list-asesoria/list-asesoria-emprendedor.component';
import { AddEmpresaComponent } from './pages/empresa/add-empresa/add-empresa.component';
import { ListEmpresasComponent } from './pages/empresa/list-empresas/list-empresas.component';
import { EncuestaEmpresaComponent } from './pages/formulario-diagnostico/encuesta-empresa.component';
import { RutaEmprendedorComponent } from './pages/ruta-emprendedor/ruta-emprendedor.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PerfilEmprendedorComponent } from './pages/perfil-emprendedor/perfil-emprendedor.component';
import { EmprendedorRoutingModule } from './emprendedor-routing.module';
import { SharedModule } from '../shared.module';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { ModalActividadComponent } from './pages/modal-actividad/modal-actividad.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { CursoRutaEmprendedorComponent} from './pages/curso-ruta-emprendedor/curso-ruta-emprendedor.component';
import { SafePipe } from './pages/curso-ruta-emprendedor/curso-ruta-emprendedor.component';
import { HttpClientModule } from '@angular/common/http';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';








@NgModule({
  declarations: [
    CrearAsesoriaModalComponent,
    ListAsesoriaEmprendedorComponent,
    AddEmpresaComponent,
    ListEmpresasComponent,
    EncuestaEmpresaComponent,
    RutaEmprendedorComponent,
    PerfilEmprendedorComponent,
    ModalActividadComponent,
    ReportesComponent,
    CursoRutaEmprendedorComponent, 
    SafePipe, 
  ],
  imports: [
    CommonModule,
    EmprendedorRoutingModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    FilterPipeModule,
    NgxPaginationModule,
    RouterModule,
    HttpClientModule,
    MatTooltipModule,
  ]
})
export class EmprendedorModule { }
