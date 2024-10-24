import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faEnvelope, faMobileAlt, faUser, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

import { AsesorService } from '../../../servicios/asesor.service';

import { User } from '../../../Modelos/user.model';
import { AlertService } from '../../../servicios/alert.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { AuthService } from '../../../servicios/auth.service';
import { environment } from '../../../../environment/env';

@Component({
  selector: 'app-perfil-asesor',
  templateUrl: './perfil-asesor.component.html',
  styleUrl: './perfil-asesor.component.css',
  providers: [AsesorService]
})
export class PerfilAsesorComponent implements OnInit {
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
  blockedInputsCorreo = true;
  imagenPreview: string | ArrayBuffer | null = null;
  selectedImagen_perfil: File | null = null;
  submitted = false;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  nombreAliado: string | null = null;
  listTipoDocumento: [] = [];
  selectedImagen_Perfil: File | null = null;
  perfilPreview: string | ArrayBuffer | null = null;
  isHidden = true;
  showEditButton = false;
  asesorId: any;
  isLoading: boolean = false;
  falupa = faCircleQuestion;
  isSubmitting: boolean = false;
  buttonMessage: string = "Guardar cambios";

  /*
    Formulario de creación o edición para un asesor.
  */
  asesorForm = this.fb.group({
    nombre: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
    apellido: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
    documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
    id_tipo_documento: ['', Validators.required],
    imagen_perfil: [null],
    genero: ['', Validators.required],
    fecha_nac: ['', [Validators.required, this.dateRangeValidator]],
    direccion: ['', [Validators.required]],
    celular: ['', [Validators.required, this.noLettersValidator, this.celularValidator]],
    id_departamento: ['', Validators.required],
    id_municipio: ['', Validators.required],
    aliado: ['', Validators.required],
    // email: ['', [Validators.required, Validators.email]],
    email: [{ value: '', disabled: true }],
    password: ['', [Validators.minLength(10), this.passwordValidator]],
    estado: true,
  });

  constructor(private fb: FormBuilder,
    private router: Router,
    private asesorService: AsesorService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService: AuthService,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.desactivarCorreo();
    this.tipodatoDocumento();
    this.cargarDepartamentos();
    this.initializeFormState();
  }

