import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators, AbstractControl, } from '@angular/forms';
import { AlertService } from '../../../../servicios/alert.service';
import { DepartamentoService } from '../../../../servicios/departamento.service';
import { EmpresaService } from '../../../../servicios/empresa.service';
import { MunicipioService } from '../../../../servicios/municipio.service';
import { User } from '../../../../Modelos/user.model';
import { AuthService } from '../../../../servicios/auth.service';
import { Empresa } from '../../../../Modelos/empresa.model';
import { ApoyoEmpresa } from '../../../../Modelos/apoyo-empresa.modelo';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-add-empresa',
  templateUrl: './add-empresa.component.html',
  styleUrl: './add-empresa.component.css',
  providers: [EmpresaService, DepartamentoService, MunicipioService, AlertService]
})

export class AddEmpresaComponent {
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  listTipoDocumento: [] = [];
  departamentoPredeterminado = '';
  submitted = false;
  token = '';
  id_documentoEmpresa: any;
  documento: string;
  id_emprendedor: any;
  user: User | null = null;
  currentRolId: number;
  buttonText: string = 'Guardar Cambios';
  emprendedorDocumento: string;
  currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  empresa: Empresa;
  apoyo: ApoyoEmpresa;
  addEmpresaForm: FormGroup;
  addApoyoEmpresaForm: FormGroup;
  listaApoyo: ApoyoEmpresa[] = [];
  isLoading: boolean = true;
  selectedApoyoDocumento: string;
  mostrarBotonEditar: boolean = true;
  mostrarBotonesNuevos: boolean = false;
  tiempoEspera = 1800;
  nombre_apoyo: string;
  apellido_apoyo: string;
  showFirstSection = true;
  showSecondSection = false;
  showThirdSection = false;
  ocultarSinApoyo: boolean = true;
  isEditing: boolean = false;
  nose: boolean = true;
  esVistaCreacion: boolean = false;
  charCount: number = 0;
  charCountFunciones: number = 0;
  falupa = faCircleQuestion;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private EmpresaService: EmpresaService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private cd: ChangeDetectorRef

  ) {
    this.id_documentoEmpresa = this.route.snapshot.paramMap.get('documento');
    this.id_emprendedor = this.route.snapshot.paramMap.get('id_emprendedor');

    this.addEmpresaForm = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      id_tipo_documento: ['', Validators.required],
      documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
      razonSocial: ['', Validators.required],
      id_departamento: ['', Validators.required],
      id_municipio: ['', Validators.required],
      telefono: ['', [Validators.maxLength(10), this.noLettersValidator]],
      celular: ['', [Validators.required, Validators.maxLength(10), this.noLettersValidator]],
      url_pagina: [''],
      direccion: ['', Validators.required],
      profesion: ['', [Validators.required, this.noNumbersValidator]],
      cargo: ['', [Validators.required, this.noNumbersValidator]],
      experiencia: ['', Validators.required],
      funciones: ['', Validators.required],
    });

    this.addApoyoEmpresaForm = this.fb.group({
      documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
      nombre: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
      apellido: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
      cargo: ['', Validators.required],
      telefono: ['', [Validators.maxLength(10), this.noLettersValidator]],
      celular: ['', [Validators.required, Validators.maxLength(10), this.noLettersValidator]],
      email: ['', [Validators.required, Validators.email]],
      id_tipo_documento: ['', Validators.required],
    });
  }


  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.cargarDepartamentos();
    this.tipodato();
    this.cargarDatosEmpresa();
    this.cargarDepartamentos();
    this.cargarApoyos();
    this.esVistaCreacion = !this.id_documentoEmpresa;
    
    if (this.listaApoyo && this.listaApoyo.length === 1) {
      this.onApoyoSelect(this.listaApoyo[0].documento);
    }
  }

  /* Valida el token del login */
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

  /*
    Navega a la página anterior en el historial del navegador.
    Utiliza el servicio Location para manejar la navegación de vuelta.
  */
  goBack(): void {
    this.location.back();
  }

  updateCharCount(): void {
    const experienciaValue = this.addEmpresaForm.get('experiencia')?.value || '';
    this.charCount = experienciaValue.length;
  }

  updateCharCountFunciones(): void {
    const funcionesValue = this.addEmpresaForm.get('funciones')?.value || '';
    this.charCountFunciones = funcionesValue.length;
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
    );
  }

  /*
    Maneja el evento de selección de un departamento en el formulario.
    Guarda el departamento seleccionado en localStorage y carga los municipios correspondientes.
  */
  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedDepartamento = target.value;
    localStorage.setItem('departamento', selectedDepartamento);
    this.cargarMunicipios(selectedDepartamento);
  }

  /*
    Carga los municipios correspondientes al departamento seleccionado
    utilizando el servicio MunicipioService y actualiza la lista de municipios.
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
    Obtiene el tipo de documento desde AuthService y actualiza la lista de tipos
    de documento disponibles.
  */
  tipodato(): void {
    this.authService.tipoDocumento().subscribe(
      data => {
        this.listTipoDocumento = data;
      },
      error => {
        console.log(error);
      }
    )
  }

  get f() {
    return this.addEmpresaForm.controls;
  }
  get g() {
    return this.addApoyoEmpresaForm.controls;
  }

  /*
    Establece los valores del formulario utilizando los datos de la empresa.
    Muestra un error en la consola si la empresa no ha sido cargada.
  
  */
  setFormValues(): void {
    if (!this.empresa) {
      console.error('No se ha cargado la empresa, no se puede establecer los valores del formulario.');
      return;
    }

    // Establece los valores para el formulario de empresa
    this.addEmpresaForm.patchValue({
      nombre: this.empresa.nombre || '',
      correo: this.empresa.correo || '',
      id_tipo_documento: this.empresa.id_tipo_documento || '',
      documento: this.empresa.documento || '',
      razonSocial: this.empresa.razonSocial || '',
      id_departamento: this.empresa.id_departamento || '',
      id_municipio: this.empresa.id_municipio || '',
      direccion: this.empresa.direccion || '',
      telefono: this.empresa.telefono || '',
      celular: this.empresa.celular || '',
      url_pagina: this.empresa.url_pagina || '',
      profesion: this.empresa.profesion || '',
      cargo: this.empresa.cargo || '',
      experiencia: this.empresa.experiencia || '',
      funciones: this.empresa.funciones || ''
    });

    // Establece los valores para el formulario de apoyo si existe
    if (this.apoyo) {
      this.addApoyoEmpresaForm.patchValue({
        documento: this.apoyo.documento || '',
        nombre: this.apoyo.nombre || '',
        apellido: this.apoyo.apellido || '',
        cargo: this.apoyo.cargo || '',
        telefono: this.apoyo.telefono || '',
        celular: this.apoyo.celular || '',
        email: this.apoyo.email || '',
        id_tipo_documento: this.apoyo.id_tipo_documento || '',
      });
    }
  }
  /*
    Carga los datos de la empresa utilizando el servicio EmpresaService, 
    y actualiza los valores en el formulario.
  */
  cargarDatosEmpresa(): void {
    this.isLoading = true;
    this.EmpresaService.traerEmpresasola(this.token, this.id_emprendedor, this.id_documentoEmpresa).subscribe(
      data => {
        this.empresa = data;
        this.apoyo = data.apoyo;

        this.setFormValues();
        this.cargarDepartamentos();
        this.cargarApoyos();
        setTimeout(() => {
          this.addEmpresaForm.patchValue({ id_municipio: data.id_departamentos });
          this.cargarMunicipios(data.id_departamento);
          setTimeout(() => {
            this.addEmpresaForm.patchValue({ id_municipio: data.id_municipio });
          }, 500);
        }, 500);
        this.isLoading = false;
      },
      err => {
        console.log('Error al cargar los datos de la empresa:', err);
        this.isLoading = false;
      }
    );
  }

  crearEmpresa(): void {
    this.submitted = true;
    if (this.addEmpresaForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos del formulario');
      return;
    }

    const camposObligatorios = ['nombre', 'correo', 'documento', 'razonSocial', 'direccion', 'telefono', 'celular', 'url_pagina', 'profesion', 'cargo', 'experiencia', 'funciones'];
    for (const key of camposObligatorios) {
      const control = this.addEmpresaForm.get(key);
      if (control && control.value && control.value.trim() === '') {
        this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
        return;
      }
    }

    /*
      Crea un objeto de tipo empresa con los valores actuales del formulario 'addEmpresaForm'.
    */
    const empresa: any = {
      documento: this.addEmpresaForm.get('documento')?.value,
      nombre: this.addEmpresaForm.get('nombre')?.value,
      correo: this.addEmpresaForm.get('correo')?.value,
      cargo: this.addEmpresaForm.get('cargo')?.value,
      razonSocial: this.addEmpresaForm.get('razonSocial')?.value,
      url_pagina: this.addEmpresaForm.get('url_pagina')?.value,
      telefono: this.addEmpresaForm.get('telefono')?.value,
      celular: this.addEmpresaForm.get('celular')?.value,
      direccion: this.addEmpresaForm.get('direccion')?.value,
      profesion: this.addEmpresaForm.get('profesion')?.value,
      experiencia: this.addEmpresaForm.get('experiencia')?.value,
      funciones: this.addEmpresaForm.get('funciones')?.value,
      id_tipo_documento: this.addEmpresaForm.get('id_tipo_documento')?.value,
      id_departamento: this.addEmpresaForm.get('id_departamento')?.value,
      id_municipio: this.addEmpresaForm.get('id_municipio')?.value,
      id_emprendedor: this.user?.emprendedor.documento,
    };

    /*
      Valida que los campos obligatorios en el formulario 'addApoyoEmpresaForm' no contengan solo espacios en blanco. 
      Si un campo obligatorio está vacío o tiene solo espacios, muestra un mensaje de error.
    */
    const camposObligatoriosApoyo = ['nombre', 'apellido', 'documento', 'cargo', 'email', 'celular', 'telefono'];
    for (const key of camposObligatoriosApoyo) {
      const control = this.addApoyoEmpresaForm.get(key);
      if (control && control.value && control.value.trim() === '') {
        this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
        return;
      }
    }

    /*
      Crea un objeto 'apoyos' con los valores del formulario 'addApoyoEmpresaForm' si es válido. 
      Los datos incluyen información personal y de contacto, además de la relación con la empresa.
    */
    const apoyos = this.addApoyoEmpresaForm.valid ? {
      documento: this.addApoyoEmpresaForm.get('documento')?.value,
      nombre: this.addApoyoEmpresaForm.get('nombre')?.value,
      apellido: this.addApoyoEmpresaForm.get('apellido')?.value,
      cargo: this.addApoyoEmpresaForm.get('cargo')?.value,
      telefono: this.addApoyoEmpresaForm.get('telefono')?.value,
      celular: this.addApoyoEmpresaForm.get('celular')?.value,
      email: this.addApoyoEmpresaForm.get('email')?.value,
      id_tipo_documento: this.addApoyoEmpresaForm.get('id_tipo_documento')?.value,
      id_empresa: empresa.documento,
    } : null;

    const apoyosList: Array<any> = [];

    /*
      Si el objeto 'apoyos' no es nulo, se agrega a la lista de 'apoyosList'. 
      Posteriormente, se crea un objeto 'payload' que incluye los datos de la empresa y la lista de apoyos.
    */
    if (apoyos) {
      apoyosList.push(apoyos);
    }

    const payload = {
      empresa: empresa,
      apoyos: apoyosList
    };

    this.EmpresaService.addEmpresa(this.token, payload).subscribe(
      data => {
        this.alertService.successAlert('Éxito', 'Registro exitoso');
        this.router.navigate(['list-empresa']);
      },
      error => {
        this.alertService.errorAlert('Error', error.error.message);
        console.log('ERROR:', error.message);
      }
    );
  }

  /*
    Método para editar una empresa. Valida el formulario; si es inválido, muestra un error. 
  */
  editEmpresa(): void {
    this.submitted = true;
    if (this.addEmpresaForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos de la empresa');
      return;
    }
    const empresaData = this.addEmpresaForm.value;
    this.EmpresaService.updateEmpresas(this.token, this.id_documentoEmpresa, empresaData).subscribe(
      response => {
        setTimeout(function () {
        }, this.tiempoEspera);
        this.alertService.successAlert('Exito', 'Empresa editado con exito');
        this.router.navigate(['list-empresa']);
      },
      error => {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar la empresa: ' + error.message);
      }
    );
  }

  /*
  Método para mostrar u ocultar contenido basado en el estado de un checkbox. 
  Si el checkbox está marcado, muestra el div de contenido y oculta el botón de guardar; 
  de lo contrario, oculta el contenido y muestra el botón.
*/
  mostrarOcultarContenido() {
    const checkbox = document.getElementById("mostrarContenido") as HTMLInputElement;
    const contenidoDiv = document.getElementById("contenido");
    const guardar = document.getElementById("guardar");
    if (contenidoDiv && guardar) {
      contenidoDiv.style.display = checkbox.checked ? "block" : "none";
      guardar.style.display = checkbox.checked ? "none" : "block";
    }
  }

  /*
    Método para avanzar a la siguiente sección. 
    Muestra la segunda sección si está en la primera, 
    y muestra la tercera sección si está en la segunda, 
    actualizando el índice actual en cada caso.
  */

  next() {
    if (this.currentIndex === 0) {
      this.showFirstSection = false;
      this.showSecondSection = true;
      this.showThirdSection = false;
      this.currentIndex = 1;
    } else if (this.currentIndex === 1) {
      this.showFirstSection = false;
      this.showSecondSection = false;
      this.showThirdSection = true;
      this.currentIndex = 2;
    }
  }
  /*
    Método para retroceder a la sección anterior. 
    Muestra la primera sección si está en la segunda, 
    y muestra la segunda sección si está en la tercera, 
    actualizando el índice actual en cada caso.
  */
  previous() {
    if (this.currentIndex === 1) {
      this.showFirstSection = true;
      this.showSecondSection = false;
      this.showThirdSection = false;
      this.currentIndex = 0;
    } else if (this.currentIndex === 2) {
      this.showFirstSection = false;
      this.showSecondSection = true;
      this.showThirdSection = false;
      this.currentIndex = 1;
    }
  }
  /*
    Método para obtener los errores de validación de un formulario. 
  */

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

  /*
    Carga apoyos de la empresa y actualiza el estado de edición. 
  */
  cargarApoyos(): void {
    this.EmpresaService.getApoyo(this.token, this.id_documentoEmpresa).subscribe(
      data => {
        this.listaApoyo = data;
        if (this.listaApoyo && this.listaApoyo.length > 0 ) {
          this.ocultarSinApoyo = false;
          this.isEditing = true;
          this.mostrarBotonesNuevos = false;
          this.onApoyoSelect(this.listaApoyo[0].documento);
        } else {
          this.ocultarSinApoyo = true;
          this.isEditing = false;
          this.mostrarBotonesNuevos = false;
          this.onApoyoSelect(this.listaApoyo[0].documento);
        }
        this.cd.detectChanges();
      },
      error => {
        console.error(error);
      }
    );
  }

  /*
  Maneja la selección de un apoyo. 
  Busca el apoyo seleccionado, activa la edición y 
  actualiza el formulario con los datos del apoyo.
*/
onApoyoSelect(documento: string) {
  this.selectedApoyoDocumento = documento;
  const selectedApoyo = this.listaApoyo.find(apoyo => apoyo.documento === documento);
  if (selectedApoyo) {
    this.addApoyoEmpresaForm.patchValue(selectedApoyo);
  }
}

  /*
    Método para editar un apoyo. 
  */
  editarApoyo(): void {
    const apoyos = this.addApoyoEmpresaForm.value;
    this.submitted = true;

    if (this.addApoyoEmpresaForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos del apoyo');
      return;
    }

    this.EmpresaService.updateApoyo(this.token, this.selectedApoyoDocumento, apoyos).subscribe(
      data => {
        setTimeout(function () {
          location.reload();
        }, this.tiempoEspera);
        this.alertService.successAlert('Exito', 'Apoyo editado con exito');
      },
      error => {
        console.error(error);
      }
    )
  }

  /*
  Restablece el formulario y ajusta la visibilidad de los botones. 
  Oculta el botón de editar y muestra los botones nuevos.
*/
  limpiarYCambiarBotones() {
    this.addApoyoEmpresaForm.reset();
    this.mostrarBotonEditar = false;
    this.mostrarBotonesNuevos = true;
  }

  /*
    Método para crear un nuevo apoyo. 
  */

  crearApoyo(): void {
    this.submitted = true;
    if (this.addApoyoEmpresaForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos del apoyo');
      return;
    }
    const apoyos : any = {
      documento: this.addApoyoEmpresaForm.get('documento')?.value,
      nombre: this.addApoyoEmpresaForm.get('nombre')?.value,
      apellido: this.addApoyoEmpresaForm.get('apellido')?.value,
      cargo: this.addApoyoEmpresaForm.get('cargo')?.value,
      telefono: this.addApoyoEmpresaForm.get('telefono')?.value,
      celular: this.addApoyoEmpresaForm.get('celular')?.value,
      email: this.addApoyoEmpresaForm.get('email')?.value,
      id_tipo_documento: this.addApoyoEmpresaForm.get('id_tipo_documento')?.value,
      id_empresa: this.id_documentoEmpresa,
    };

    this.EmpresaService.crearApoyo(this.token, apoyos).subscribe(
      data => {
        setTimeout(function () {
          location.reload();
        }, this.tiempoEspera);
        this.alertService.successAlert('Exito', 'Apoyo creado con exito');

      },
      error => {
        console.error(error);
      }
    )
  }

  /*
    Método para cancelar la acción actual. 
  */
  cancel(): void {
    this.cargarDatosEmpresa();
    this.mostrarBotonEditar = true;
    this.mostrarBotonesNuevos = false;
  }

  /*
  Validador para comprobar que un campo no contenga números. 
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
    Validador para verificar la longitud de un número de documento. 
    Retorna un error si la longitud no está entre 5 y 13 dígitos; 
  */
  documentoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? control.value.toString() : '';
    if (value.length < 5 || value.length > 13) {
      return { lengthError: 'El número de documento debe tener entre 5 y 13 dígitos *' };
    }
    return null;
  }
  /*
    Validador para comprobar que un campo no contenga letras. 
    Retorna un error si se encuentran letras; de lo contrario, retorna null.
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
}




