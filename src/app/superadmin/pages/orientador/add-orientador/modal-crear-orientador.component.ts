import { Component, OnInit, Input,  ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup,  ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../../../Modelos/user.model';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { OrientadorService } from '../../../../servicios/orientador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../servicios/alert.service';
import { DepartamentoService } from '../../../../servicios/departamento.service';
import { MunicipioService } from '../../../../servicios/municipio.service';
import { AuthService } from '../../../../servicios/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-modal-crear-orientador',
  templateUrl: './modal-crear-orientador.component.html',
  styleUrl: './modal-crear-orientador.component.css'
})
export class ModalCrearOrientadorComponent implements OnInit {
  @Input() isEditing: boolean = false;
  submitted: boolean = false;
  boton = true;
  estado: boolean;
  isActive: boolean = true;
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  falupa = faCircleQuestion;
  currentRolId: number;
  orientadorId: any;
  hide = true;
  errorMessage: string = '';


  //////
  listTipoDocumento: [] = [];
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  ////
  imagenPerlil_Preview: string | ArrayBuffer | null = null;
  selectedImagen_Perfil: File | null = null;
  formSubmitted = false;
  currentIndex: number = 0;
  currentSubSectionIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  /////
  tiempoEspera = 1800;
  ///
  idOrientador: number = null;
  isLoading: boolean = false;

  orientadorForm = this.fb.group({
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
    email: ['', [Validators.required,Validators.email]],
    password: ['', [Validators.minLength(8)]],
    estado: true,
  });
  
  sectionFields: string[][] = [
    ['nombre', 'apellido', 'documento', 'id_tipo_documento','fecha_nac', 'genero'], // Sección 1
    ['celular', 'email','id_departamento', 'id_municipio', 'direccion'], // Sección 2
  ];

  constructor(
    private fb: FormBuilder,
    private orientadorServices: OrientadorService,
    private router: Router,
    private alertService: AlertService,
    private alerService: AlertService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location:Location
  ) {
  }
   /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.route.paramMap.subscribe(params => {
      this.idOrientador = +params.get('id');
      if (this.idOrientador) {
        this.isEditing = true;
        this.verEditar();
      } else {
        this.idOrientador = null; // Establece claramente que no hay un id en modo creación
        this.isEditing = false;
      }
    });
    
