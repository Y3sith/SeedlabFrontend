import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Superadmin } from '../../../Modelos/superadmin.model';
import { User } from '../../../Modelos/user.model';
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-perfil-superadmin',
  templateUrl: './perfil-superadmin.component.html',
  styleUrl: './perfil-superadmin.component.css'
})
export class PerfilSuperadminComponent {
  // iconos
  faEnvelope = faEnvelope;
  faMobileAlt = faMobileAlt;
  faUser = faUser;
  token = '';
  blockedInputs = true;
  user: User | null = null;
  currentRolId: number;
  id: number;
  boton: boolean;
  hide = true

  perfiladminForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    estado: true,
  });

  constructor(
    private superadminService: SuperadminService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
  }

  /* Valida el token del login, se usa del localstorage el id del usuario logueado */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
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

  /* Trae los datos del admin para poder editarlo en el input, de acuerdo al id del usuario logueado */
  verEditar(): void {
    if (this.token) {
      this.superadminService.getInfoAdmin(this.token, this.id).subscribe(
        (data) => {
          this.perfiladminForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: data.password
          });
          console.log(data);

        },
        (err) => {
          console.log(err);
        }
      )
    }
  }

  /* Actualiza los datos del super admin */
  updateAdministrador(): void {
    const perfil: Superadmin = {
      nombre: this.perfiladminForm.get('nombre')?.value,
      apellido: this.perfiladminForm.get('apellido')?.value,
      email: this.perfiladminForm.get('email')?.value, 
      password: this.perfiladminForm.get('password')?.value,
      estado: this.perfiladminForm.get('estado')?.value,
    }
    this.superadminService.updateAdmin(perfil, this.token, this.id).subscribe(
      (data) => {
        location.reload();
      },
      (err) => {
        console.log(err);
      }
    )
  }

  /* Validaciones la contraseña */
  passwordValidator(control: AbstractControl) {
    const value = control.value;
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    if (hasUpperCase && hasSpecialChar) {
      return null;
    } else {
      return { passwordStrength: 'La contraseña debe contener al menos una letra mayúscula y un carácter especial *' };
    }
  }

  /* Bloqueo de inputs */
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['nombre', 'apellido', 'email', 'password'];
    fieldsToToggle.forEach(field => {
      const control = this.perfiladminForm.get(field);
      if (this.blockedInputs) {
        control.disable();
      } else {
        control.enable();
      }
    })
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