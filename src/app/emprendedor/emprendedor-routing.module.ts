import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilEmprendedorComponent } from './pages/perfil-emprendedor/perfil-emprendedor.component';
import { ListAsesoriaEmprendedorComponent } from './pages/asesorias/list-asesoria/list-asesoria-emprendedor.component';
import { AddEmpresaComponent } from './pages/empresa/add-empresa/add-empresa.component';
import { ListEmpresasComponent } from './pages/empresa/list-empresas/list-empresas.component';
import { EncuestaEmpresaComponent } from './pages/formulario-diagnostico/encuesta-empresa.component';
import { EditEmpresaComponent } from './pages/empresa/edit-empresa/edit-empresa.component';
import { CursorutasComponent } from '../ruta/cursorutas/cursorutas.component';
import { RutaEmprendedorComponent } from './pages/ruta-emprendedor/ruta-emprendedor.component';
import { ModalActividadComponent } from './pages/modal-actividad/modal-actividad.component';
import { ReportesComponent } from './pages/reportes/reportes.component';

const routes: Routes = [

  {
    path: '',
    children: [
      {path: 'list-asesoria', component: ListAsesoriaEmprendedorComponent, data: {title: 'Asesorias', showInMenu:true, icon:'fa-solid fa-comments', isLeft:true}},
      {path: 'encuesta/:id', component: EncuestaEmpresaComponent, data:{title: 'Encuesta', showInMenu:false, icon:'fa-solid fa-square-poll-vertical'}},
      {path: 'list-empresa', component: ListEmpresasComponent, data:{title: 'Empresa', showInMenu:true, icon:'fa-solid fa-building'}},
      {path: 'ruta', component: RutaEmprendedorComponent, data:{title: 'Ruta', showInMenu:true, icon:'fa-solid fa-location-arrow'}},
      {path: 'modal', component: ModalActividadComponent, data:{title: 'modal', showInMenu:false, icon:'fa-solid fa-location-arrow'}}, //Agregado para ver la modal por la ruta
      {path: 'reportes-emprendedor', component: ReportesComponent, data:{title: 'Ruta', showInMenu:true, icon:'fa-regular fa-file-lines'}},
      {path: 'perfil-emprendedor', component: PerfilEmprendedorComponent, data:{title: 'Perfil', showInMenu:true, icon:'fa-solid fa-circle-user'}},
      {path: 'add-empresa', component: AddEmpresaComponent, data:{showInMenu: false}},
      {path: 'edit-empresa/:id_emprendedor/:documento', component:EditEmpresaComponent, data:{showInMenu: false}},

    ]
  }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild( routes )
  ]
})
export class EmprendedorRoutingModule {
  static getRoutes(): Routes{
    return routes;
  }
 }
