import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerAsesoriasComponent } from './pages/asesorias/list-asesorias/ver-asesorias.component';
import { PerfilOrientadorComponent } from './pages/perfil-orientador/perfil-orientador.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RutaEmprendedorComponent } from '../emprendedor/pages/ruta-emprendedor/ruta-emprendedor.component';
import { CursoRutaEmprendedorComponent } from '../emprendedor/pages/curso-ruta-emprendedor/curso-ruta-emprendedor.component';

const routes: Routes = [
  {
    path:'',
    children:[
      { path: 'dashboard-orientador', component: DashboardComponent, data:{title: 'Dashboard', showInMenu: true, icon:'fa-solid fa-chart-pie'}},
      { path: 'list-asesorias-orientador', component: VerAsesoriasComponent, data:{title: 'Asesorias', showInMenu: true, icon:'fa-solid fa-users-gear'}},
      { path: 'reportes', component: ReportesComponent, data:{title: 'Reportes', showInMenu: true, icon:'fa-regular fa-file-lines'}}, 
      { path: 'ruta', component: RutaEmprendedorComponent, data:{title: 'Ruta General', showInMenu:true, icon:'fa-solid fa-code-fork'}},
      { path: 'curso-ruta-superadmin', component: CursoRutaEmprendedorComponent, data:{showInMenu: false}},
      { path: 'perfil-orientador', component: PerfilOrientadorComponent, data: { title: 'Perfil', showInMenu: true, icon:'fa-solid fa-circle-user'}},
    ]
  }
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild( routes )]
})
export class OrientadorRoutingModule {
  static getRoutes(): Routes{
    return routes;
  }
 }
