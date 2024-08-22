import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';

import { AsesorService } from '../../../servicios/asesor.service';

import { Asesor } from '../../../Modelos/asesor.model';
import { User } from '../../../Modelos/user.model';

@Component({
  selector: 'app-perfil-asesor',
  templateUrl: './perfil-asesor.component.html',
  styleUrl: './perfil-asesor.component.css',
  providers: [AsesorService]
})
export class PerfilAsesorComponent implements OnInit {
  // iconoes
  faEnvelope = faEnvelope;
  faMobileAlt = faMobileAlt;
  faUser = faUser;

  token: string | null = null;
  blockedInputs = true;
  id: number | null = null;
  nombre: string | null = null;
  currentRolId: number;
  user: User
  boton: boolean;
  hide = true;
  bloqueado = true;

  asesorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    imagen_perfil: ['', Validators.required],
    genero: ['',Validators.required],
    direccion: ['',Validators.required],
    celular: ['', [Validators.required, Validators.maxLength(10)]],
    aliado: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    estado: true,
  });

  constructor(private fb: FormBuilder,
    private router: Router,
    private asesorService: AsesorService) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /* Trae los datos del asesor para poder editarlo en el input, de acuerdo al id del usuario logueado */
  verEditar(): void {
    this.asesorService.getAsesorID(this.token, this.id).subscribe(
      data => {
        this.asesorForm.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          imagen_perfil: data.imagen_perfil,
          genero: data.genero,
          direccion: data.direccion,
          celular: data.celular,
          email: data.email,
        });
      },
      error => {
        console.log(error);
      }
    )
  }

  /* Actualiza los datos del asesor */
  editAsesor(): void {
    const asesor: Asesor = {
      nombre: this.asesorForm.get('nombre')?.value,
      apellido: this.asesorForm.get('apellido')?.value,
      imagen_perfil: this.asesorForm.get('')?.value,
      genero: this.asesorForm.get('genero')?.value,
      direccion: this.asesorForm.get('direccion')?.value,
      celular: this.asesorForm.get('celular')?.value,
      aliado: this.asesorForm.get('aliado')?.value,
      email: this.asesorForm.get('email')?.value,
      password: this.asesorForm.get('password')?.value,
      estado: this.asesorForm.get('estado')?.value,
    };
    this.asesorService.updateAsesor(this.token, this.id, asesor).subscribe(
      data => {
        location.reload();
      },
      error => {
        console.error(error);
      }
    )
  }

  /* Bloqueo de inputs */
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['nombre', 'apellido', 'celular'];
    fieldsToToggle.forEach(field => {
      const control = this.asesorForm.get(field);
      if (this.blockedInputs) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }

 /* Restaura los datos originales */
  onCancel(): void {
    this.verEditar();
  }

  /* Muesta el boton de guardar cambios */
  mostrarGuardarCambios(): void {
    this.boton = false;
  }
}
