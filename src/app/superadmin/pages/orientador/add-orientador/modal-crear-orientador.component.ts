import { Component, OnInit, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
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
    fecha_nac: [''],
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
    //this.orientadorId = data.orientadorId;
  }

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
      //this.verEditar(); // Llama a verEditar si estás editando un orientador
    } else {
      this.orientadorForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.orientadorForm.get('password')?.updateValueAndValidity();
    this.tipoDocumento();
    this.cargarDepartamentos();

  }

  get f() { return this.orientadorForm.controls; } //aquii


  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

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

  goBack(): void {
    this.location.back();
  }

  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
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

  verEditar(): void {
    if (this.idOrientador != null) {
      this.orientadorServices.getinformacionOrientador(this.token, this.idOrientador).subscribe(
        data => {
          console.log('datossssss: ', data);
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
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  addOrientador(): void {
    // Mark all form controls as touched to trigger validation
    Object.values(this.orientadorForm.controls).forEach(control => {
      control.markAsTouched();
    });
  
    let errorMessage = 'Por favor, complete correctamente el formulario';
    Object.keys(this.orientadorForm.controls).forEach(key => {
      const control = this.orientadorForm.get(key);
      if (control.invalid && control.errors && key !== 'direccion' && 
          !(key === 'password' && this.idOrientador && !control.value)) {
        // Add specific error messages here if needed
      }
    });
    if (errorMessage !== 'Por favor, complete correctamente el formulario') {
      this.alerService.errorAlert('Error de validación', errorMessage);
      return;
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
    console.log('Datos del formulario:', this.orientadorForm.value);
  
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

  toggleActive() {
    this.isActive = !this.isActive;
    console.log("Estado después de toggle:", this.isActive);
    this.orientadorForm.patchValue({ estado: this.isActive ? true : false });
  }
  mostrarToggle(): void {
    if (this.orientadorId != null) {
      this.boton = false;
    }
    this.boton = true;
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
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.orientadorForm.patchValue({ imagen_perfil: null });
      this.imagenPerlil_Preview = null;
    }
  }
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
    this.errorMessage = message;
  }
  
  // Función auxiliar para limpiar el mensaje de error
  private clearErrorMessage() {
    this.errorMessage = '';
  }
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
}
