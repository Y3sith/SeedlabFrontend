import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CursorutasComponent } from './ruta/cursorutas/cursorutas.component';
import { BodyComponent } from './inicio/body/body.component';

const routes: Routes = [
  //Auth
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  //Aliados
  {
    path: 'aliados',
    loadChildren: () => import('./aliados/aliados.module').then(m => m.AliadosModule)
  },

  //Asesor
  {
    path: 'asesor',
    loadChildren: () => import('./asesor/asesor.module').then(m => m.AsesorModule)
  },

  //Emprendedor y empresa
  {
    path: 'emprendedor',
    loadChildren: () => import('./emprendedor/emprendedor.module').then(m => m.EmprendedorModule)
  },

  {
    path: 'orientador',
    loadChildren: () => import('./orientador/orientador.module').then(m => m.OrientadorModule)
  },

  {
    path:'superadmin',
    loadChildren: () => import('./superadmin/superadmin.module').then(m => m.SuperadminModule)
  },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: BodyComponent }, // Ruta raíz que muestra BodyComponent
  { path: 'curso', component: CursorutasComponent }, // Ruta raíz que muestra BodyComponent

  { path: '**', redirectTo: 'error404', pathMatch: 'full' } // Manejo de rutas no encontradas, redirige a la ruta Not found
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
