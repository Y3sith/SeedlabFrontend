import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ruta-aliado',
  templateUrl: './ruta-aliado.component.html',
  styleUrl: './ruta-aliado.component.css'
})
export class RutaAliadoComponent {
  token: string | null = null;
  currentRolId: number;
  user: User | null = null;










  ////añadir actividad
  actividadForm = this.fb.group({
    id: [],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fuente: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_asesor: [''],
    id_ruta: ['', Validators.required],
    id_aliado: ['', Validators.required]
  })
  ////anadir nivel

  nivelForm = this.fb.group({
    id_nivel: [],
    nombre: [{ value: '', disabled: true }, Validators.required],
    id_actividad: [{ value: '', disabled: true }, Validators.required]
  })

  ///// añadir leccion
  leccionForm = this.fb.group({
    id_leccion: [''],
    nombre: [{ value: '', disabled: true }, Validators.required],
    id_nivel: [{ value: '', disabled: true }, Validators.required]
  })

  ///añadir contenido por leccion
  contenidoLeccionForm = this.fb.group({
    id_contenido: [''],
    titulo: [{ value: '', disabled: true }, Validators.required],
    descripcion: [{ value: '', disabled: true }, Validators.required],
    fuente_contenido: [{ value: '', disabled: true }, Validators.required],
    id_tipo_dato: [{ value: '', disabled: true }, Validators.required],
    id_leccion: [{ value: '', disabled: true }, Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private router: Router,

  ){}


  ngOnInit(){
    this.validateToken();
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
}
