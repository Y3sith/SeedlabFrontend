import { Component, ChangeDetectorRef, } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { OrientadorService } from '../../../servicios/orientador.service';
import { Orientador } from '../../../Modelos/orientador.model';
import { User } from '../../../Modelos/user.model';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../servicios/auth.service';
@Component({
  selector: 'app-perfil-orientador',
  templateUrl: './perfil-orientador.component.html',
  styleUrl: './perfil-orientador.component.css'
})


export class PerfilOrientadorComponent {
  isActive: boolean = true;
  faEnvelope = faEnvelope;
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
  imagenPreview: string | ArrayBuffer | null = null;
  selectedImagen_perfil: File | null = null;
  listTipoDocumento: any[] = [];
  registerForm: FormGroup;  
  listOrientador: Orientador[] = [];
  originalData: any;
  perfil: '';
  boton: boolean;
  id: number;
  selectedImagen: File | null = null;
  orientadorId : number = 1;




  perfilorientadorForm = this.fb.group({
    documento: ['', Validators.required],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    celular: ['', [Validators.required, Validators.maxLength(10)]],
    imagen_perfil: [null ,Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    id_departamento: ['', Validators.required],
    id_municipio: ['', Validators.required],
    id_tipo_documento: ['', Validators.required],
    estado: true,
  });

  constructor(
    private orientadorService: OrientadorService,
    private router: Router,
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private municipioService: MunicipioService,
    private authServices: AuthService

  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.isAuthenticated = this.authServices.isAuthenticated();
    this.cargarDepartamentos(); 
    this.verEditar(); 
    this.tipodato();

    // this.isEditing = true;
  }

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


  verEditar(): void {
    if (this.token) {
      this.orientadorService.getinformacionOrientador(this.token, this.id).subscribe(
        (data) => {
          this.perfilorientadorForm.patchValue({
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
            id_departamento: data.id_departamento,
            id_municipio: data.id_municipio,
            estado: data.estado,
            id_tipo_documento: data.id_tipo_documento,

          });
          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.perfilorientadorForm.get('estado')?.setValue(this.isActive);
          });

          // Cargar los departamentos y municipios
          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.perfilorientadorForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.perfilorientadorForm.patchValue({ id_municipio: data.id_municipio });
            }, 500);
          }, 500);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  tipoDocumento(): void {
    this.authServices.tipoDocumento().subscribe(
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
  
  updateOrientador(): void {
    const formData = new FormData();
    let estadoValue: string;
    if (this.orientadorId == null) {
      estadoValue = '1';
    } else {
    }

          formData.append('nombre', this.perfilorientadorForm.get('nombre')?.value);
          formData.append('apellido', this.perfilorientadorForm.get('apellido')?.value);
          formData.append('documento', this.perfilorientadorForm.get('documento')?.value);
          formData.append('celular', this.perfilorientadorForm.get('celular')?.value);
          formData.append('email', this.perfilorientadorForm.get('email')?.value);
          formData.append('password', this.perfilorientadorForm.get('password')?.value);
          formData.append('genero', this.perfilorientadorForm.get('genero')?.value);
          formData.append('fecha_nac', this.perfilorientadorForm.get('fecha_nac')?.value);
          formData.append('direccion', this.perfilorientadorForm.get('direccion')?.value);
          formData.append('id_tipo_documento', this.perfilorientadorForm.get('id_tipo_documento')?.value);
          formData.append('id_municipio', this.perfilorientadorForm.get('id_municipio')?.value);
          formData.append('id_departamento', this.perfilorientadorForm.get('id_departamento')?.value);
          formData.append('estado', this.perfilorientadorForm.get('estado')?.value.toString());
        
          Object.keys(this.perfilorientadorForm.controls).forEach(key => {
            const control = this.perfilorientadorForm.get(key);
      
            if (control?.value !== null && control?.value !== undefined) {
              if (key === 'fecha_nac') {
                if (control.value) {
                  const date = new Date(control.value);
                  if (!isNaN(date.getTime())) {
                    formData.append(key, date.toISOString().split('T')[0]);
                  }
                }
              }
              else if (key === 'estado') {
                // Convertir el valor booleano a 1 o 0
                formData.append(key, control.value ? '1' : '0');
              } else if (key !== 'imagen_perfil') {
                formData.append(key, control.value);
              }
            }
          });

          // Si el campo imagen_perfil tiene un archivo seleccionado, lo añadimos
          if (this.selectedImagen) {
            formData.append('imagen_logo', this.selectedImagen, this.selectedImagen.name);
          }
  
  
          console.log("Datos a enviar:");
  
          this.orientadorService.updateOrientador(this.token, this.orientadorId, formData).subscribe(
            data => {
              console.log("personalizacion creada", data);
              // console.log("Imagen en base64:", this.personalizacionForm.value.imagen_Logo);
              // alert("Imagen en base64:\n");
  
              location.reload();
            },
            error => {
              console.error("no funciona", error);
            }
          );
        }
  

    logFormErrors(): void {
      Object.keys(this.perfilorientadorForm.controls).forEach(key => {
        const controlErrors = this.perfilorientadorForm.get(key)?.errors;
        if (controlErrors) {
          console.error(`Error en el control ${key}:`, controlErrors);
        }
      });
    }
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

  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'email', 'password', 'genero', 'fecha_nac', 'direccion', 'municipio'];
    fieldsToToggle.forEach(field => {
      const control = this.perfilorientadorForm.get(field);
      if (control && field !== 'nombretipodoc') {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }

   //Funcion para cargar los departamentos

   cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
        //console.log('Departamentos cargados:', JSON.stringify(data));
        //console.log('zzzzzzzzzzz: ',this.listDepartamentos);
      },
      (err) => {
        console.log(err);
      }
    );
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
      this.perfilorientadorForm.patchValue({ imagen_perfil: null });
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: null });
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.perfilorientadorForm.patchValue({ imagen_perfil: file });
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
    /* Restaura los datos originales */
    onCancel(): void {
      this.verEditar();
    }
  
    /* Muesta el boton de guardar cambios */
    mostrarGuardarCambios(): void {
      this.boton = false;
    }

    tipodato(): void {
      if (this.token) {
        this.authServices.tipoDocumento().subscribe(
          data => {
            this.listTipoDocumento = data;
            //console.log('datos tipo de documento: ',data)
          },
          error => {
            console.log(error);
          }
        )
      }
    }
  //   desactivarEmprendedor(): void {
  //     // let confirmationText = this.token
  //     //   ? "¿Estás seguro de desactivar tu cuenta?"
  //     //   : "¿Estás seguro de desactivar tu cuenta?";
  //     if (this.token) {
  //       this.alertService.DesactivarEmprendedor("¿Estás seguro de desactivar tu cuenta?",
  //       "¡Ten en cuenta que si desactivas tu cuenta tendras que validarte nuevamente por medio de tu correo electronico al momnento de iniciar sección!", 'warning').then((result) => {
  //         if (result.isConfirmed) {
  //           this.orientadorService.destroy(this.token, this.documento).subscribe(
  //             (data) => {
  //               console.log("desactivar", data);
  //               this.isAuthenticated = false;
  //               localStorage.clear();
  //               location.reload();
  //             },
  //             (err) => {
  //               console.log(err);
  //             }
  //           );
  //         }
  //       });
  //     }
  //   }

  // 
}