import { Component } from '@angular/core';
import { User } from '../../Modelos/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes-adm',
  templateUrl: './reportes-adm.component.html',
  styleUrl: './reportes-adm.component.css'
})
export class ReportesAdmComponent {
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;




  constructor(
    private router: Router,
  ){}


  ngOnInit(): void {
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  emprendedoresPorMunicipioPDF():void{
    
  }
}
