import {ChangeDetectorRef,Component,Input,OnInit,} from '@angular/core';
import {AbstractControl, FormBuilder,FormGroup,ValidationErrors,Validators,} from '@angular/forms';
import {faCircleQuestion,} from '@fortawesome/free-solid-svg-icons';
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
  @Input() isEditing: boolean;
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
  /////
  listTipoDocumento: [] = [];
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  /////
  imagenPerlil_Preview: string | ArrayBuffer | null = null;
  selectedImagen_Perfil: File | null = null;
  formSubmitted = false;
  currentIndex: number = 0;
  currentSubSectionIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  /////
  idAsesor: number = null;
  errorMessage: string = '';


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
    fecha_nac: ['',this.dateRangeValidator],
    email: ['', [Validators.required,Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    aliado: ['', Validators.required],
    estado: true,
  });

  sectionFields: string[][] = [
    ['nombre', 'apellido', 'documento', 'id_tipo_documento','fecha_nac', 'genero'], // Sección 1
    ['celular', 'email','id_departamento', 'id_municipio', 'direccion', 'password'], // Sección 2
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
  ) {}

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
    /*para ver si lo estan editando salga la palabra editar */
    if (this.asesorId != null) {
      this.isEditing = true;
      this.asesorForm.get('password')?.setValidators([Validators.minLength(8)]);
    } else {
      this.asesorForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    
    this.asesorForm.get('password')?.updateValueAndValidity();
    this.tipoDocumento();
    this.cargarDepartamentos();
  }

  get f() {
    return this.asesorForm.controls;
  }

  /* Valida el token del login colocando el nombre del aliado para llenarlo automaticamente con el localstorage*/
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

  goBack(){
    this.location.back();
  }

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
      (data) => {
        this.listMunicipios = data;
      },
      (err) => {
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

  /* Trae la informacion del asesor cuando el asesorId no sea nulo */
  verEditar(): void {
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

          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.asesorForm.get('estado')?.setValue(this.isActive);
          });

          // Cargar los departamentos y municipios
          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.asesorForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.asesorForm.patchValue({ id_municipio: data.id_municipio });
            }, 500);
          }, 500);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }


  
  /* Crear asesor o actualiza dependendiendo del asesorId */
  addAsesor(): void {
    // Mark all form controls as touched to trigger validation
    Object.values(this.asesorForm.controls).forEach(control => {
      control.markAsTouched();
    });
  
    let errorMessage = 'Por favor, complete correctamente el formulario';
    Object.keys(this.asesorForm.controls).forEach(key => {
      const control = this.asesorForm.get(key);
      if (control.invalid && control.errors && key !== 'direccion' && 
          !(key === 'password' && this.idAsesor && !control.value)) {
        // Add specific error messages here if needed
      }
    });
    if (errorMessage !== 'Por favor, complete correctamente el formulario') {
      this.alerService.errorAlert('Error de validación', errorMessage);
      return;
    }

    // Validaciones permanentes (excluyendo dirección y contraseña en modo edición)
    if (this.asesorForm.get('nombre').invalid || 
        this.asesorForm.get('apellido').invalid || 
        this.asesorForm.get('documento').invalid || 
        this.asesorForm.get('celular').invalid ||
        (this.asesorForm.get('password').invalid && (!this.idAsesor || this.asesorForm.get('password').value))) {
      this.alerService.errorAlert('Error', 'Por favor, complete correctamente los campos obligatorios.');
      return;
    }
  
    // Validaciones opcionales
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
        return;
      }
    }
  
    const emailControl = this.asesorForm.get('email');
    if (emailControl.value && !emailControl.valid) {
      this.alerService.errorAlert('Error', 'Por favor, ingrese un email válido.');
      return;
    }

    const formData = new FormData();
    let estadoValue: string;
    if (this.idAsesor == null) {
      estadoValue = '1';
    } else {
      // Aquí falta la lógica para el caso en que idAsesor no sea null
    }

    formData.append('nombre', this.asesorForm.get('nombre')?.value);
    formData.append('apellido', this.asesorForm.get('apellido')?.value);
    formData.append('documento', this.asesorForm.get('documento')?.value);
    formData.append('celular', this.asesorForm.get('celular')?.value);
    formData.append('genero', this.asesorForm.get('genero')?.value);

    // Agregamos la dirección solo si tiene un valor
    const direccionControl = this.asesorForm.get('direccion');
    if (direccionControl && direccionControl.value) {
      formData.append('direccion', direccionControl.value);
    }

    formData.append('aliado', this.nombreAliado);
    formData.append('id_tipo_documento', this.asesorForm.get('id_tipo_documento')?.value);
    formData.append('departamento', this.asesorForm.get('id_departamento')?.value);
    formData.append('municipio', this.asesorForm.get('id_municipio')?.value);
    formData.append('email', this.asesorForm.get('email')?.value);

    // Agregamos la contraseña solo si tiene un valor o si es un nuevo asesor
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
            }
          );
        }
      });
    /* Crea asesor */
    } else {
      this.asesorService.createAsesor(this.token, formData).subscribe(
        (data) => {
          setTimeout(function() {
          }, this.tiempoEspera);
            this.alerService.successAlert('Exito', data.message);
            this.router.navigate(['/list-asesores']);
        },
        (error) => {
          console.error('Error al crear el asesor:', error);
          this.alerService.errorAlert('Error', error.error.message);
        }
      );
    }
  }

  /* Cerrar el modal */
  // cancelarModal() {
  //   this.dialogRef.close();
  // }

  /* Cambia el estado del toggle*/
  toggleActive() {
    this.isActive = !this.isActive;
    //this.asesorForm.patchValue({ estado: this.isActive ? 'Activo' : 'Inactivo' });
    this.asesorForm.patchValue({ estado: this.isActive ? true : false });
  }

  /* Muestra el toggle del estado dependiendo del asesorId que no sea nulo*/
  mostrarToggle(): void {
    if (this.asesorId != null) {
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
        this.alertService.errorAlert(
          'Error',
          `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`
        );
        this.resetFileField(field);

        ////Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input

        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: null });
          this.imagenPerlil_Preview = null; // Resetea la previsualización
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

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_Perfil = file;
        this.asesorForm.patchValue({ imagen_perfil: file });
      }
    } else {
      this.resetFileField(field);
    }
  }
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.asesorForm.patchValue({ imagen_perfil: null });
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
    Object.keys(form.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null = form.get(key)?.errors;
      if (controlErrors) {
        result[key] = controlErrors;
      }
    });
    return result;
  }


  next() {
    const form = this.asesorForm;
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
