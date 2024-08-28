import { Component, OnInit } from '@angular/core';
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

  getItemClass(index: number): string {
    if (index === 0) return 'item-single';
    if ((index - 1) % 3 === 0) return 'item-mid';
    if ((index - 2) % 3 === 0) return 'item-mid';
    return 'item-single';
  }
  
  getOrder(index: number): number {
    return Math.floor(index / 3) * 3 + (index % 3);
  }

  getCircleColor(index: number): string {
    const colors = ['#1abc9c', '#3498db', '#9b59b6', '#e67e22', '#e74c3c', '#f39c12'];
    return colors[index % colors.length];
  }
}
