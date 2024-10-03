import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { User } from '../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { AuthService } from '../../../servicios/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-modal-crear-superadmin',
  templateUrl: './modal-crear-superadmin.component.html',
  styleUrl: './modal-crear-superadmin.component.css'
})
export class ModalCrearSuperadminComponent implements OnInit {
  @Input() isEditing: boolean = false
  submitted: boolean = false;
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: string | null = null;
  adminId: any;
  hide = true;
  falupa = faCircleQuestion;
  estado: boolean;
  isActive: boolean = true;
  boton = true;
  tiempoEspera = 1800;
  ////
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  listTipoDocumento: any[] = [];
  ///
  imagenPerlil_Preview: string | ArrayBuffer | null = null;
  selectedImagen_Perfil: File | null = null;
  formSubmitted = false;
  currentIndex: number = 0;
  currentSubSectionIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  idSuperAdmin: number = null;
  errorMessage: string = '';
  isLoading: boolean = false;


/*
  Este código define un formulario reactivo en Angular utilizando FormBuilder para crear y gestionar un grupo 
  de campos relacionados con los datos de un super Admin. Se aplican validaciones específicas para garantizar que la entrada 
  de datos sea correcta, como la obligatoriedad, formatos adecuados (por ejemplo, solo letras, solo números, o formato 
  de correo electrónico), longitud mínima, y validaciones personalizadas para fechas. Adicionalmente, la estructura `sectionFields` 
  organiza los campos en secciones, facilitando su disposición o presentación en la interfaz de usuario. 
  El estado del super Admin se inicializa como `true`, indicando que el super Admin está activo por defecto.
*/
  superadminForm = this.fb.group({
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
    fecha_nac: ['',this.dateRangeValidator],
    email: ['', [Validators.required,Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    estado: true,
  });

  sectionFields: string[][] = [
    ['nombre', 'apellido', 'documento', 'id_tipo_documento','fecha_nac', 'genero'], // Sección 1
    ['celular', 'email','id_departamento', 'id_municipio', 'direccion', 'password'], // Sección 2
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private superadminService: SuperadminService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location:Location
  ) {}

  /*
    Este método se utiliza cuando se desea regresar a la vista anterior sin recargar la página o perder el estado actual.
  */
  goBack() {
    this.location.back();
  }

  /* Inicializa con esas funciones al cargar la pagina, 
  con los validator verificando cuando es editando y cuando es creando para que no salga error el campo vacio */
  ngOnInit(): void {
    this.validateToken();
    this.route.paramMap.subscribe(params => {
          this.idSuperAdmin = +params.get('id');
          if (this.idSuperAdmin) {
            this.isEditing = true;
            this.verEditar();
          } else {
            this.idSuperAdmin = null; // Establece claramente que no hay un id en modo creación
            this.isEditing = false;
          }
        });

    if (this.adminId != null) {
      this.isEditing = true;
      this.superadminForm.get('password')?.setValidators([Validators.minLength(8)]);
    } else {
      this.superadminForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }

    this.superadminForm.get('password')?.updateValueAndValidity();
    this.cargarDepartamentos();
    this.tipoDocumento();
  }

  get f() { return this.superadminForm.controls; } /* Validaciones */

  /*
    Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
    formulario o cualquier otra parte de la aplicación.
  */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
    El método se encarga de obtener una lista de tipos de documentos desde el servicio de autenticación (`authService`) 
    y almacenarla en la propiedad `listTipoDocumento`. 
  */
  tipoDocumento(): void {
    this.authService.tipoDocumento().subscribe(
      data => {
        this.listTipoDocumento = data;
      },
      error => {
        console.log(error);
      }
    )
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
    const target = event.target as HTMLSelectElement; // Cast a HTMLSelectElement
    const selectedDepartamento = target.value;

    // Guarda el departamento seleccionado en el localStorage
    localStorage.setItem('departamento', selectedDepartamento);

    // Llama a cargarMunicipios si es necesario
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
    if (this.idSuperAdmin != null) {
      this.superadminService.getsuperadmin(this.token,this.idSuperAdmin).subscribe(
        data => {
          this.superadminForm.patchValue({
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
            email: data.email,
            password: '',
            estado: data.estado,
          });
          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.superadminForm.get('estado')?.setValue(this.isActive);
          });
          // Cargar los departamentos y municipios
          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.superadminForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.superadminForm.patchValue({ id_municipio: data.id_municipio });
            }, 500);
          }, 500);
          this.isLoading = false;
        },
        error => {
          console.error(error);
          this.isLoading = false;
        }
      )
    }
  }

  /*
    Este método gestiona la creación o actualización de un super Admin mediante la recolección de datos desde un formulario reactivo (`superadminForm`) 
    y la validación de la información ingresada. El método determina si se está editando un super Admin existente o creando uno nuevo. 
    En el caso de una actualización, se solicita confirmación al usuario antes de realizar la actualización mediante el servicio `superadminService`. 
    Si se trata de una creación de super Admin, se realiza la llamada al servicio correspondiente, mostrando alertas de éxito o error según sea necesario.
  */
  addSuperadmin(): void {
    Object.values(this.superadminForm.controls).forEach(control => {
      control.markAsTouched();
    });
  
    const camposObligatorios = ['nombre', 'apellido', 'documento', 'celular', 'direccion', 'email', 'password'];
    for (const key of camposObligatorios) {
        const control = this.superadminForm.get(key);
        if (control && control.value && control.value.trim() === '') {
            this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
            return;
        }
    }

    // Validaciones permanentes (excluyendo dirección y contraseña en modo edición)
    if (this.superadminForm.get('nombre').invalid || 
        this.superadminForm.get('apellido').invalid || 
        this.superadminForm.get('documento').invalid || 
        this.superadminForm.get('celular').invalid ||
        (this.superadminForm.get('password').invalid && (!this.idSuperAdmin || this.superadminForm.get('password').value))) {
      this.alertService.errorAlert('Error', 'Por favor, complete correctamente los campos obligatorios.');
      return;
    }
  
    // Validaciones opcionales
    const fechaNacControl = this.superadminForm.get('fecha_nac');
    if (fechaNacControl.value) {
      const fechaNac = new Date(fechaNacControl.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      if (edad < 18 || edad > 100) {
        this.alertService.errorAlert('Error', 'Debes ser mayor de edad');
        return;
      }
    }
  
    const emailControl = this.superadminForm.get('email');
    if (emailControl.value && !emailControl.valid) {
      this.alertService.errorAlert('Error', 'Por favor, ingrese un email válido.');
      return;
    }
  
    const formData = new FormData();
    let estadoValue: string;
    if (this.idSuperAdmin == null) {
      estadoValue = '1';
    } else {
    }
    formData.append('nombre', this.superadminForm.get('nombre')?.value);
    formData.append('apellido', this.superadminForm.get('apellido')?.value);
    formData.append('documento', this.superadminForm.get('documento')?.value);
    formData.append('celular', this.superadminForm.get('celular')?.value);
    formData.append('genero', this.superadminForm.get('genero')?.value);
  
    if (this.superadminForm.get('direccion')?.value) {
      formData.append('direccion', this.superadminForm.get('direccion')?.value);
    } else { }
  
    formData.append('id_tipo_documento', this.superadminForm.get('id_tipo_documento')?.value);
    formData.append('departamento', this.superadminForm.get('id_departamento')?.value);
    formData.append('municipio', this.superadminForm.get('id_municipio')?.value);
    formData.append('email', this.superadminForm.get('email')?.value);

    const passwordControl = this.superadminForm.get('password');
    if (passwordControl && (passwordControl.value || !this.idSuperAdmin)) {
      if (passwordControl.valid) {
        formData.append('password', passwordControl.value);
      } else {
        this.alertService.errorAlert('Error', 'La contraseña no cumple con los requisitos.');
        return;
      }
    }
  
    Object.keys(this.superadminForm.controls).forEach((key) => {
      const control = this.superadminForm.get(key);
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
          formData.append(key, control.value ? '1' : '0');
        }
         else if (key !== 'imagen_perfil' && key !== 'direccion' && 
                  !(key === 'password' && this.idSuperAdmin && !control.value)) {
          formData.append(key, control.value);
        }
      }
    });
  
    if (this.selectedImagen_Perfil) {
      formData.append('imagen_perfil', this.selectedImagen_Perfil, this.selectedImagen_Perfil.name);
    }  
    /* Actualiza superadmin */
    if (this.idSuperAdmin != null) {
      this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
        if (result.isConfirmed) {
          this.superadminService.updateAdmin(this.token, this.idSuperAdmin, formData).subscribe(
            (data) => {
              setTimeout(function (){
              }, this.tiempoEspera);
              this.router.navigate(['/list-superadmin']);
              this.alertService.successAlert('Exito', data.message)
            },
            error => {
              console.error(error);
              if (error.status === 400) {
                this.alertService.errorAlert('Error', error.error.message)
              }
            }
          )
        }
      });
    /* Crea superadmin */
    } else {
      this.superadminService.createSuperadmin(this.token, formData).subscribe(
        data => {
          setTimeout(function () {
          },this.tiempoEspera);
          this.alertService.successAlert('Exito', data.message);
          this.router.navigate(['/list-superadmin']);
        },
        error => {
          console.error(error);
          if (error.status === 400) {
            this.alertService.errorAlert('Error', error.error.message)
          }
        }
      );
    }
  }

  /*
      Este método es útil para gestionar la activación/desactivación de un super Admin en la interfaz de usuario.
  */
  toggleActive() {
    this.isActive = !this.isActive;
    this.superadminForm.patchValue({ estado: this.isActive ? true : false });
  }

  /*
   Este método gestiona la visibilidad de un botón en la interfaz de usuario. 
  */
  mostrarToggle(): void {
    if (this.adminId != null) {
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
        maxSize = 5 * 1024 * 1024; // 5MB para imágenes
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert(
          'Error',
          `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`
        );
        this.resetFileField(field);

        ////Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input

        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.superadminForm.patchValue({ imagen_perfil: null });
          this.imagenPerlil_Preview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.superadminForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPerlil_Preview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_Perfil = file;
        this.superadminForm.patchValue({ imagen_perfil: file });
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
      this.superadminForm.patchValue({ imagen_perfil: null });
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
    Este método es responsable de validar los campos del formulario de un componente 
    y gestionar la navegación entre diferentes secciones del formulario.
  */
  next() {
    const form = this.superadminForm;
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