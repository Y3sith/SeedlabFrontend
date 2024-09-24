import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
// import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
// import { faIdCard } from '@fortawesome/free-solid-svg-icons';
// import { faLandmarkFlag } from '@fortawesome/free-solid-svg-icons';
// import { faMountainCity } from '@fortawesome/free-solid-svg-icons';
// import { faPhone } from '@fortawesome/free-solid-svg-icons';
// import { faVenusMars } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../servicios/auth.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { EmprendedorService } from '../../../servicios/emprendedor.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { PerfilEmprendedor } from '../../../Modelos/perfil-emprendedor.model';
import { User } from '../../../Modelos/user.model';
import { AlertService } from '../../../servicios/alert.service';


@Component({
  selector: 'app-perfil-emprendedor',
  templateUrl: './perfil-emprendedor.component.html',
  styleUrl: './perfil-emprendedor.component.css'
})
export class PerfilEmprendedorComponent implements OnInit {
  @Input() isEditing: boolean = false
  isActive: boolean = true;
  // faVenusMars = faVenusMars;
  // faMountainCity = faMountainCity;
  // faLandmarkFlag = faLandmarkFlag;
  showPassword = faEye;
  // faIdCard = faIdCard;
  // faEnvelope = faEnvelope;
  // faPhone = faPhone;
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
  listTipoDocumento: any[] = [];
  tiempoEspera = 1800;
  emprendedorForm: FormGroup;
  registerForm: FormGroup;
  listEmprendedor: PerfilEmprendedor[] = [];
  originalData: any;
  perfil: '';
  boton: boolean;
  editboton: boolean;
  selectedImagen_perfil: File | null = null;
  perfilPreview: string | ArrayBuffer | null = null;
  isHidden = true;
  showEditButton = false;
  falupa = faCircleQuestion;

  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private emprendedorService: EmprendedorService,
    private authServices: AuthService,
    private router: Router,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.emprendedorForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      documento: ['', Validators.required],
      imagen_perfil: [Validators.required],
      celular: ['', [Validators.required, Validators.maxLength(10), this.noLettersValidator]],
      genero: ['', Validators.required],
      direccion: [],
      id_tipo_documento: [Validators.required],
      id_departamento: ['', Validators.required],
      id_municipio: ['', Validators.required],
      fecha_nac: ['', [Validators.required, this.dateRangeValidator]],
      email: ['', Validators.required],
      password: ['', [Validators.minLength(10), this.passwordValidator]],
      estado: true,
    });
  }

  ngOnInit(): void {
    this.validateToken();
    this.isAuthenticated = this.authServices.isAuthenticated();
    this.verEditar();
    this.tipoDocumento();
    this.cargarDepartamentos();
    this.isEditing = true;
    this.initializeFormState();
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
          this.router.navigate(['home']);
        } else {
          this.documento = this.user.emprendedor.documento;
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
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
    this.emprendedorForm.get('id_municipio')?.setValue(null);
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



  verEditar(): void {
    if (this.token) {
      this.emprendedorService.getInfoEmprendedor(this.token, this.documento).subscribe(
        (data) => {
          this.isActive = data.estado === 'Activo';
          // Rellenar el formulario con los datos del emprendedor
          this.emprendedorForm.patchValue({
            documento: data.documento,
            nombre: data.nombre,
            apellido: data.apellido,
            imagen_perfil: data.imagen_perfil,
            celular: data.celular,
            email: data.email,
            password: "",
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            id_departamento: data.id_departamento,
            id_municipio: data.id_municipio,
            id_tipo_documento: data.id_tipo_documento,
            estado: data.estado
          });

          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.emprendedorForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.emprendedorForm.patchValue({ id_municipio: data.id_municipio });
            }, 500);
          }, 500);
        },
        (err) => {
          console.log(err);
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


  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.emprendedorForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.perfilPreview = null;
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


  updateEmprendedor(): void {
    const formData = new FormData();
    let estadoValue: string;

    // Validación general
    if (this.emprendedorForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar los campos requeridos por el perfil');
      this.submitted = true;
      return;
    }

    // First pass: handle special cases and avoid duplication
    Object.keys(this.emprendedorForm.controls).forEach((key) => {
      const control = this.emprendedorForm.get(key);
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
      const value = this.emprendedorForm.get(field)?.value;
      if (value !== null && value !== undefined && value !== '') {
        formData.append(field, value);
      }
    });


    if (this.emprendedorForm.get('direccion')?.value) {
      formData.append('direccion', this.emprendedorForm.get('direccion')?.value);
    }

    if (this.selectedImagen_perfil) {
      formData.append('imagen_perfil', this.selectedImagen_perfil, this.selectedImagen_perfil.name);
    }



    this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
      if (result.isConfirmed) {
        this.emprendedorService.updateEmprendedor(this.token, formData, this.documento).subscribe(
          (data) => {
            setTimeout(function () {
              location.reload();
            }, this.tiempoEspera);
            this.alertService.successAlert('Exito', data.message);
          },
          (error) => {
            console.error('Error from server:', error);
            this.alertService.errorAlert('Error', error.message);
          }
        );
      }
    });
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
          this.emprendedorForm.patchValue({ imagen_perfil: null });
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
          this.emprendedorForm.patchValue({ imagen_perfil: previewUrl });
          this.perfilPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.emprendedorForm.patchValue({ imagen_perfil: file });
      }

    } else {
      this.resetFileField(field);
    }
  }




  desactivarEmprendedor(): void {
    if (this.token) {
      this.alertService.DesactivarEmprendedor("¿Estás seguro de desactivar tu cuenta?",
        "¡Ten en cuenta que si desactivas tu cuenta tendras que validarte nuevamente por medio de tu correo electronico al momento de iniciar sección!", 'warning').then((result) => {
          if (result.isConfirmed) {
            this.emprendedorService.destroy(this.token, this.documento).subscribe(
              (data) => {
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

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    // Si el campo está vacío, consideramos que es válido
    if (!value || value.trim() === '') {
      return null;
    }

    const hasUpperCase = /[A-Z]+/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    if (hasUpperCase && hasSpecialChar) {
      return null;
    } else {
      return { passwordStrength: 'La contraseña debe contener al menos una letra mayúscula y un carácter especial *' };
    }
  }


  get f() { return this.emprendedorForm.controls; }




  trackById(index: number, item: any): number {
    return item.id;
  }

  initializeFormState(): void {
    const fieldsToDisable = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    fieldsToDisable.forEach(field => {
      const control = this.emprendedorForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  //para que no me deje editar el nombre del tipo del documento
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento'];

    fieldsToToggle.forEach(field => {
      const control = this.emprendedorForm.get(field);
      if (control) {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });

    // Force change detection
    this.cdRef.detectChanges();
  }

  // Restaura los datos originales
  onCancel(): void {
    location.reload();
  }

  mostrarGuardarCambios(): void {
    this.boton = false;
  }

  onEdit() {
    this.blockedInputs = false;
    this.showEditButton = true;
    this.toggleInputsLock();
  }

  getFormValidationErrors(form: FormGroup) {
    const result: any = {};
    Object.keys(form.controls).forEach(key => {
      const controlErrors: ValidationErrors | null = form.get(key)?.errors;
      if (controlErrors) {
        result[key] = controlErrors;
      }
    });
    return result;
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

  noLettersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasLetters = /[a-zA-Z]/.test(value);

    if (hasLetters) {
      return { hasLetters: 'El campo no debe contener letras *' };
    } else {
      return null;
    }
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
