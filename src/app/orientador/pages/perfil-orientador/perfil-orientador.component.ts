import { Component, ChangeDetectorRef, } from '@angular/core';
import { AbstractControl, FormBuilder, Validators, ValidationErrors, FormGroup } from '@angular/forms';
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
  blockedInputs = true;
  blockedInputsCORREO = true;
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
  orientadorId: number
  perfilPreview: string | ArrayBuffer | null = null;
  isHidden = true;
  showEditButton = false;
  tiempoEspera = 1800;
  falupa = faCircleQuestion;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  buttonMessage: string = "Guardar cambios";


  /*
    Define un formulario reactivo para el perfil del orientador.
  */
  perfilorientadorForm = this.fb.group({
    documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
    nombre: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
    apellido: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
    celular: ['', [Validators.required, this.celularValidator]],
    imagen_perfil: [Validators.required],
    // email: ['', [Validators.required, Validators.email, this.emailValidator]],
    email: [{ value: '', disabled: true }],
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

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.bloquearcorreo();
    this.isAuthenticated = this.authServices.isAuthenticated();
    this.verEditar();
    this.cargarDepartamentos();
    this.tipodato();
    this.initializeFormState();
  }

  /*
  Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
  formulario o cualquier otra parte de la aplicación.
  */
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

  /*
    Carga la información del orientador para editar su perfil. 
  */
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
          this.cargarDepartamentos();
          setTimeout(() => {
            this.perfilorientadorForm.patchValue({ id_municipio: data.id_departamentos });

            this.cargarMunicipios(data.id_departamento);
            setTimeout(() => {
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

  /*
  Obtiene la lista de tipos de documentos a través del servicio de autenticación. 
  Los datos recibidos se almacenan en la propiedad listTipoDocumento.
*/
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

  bloquearcorreo():void{
    this.blockedInputsCORREO = true;
  }

  /*
    Actualiza la información del orientador utilizando un FormData. 
  */
  updateOrientador(): void {
    const formData = new FormData();
    let estadoValue: string;
    this.isSubmitting = true;
    this.buttonMessage = "Guardando...";

    if (this.perfilorientadorForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar los campos requeridos por el perfil')
      this.submitted = true;
      this.isSubmitting = false;
      this.buttonMessage = "Guardar cambios";
      return
    }

    const camposObligatorios = ['nombre', 'apellido', 'password'];
    for (const key of camposObligatorios) {
      const control = this.perfilorientadorForm.get(key);
      if (control && control.value && control.value.trim() === '') {
        this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
        this.isSubmitting = false;
        this.buttonMessage = "Guardar cambios";
        return;
      }
    }


    Object.keys(this.perfilorientadorForm.controls).forEach((key) => {
      const control = this.perfilorientadorForm.get(key);
      if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
        if (key === 'password') {
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
            this.desactivarboton();
            this.buttonMessage = "Guardando...";
            this.isSubmitting = false;
            setTimeout(function () {
              location.reload();
            }, 2000);
            this.alertService.successAlert('Exito', data.message);
          },
          (error) => {
            this.isSubmitting = false;
            this.buttonMessage = "Guardar cambios";
            console.error('Error from server:', error);
            this.alertService.errorAlert('Error', error.error.message);
          }
        );
      } else {
        this.isSubmitting = false;
        this.buttonMessage = "Guardar cambios";
      }
    });
  }

  desactivarboton():void{
    const guardarBtn = document.getElementById('guardarBtn') as HTMLButtonElement;
    if (guardarBtn) {
// Cambia el cursor para indicar que está deshabilitado
      guardarBtn.style.pointerEvents = 'none';
    }
  }

  /*
    Registra en la consola los errores de validación de cada control 
    del formulario perfilorientadorForm. Para cada control que tiene 
    errores, se imprime el nombre del control y los errores correspondientes.
  */
  logFormErrors(): void {
    Object.keys(this.perfilorientadorForm.controls).forEach(key => {
      const controlErrors = this.perfilorientadorForm.get(key)?.errors;
      if (controlErrors) {
        console.error(`Error en el control ${key}:`, controlErrors);
      }
    });
  }



  get f() { return this.perfilorientadorForm.controls; }

  /*
  Inicializa el estado del formulario deshabilitando ciertos campos 
  específicos del formulario perfilorientadorForm.
*/
  initializeFormState(): void {
    const fieldsToDisable = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    fieldsToDisable.forEach(field => {
      const control = this.perfilorientadorForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  /*
  Alterna el estado de bloqueo de los campos de entrada en el formulario 
  perfilorientadorForm. 
*/
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
    this.cdRef.detectChanges();

  }
  /*
    Carga la lista de departamentos a través del servicio departamentoService.
    
  */
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

  /*
      Este método se activa cuando un usuario selecciona un departamento de la lista desplegable. 
      Finalmente, llama al método `cargarMunicipios(selectedDepartamento)`, que carga los municipios 
      asociados al departamento seleccionado
    */
  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedDepartamento = target.value;
    localStorage.setItem('departamento', selectedDepartamento);
    this.perfilorientadorForm.get('id_municipio')?.setValue(null);
    this.listMunicipios = [];
    this.cargarMunicipios(selectedDepartamento);
  }

  /*
        Este método se encarga de obtener una lista de municipios asociados a un departamento específico.
      */
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

  /*
      Este método se encarga de restablecer el campo de archivo a su estado inicial, 
      eliminando cualquier valor previamente asignado.
    */
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.perfilorientadorForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.perfilPreview = null;
    }
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: null });
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: previewUrl });
          this.perfilPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.perfilorientadorForm.patchValue({ imagen_perfil: file });
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
        this.perfilPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }
  // Restaura los datos originales
  onCancel(): void {
    location.reload();
  }

  /*muestra boton de guardar cambios*/
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
    El método se encarga de obtener una lista de tipos de documentos desde el servicio de autenticación (`authService`) 
    y almacenarla en la propiedad `listTipoDocumento`. 
  */
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
  Valida el formato del correo electrónico ingresado.
*/
  emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasAtSymbol = /@/.test(value);

    if (!hasAtSymbol) {
      return { emailInvalid: 'El correo debe ser válido *' };
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