import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Superadmin } from '../../../Modelos/superadmin.model';
import { User } from '../../../Modelos/user.model';
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { AuthService } from '../../../servicios/auth.service';


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
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  imagenPreview: string | ArrayBuffer | null = null;
  selectedImagen_perfil: File | null = null;
  submitted = false;
  bloqueado = true;
  errorMessage: string | null = null;
  listTipoDocumento: any[] = [];
  isActive: boolean = true;
  estado: boolean;

  perfiladminForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento:'',
    imagen_perfil: [null, Validators.required],
    celular:['', Validators.required],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion:['', Validators.required],
    municipio: ['', Validators.required],
    departamento: ['', Validators.required],
    nombretipodoc: new FormControl({ value: '', disabled: false }, Validators.required),
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    estado: true,
  });

  constructor(
    private superadminService: SuperadminService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService:AuthService,
    private cdRef: ChangeDetectorRef,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.cargarDepartamentos();
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
            departamento: data.id_departamento
          })
          this.isActive = data.estado === 'Activo';

          if(data.id_departamento || data.id_tipo_documento){
            this.cargarMunicipios(data.id_departamento);
            this.tipoDocumento();
          }
          this.perfiladminForm.patchValue({
            documento: data.documento,
            nombre: data.nombre,
            apellido: data.apellido,
            imagen_perfil: data.imagen_perfil,
            celular: data.celular,
            email: data.email,
            password: data.password,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            nombretipodoc: data.id_tipo_documento ? data.id_tipo_documento.toString() : '',
            departamento: data.id_departamento? data.id_departamento.toString() : '',
            municipio: data.id_municipio.toString(),
            estado: data.estado
            
          });
          console.log('ver editar perfil',data);

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
      documento: this.perfiladminForm.get('documento')?.value,
      celular: this.perfiladminForm.get('celular')?.value,
      genero: this.perfiladminForm.get('genero')?.value,
      direccion: this.perfiladminForm.get('direccion')?.value,
      id_tipo_documento: this.perfiladminForm.get('nombretipodoc')?.value,
      email: this.perfiladminForm.get('email')?.value,
      password: this.perfiladminForm.get('password')?.value,
      fecha_nac: this.perfiladminForm.get('fecha_nac')?.value,
      id_departamento: this.perfiladminForm.get('departamento')?.value,
      id_municipio: this.perfiladminForm.get('municipio')?.value,
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

  get f() {
    return this.perfiladminForm.controls;
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

  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast a HTMLSelectElement
    const selectedDepartamento = target.value;

    // Guarda el departamento seleccionado en el localStorage
    localStorage.setItem('departamento', selectedDepartamento);

    // Llama a cargarMunicipios si es necesario
    this.cargarMunicipios(selectedDepartamento);
  }

  cargarMunicipios(idDepartamento: string): void {
    this.municipioService.getMunicipios(idDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
        //console.log('Municipios cargados:', JSON.stringify(data));
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.perfiladminForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.imagenPreview = null;
    }
  }

  onFileSelecteds(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      let maxSize = 0;

      if (field === 'urlImagen' || field === 'logo' || field === 'ruta_multi') {
        maxSize = 5 * 1024 * 1024; // 5MB para imágenes
      } else if (field === 'ruta_documento') {
        maxSize = 18 * 1024 * 1024; // 20MB para documentos
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField(field);

        ////Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input

        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.perfiladminForm.patchValue({ imagen_perfil: null });
          this.selectedImagen_perfil = null;
          this.imagenPreview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.perfiladminForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.perfiladminForm.patchValue({ imagen_perfil: file });
      }

    } else {
      this.resetFileField(field);
    }
  }

  generateImagePreview(file: File, field: string) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'imagen_perfil') {
        this.imagenPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  tipoDocumento(): void {
    this.authService.tipoDocumento().subscribe(
      data => {
        this.listTipoDocumento = data;

        console.log('tipos de documentos', this.listTipoDocumento);
        //console.log('datos tipo de documento: ',data)
      },
      error => {
        console.log(error);
      }
    )
  }
}