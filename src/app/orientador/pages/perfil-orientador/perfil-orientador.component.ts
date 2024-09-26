import { Component, ChangeDetectorRef, } from '@angular/core';
import { AbstractControl, FormBuilder, Validators, ValidationErrors, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { OrientadorService } from '../../../servicios/orientador.service';
import { Orientador } from '../../../Modelos/orientador.model';
import { User } from '../../../Modelos/user.model';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { faCircleQuestion, faEnvelope } from '@fortawesome/free-solid-svg-icons';
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
  selectedImagen_perfil: File | null = null;
  listTipoDocumento: any[] = [];
  registerForm: FormGroup;  
  listOrientador: Orientador[] = [];
  originalData: any;
  perfil: '';
  boton: boolean;
  id: number;
  selectedImagen: File | null = null;
  orientadorId : number
  perfilPreview: string | ArrayBuffer | null = null;
  isHidden = true;
  showEditButton = false;
  tiempoEspera = 1800;

  falupa = faCircleQuestion;
  isLoading: boolean = false;

  perfilorientadorForm = this.fb.group({
    documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
    nombre: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
    apellido: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
    celular: ['', [Validators.required, Validators.maxLength(10), this.noLettersValidator ]],
    imagen_perfil: [Validators.required],
    email: ['', [Validators.required, Validators.email, this.emailValidator]],
    password: ['', [Validators.minLength(8)]],
    genero: ['', Validators.required],
    fecha_nac: ['', [Validators.required, this.dateRangeValidator]],
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
    this.verEditar(); 
    this.cargarDepartamentos(); 
    this.tipodato();
    this.initializeFormState();

    // this.isEditing = true;
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.orientadorId = this.user.id;
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
    this.isLoading = true;
    if (this.token) {
      this.orientadorService.getinformacionOrientador(this.token, this.orientadorId).subscribe(
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
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      );
    }
  }

  tipoDocumento(): void {
    this.authServices.tipoDocumento().subscribe(
      data => {
        this.listTipoDocumento = data;
      },
      error => {
        console.log(error);
      }
    )
  }
  
  updateOrientador(): void {
    const formData = new FormData();
    let estadoValue: string;

    if(this.perfilorientadorForm.invalid){
      this.alertService.errorAlert('Error', 'Debes completar los campos requeridos por el perfil')
      this.submitted = true;
      return
    }
  
    // First pass: handle special cases and avoid duplication
    Object.keys(this.perfilorientadorForm.controls).forEach((key) => {
      const control = this.perfilorientadorForm.get(key);
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
      const value = this.perfilorientadorForm.get(field)?.value;
      if (value !== null && value !== undefined && value !== '') {
        formData.append(field, value);
      }
    });
  
   
    if (this.perfilorientadorForm.get('direccion')?.value) {
      formData.append('direccion', this.perfilorientadorForm.get('direccion')?.value);
    }
  
    if (this.selectedImagen_perfil) {
      formData.append('imagen_perfil', this.selectedImagen_perfil, this.selectedImagen_perfil.name);
    }
  

        this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
          if (result.isConfirmed) {
            this.orientadorService.updateOrientador(this.token, this.orientadorId, formData).subscribe(
              (data) => {
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
        

  

    logFormErrors(): void {
      Object.keys(this.perfilorientadorForm.controls).forEach(key => {
        const controlErrors = this.perfilorientadorForm.get(key)?.errors;
        if (controlErrors) {
          console.error(`Error en el control ${key}:`, controlErrors);
        }
      });
    }

  

  get f() { return this.perfilorientadorForm.controls; }

  initializeFormState(): void {
    const fieldsToDisable = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    fieldsToDisable.forEach(field => {
      const control = this.perfilorientadorForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  //para que no me deje editar el nombre del tipo del documento
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    
    fieldsToToggle.forEach(field => {
      const control = this.perfilorientadorForm.get(field);
      if (control) {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
      } else {
        console.warn(`Control for field ${field} not found in form`);
      }
    });
  
    // Force change detection
    this.cdRef.detectChanges();
  
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
    this.perfilorientadorForm.get('id_municipio')?.setValue(null);
    this.listMunicipios = [];
    // Llama a cargarMunicipios si es necesario
    this.cargarMunicipios(selectedDepartamento);
  }

  cargarMunicipios(departamentoId: string): void {
    this.municipioService.getMunicipios(departamentoId).subscribe(
      (data) => {
        this.listMunicipios = data;
      },
      (err) => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.perfilorientadorForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.perfilPreview = null;
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: null });
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
        this.perfilorientadorForm.patchValue({ imagen_perfil: previewUrl });
        this.perfilPreview = previewUrl;
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
        this.perfilPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
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

    tipodato(): void {
      if (this.token) {
        this.authServices.tipoDocumento().subscribe(
          data => {
            this.listTipoDocumento = data;
          },
          error => {
            console.log(error);
          }
        )
      }
    }

    noNumbersValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      const hasNumbers = /\d/.test(value);
  
      if (hasNumbers) {
        return { hasNumbers: 'El campo no debe contener números *' };
      } else {
        return null;
      }
    }

    noLettersValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      const hasLetters = /[a-zA-Z]/.test(value);
    
      if (hasLetters) {
        return { hasLetters: 'El campo no debe contener letras *' };
      } else {
        return null;
      }
    }

    dateRangeValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      if (!value) {
        return null; // Si no hay valor, no se valida
      }
    
      const selectedDate = new Date(value);
      const today = new Date();
      const hundredYearsAgo = new Date();
      hundredYearsAgo.setFullYear(today.getFullYear() - 100);
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
    
      if (selectedDate > today) {
        return { futureDate: 'La fecha no es válida *' };
      } else if (selectedDate < hundredYearsAgo) {
        return { tooOld: 'La fecha no es válida *' };
      } else if (selectedDate > eighteenYearsAgo) {
        return { tooRecent: 'Debe tener al menos 18 años *' };
      } else {
        return null;
      }
    }

    documentoValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value ? control.value.toString() : '';
      if (value.length < 5 || value.length > 13) {
        return { lengthError: 'El número de documento debe tener entre 5 y 13 dígitos *' };
      }
      return null;
    }

    emailValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      const hasAtSymbol = /@/.test(value);
  
      if (!hasAtSymbol) {
        return { emailInvalid: 'El correo debe ser válido *' };
      } else {
        return null;
      }
    }
}