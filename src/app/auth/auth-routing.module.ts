import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForgotComponent } from './pages/forgot/forgot.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { VerificationComponent } from './pages/verification/verification.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';


const routes: Routes = [

  {
    path: '',
    children: [
      {path: 'forgot', component: ForgotComponent},
      {path: 'login', component: LoginComponent},
      {path: 'registro', component: RegistroComponent},
      {path: 'verification', component: VerificationComponent},
      {path: 'notFound', component: NotFoundComponent},
    ]
  }
];



@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild( routes )
  ]
})
export class AuthRoutingModule { }