  /*
        Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
       formulario o cualquier otra parte de la aplicación.
  */

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
    this.isLoading = true;
    this.asesorService.getAsesorID(this.token, this.id).subscribe(
      data => {
        this.asesorForm.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          documento: data.documento,
          id_tipo_documento: data.id_tipo_documento,
          imagen_perfil: data.imagen_perfil,
          genero: data.genero,
          fecha_nac: data.fecha_nac,
          direccion: data.direccion,
          celular: data.celular,
          id_departamento: data.id_departamento,
          id_municipio: data.id_municipio,
          aliado: data.id,
          email: data.email,
          password: '',
          estado: data.estado
        });
        this.cargarDepartamentos();
        setTimeout(() => {
          this.asesorForm.patchValue({ id_municipio: data.id_departamentos });
          this.cargarMunicipios(data.id_departamento);
          setTimeout(() => {
            this.asesorForm.patchValue({ id_municipio: data.id_municipio });
          }, 500);
        }, 500);
        this.isLoading = false;
      },
      error => {
        console.log(error);
        this.isLoading = false;
      }
    )
  }

  desactivarCorreo():void {
    this.blockedInputsCorreo = true;
  }

  desactivarboton():void{
    const guardarBtn = document.getElementById('guardarBtn') as HTMLButtonElement;
    if (guardarBtn) {
      guardarBtn.style.pointerEvents = 'none';
    }
  }

  getFullImageUrl(path: string): string {
    return `${environment.imageBaseUrl}/${path}`;;
  }


  /* Actualiza los datos del asesor */
  editAsesor(): void {
    if (this.asesorForm.invalid) {
      // console.log('Formulario inválido. Campos con errores:', this.asesorForm);
      this.alertService.errorAlert('Error', 'Hay errores en el formulario Revisa los campos.')
    //   Object.keys(this.asesorForm.controls).forEach(key => {
    //     const control = this.asesorForm.get(key);
    //     if (control?.invalid) {
    //         console.log(`Campo inválido: ${key}, Errores:`, control.errors);
    //     }
    // });
      this.submitted = true;
      this.isSubmitting = false;
      this.buttonMessage = "Guardar cambios";
    return
    }

    const formData = new FormData();
    let estadoValue: string;
    this.isSubmitting = true;
    this.buttonMessage = "Guardando...";

    const camposObligatorios = ['nombre','apellido','password'];
    for (const key of camposObligatorios) {
        const control = this.asesorForm.get(key);
        if (control && control.value && control.value.trim() === '') {
            this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
            this.isSubmitting = false;
            this.buttonMessage = "Guardar cambios";
            return;
        }
    }
    Object.keys(this.asesorForm.controls).forEach((key) => {
      const control = this.asesorForm.get(key);
      if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
        if (key === 'password') {
          if (control.value.trim() !== '') {
            formData.append(key, control.value);
          }
        } else if (key === 'fecha_nac') {
          const date = new Date(control.value);
          if (!isNaN(date.getTime())) {
            const today = new Date();
            const birthDate = new Date(control.value);
            let userAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              userAge--;
            }
            if (userAge < 18) {
              this.alertService.errorAlert('Error', 'No puedes actualizar un administrador menor de edad.');
              this.isSubmitting = false;
              this.buttonMessage = "Guardar cambios";
              return;
            }
            formData.append(key, date.toISOString().split('T')[0]);
          }
        } else if (key === 'estado') {
          formData.append(key, control.value ? '1' : '0');
        } else if (key !== 'imagen_perfil') {
          formData.append(key, control.value);
        }
      }
    });

    const specificFields = ['nombre', 'apellido', 'documento', 'celular', 'genero', 'id_tipo_documento', 'id_departamento', 'id_municipio', 'email'];
    specificFields.forEach(field => {
      const value = this.asesorForm.get(field)?.value;
      if (value !== null && value !== undefined && value !== '') {
        formData.append(field, value);
      }
    });


    if (this.asesorForm.get('direccion')?.value) {
      formData.append('direccion', this.asesorForm.get('direccion')?.value);
    }

    if (this.selectedImagen_perfil) {
      formData.append('imagen_perfil', this.selectedImagen_perfil, this.selectedImagen_perfil.name);
    }

    formData.append('aliado', this.nombreAliado);

    this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
      if (result.isConfirmed) {
        this.asesorService.updateAsesor(this.token, this.id, formData).subscribe(
          (data) => {
            console.log(data);
            this.desactivarboton();
            this.buttonMessage = "Guardando...";
            this.isSubmitting = false;
            setTimeout(function () {
              location.reload();
            },2000);
            this.alertService.successAlert('Exito', data.message);
          },
          (error) => {
            this.isSubmitting = false;
            this.buttonMessage = "Guardar cambios";
            console.error('Error from server:', error);
            this.alertService.errorAlert('Error', error.error.message);
            console.log(error)
          }
        );
      } else {
        this.isSubmitting = false;
        this.buttonMessage = "Guardar cambios";
      }
    });
  }

  get a() { return this.asesorForm.controls; }

  /*
    Inicializa el estado del formulario deshabilitando ciertos campos.
  */
  initializeFormState(): void {
    const fieldsToDisable = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    fieldsToDisable.forEach(field => {
      const control = this.asesorForm.get(field);
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
      const control = this.asesorForm.get(field);
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
    this.cdRef.detectChanges();
  }

  // Restaura los datos originales
  onCancel(): void {
    location.reload();
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
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


  /*
    Muestra el botón de "Guardar Cambios".
  */
  mostrarGuardarCambios(): void {
    this.boton = false;
  }

  /*
    Activa el modo de edición para el formulario o inputs.
  */
  onEdit() {
    this.blockedInputs = false;
    this.showEditButton = true;
    this.toggleInputsLock();
  }

  /*
      Este método maneja la selección de archivos desde un input de tipo archivo. 
      Verifica si hay archivos seleccionados y, si es así, comprueba su tamaño.
    */
  onFileSelecteds(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let maxSize = 0;
      if (field === 'imagen_perfil') {
        maxSize = 5 * 1024 * 1024;
      }
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField(field);
        event.target.value = '';
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: null });
          this.selectedImagen_perfil = null;
          this.perfilPreview = null;
        }
        this.resetFileField(field);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: previewUrl });
          this.perfilPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);
      this.generateImagePreview(file, field);
      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.asesorForm.patchValue({ imagen_perfil: file });
      }
    } else {
      this.resetFileField(field);
    }
  }

  /*
      Este método utiliza `FileReader` para crear una vista previa de la imagen 
      seleccionada, actualizando la propiedad correspondiente en el componente.
    */
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

  /*
      Este método se encarga de restablecer el campo de archivo a su estado inicial, 
      eliminando cualquier valor previamente asignado.
    */
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.asesorForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.imagenPreview = null;
    }
  }

  get f() {
    return this.asesorForm.controls;
  }

  /*
       Este método solicita una lista de departamentos a través del servicio `departamentoService` 
       y la asigna a la propiedad `listDepartamentos`.
   */
  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /*
      Este método se activa cuando un usuario selecciona un departamento de la lista desplegable. 
      Finalmente, llama al método `cargarMunicipios(selectedDepartamento)`, que carga los municipios 
      asociados al departamento seleccionado
    */
  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedDepartamento = target.value;

    localStorage.setItem('departamento', selectedDepartamento);
    this.asesorForm.get('id_municipio')?.setValue(null);
    this.listMunicipios = [];
    this.cargarMunicipios(selectedDepartamento);
  }

  /*
      Este método se encarga de obtener una lista de municipios asociados a un departamento específico.
    */
  cargarMunicipios(idDepartamento: string): void {
    this.municipioService.getMunicipios(idDepartamento).subscribe(
      (data) => {
        this.listMunicipios = data;
      },
      (err) => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  /*
      El método se encarga de obtener una lista de tipos de documentos desde el servicio de autenticación (`authService`) 
      y almacenarla en la propiedad `listTipoDocumento`. 
    */
  tipodatoDocumento(): void {
    if (this.token) {
      this.authService.tipoDocumento().subscribe(
        data => {
          this.listTipoDocumento = data;
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  /*
    Valida que un campo no contenga números.
  */
  noNumbersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasNumbers = /\d/.test(value);

    if (hasNumbers) {
      return { hasNumbers: 'El campo no debe contener números *' };
    } else {
      return null;
    }
  }

  /*
    Valida que un número de documento tenga una longitud específica.
  */
  documentoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? control.value.toString() : '';
    if (value.length < 5 || value.length > 13) {
      return { lengthError: 'El número de documento debe tener entre 5 y 13 dígitos *' };
    }
    return null;
  }

  /*
    Valida que un campo no contenga letras.
  */
  noLettersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasLetters = /[a-zA-Z]/.test(value);

    if (hasLetters) {
      return { hasLetters: 'El campo no debe contener letras *' };
    } else {
      return null;
    }
  }

  /*
    Valida que la fecha seleccionada no sea anterior a la fecha actual.
  */
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
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

  celularValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? control.value.toString() : '';
    if (value.length < 5 || value.length > 10) {
      return { lengthError: 'El número de celular debe tener entre 5 y 10 dígitos *' };
    }
    return null;
  }

}
