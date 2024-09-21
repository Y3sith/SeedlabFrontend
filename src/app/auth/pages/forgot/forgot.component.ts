import { Component } from '@angular/core';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { Router } from '@angular/router';

import { AlertService } from '../../../servicios/alert.service';
import { AuthService } from '../../../servicios/auth.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css',
  providers: [AuthService, AlertService]
})
export class ForgotComponent {

  passwordForm: FormGroup;

  
  constructor(
    private forgotPasswordService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService,
  ){
    this.passwordForm = this.fb.group({
      email:['']
    });
  
  }


  password():void{
    const email = this.passwordForm.get('email')?.value;
    this.forgotPasswordService.forgotPassword(email).subscribe(
      (response:any) => {
        this.alertService.successAlert('Éxito', response.message);
        this.router.navigate(['/login']);
      },
      error => {
        console.error(error);
        if (error.status === 400){
          this.alertService.errorAlert('Error', error.error.message);
        } else if (error.status === 404) {
          this.alertService.errorAlert('Error', error.error.message);
      }
      }
    )
  }
}
//this.router.navigate(['/login']);