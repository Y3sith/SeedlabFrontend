import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
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
  adminid: number;
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
  ////////
  selectedImagen_Perfil: File | null = null;
  perfilPreview: string | ArrayBuffer | null = null;
  isHidden = true;
  showEditButton = false;
  tiempoEspera = 1800;



  perfiladminForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: '',
    imagen_perfil: [null, Validators.required],
    celular: ['', Validators.required],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    id_municipio: ['', Validators.required],
    id_departamento: ['', Validators.required],
    id_tipo_documento: new FormControl({ value: '', disabled: false }, Validators.required),
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
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.cargarDepartamentos();
    this.initializeFormState();
  }

  /* Valida el token del login, se usa del localstorage el id del usuario logueado */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.adminid = this.user.id;
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
      this.superadminService.getInfoAdmin(this.token, this.adminid).subscribe(
        (data) => {
          this.perfiladminForm.patchValue({
            id_departamento: data.id_departamento
          })
          this.isActive = data.estado === 'Activo';

          if (data.id_departamento || data.id_tipo_documento) {
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
            id_tipo_documento: data.id_tipo_documento ? data.id_tipo_documento.toString() : '',
            id_departamento: data.id_departamento ? data.id_departamento.toString() : '',
            id_municipio: data.id_municipio.toString(),
            estado: data.estado

          });
          console.log('ver editar perfil', data);

        },
        (err) => {
          console.log(err);
        }
      )
    }
  }

  /* Actualiza los datos del super admin */
  updateAdministrador(): void {
    const formData = new FormData();
    let estadoValue: string;
  
    // First pass: handle special cases and avoid duplication
    Object.keys(this.perfiladminForm.controls).forEach((key) => {
      const control = this.perfiladminForm.get(key);
      if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
        if (key === 'password') {
          // Only include password if it's not empty
          if (control.value.trim() !== '') {
            formData.append(key, control.value);
          }
        } else if (key === 'fecha_nac') {
          const date = new Date(control.value);
          if (!isNaN(date.getTime())) {
            formData.append(key, date.toISOString().split('T')[0]);
          }
        } else if (key === 'estado') {
          formData.append(key, control.value ? '1' : '0');
        } else if (key !== 'imagen_perfil') {
          formData.append(key, control.value);
        }
      }
    });
  
    // Append specific fields (this will overwrite any duplicates from the first pass)
    const specificFields = ['nombre', 'apellido', 'documento', 'celular', 'genero', 'id_tipo_documento', 'id_departamento', 'id_municipio', 'email'];
    specificFields.forEach(field => {
      const value = this.perfiladminForm.get(field)?.value;
      if (value !== null && value !== undefined && value !== '') {
        formData.append(field, value);
      }
    });
  
   
    if (this.perfiladminForm.get('direccion')?.value) {
      formData.append('direccion', this.perfiladminForm.get('direccion')?.value);
    }
  
    if (this.selectedImagen_perfil) {
      formData.append('imagen_perfil', this.selectedImagen_perfil, this.selectedImagen_perfil.name);
    }
  
        //   this.orientadorService.updateOrientador(this.token, this.orientadorId, formData).subscribe(
        //     data => {
        //       console.log("personalizacion creada", data);
        //       location.reload();
        //     },
        //     error => {
        //       console.error("no funciona", error);
        //     }
        //   );
        // }

        this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
          if (result.isConfirmed) {
            this.superadminService.updateAdmin(this.token, this.adminid, formData).subscribe(
              (data) => {
                console.log('Response from server:', data);
                setTimeout(function () {
                  location.reload();
                }, this.tiempoEspera);
                this.alertService.successAlert('Exito', data.message);
              },
              (error) => {
                console.error('Error from server:', error);
                this.alertService.errorAlert('Error', error.error.message);
              }
            );
          }
        });
      }

          // this.superadminService.updateAdmin(this.token, this.adminid, formData).subscribe(
          //   data => {
          //     console.log("personalizacion creada", data);
          //     // console.log("Imagen en base64:", this.personalizacionForm.value.imagen_Logo);
          //     // alert("Imagen en base64:\n");

          //     location.reload();
          //   },
          //   error => {
          //     console.error("no funciona", error);
          //   }
          // );
        
    

    logFormErrors(): void {
      Object.keys(this.perfiladminForm.controls).forEach(key => {
        const controlErrors = this.perfiladminForm.get(key)?.errors;
        if (controlErrors) {
          console.error(`Error en el control ${key}:`, controlErrors);
        }
      });
    }
  //   const perfil: Superadmin = {
  //     nombre: this.perfiladminForm.get('nombre')?.value,
  //     apellido: this.perfiladminForm.get('apellido')?.value,
  //     documento: this.perfiladminForm.get('documento')?.value,
  //     celular: this.perfiladminForm.get('celular')?.value,
  //     genero: this.perfiladminForm.get('genero')?.value,
  //     direccion: this.perfiladminForm.get('direccion')?.value,
  //     id_tipo_documento: this.perfiladminForm.get('nombretipodoc')?.value,
  //     email: this.perfiladminForm.get('email')?.value,
  //     password: this.perfiladminForm.get('password')?.value,
  //     fecha_nac: this.perfiladminForm.get('fecha_nac')?.value,
  //     id_departamento: this.perfiladminForm.get('departamento')?.value,
  //     id_municipio: this.perfiladminForm.get('municipio')?.value,
  //   }
  //   this.superadminService.updateAdmin(this.token,perfil, this.id).subscribe(
  //     (data) => {
  //       location.reload();
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   )
  // }

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

  initializeFormState(): void {
    const fieldsToDisable = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    fieldsToDisable.forEach(field => {
      const control = this.perfiladminForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  /* Bloqueo de inputs */
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    
    fieldsToToggle.forEach(field => {
      const control = this.perfiladminForm.get(field);
      if (control) {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
        console.log(`Field ${field} is ${control.disabled ? 'disabled' : 'enabled'}`);
      } else {
        console.warn(`Control for field ${field} not found in form`);
      }
    });
  
    // Force change detection
    this.cdRef.detectChanges();
  
    // Log the entire form state
    console.log('Form state after toggling:', this.perfiladminForm);
  }

    /* Restaura los datos originales */
    onCancel(): void {
      location.reload();
    }
  
    /*muestra boton de guardar cambios*/ 
    mostrarGuardarCambios(): void {
      this.boton = false;
    }
  
    onEdit() {
      this.blockedInputs = false;
      this.showEditButton = true;
      this.toggleInputsLock();
    }

  //Funcion para cargar los departamentos
  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        console.log("DEPARTAMENTO",data);
        this.listDepartamentos = data;
        //this.cdRef.detectChanges(); // Forzar la detección de cambios
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

  cargarMunicipios(departamentoId: string): void {
    this.municipioService.getMunicipios(departamentoId).subscribe(
      (data) => {
        this.listMunicipios = data;
      console.log("MUNICIPIOS",data);
        // Establecer el municipio actual en el select después de cargar los municipios
        //const municipioId = this.emprendedorForm.get('id_municipio')?.value;
        // if (municipioId) {
        //   this.emprendedorForm.patchValue({ id_municipio: municipioId });
        // }
      },
      (err) => {
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
  
      if (field === 'imagen_perfil') {
        maxSize = 5 * 1024 * 1024; // 5MB para imágenes
      } 
  
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField(field);
  
        //Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input
  
        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.perfiladminForm.patchValue({ imagen_perfil: null });
          this.selectedImagen_perfil = null;
          this.perfilPreview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
    reader.onload = (e: any) => {
      const previewUrl = e.target.result;
      if (field === 'imagen_perfil') {
        this.perfiladminForm.patchValue({ imagen_perfil: previewUrl });
        this.perfilPreview = previewUrl;
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