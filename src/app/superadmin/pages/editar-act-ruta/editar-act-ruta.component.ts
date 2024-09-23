import { Component } from '@angular/core';
import { User } from '../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { RutaService } from '../../../servicios/rutas.service';
import { FormBuilder } from '@angular/forms';
import { ActividadService } from '../../../servicios/actividad.service';
import { Actividad } from '../../../Modelos/actividad.model';

@Component({
  selector: 'app-editar-act-ruta',
  templateUrl: './editar-act-ruta.component.html',
  styleUrl: './editar-act-ruta.component.css'
})
export class EditarActRutaComponent {
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  ActividadId: number | null = null;
  actividadId: any;
  nivelId:any;


  ////
  listRutaActNivLec: Actividad[] = [];

  actividadSeleccionada: any | null;
  rutaSeleccionada: any | null;
  nivelSeleccionada: any | null;
  leccionSeleccionada: any | null;
  contenidoLeccionSeleccionada: any | null;
  ////
  actividadForm = this.fb.group({
    id:[null],
    nombre: [''],
    descripcion: [''],
    ruta_multi: [''],
    id_tipo_dato: [''],
    id_asesor: [''],
    id_aliado: ['']
  })

  

  nivelForm = this.fb.group({
    id:[null],
    nombre: [''],
    descripcion: ['']
  });

  leccionForm = this.fb.group({
    nombre: ['']
  });

  contenidoLeccionForm = this.fb.group({
    titulo: [''],
    descripcion: [''],
    fuente: [''],
    id_tipo_dato: ['']
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rutaService: RutaService,
    private fb: FormBuilder,
    private actividadService: ActividadService,
  ) {


  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.ActividadId = +params['id_actividad'];
    });
    this.validateToken();
    this.verEditar();
    
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 1) {
          this.router.navigate(['/home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['/home']);
    }
  }

  verEditar(): void {
    if (this.ActividadId !== null) {
      this.actividadService.ActiNivelLeccionContenido(this.token, this.ActividadId).subscribe(
      (data) => {
        this.listRutaActNivLec = data
      },
      (error) => {
        console.log(error);
      }
    )
    }
  }

  selectRuta(ruta: any): void {
    this.rutaSeleccionada = ruta;
  }
  
  actividadSelect(actividad: any): void {
    this.actividadSeleccionada = actividad;
    this.nivelSeleccionada = null;
    this.leccionSeleccionada = null;
    this.contenidoLeccionSeleccionada = null;
    this.actividadForm.patchValue(actividad);
    this.actividadId = this.actividadForm.value.id;
  }

  nivelSelect(nivel: any): void {
    this.nivelSeleccionada = nivel;
    this.leccionSeleccionada = null;
    this.contenidoLeccionSeleccionada = null;
    this.nivelForm.patchValue(nivel);
    this.nivelId = this.nivelForm.value.id;
  }

  leccionSelect(leccion: any): void {
    this.leccionSeleccionada = leccion;
    this.contenidoLeccionSeleccionada = null;
    this.leccionForm.patchValue(leccion);
  }

  contenidoLeccionSelect(contenido: any): void {
    this.contenidoLeccionSeleccionada = contenido;
    this.contenidoLeccionForm.patchValue(contenido);
  }

  updateNivel(): void {
    const nivelData = this.nivelForm;
    this.rutaService.updateNivel(this.token,this.nivelId,nivelData).subscribe(
      (error) => {
        console.log('Error al actualizar', error);
      }
    )
  }

  updateLeccion(): void {
    const leccionData = this.leccionForm;
    this.rutaService.updateLeccion(this.token).subscribe(
      (error) => {
        console.log('Error al actualizar', error);
      }
    )
  }

  updateContenidoLeccion(): void {
    const contenidoData = this.contenidoLeccionForm;
    this.rutaService.updateContenidoLecciones(this.token).subscribe(
      (error) => {
        console.log('Error al actualizar', error);
      }
    )
  }
}
