import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../Modelos/user.model';
import { RutaService } from '../../../../servicios/rutas.service';

@Component({
  selector: 'app-list-actividades',
  templateUrl: './list-actividades.component.html',
  styleUrl: './list-actividades.component.css'
})
export class ListActividadesComponent {
  token: string | null = null;
  rutaId: number | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  listAcNiLeCo: [] = [];



  constructor(
    private route: ActivatedRoute,   
    private router: Router,
    private rutaService: RutaService, 
  ){ 
  }

  ngOnInit():void{
    this.validateToken();
    this.route.queryParams.subscribe(params => {
      this.rutaId = +params['id_ruta'];
      console.log('id ruta: ',this.rutaId);

    });

    this.ver();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');
      //console.log('currentrol',identityJSON);
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        //console.log('ererer',this.id)
        if (this.currentRolId != 1) {
          this.router.navigate(['/home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['/home']);
    }
  }

  ver():void{
    if (this.rutaId !== null) {
      this.rutaService.actnivleccontXruta(this.token,this.rutaId).subscribe(
      data => {
        this.listAcNiLeCo = data;
        console.log('Rutassssss:', this.listAcNiLeCo);
      },
      error => {
        console.log(error);
      }
    )
    }
  }















































}
