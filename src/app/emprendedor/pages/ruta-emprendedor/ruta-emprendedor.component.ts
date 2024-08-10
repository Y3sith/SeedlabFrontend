import { Component, OnInit } from '@angular/core';
import { RutaService } from '../../../servicios/rutas.service';
import { Router } from '@angular/router';
import { Ruta } from '../../../Modelos/ruta.modelo';

@Component({
  selector: 'app-ruta-emprendedor',
  templateUrl: './ruta-emprendedor.component.html',
  styleUrl: './ruta-emprendedor.component.css'
})
export class RutaEmprendedorComponent implements OnInit {
  token: string | null = null;
  documento: string | null;
  user: any = null;
  currentRolId: number;
  idRuta: number | null; 
  rutaContenidoList: Ruta []=[];
  rutaList: Ruta []=[];
/////////
  

  constructor(
    private rutaService: RutaService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.validateToken();
    this.listarRuta();
    //this.contenidoDeRuta();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        console.log (this.currentRolId);

        if (this.currentRolId != 5) {
          this.router.navigate(['home']);
        } else {
          this.documento = this.user.emprendedor.documento;
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  listarRuta():void{
    // if (this.token) {
      this.rutaService.rutasActivas(this.token).subscribe(
        data =>{
          this.rutaList = data;
          console.log('Rutas:', this.rutaList);
        },
        err => {
          console.log(err);
        }
      )
    // }
  }

  
  
}
