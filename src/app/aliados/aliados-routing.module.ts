import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAsesoresComponent } from './pages/list-asesores/list-asesores.component';
import { AsesoriaAliadoComponent } from './pages/list-asesorias/asesoria-aliado.component';
import { FanPageComponent } from './pages/fan-page/fan-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PerfilAliadoComponent } from './pages/perfil-aliado/perfil-aliado.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: 'dashboard-aliado', component: DashboardComponent, data: {title: 'Dashboard', showInMenu: true, icon: 'fa-solid fa-chart-pie'}},
      {path: 'list-asesores', component:ListAsesoresComponent, data: {title: 'Asesores', showInMenu: true, icon: 'fa-solid fa-users'}},
      {path: 'list-asesorias', component: AsesoriaAliadoComponent, data: {title: 'Asesorias', showInMenu: true, icon: 'fa-solid fa-users-gear'}},
      //{path: 'fan-page', component: FanPageComponent, data: {title: 'FanPage', showInMenu: true, icon: 'fa-solid fa-palette'}},
      {path: 'perfil-aliado', component: PerfilAliadoComponent, data: {title: 'Perfil', showInMenu: true, icon: 'fa-solid fa-circle-user'}},

    ]
  }
];  

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot( routes)
  ]
})
export class AliadosRoutingModule {
  static getRoutes(): Routes{
    return routes;
  }
 }