    if (this.orientadorId != null) {
      this.isEditing = true;
      this.orientadorForm.get('password')?.setValidators([Validators.minLength(8)]);
    } else {
      this.orientadorForm.get('password')?.setValidators([Validators.minLength(8)]);
    }
    this.orientadorForm.get('password')?.updateValueAndValidity();
    this.tipoDocumento();
    this.cargarDepartamentos();

  }
  /*getter que facilita el acceso a los controles del formulario reactivo*/
  get f() { return this.orientadorForm.controls; } //aquii

  /*Verifica si hay un token almacenado localmente. Si no lo encuentra, redirige al usuario a la página de inicio de sesión.*/
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }
  /* Hace una petición al servicio authService para obtener los tipos de documentos disponibles y almacenarlos en la lista listTipoDocumento.*/
  tipoDocumento(): void {
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
  /*Navega a la página anterior en el historial del navegador.*/
  goBack(): void {
    this.location.back();
  }
  /*Carga la lista de departamentos desde el servicio correspondiente y la almacena en la lista listDepartamentos.*/
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
  /* Se ejecuta cuando el usuario selecciona un departamento. Guarda la selección en localStorage y llama a cargarMunicipios para obtener los municipios del departamento seleccionado.*/
  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast a HTMLSelectElement
    const selectedDepartamento = target.value;

    // Guarda el departamento seleccionado en el localStorage
    localStorage.setItem('departamento', selectedDepartamento);

    // Llama a cargarMunicipios si es necesario
    this.cargarMunicipios(selectedDepartamento);
  }
  /*Carga los municipios asociados al departamento seleccionado desde el servicio correspondiente y los almacena en la lista listMunicipios.*/
  cargarMunicipios(idDepartamento: string): void {
    this.municipioService.getMunicipios(idDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }
  /* Es un validador personalizado para verificar si una contraseña contiene al menos una letra mayúscula y un carácter especial.*/
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
  /*Carga los datos de un orientador específico si se está en modo de edición. Pone los valores en el formulario y ajusta la visualización de los campos de departamento y municipio.*/
  verEditar(): void {
    this.isLoading = true;
    if (this.idOrientador != null) {
      this.orientadorServices.getinformacionOrientador(this.token, this.idOrientador).subscribe(
        data => {
          this.orientadorForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            id_tipo_documento: data.id_tipo_documento,
            imagen_perfil: data.imagen_perfil,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            id_departamento: data.id_departamento,
            id_municipio: data.id_municipio,
            celular: data.celular,
            email: data.email,
            password: '',
            estado: data.estado 
          });
          this.isActive = data.estado === 'Activo'; 
          setTimeout(() => {
            this.orientadorForm.get('estado')?.setValue(this.isActive);
          });
          this.cargarDepartamentos();
          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.orientadorForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.orientadorForm.patchValue({ id_municipio: data.id_municipio });
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
  }
  /*Valida el formulario, construye los datos para crear o actualizar un orientador, y luego envía estos datos al servicio correspondiente.
  Realiza validaciones adicionales, como la edad y la fuerza de la contraseña.*/
  addOrientador(): void {
    Object.values(this.orientadorForm.controls).forEach(control => {
      control.markAsTouched();
    });
  
    const camposObligatorios = ['nombre', 'apellido', 'documento','direccion', 'celular', 'email', 'password'];
    for (const key of camposObligatorios) {
        const control = this.orientadorForm.get(key);
        if (control && control.value && control.value.trim() === '') {
            this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
            return;
        }
    }
  
    // Validaciones permanentes (excluyendo dirección y contraseña en modo edición)
    if (this.orientadorForm.get('nombre').invalid || 
        this.orientadorForm.get('apellido').invalid || 
        this.orientadorForm.get('documento').invalid || 
        this.orientadorForm.get('celular').invalid || 
        (this.orientadorForm.get('password').invalid && (!this.idOrientador || this.orientadorForm.get('password').value))) {
          this.alerService.errorAlert('Error', 'Por favor, complete correctamente los campos obligatorios.');
      return;
    }
  
    // Validaciones opcionales
    const fechaNacControl = this.orientadorForm.get('fecha_nac');
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
        return;
      }
    }
  
    const emailControl = this.orientadorForm.get('email');
    if (emailControl.value && !emailControl.valid) {
      this.alerService.errorAlert('Error', 'Por favor, ingrese un email válido.');
      return;
    }
  
    // El resto de tu código existente
    const formData = new FormData();
    let estadoValue: string;
    if (this.idOrientador == null) {
      estadoValue = '1';
    } else {
      // Aquí falta la lógica para el caso en que idOrientador no sea null
    }
  
    formData.append('nombre', this.orientadorForm.get('nombre')?.value);
    formData.append('apellido', this.orientadorForm.get('apellido')?.value);
    formData.append('documento', this.orientadorForm.get('documento')?.value);
    formData.append('celular', this.orientadorForm.get('celular')?.value);
    formData.append('genero', this.orientadorForm.get('genero')?.value);
  
    // Agregamos la dirección solo si tiene un valor
    const direccionControl = this.orientadorForm.get('direccion');
    if (direccionControl && direccionControl.value) {
      formData.append('direccion', direccionControl.value);
    }
  
    formData.append('id_tipo_documento', this.orientadorForm.get('id_tipo_documento')?.value);
    formData.append('departamento', this.orientadorForm.get('id_departamento')?.value);
    formData.append('municipio', this.orientadorForm.get('id_municipio')?.value);
    formData.append('email', this.orientadorForm.get('email')?.value);
  
    // Agregamos la contraseña solo si tiene un valor o si es un nuevo orientador
    const passwordControl = this.orientadorForm.get('password');
    if (passwordControl && (passwordControl.value || !this.idOrientador)) {
      if (passwordControl.valid) {
        formData.append('password', passwordControl.value);
      } else {
        this.alerService.errorAlert('Error', 'La contraseña no cumple con los requisitos.');
        return;
      }
    }
  
    Object.keys(this.orientadorForm.controls).forEach((key) => {
      const control = this.orientadorForm.get(key);
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
                   !(key === 'password' && this.idOrientador && !control.value)) {
          formData.append(key, control.value);
        }
      }
    });
  
    if (this.selectedImagen_Perfil) {
      formData.append('imagen_perfil', this.selectedImagen_Perfil, this.selectedImagen_Perfil.name);
    }
  
    /* Actualiza orientador */
    if (this.idOrientador != null) {
      this.alerService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question').then((result) => {
        if (result.isConfirmed) {
          this.orientadorServices.updateOrientador(this.token, this.idOrientador, formData).subscribe(
            (data) => {
              setTimeout(() => {
                this.router.navigate(['/list-orientador']);
                this.alerService.successAlert('Exito', data.message);
              }, this.tiempoEspera);
            },
            error => {
              console.error(error);
              if (error.status === 400) {
                this.alertService.errorAlert('Error', error.error.message)
              }
            }
          );
        }
      });
    } else {
      this.orientadorServices.createOrientador(this.token, formData).subscribe(
        data => {
          setTimeout(() => {
            this.alerService.successAlert('Exito', data.message);
            this.router.navigate(['/list-orientador']);
          }, this.tiempoEspera);
        },
        error => {
          console.log(error);
          if (error.status === 400) {
            this.alerService.errorAlert('Error', error.error.message);
          }
        }
      );
    }
  }
  /*Alterna el estado activo o inactivo del orientador, actualizando el formulario con el valor correspondiente.*/
  toggleActive() {
    this.isActive = !this.isActive;
    this.orientadorForm.patchValue({ estado: this.isActive ? true : false });
  }
  /*Muestra u oculta un botón dependiendo de si se ha seleccionado un orientador para editar.*/
  mostrarToggle(): void {
    if (this.orientadorId != null) {
      this.boton = false;
    }
    this.boton = true;
  }
  /*Maneja la selección de un archivo para subir, validando su tamaño y actualizando el formulario con el archivo seleccionado. Si el archivo es demasiado grande, se resetea el campo.*/
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

        ////Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input

        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.orientadorForm.patchValue({ imagen_perfil: null });
          this.imagenPerlil_Preview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.orientadorForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPerlil_Preview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_Perfil = file;
        this.orientadorForm.patchValue({ imagen_perfil: file });
      }

    } else {
      this.resetFileField(field);
    }
  }
  /*Esta función se encarga de restablecer el campo de imagen en un formulario. Si el campo es 'imagen_perfil',
  elimina el valor actual del formulario (patchValue) y también elimina la vista previa de la imagen.*/
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.orientadorForm.patchValue({ imagen_perfil: null });
      this.imagenPerlil_Preview = null;
    }
  }
  /*Genera una vista previa de la imagen seleccionada utilizando un FileReader. Si el campo es 'imagen_perfil',
  se asigna el resultado de la lectura (la imagen convertida a base64)
  a una variable que contiene la vista previa.
  Luego, se actualiza la interfaz del componente con detectChanges()*/
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
  /* Esta función recorre los controles de un formulario y devuelve un objeto con los errores de validación encontrados en cada uno de los campos que contengan errores.*/
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

 
  /*Controla el flujo de navegación entre secciones del formulario.
  Verifica si todos los campos de la sección actual son válidos antes de avanzar a la siguiente.
  Tiene validaciones especiales para el correo electrónico y la fecha de nacimiento.
  Si la sección es válida, avanza a la siguiente sección o subsección; si no lo es, muestra un mensaje de error.*/
  next() {
    const form = this.orientadorForm;
    let sectionIsValid = true;
  
    // Obtener los campos de la sección actual
    const currentSectionFields = this.sectionFields[this.currentIndex];
  
    currentSectionFields.forEach(field => {
      const control = form.get(field);
      if (control.invalid) {
        control.markAsTouched();
        control.markAsDirty();
        sectionIsValid = false;
      }
    });
  
    // Validaciones especiales
    if (this.currentIndex === 1) { // Asumiendo que email y fecha_nac están en la sección 2
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
    /* Muestra un mensaje de error usando un servicio de alertas y lo almacena en una variable para su visualización en la interfaz.*/
    if (!sectionIsValid) {
      this.showErrorMessage('Por favor, complete correctamente todos los campos de esta sección antes de continuar.');
      return;
    }
  
    // Si llegamos aquí, la sección actual es válida
    if (this.currentSubSectionIndex < this.subSectionPerSection[this.currentIndex] - 1) {
      this.currentSubSectionIndex++;
    } else {
      if (this.currentIndex < this.subSectionPerSection.length - 1) {
        this.currentIndex++;
        this.currentSubSectionIndex = 0;
      }
    }
  
    // Limpiar el mensaje de error si existe
    this.clearErrorMessage();
  }
  
  // Función auxiliar para mostrar mensajes de error
  private showErrorMessage(message: string) {
    console.error(message);
    this.alertService.errorAlert('error', message);
    this.errorMessage = message;
  }
  
  // Función auxiliar para limpiar el mensaje de error
  private clearErrorMessage() {
    this.errorMessage = '';
  }
  /*Controla la navegación hacia la sección o subsección anterior del formulario, retrocediendo en el flujo de las secciones/subsecciones.*/
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
  /*Es un validador personalizado para verificar que la fecha ingresada sea válida.
  Asegura que la fecha no sea futura, que no sea demasiado antigua (más de 100 años), y que la persona tenga al menos 18 años.
  Si la fecha no es válida, devuelve un error específico, de lo contrario, devuelve null.*/
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
