import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../Modelos/user.model';
import { RutaService } from '../../../../servicios/rutas.service';
import { FormBuilder } from '@angular/forms';
import { ActividadService } from '../../../../servicios/actividad.service';

@Component({
  selector: 'app-list-actividades',
  templateUrl: './list-actividades.component.html',
  styleUrl: './list-actividades.component.css',
})
export class ListActividadesComponent {
  userFilter: any = { nombre: '' };
  token: string | null = null;
  rutaId: number | null = null;
  ActividadId: any;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  listAcNiLeCo: [] = [];

  actividadForm = this.fb.group({
    estado: [],
  })

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private rutaService: RutaService,
    private actividadService: ActividadService,
  ) {}

  ngOnInit(): void {
    this.validateToken();
    this.route.queryParams.subscribe((params) => {
      this.rutaId = +params['id_ruta'];
      console.log('id ruta: ', this.rutaId);
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

  ver(): void {
    if (this.rutaId !== null) {
      this.rutaService.actnivleccontXruta(this.token, this.rutaId).subscribe(
        (data) => {
          this.listAcNiLeCo = data;
          console.log('Rutassssss:', this.listAcNiLeCo);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  toggleEstado(actividad: any): void {
    const nuevoEstado = !actividad.estado  ? 0 : 1; // Cambia el estado actual
    // Actualizar el estado en el backend
    this.actividadService.updateActividad(actividad.id, nuevoEstado, this.token).subscribe(
      (response) => {
        actividad.estado = nuevoEstado; // Actualizar el estado localmente si la petición es exitosa
        console.log('Estado actualizado', response);
      },
      (error) => {
        console.log('Error al actualizar el estado', error);
      }
    );
  }



  EditarActividad(ActividadId: number): void {
    this.router.navigate(['editar-act-ruta'], { queryParams: { id_actividad: ActividadId } });
  }
  
}
