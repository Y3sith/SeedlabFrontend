import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAsesoresComponent } from './pages/list-asesores/list-asesores.component';
import { AsesoriaAliadoComponent } from './pages/list-asesorias/asesoria-aliado.component';
import { FanPageComponent } from './pages/fan-page/fan-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: 'list-asesores', component:ListAsesoresComponent, data: {title: 'Asesores', showInMenu: true}},
      {path: 'list-asesorias', component: AsesoriaAliadoComponent, data: {title: 'Asesorias', showInMenu: true}},
      {path: 'fan-page', component: FanPageComponent, data: {title: 'FanPage', showInMenu: true}},
      {path: 'dashboard', component: DashboardComponent, data: {title: 'Dashboard', showInMenu: true}},
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
