import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilAsesorComponent } from './pages/perfil-asesor/perfil-asesor.component';
import { AsesoriasComponent } from './pages/asesorias/asesorias.component';
import { ListRutaComponent } from './pages/list-ruta/list-ruta.component';
import { ListActividadesComponent } from './pages/list-actividades/list-actividades.component';
import { RutaAsesorComponent } from './pages/ruta-asesor/ruta-asesor.component';

const routes: Routes = [

  {
    path: '',
    children: [
      {path: 'asesorias', component: AsesoriasComponent, data:{title: 'Asesorias', icon:'fa-solid fa-users-gear', showInMenu: true}},
      {path: 'perfil-asesores', component: PerfilAsesorComponent, data:{title: 'Perfil', icon:'fa-solid fa-circle-user', showInMenu: true}},
      {path: 'list-ruta-asesor', component: ListRutaComponent, data: {title: 'Rutas', showInMenu:true, icon: 'fa-solid fa-location-arrow'}},
      {path: 'list-actividades-asesor', component: ListActividadesComponent, data:{  showInMenu: false } },
      {path: 'Ruta-asesor', component: RutaAsesorComponent, data:{  showInMenu: false } }
    ]
  }
];



@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class AsesorRoutingModule {
  static getRoutes(): Routes{
    return routes;
  }
 }
