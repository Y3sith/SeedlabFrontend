import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAsesoresComponent } from './pages/list-asesores/list-asesores.component';
import { AsesoriaAliadoComponent } from './pages/list-asesorias/asesoria-aliado.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PerfilAliadoComponent } from './pages/perfil-aliado/perfil-aliado.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ModalAddAsesoresComponent } from './pages/add-asesores/modal-add-asesores.component';
import { data } from 'jquery';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: 'dashboard-aliado', component: DashboardComponent, data: {title: 'Dashboard', showInMenu: true, icon: 'fa-solid fa-chart-pie'}},
      {path: 'list-asesores', component:ListAsesoresComponent, data: {title: 'Asesores', showInMenu: true, icon: 'fa-solid fa-users'}},
      {path: 'list-asesorias', component: AsesoriaAliadoComponent, data: {title: 'Asesorias', showInMenu: true, icon: 'fa-solid fa-users-gear'}},
      {path: 'perfil-aliado', component: PerfilAliadoComponent, data: {title: 'Perfil', showInMenu: true, icon: 'fa-solid fa-circle-user'}},
      {path: 'Reportes', component:ReportesComponent, data:{title: 'Reportes', showInMenu: true, icon: 'fa-regular fa-file-lines'}},
      {path: 'add-asesor', component: ModalAddAsesoresComponent, data:{showInMenu:false}},
      { path: 'edit-orientador/:id', component: ModalAddAsesoresComponent, data:{  showInMenu: false } },
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
