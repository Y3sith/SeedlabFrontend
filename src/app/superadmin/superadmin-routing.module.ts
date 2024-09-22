import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListSuperadminComponent } from './pages/list-superadmin/list-superadmin.component';
import { PerfilSuperadminComponent } from './pages/perfil-superadmin/perfil-superadmin.component';
import { PersonalizacionesComponent } from './pages/personalizaciones/personalizaciones.component';
import { ListRutasComponent } from './pages/ruta/list-ruta/list-rutas.component';
import { ListOrientadorComponent } from './pages/orientador/list-orientador/list-orientador.component';
import { ListAliadosComponent } from './pages/aliados/list-aliados/list-aliados.component';
import { AddAliadosComponent } from './pages/aliados/add-aliados/add-aliados.component';
import { ActnivlecComponent } from './pages/ruta/actnivlec/actnivlec.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EditarActRutaComponent } from './pages/editar-act-ruta/editar-act-ruta.component';
import { ReportesAdmComponent } from './pages/reportes-adm/reportes-adm.component';
import { ModalCrearOrientadorComponent } from './pages/orientador/add-orientador/modal-crear-orientador.component';
import { ModalCrearSuperadminComponent } from './pages/add-superadmin/modal-crear-superadmin.component';
import { ListActividadesComponent } from './pages/ruta/list-actividades/list-actividades.component';
import { RutaEmprendedorComponent } from '../emprendedor/pages/ruta-emprendedor/ruta-emprendedor.component';
import { CursoRutaEmprendedorComponent } from '../emprendedor/pages/curso-ruta-emprendedor/curso-ruta-emprendedor.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard-superadmin', component: DashboardComponent, data: { title: 'Dashboard', icon: 'fa-solid fa-chart-pie', showInMenu: true } },
      { path: 'list-orientador', component: ListOrientadorComponent, data: { title: 'Orientador', icon: 'fa-solid fa-chalkboard-user', showInMenu: true } },
      { path: 'list-aliados', component: ListAliadosComponent, data: { title: 'Aliados', icon: 'fa-solid fa-users-line', showInMenu: true } },
      { path: 'list-superadmin', component: ListSuperadminComponent, data: { title: 'Super Admin', icon: 'fa-solid fa-user', showInMenu: true } },
      { path: 'list-ruta', component: ListRutasComponent, data: { title: 'Rutas', icon: 'fa-solid fa-location-arrow', showInMenu: true } },
      { path: 'personalizaciones', component: PersonalizacionesComponent, data: { title: 'Personalización Sistema', icon: 'fa-solid fa-paintbrush', showInMenu: true } },
      { path: 'perfil-admin', component: PerfilSuperadminComponent, data: { title: 'Perfil', icon: 'fa-solid fa-circle-user', showInMenu: true } },
      { path: 'add-aliados', component: AddAliadosComponent, data: { showInMenu: false } },
      { path: 'add-orientador', component: ModalCrearOrientadorComponent, data:{  showInMenu: false } },
      { path: 'edit-orientador/:id', component: ModalCrearOrientadorComponent, data:{  showInMenu: false } },
      { path: 'add-superAdmin', component: ModalCrearSuperadminComponent, data:{  showInMenu: false } },
      { path: 'edit-superAdmin/:id', component: ModalCrearSuperadminComponent, data:{  showInMenu: false } },
      { path: 'edit-aliados/:id', component: AddAliadosComponent, data: { showInMenu: false } },
      { path: 'actnivlec', component: ActnivlecComponent, data: { title: 'Act-Niv-Lec', showInMenu: false } },
      { path: 'editar-act-ruta',component: EditarActRutaComponent,data:{title : 'Editar-Act-Ruta',showInMenu: false}},
      { path: 'list-actividades', component: ListActividadesComponent, data: {title: 'Actividades', showInMenu: false}},
      { path: 'ruta', component: RutaEmprendedorComponent, data:{title: 'Ruta General', showInMenu:true, icon:'fa-solid fa-code-fork'}},
      { path: 'curso-ruta-superadmin', component: CursoRutaEmprendedorComponent, data:{showInMenu: false}},

      /////
      { path: 'reportes-admin',component: ReportesAdmComponent,data:{title : 'Reportes-Admin',icon:'fa-regular fa-file-lines', showInMenu: true}},
      ////
      
    ]
  }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class SuperadminRoutingModule {
  static getRoutes(): Routes {
    return routes;
  }
}
