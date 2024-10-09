import { ChangeDetectorRef, Component, Input, OnInit, } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, } from '@angular/forms';
import { faCircleQuestion, } from '@fortawesome/free-solid-svg-icons';
import { AliadoService } from '../../../servicios/aliado.service';
import { AsesorService } from '../../../servicios/asesor.service';
import { User } from '../../../Modelos/user.model';
import { Asesor } from '../../../Modelos/asesor.model';
import { AlertService } from '../../../servicios/alert.service';
import { AuthService } from '../../../servicios/auth.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-modal-add-asesores',
  templateUrl: './modal-add-asesores.component.html',
  styleUrl: './modal-add-asesores.component.css',
  providers: [AsesorService, AliadoService, AlertService],
})
export class ModalAddAsesoresComponent implements OnInit {
  @Input() isEditing: boolean = false;
  hide = true;
  boton = true;
  isActive: boolean = true;
  submitted: boolean = false;
  asesorId: any;
  user: User | null = null;
  currentRolId: string | null = null;
  listaAsesores: Asesor[] = [];
  estado: boolean;
  id: number | null = null;
  token: string | null = null;
  nombre: string | null = null;
  nombreAliado: string | null = null;
  tiempoEspera = 1800;
  falupa = faCircleQuestion;
  listTipoDocumento: [] = [];
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  imagenPerlil_Preview: string | ArrayBuffer | null = null;
  selectedImagen_Perfil: File | null = null;
  formSubmitted = false;
  currentIndex: number = 0;
  currentSubSectionIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  idAsesor: number = null;
  errorMessage: string = '';
  isLoading: boolean = false;
  isSubmitting = false;
  bloqueado = false;
  
/*
  Este código define un formulario reactivo en Angular utilizando FormBuilder para crear y gestionar un grupo 
  de campos relacionados con los datos de un asesor. Se aplican validaciones específicas para garantizar que la entrada 
  de datos sea correcta, como la obligatoriedad, formatos adecuados (por ejemplo, solo letras, solo números, o formato 
  de correo electrónico), longitud mínima, y validaciones personalizadas para fechas. Adicionalmente, la estructura `sectionFields` 
  organiza los campos en secciones, facilitando su disposición o presentación en la interfaz de usuario. 
  El estado del asesor se inicializa como `true`, indicando que el asesor está activo por defecto.
*/

  asesorForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)]],
    apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)]],
    documento: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
    imagen_perfil: [null],
    celular: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    genero: ['', Validators.required],
    direccion: [''],
    id_tipo_documento: ['', Validators.required],
    id_departamento: ['', Validators.required],
    id_municipio: ['', Validators.required],
    fecha_nac: ['', this.dateRangeValidator],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    aliado: ['', Validators.required],
    estado: true,
  });

  sectionFields: string[][] = [
    ['nombre', 'apellido', 'documento', 'id_tipo_documento', 'fecha_nac', 'genero'],
    ['celular', 'email', 'id_departamento', 'id_municipio', 'direccion'],
  ];

  constructor(
    private fb: FormBuilder,
    private asesorService: AsesorService,
    private aliadoService: AliadoService,
    private alerService: AlertService,
    private authService: AuthService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.route.paramMap.subscribe(params => {
      this.idAsesor = +params.get('id');
      if (this.idAsesor) {
        this.isEditing = true;
        this.verEditar();
      } else {
        this.idAsesor = null;
        this.isEditing = false;
      }
    })
    if (this.asesorId != null) {
      this.isEditing = true;
      this.asesorForm.get('password')?.setValidators([Validators.minLength(8)]);
    } else {
      this.asesorForm.get('password')?.setValidators([Validators.minLength(8)]);
    }
    this.asesorForm.get('password')?.updateValueAndValidity();
    this.tipoDocumento();
    this.cargarDepartamentos();
  }
  get f() {
    return this.asesorForm.controls;
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
        this.nombreAliado = this.user.nombre;

        if (this.user && this.user.nombre) {
          this.nombreAliado = this.user.nombre;
          this.asesorForm.patchValue({ aliado: this.nombreAliado });
        } else {
          console.warn(
            'El nombre del aliado no está definido en el objeto identity'
          );
        }
      } else {
        console.error('No se encontró información de identity en localStorage');
      }
    }
  }

  /*
    Este método se utiliza cuando se desea regresar a la vista anterior sin recargar la página o perder el estado actual.
  */
  goBack() {
    this.location.back();
  }

  /*
    El método se encarga de obtener una lista de tipos de documentos desde el servicio de autenticación (`authService`) 
    y almacenarla en la propiedad `listTipoDocumento`. 
  */
  tipoDocumento(): void {
    if (this.token) {
      this.authService.tipoDocumento().subscribe(
        (data) => {
          this.listTipoDocumento = data;
        },
        (error) => {
          console.log(error);
        }
      );
    }
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
    Este método es una función de validación personalizada 
    que verifica la fortaleza de una contraseña ingresada en un control de formulario.
  */

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

  /*
    Este método se encarga de cargar y mostrar la información de un asesor en un formulario para su edición. 
  */

  verEditar(): void {
    this.isLoading = true;
    if (this.idAsesor != null) {
      this.aliadoService.getAsesorAliado(this.token, this.idAsesor).subscribe(
        (data) => {
          this.asesorForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            id_tipo_documento: data.id_tipo_documento,
            imagen_perfil: data.imagen_perfil,
            genero: data.genero,
            direccion: data.direccion,
            fecha_nac: data.fecha_nac,
            celular: data.celular,
            id_departamento: data.id_departamento,
            id_municipio: data.id_municipio,
            aliado: data.id,
            email: data.email,
            password: '',
            estado: data.estado,
          });
          this.bloqueado = true;
          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.asesorForm.get('estado')?.setValue(this.isActive);
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
        (error) => {
          (error);
          this.isLoading = false;
        }
      );
    }
  }

  /*
    Este método gestiona la creación o actualización de un asesor mediante la recolección de datos desde un formulario reactivo (`asesorForm`) 
    y la validación de la información ingresada. El método determina si se está editando un asesor existente o creando uno nuevo. 
    En el caso de una actualización, se solicita confirmación al usuario antes de realizar la actualización mediante el servicio `asesorService`. 
    Si se trata de una creación de asesor, se realiza la llamada al servicio correspondiente, mostrando alertas de éxito o error según sea necesario.
  */

  addAsesor(): void {
    this.isSubmitting = true;
    Object.values(this.asesorForm.controls).forEach(control => {
      control.markAsTouched();
    });
    const camposObligatorios = ['nombre', 'apellido', 'documento', 'direccion', 'celular', 'email', 'password'];
    for (const key of camposObligatorios) {
        const control = this.asesorForm.get(key);
        if (control && control.value && control.value.trim() === '') {
            this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
            this.isSubmitting = false;
            return;
        }
    }
    if (this.asesorForm.get('nombre').invalid ||
      this.asesorForm.get('apellido').invalid ||
      this.asesorForm.get('documento').invalid ||
      this.asesorForm.get('celular').invalid ||
      (this.asesorForm.get('password').invalid && (!this.idAsesor || this.asesorForm.get('password').value))) {
      this.alerService.errorAlert('Error', 'Por favor, complete correctamente los campos obligatorios.');
      this.isSubmitting = false;
      return;
    }
    const fechaNacControl = this.asesorForm.get('fecha_nac');
    if (fechaNacControl.value) {
      const fechaNac = new Date(fechaNacControl.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      if (edad < 18 || edad > 100) {
        this.alerService.errorAlert('Error', 'Debes ser mayor de edad');
        this.isSubmitting = false;
        return;
      }
    }
    const emailControl = this.asesorForm.get('email');
    if (emailControl.value && !emailControl.valid) {
      this.alerService.errorAlert('Error', 'Por favor, ingrese un email válido.');
      this.isSubmitting = false;
      return;
    }
    const formData = new FormData();
    let estadoValue: string;
    if (this.idAsesor == null) {
      estadoValue = '1';
    } else {
    }
    formData.append('nombre', this.asesorForm.get('nombre')?.value);
    formData.append('apellido', this.asesorForm.get('apellido')?.value);
    formData.append('documento', this.asesorForm.get('documento')?.value);
    formData.append('celular', this.asesorForm.get('celular')?.value);
    formData.append('genero', this.asesorForm.get('genero')?.value);
    const direccionControl = this.asesorForm.get('direccion');
    if (direccionControl && direccionControl.value) {
      formData.append('direccion', direccionControl.value);
    }
    formData.append('aliado', this.nombreAliado);
    formData.append('id_tipo_documento', this.asesorForm.get('id_tipo_documento')?.value);
    formData.append('departamento', this.asesorForm.get('id_departamento')?.value);
    formData.append('municipio', this.asesorForm.get('id_municipio')?.value);
    formData.append('email', this.asesorForm.get('email')?.value);
    const passwordControl = this.asesorForm.get('password');
    if (passwordControl && (passwordControl.value || !this.idAsesor)) {
      if (passwordControl.valid) {
        formData.append('password', passwordControl.value);
      } else {
        this.alerService.errorAlert('Error', 'La contraseña no cumple con los requisitos.');
        return;
      }
    }
    Object.keys(this.asesorForm.controls).forEach((key) => {
      const control = this.asesorForm.get(key);
      if (control?.value !== null && control?.value !== undefined) {
        if (key === 'fecha_nac') {
          if (control.value) {
            const date = new Date(control.value);
            if (!isNaN(date.getTime())) {
              formData.append(key, date.toISOString().split('T')[0]);
            }
          }
        } else if (key === 'estado') {
          formData.append(key, control.value ? '1' : '0');
        } else if (key !== 'imagen_perfil' && key !== 'direccion' &&
          !(key === 'password' && this.idAsesor && !control.value)) {
          formData.append(key, control.value);
        }
      }
    });
    if (this.selectedImagen_Perfil) {
      formData.append('imagen_perfil', this.selectedImagen_Perfil, this.selectedImagen_Perfil.name);
    }
    /* Actualiza asesor */
    if (this.idAsesor != null) {
      this.alerService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
        if (result.isConfirmed) {
          this.asesorService.updateAsesorxaliado(this.token, this.idAsesor, formData).subscribe(
            (data) => {
              setTimeout(() => {
                this.router.navigate(['/list-asesores']);
                this.alerService.successAlert('Exito', data.message);
              }, this.tiempoEspera);
            },
            (error) => {
              this.alerService.errorAlert('Error', error.error.message);
              console.error('Error', error.error.message);
              this.isSubmitting = false;
            }
          );
        }
      });
      /* Crea asesor */
    } else {
      this.asesorService.createAsesor(this.token, formData).subscribe(
        (data) => {
          setTimeout(function () {
          }, this.tiempoEspera);
          this.alerService.successAlert('Exito', data.message);
          this.router.navigate(['/list-asesores']);
        },
        (error) => {
          console.error('Error al crear el asesor:', error);
          this.alerService.errorAlert('Error', error.error.message);
          this.isSubmitting = false;
        }
      );
    }
  }

  /*
      Este método es útil para gestionar la activación/desactivación de un asesor en la interfaz de usuario.
  */
  toggleActive() {
    this.isActive = !this.isActive;
    this.asesorForm.patchValue({ estado: this.isActive ? true : false });
  }

  /*
   Este método gestiona la visibilidad de un botón en la interfaz de usuario. 
  */

  mostrarToggle(): void {
    if (this.asesorId != null) {
      this.boton = false;
    }
    this.boton = true;
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
        this.alertService.errorAlert(
          'Error',
          `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`
        );
        this.resetFileField(field);
        event.target.value = '';
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: null });
          this.imagenPerlil_Preview = null;
        }
        this.resetFileField(field);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPerlil_Preview = previewUrl;
        }
      };
      reader.readAsDataURL(file);
      this.generateImagePreview(file, field);
      if (field === 'imagen_perfil') {
        this.selectedImagen_Perfil = file;
        this.asesorForm.patchValue({ imagen_perfil: file });
      }
    } else {
      this.resetFileField(field);
    }
  }

  /*
    Este método se encarga de restablecer el campo de archivo a su estado inicial, 
    eliminando cualquier valor previamente asignado.
  */

  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.asesorForm.patchValue({ imagen_perfil: null });
      this.imagenPerlil_Preview = null;
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
        this.imagenPerlil_Preview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }


  /*
    Este método recorre los controles del formulario y recopila los errores 
    de validación, devolviendo un objeto que contiene los campos con errores para su posible 
    visualización.
  */

  getFormValidationErrors(form: FormGroup) {
    const result: any = {};
    Object.keys(form.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null = form.get(key)?.errors;
      if (controlErrors) {
        result[key] = controlErrors;
      }
    });
    return result;
  }

  /*
    Este método es responsable de validar los campos del formulario de un componente 
    y gestionar la navegación entre diferentes secciones del formulario.
  */

  next() {
    const form = this.asesorForm;
    let sectionIsValid = true;
    const currentSectionFields = this.sectionFields[this.currentIndex];
    currentSectionFields.forEach(field => {
      const control = form.get(field);
      if (control.invalid) {
        control.markAsTouched();
        control.markAsDirty();
        sectionIsValid = false;
      }
    });
    if (this.currentIndex === 1) {
      const emailControl = form.get('email');
      if (emailControl.value && emailControl.invalid) {
        emailControl.markAsTouched();
        emailControl.markAsDirty();
        sectionIsValid = false;
      }
      const fechaNacControl = form.get('fecha_nac');
      if (fechaNacControl.value) {
        const fechaNac = new Date(fechaNacControl.value);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }
        if (edad < 18 || edad > 100) {
          fechaNacControl.setErrors({ 'invalidAge': true });
          fechaNacControl.markAsTouched();
          sectionIsValid = false;
        }
      }
    }
    if (!sectionIsValid) {
      this.showErrorMessage('Por favor, complete correctamente todos los campos de esta sección antes de continuar.');
      return;
    }
    if (this.currentSubSectionIndex < this.subSectionPerSection[this.currentIndex] - 1) {
      this.currentSubSectionIndex++;
    } else {
      if (this.currentIndex < this.subSectionPerSection.length - 1) {
        this.currentIndex++;
        this.currentSubSectionIndex = 0;
      }
    }
    this.clearErrorMessage();
  }

  private showErrorMessage(message: string) {
    console.error(message);
    this.alertService.errorAlert('error', message);
    this.errorMessage = message;
  }

  private clearErrorMessage() {
    this.errorMessage = '';
  }

  /*
    Este método  es responsable de gestionar la navegación hacia atrás 
    entre diferentes secciones y sub-secciones del formulario.
  */

  previous(): void {
    if (this.currentSubSectionIndex > 0) {
      this.currentSubSectionIndex--;
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.currentSubSectionIndex = this.subSectionPerSection[this.currentIndex] - 1;
      }
    }

  }

  /*
    Este método es un validador personalizado que se utiliza 
    para verificar la validez de una fecha seleccionada en relación con las 
    restricciones de edad.
  */

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
}
