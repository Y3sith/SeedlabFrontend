import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { OrientadorService } from '../../../servicios/orientador.service';
import { Orientador } from '../../../Modelos/orientador.model';
import { User } from '../../../Modelos/user.model';
// iconos
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-perfil-orientador',
  templateUrl: './perfil-orientador.component.html',
  styleUrl: './perfil-orientador.component.css'
})
export class PerfilOrientadorComponent {

  // iconos
  faEnvelope = faEnvelope;
  faMobileAlt = faMobileAlt;
  faUser = faUser;


  user: User | null = null;
  token = '';
  currentRolId: number;
  id: number;
  blockedInputs = true;
  boton: boolean
  hide = true;
  bloqueado = true;


  perfilorientadorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    celular: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    documento:'',
    imagen_perfil: [null, Validators.required],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion:['', Validators.required],
    nombretipodoc: new FormControl({ value: '', disabled: true }, Validators.required),
    estado: [true]
  });

  constructor(
    private orientadorService: OrientadorService,
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService
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
        if (this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /* Trae los datos del orientador para poder editarlo en le input, de acuerdo al id del usuario logueado */
  verEditar(): void {
    if (this.token) {
      this.orientadorService.getinformacionOrientador(this.token, this.id).subscribe(
        (data) => {
          this.perfilorientadorForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular,
            email: data.email,
            password: data.password,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            nombretipodoc: data.id_tipo_documento ? data.id_tipo_documento.toString() : '',
            imagen_perfil: data.imagen_perfil,
            documento: data.documento,
            estado: data.estado
          });
        },
        (err) => {
          console.log(err);
        }
      )
    }
  }

  /* Actualiza la informacion del orientador */
  updateOrientador(): void {
    const perfil: Orientador = {
      nombre: this.perfilorientadorForm.get('nombre')?.value,
      apellido: this.perfilorientadorForm.get('apellido')?.value,
      celular: this.perfilorientadorForm.get('celular')?.value,
      email: this.perfilorientadorForm.get('email')?.value,
      password: this.perfilorientadorForm.get('password')?.value,
      documento: this.perfilorientadorForm.get('documento')?.value,
      genero: this.perfilorientadorForm.get('genero')?.value,
      fecha_nac: this.perfilorientadorForm.get('fecha_nac')?.value,
      direccion: this.perfilorientadorForm.get('direccion')?.value,
      id_tipo_documento: this.perfilorientadorForm.get('nombretipodoc')?.value,
      id_municipio: this.perfilorientadorForm.get('municipio')?.value,

    }
    this.orientadorService.updateOrientador(this.token, this.id, perfil).subscribe(
      (data) => {
        location.reload();
      },
      error => { 
        console.error(error);
        if (error.status === 402) {
          this.alertService.errorAlert('Error',error.error.message);
        }
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
    const fieldsToToggle = ['nombre', 'apellido', 'celular', 'email', 'email', 'password'];
    fieldsToToggle.forEach(field => {
      const control = this.perfilorientadorForm.get(field);
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
