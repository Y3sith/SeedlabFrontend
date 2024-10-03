import { AngularMaterialModule } from '../angular-material.module';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BodyComponent } from './inicio/body/body.component';
import { MenuComponent } from './inicio/menu/menu.component';
import { AuthModule } from './auth/auth.module';
import { AliadosModule } from './aliados/aliados.module';
import { AsesorModule } from './asesor/asesor.module';
import { EmprendedorModule } from './emprendedor/emprendedor.module';
import { SuperadminModule } from './superadmin/superadmin.module';


import { OrientadorModule } from './orientador/orientador.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { AuthInterceptor } from './auth.interceptor';



@NgModule({
  declarations: [
    AppComponent,
    BodyComponent,
    MenuComponent,

  ],
  imports: [
    AngularMaterialModule,
    AppRoutingModule,
    BrowserModule,
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    MatListModule,
    MatSidenav,
    MatSidenavModule,
    MatToolbarModule,
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
    {provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,},

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
