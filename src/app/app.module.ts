import { AngularMaterialModule } from '../angular-material.module';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
//import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup } from '@angular/forms';

//import { ColorPickerModule } from 'ngx-color-picker';
//import { FilterPipeModule } from 'ngx-filter-pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
//import { NgxPaginationModule } from 'ngx-pagination';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BodyComponent } from './inicio/body/body.component';
import { CursorutasComponent } from './ruta/cursorutas/cursorutas.component';

import { MenuComponent } from './inicio/menu/menu.component';

import { RutasComponent } from './ruta/rutas/rutas.component';
import { SafeUrlPipe } from './ruta/cursorutas/cursorutas.component';

import { AuthModule } from './auth/auth.module';
import { AliadosModule } from './aliados/aliados.module';
import { AsesorModule } from './asesor/asesor.module';
import { EmprendedorModule } from './emprendedor/emprendedor.module';
import { SuperadminModule } from './superadmin/superadmin.module';


import { OrientadorModule } from './orientador/orientador.module';
import { NgxEchartsModule } from 'ngx-echarts';



@NgModule({
  declarations: [
    AppComponent,
    BodyComponent,
    CursorutasComponent,
   // HeaderComponent,
    MenuComponent,
    //ModalCrearOrientadorComponent,
    //OrientadorCrearComponent,
    RutasComponent,
    SafeUrlPipe,
    
  ],
  imports: [
    AngularMaterialModule,
    AppRoutingModule,
    BrowserModule,
    //ColorPickerModule,
    CommonModule,
    //FilterPipeModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    //MatIconModule,
    MatListModule,
    MatSidenav,
    MatSidenavModule,
    MatToolbarModule,
    //NgxPaginationModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    AuthModule,
    AliadosModule,
    AsesorModule,
    EmprendedorModule,
    SuperadminModule,
    OrientadorModule,
    
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
    
  
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
