import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '../../../servicios/alert.service';
import { AuthService } from '../../../servicios/auth.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css',
  providers: [AuthService, AlertService],
})
export class VerificationComponent implements OnInit {
  email: string;
  codigoVerificacion: string = '';

  @ViewChild('txt1') txt1!: ElementRef<HTMLInputElement>;
  @ViewChild('txt2') txt2!: ElementRef<HTMLInputElement>;
  @ViewChild('txt3') txt3!: ElementRef<HTMLInputElement>;
  @ViewChild('txt4') txt4!: ElementRef<HTMLInputElement>;
  @ViewChild('txt5') txt5!: ElementRef<HTMLInputElement>;


constructor(private router:Router,
  private authService:AuthService,
  private route: ActivatedRoute,
  private alertService:AlertService
){}

  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      if ('email' in params) {
        this.email = params['email'];
      } else {
        console.log('No se encontró el parámetro "email" en la URL');
      }
    });          

}

ngAfterViewInit(): void {
  this.txt1.nativeElement.addEventListener('input', () => this.actualizarCodigo());
  this.txt2.nativeElement.addEventListener('input', () => this.actualizarCodigo());
  this.txt3.nativeElement.addEventListener('input', () => this.actualizarCodigo());
  this.txt4.nativeElement.addEventListener('input', () => this.actualizarCodigo());
  this.txt5.nativeElement.addEventListener('input', () => this.actualizarCodigo());
}

actualizarCodigo(){
  this.codigoVerificacion = this.txt1.nativeElement.value + this.txt2.nativeElement.value + this.txt3.nativeElement.value + this.txt4.nativeElement.value + this.txt5.nativeElement.value;
}


verificarEmail():void{
  this.authService.verificarEmail(this.email, this.codigoVerificacion).subscribe(
    data => {
      this.router.navigate(['/login']);
      this.alertService.successAlert('Exito',data.message);
    },
    err => {
      console.log('Error al verificar el correo electrónico:',err);
      if(err.status === 400){
        this.alertService.errorAlert('Error', 'Tu codigo es incorrecto, intenta nuevamente');
      }else if(err.status === 409){
        this.alertService.errorAlert('Error',err.message);
      }
      this.router.navigate(['/verification']);
    }
  );
}







move(e:any, p:any, c:any, n:any){
  var length= c.value.length;
  var maxlength= c.getAttribute('maxlength');
    if(length == maxlength){
      if(n !=""){
        n.focus();
      }  
    }
    if(e.key === "Backspace"){
      if(p != ""){
        p.focus();
      }
    }
  }
}
