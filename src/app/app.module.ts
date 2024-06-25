import { AngularMaterialModule } from '../angular-material.module';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { AddAliadosComponent } from './super-admin/aliados/add-aliados/add-aliados.component';
import { AddEmpresaComponent } from './emprendedor/empresa/add-empresa/add-empresa.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AsesoriasComponent } from './asesor/asesorias/asesorias.component';
import { BodyComponent } from './inicio/body/body.component';
import { CargaComponent } from './carga/carga.component';
import { CrearAsesoriaModalComponent } from './emprendedor/asesorias/crear-asesoria-modal/crear-asesoria-modal.component';
import { CrearSuperadminComponent } from './super-admin/crear-superadmin/crear-superadmin.component';
import { CursorutasComponent } from './ruta/cursorutas/cursorutas.component';
import { DarAliadoAsesoriaModalComponent } from './orientador/asesorias/dar-aliado-asesoria-modal/dar-aliado-asesoria-modal.component';
import { EditEmpresaComponent } from './emprendedor/empresa/edit-empresa/edit-empresa.component';
import { EncuestaEmpresaComponent } from './emprendedor/formulario-diagnostico/encuesta-empresa.component';
//import { HeaderComponent } from './header/header.component';
import { HorarioModalComponent } from './asesor/horario-modal/horario-modal.component';
import { ListAliadosComponent } from './super-admin/aliados/list-aliados/list-aliados.component';
import { ListAsesoriaEmprendedorComponent } from './emprendedor/asesorias/list-asesoria-emprendedor/list-asesoria-emprendedor.component';
import { ListEmpresasComponent } from './emprendedor/empresa/list-empresas/list-empresas.component';
import { ListRutasComponent } from './super-admin/ruta/list-rutas/list-rutas.component';
import { MenuComponent } from './inicio/menu/menu.component';
import { ModalComponent } from './super-admin/modal/modal.component';
import { ModalCrearOrientadorComponent } from './orientador/orientador-crear/modal-crear-orientador/modal-crear-orientador.component';
import { ModalcrearSuperadminComponent } from './super-admin/modalcrear-superadmin/modalcrear-superadmin.component';
import { OrientadorCrearComponent } from './orientador/orientador-crear/orientador-crear.component';
import { PerfilAdminComponent } from './super-admin/perfil-admin/perfil-admin.component';
import { PerfilAsesorComponent } from './asesor/perfil-asesor/perfil-asesor.component';
import { PerfilEmprendedorComponent } from './emprendedor/perfil-emprendedor/perfil-emprendedor.component';
import { PerfilOrientadorComponent } from './orientador/perfil-orientador/perfil-orientador.component';
import { PersonalizacionesComponent } from './super-admin/personalizaciones/personalizaciones.component';
import { ReportesComponent } from './orientador/reportes/reportes.component';
import { RutaEmprendedorComponent } from './emprendedor/ruta-emprendedor/ruta-emprendedor.component';
import { RutasComponent } from './ruta/rutas/rutas.component';
import { SafeUrlPipe } from './ruta/cursorutas/cursorutas.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { VerAsesoriasComponent } from './orientador/asesorias/list-asesorias/ver-asesorias.component';

import { AuthModule } from './auth/auth.module';
import { AliadosModule } from './aliados/aliados.module';



@NgModule({
  declarations: [
    AddAliadosComponent,
    AddEmpresaComponent,
    AppComponent,
    AsesoriasComponent,
    BodyComponent,
    CrearAsesoriaModalComponent,
    CrearSuperadminComponent,
    CursorutasComponent,
    DarAliadoAsesoriaModalComponent,
    EditEmpresaComponent,
    EncuestaEmpresaComponent,
   // HeaderComponent,
    HorarioModalComponent,
    ListAsesoriaEmprendedorComponent,
    ListAliadosComponent,
    ListEmpresasComponent,
    ListRutasComponent,
    MenuComponent,
    ModalComponent,
    ModalCrearOrientadorComponent,
    ModalcrearSuperadminComponent,
    OrientadorCrearComponent,
    PerfilAdminComponent,
    PerfilAsesorComponent,
    PerfilEmprendedorComponent,
    PerfilOrientadorComponent,
    PersonalizacionesComponent,
    ReportesComponent,
    RutaEmprendedorComponent,
    RutasComponent,
    SafeUrlPipe,
    SuperAdminComponent,
    VerAsesoriasComponent,
    CargaComponent,
  ],
  imports: [
    AngularMaterialModule,
    AppRoutingModule,
    BrowserModule,
    ColorPickerModule,
    CommonModule,
    FilterPipeModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatSidenav,
    MatSidenavModule,
    MatToolbarModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    AuthModule,
    AliadosModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
// main.ts


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
