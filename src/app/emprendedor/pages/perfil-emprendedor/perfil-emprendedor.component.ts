import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { faLandmarkFlag } from '@fortawesome/free-solid-svg-icons';
import { faMountainCity } from '@fortawesome/free-solid-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faVenusMars } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../servicios/auth.service';
import { DepartamentoService } from '../../servicios/departamento.service';
import { EmprendedorService } from '../../servicios/emprendedor.service';
import { MunicipioService } from '../../servicios/municipio.service';
import { PerfilEmprendedor } from '../../Modelos/perfil-emprendedor.model';
import { User } from '../../Modelos/user.model';
import { AlertService } from '../../servicios/alert.service';


@Component({
  selector: 'app-perfil-emprendedor',
  templateUrl: './perfil-emprendedor.component.html',
  styleUrl: './perfil-emprendedor.component.css'
})
export class PerfilEmprendedorComponent implements OnInit {
  @Input() isEditing: boolean = false
  isActive: boolean = true;
  faVenusMars = faVenusMars;
  faMountainCity = faMountainCity;
  faLandmarkFlag = faLandmarkFlag;
  showPassword = faEye;
  faIdCard = faIdCard;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  hide = true;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  departamentoPredeterminado = '';
  submitted = false;
  errorMessage: string | null = null;
  email: string;
  token = '';
  blockedInputs = true; // Inicialmente bloqueados
  bloqueado = true;
  documento: string;
  user: User | null = null;
  currentRolId: number;
  emprendedorId: any;
  estado: boolean;
  isAuthenticated: boolean = true;




  emprendedorForm = this.fb.group({
    documento: '',
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    celular: ['', [Validators.required, Validators.maxLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    nombretipodoc: new FormControl({ value: '', disabled: true }, Validators.required), // Aquí se deshabilita el campo
    municipio: ['', Validators.required],
    estado: true,
  });
  registerForm: FormGroup; //ahorita quitarlo
  listEmprendedor: PerfilEmprendedor[] = [];
  originalData: any;
  perfil: '';
  boton: boolean;

  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private emprendedorService: EmprendedorService,
    private authServices: AuthService,
    private alerService: AlertService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.isAuthenticated = this.authServices.isAuthenticated();
    this.verEditar();
    this.cargarDepartamentos();
    this.isEditing = true;
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;

        if (this.currentRolId != 5) {
          this.router.navigate(['/inicio/body']);
        } else {
          this.documento = this.user.emprendedor.documento;
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['/inicio/body']);
    }
  }

  verEditar(): void {
    if (this.token) {
      this.emprendedorService.getInfoEmprendedor(this.token, this.documento).subscribe(
        (data) => {
          this.emprendedorForm.patchValue({
            documento: data.documento,
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular,
            email: data.email,
            password: data.password,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            nombretipodoc: data.id_tipo_documento ? data.id_tipo_documento.toString() : '',
            estado: data.estado
          });
          this.isActive = data.estado === 'Activo'; // Asegura que el estado booleano es correcto
          console.log("Estado inicial:", this.isActive); // Verifica el estado inicial en la consola
          console.log(data);

          // Forzar cambio de detección de Angular
          setTimeout(() => {
            this.emprendedorForm.get('estado')?.setValue(this.isActive);
          })

        },
        (err) => {
          console.log(err);
        }
      );
    }
  }


  updateEmprendedor(): void {
    const perfil: PerfilEmprendedor = {
      documento: this.emprendedorForm.get('documento')?.value,
      id_tipo_documento: this.emprendedorForm.get('nombretipodoc')?.value,
      nombre: this.emprendedorForm.get('nombre')?.value,
      apellido: this.emprendedorForm.get('apellido')?.value,
      celular: this.emprendedorForm.get('celular')?.value,
      email: this.emprendedorForm.get('email')?.value,
      password: this.emprendedorForm.get('password')?.value,
      genero: this.emprendedorForm.get('genero')?.value,
      fecha_nac: this.emprendedorForm.get('fecha_nac')?.value,
      direccion: this.emprendedorForm.get('direccion')?.value,
      id_municipio: this.emprendedorForm.get('municipio')?.value,
    }
    // let confirmationText = this.isActive
    //   ? "¿Estas seguro de guardar los cambios?"
    //   : "¿Estas seguro de guardar los cambios?";

    this.alerService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question',).then((result) => {
      if (result.isConfirmed) {
        this.emprendedorService.updateEmprendedor(perfil, this.token, this.documento).subscribe(
          (data) => {
            location.reload();
          },
          (err) => {
            console.log(err);
          }
        );
      }
    })
  }


  desactivarEmprendedor(): void {
    // let confirmationText = this.token
    //   ? "¿Estás seguro de desactivar tu cuenta?"
    //   : "¿Estás seguro de desactivar tu cuenta?";
    if (this.token) {
      this.alerService.DesactivarEmprendedor("¿Estás seguro de desactivar tu cuenta?",
      "¡Ten en cuenta que si desactivas tu cuenta tendras que validarte nuevamente por medio de tu correo electronico al momnento de iniciar sección!", 'warning').then((result) => {
        if (result.isConfirmed) {
          this.emprendedorService.destroy(this.token, this.documento).subscribe(
            (data) => {
              console.log("desactivar", data);
              this.isAuthenticated = false;
              localStorage.clear();
              location.reload();
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });
    }
  }




  // console.log("Texto de confirmación para desactivar:", confirmationText);

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

  get f() { return this.registerForm.controls; }


  //Funcion para cargar los departamentos
  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
      },
      (err) => {
        console.log(err);
      }
    )
  }

  //Funcion para traer el nombre del departamento seleccionado
  onDepartamentoSeleccionado(nombreDepartamento: string): void {
    this.cargarMunicipios(nombreDepartamento);
  }

  //Funcion para cargar los municipios
  cargarMunicipios(nombreDepartamento: string): void {
    this.municipioService.getMunicipios(nombreDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  //para que no me deje editar el nombre del tipo del documento
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'email', 'password', 'genero', 'fecha_nac', 'direccion', 'municipio'];
    fieldsToToggle.forEach(field => {
      const control = this.emprendedorForm.get(field);
      if (control && field !== 'nombretipodoc') {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }

  // Restaura los datos originales
  onCancel(): void {
    this.verEditar();
  }

  mostrarGuardarCambios(): void {
    this.boton = false;
  }



}
