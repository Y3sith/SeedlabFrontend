import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { RutaService } from '../../../servicios/rutas.service';
import { Router } from '@angular/router';
import { Ruta } from '../../../Modelos/ruta.modelo';



@Component({
  selector: 'app-ruta-emprendedor',
  templateUrl: './ruta-emprendedor.component.html',
  styleUrls: ['./ruta-emprendedor.component.css']
})
export class RutaEmprendedorComponent implements OnInit {
  token: string | null = null;
  documento: string | null;
  user: any = null;
  currentRolId: number;
  idRuta: number | null; 
  rutaList: Ruta[] = [];

  constructor(
    private rutaService: RutaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.validateToken();
    this.listarRuta();
  }

  validateToken(): void {
    this.token = localStorage.getItem("token");
    let identityJSON = localStorage.getItem('identity');

    if (identityJSON) {
      let identity = JSON.parse(identityJSON);
      this.user = identity;
      this.currentRolId = this.user.id_rol;

      if (this.currentRolId != 5) {
        this.router.navigate(['home']);
      } else {
        this.documento = this.user.emprendedor.documento;
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  listarRuta(): void {
    if (this.token) {
      console.log('Solicitando rutas activas...');
      this.rutaService.rutasActivas(this.token).subscribe(
        data => {
          this.rutaList = data;
          console.log('Rutas recibidas:', this.rutaList);
          console.log('Número de rutas:', this.rutaList.length);
          if (this.rutaList.length > 0) {
            console.log('Primera ruta:', this.rutaList[0]);
          }
        },
        err => {
          console.error('Error al obtener rutas:', err);
        }
      );
    } else {
      console.log('No hay token disponible');
    }
  }
}  