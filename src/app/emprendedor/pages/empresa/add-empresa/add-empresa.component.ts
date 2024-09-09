import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators, AbstractControl, MinLengthValidator } from '@angular/forms';
import { EmprendedorService } from '../../../../servicios/emprendedor.service';
import { AlertService } from '../../../../servicios/alert.service';
import { DepartamentoService } from '../../../../servicios/departamento.service';
import { EmpresaService } from '../../../../servicios/empresa.service';
import { MunicipioService } from '../../../../servicios/municipio.service';
import { User } from '../../../../Modelos/user.model';
import { AuthService } from '../../../../servicios/auth.service';
import { Empresa } from '../../../../Modelos/empresa.model';
import { ApoyoEmpresa } from '../../../../Modelos/apoyo-empresa.modelo';
import { ActivatedRoute, Router } from '@angular/router';
import { data } from 'jquery';
import { Location } from '@angular/common';


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
  isLoading: boolean = true; // Variable para gestionar el estado de carga
  selectedApoyoDocumento: string = '';
  mostrarBotonEditar: boolean = true;
  mostrarBotonesNuevos: boolean = false;
  tiempoEspera = 1800;
  nombre_apoyo: string;
  apellido_apoyo: string;
  ////
  showFirstSection = true;
  showSecondSection = false;
  showThirdSection = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private EmpresaService: EmpresaService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,
    private authService:AuthService,
    private route: ActivatedRoute, 
    private location: Location

  ) {
    this.id_documentoEmpresa = this.route.snapshot.paramMap.get('documento');
    this.id_emprendedor = this.route.snapshot.paramMap.get('id_emprendedor'); 
    console.log("EMPRENDEDOR",this.id_emprendedor);
    console.log("DOCUMENTO",this.id_documentoEmpresa)

    this.addEmpresaForm = this.fb.group({
      nombre: ['', [Validators.required, this.noNumbersValidator, Validators.minLength(4)]],
      correo: ['', [Validators.required, Validators.email, this.emailValidator]],
      id_tipo_documento: ['', Validators.required],
      documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
      razonSocial: ['', Validators.required],
      id_departamento: ['', Validators.required],
      id_municipio: ['', Validators.required],
      telefono: ['', [Validators.maxLength(10), this.noLettersValidator]],
      celular: ['', [Validators.required, Validators.maxLength(10), this.noLettersValidator ]],
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
      telefono: [''],
      celular: ['', [Validators.required, Validators.maxLength(10), this.noLettersValidator ]],
      email: ['', [Validators.required, Validators.email]],
      id_tipo_documento: ['', Validators.required],
    });
  }


  ngOnInit(): void {
    this.validateToken();
    this.cargarDepartamentos();
    this.tipodato();
    this.cargarDatosEmpresa();
    this.cargarDepartamentos();
    this.cargarApoyos();
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

  goBack(): void {
    this.location.back();
  }


  //Funcion para cargar los departamentos
  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
        //console.log('Departamentos cargados:', JSON.stringify(data));
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
      (data) => {
        this.listMunicipios = data;
        //console.log('Municipios cargados:', JSON.stringify(data));
      },
      (err) => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }
  

  tipodato():void{
      this.authService.tipoDocumento().subscribe(
        data => {
          this.listTipoDocumento = data;
          //console.log('datos tipo de documento: ',data)
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

  setFormValues(): void {
    if (!this.empresa) {
      console.error('No se ha cargado la empresa, no se puede establecer los valores del formulario.');
      return; // Salir de la función si empresa es undefined
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

  cargarDatosEmpresa(): void {
    this.EmpresaService.traerEmpresasola(this.token, this.id_emprendedor, this.id_documentoEmpresa).subscribe(
      data => {
        this.empresa = data;
        this.apoyo = data.apoyo;

        console.log('empresa', data); // Verifica los datos cargados
        this.setFormValues();
        this.cargarDepartamentos();

        setTimeout(() => {
          // Establecer el departamento seleccionado
          this.addEmpresaForm.patchValue({ id_municipio: data.id_departamentos });

          // Cargar los municipios de ese departamento
          this.cargarMunicipios(data.id_departamento);

          setTimeout(() => {
            // Establecer el municipio seleccionado
            this.addEmpresaForm.patchValue({ id_municipio: data.id_municipio });
          }, 500);
        }, 500);
      },
      err => {
        console.log('Error al cargar los datos de la empresa:', err);
      }
    );
  }

  crearEmpresa(): void {
    this.submitted = true;
    console.log("Formulario enviado", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);

    if (this.addEmpresaForm.invalid) {
      console.log("Formulario inválido", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos de la empresa');
      return;
    }

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
    
    if (apoyos) {
      apoyosList.push(apoyos);
    }


    const payload = {
      empresa: empresa,
      apoyos: apoyosList
    };

    console.log('Payload para la API:', payload);

    this.EmpresaService.addEmpresa(this.token, payload).subscribe(
      data => {
        console.log('Respuesta de la API (empresa creada):', data);
        this.alertService.successAlert('Éxito', 'Registro exitoso');
        this.router.navigate(['list-empresa']);
      },
      error => {
        this.alertService.errorAlert('Error', 'Ha ocurrido un error inesperado');
        console.log('Respuesta de la API ERROR:', error);
      }
    );
  }

  editEmpresa():void {
    this.submitted = true;
  
    // Verifica si el formulario es inválido
    if (this.addEmpresaForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos de la empresa');
      return;
    }
    const empresaData = this.addEmpresaForm.value;

    this.EmpresaService.updateEmpresas(this.token, this.id_documentoEmpresa, empresaData).subscribe(
      response => {
        console.log('Datos actualizados:', response);
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

  mostrarOcultarContenido() {
    const checkbox = document.getElementById("mostrarContenido") as HTMLInputElement;
    const contenidoDiv = document.getElementById("contenido");
    const guardar = document.getElementById("guardar");
    if (contenidoDiv && guardar) {
      contenidoDiv.style.display = checkbox.checked ? "block" : "none";
      guardar.style.display = checkbox.checked ? "none" : "block";
    }
  }




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

  cargarApoyos(): void {
    this.EmpresaService.getApoyo(this.token, this.id_documentoEmpresa).subscribe(
      data => {
        this.listaApoyo = data;
        console.log("apoyos", this.listaApoyo);
        if (this.listaApoyo.length > 0) {
          this.onApoyoSelect(this.listaApoyo[0].documento);
        }
      },
      error => {
        console.error(error);
      });
  }

  onApoyoSelect(documento: string) {
    const selectedApoyo = this.listaApoyo.find(apoyo => apoyo.documento === documento);
    
    if (selectedApoyo) {
      this.selectedApoyoDocumento = selectedApoyo.documento;
      this.addApoyoEmpresaForm.patchValue({
        documento: selectedApoyo.documento,
        nombre: selectedApoyo.nombre,
        apellido: selectedApoyo.apellido,
        email: selectedApoyo.email,
        cargo: selectedApoyo.cargo,
        telefono: selectedApoyo.telefono,
        celular: selectedApoyo.celular,
        id_tipo_documento: selectedApoyo.id_tipo_documento,
        id_empresa: selectedApoyo.id_empresa,
      });
      console.log("Apoyo seleccionado:", selectedApoyo);
    } else {
      console.log("No se encontró el apoyo con documento:", documento);
    }
  }

  editarApoyo():void {
    const apoyos = this.addApoyoEmpresaForm.value;
    this.submitted = true;

    if (this.addApoyoEmpresaForm.invalid) {
      console.log('Formulario inválido');
      console.log("Formulario inválido", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos del apoyo');
      return;
    }

    this.EmpresaService.updateApoyo(this.token, this.selectedApoyoDocumento, apoyos).subscribe(
      data => {
        //console.log("funcionaaaaa", this.apoyo.documento);
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

  limpiarYCambiarBotones() {
    // Limpiar los inputs (asumiendo que tienes un formulario)
    this.addApoyoEmpresaForm.reset();

    // Ocultar el botón de editar
    this.mostrarBotonEditar = false;

    // Mostrar los nuevos botones
    this.mostrarBotonesNuevos = true;

  }

  crearApoyo():void {
    this.submitted = true;
  
    if (this.addApoyoEmpresaForm.invalid) {
      console.log('Formulario inválido');
      console.log("Formulario inválido", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);
      this.alertService.errorAlert('Error', 'Debes completar todos los campos requeridos del apoyo');
      return;
    }

    const apoyos = this.addApoyoEmpresaForm.valid ? {
      documento: this.addApoyoEmpresaForm.get('documento')?.value,
      nombre: this.addApoyoEmpresaForm.get('nombre')?.value,
      apellido: this.addApoyoEmpresaForm.get('apellido')?.value,
      cargo: this.addApoyoEmpresaForm.get('cargo')?.value,
      telefono: this.addApoyoEmpresaForm.get('telefono')?.value,
      celular: this.addApoyoEmpresaForm.get('celular')?.value,
      email: this.addApoyoEmpresaForm.get('email')?.value,
      id_tipo_documento: this.addApoyoEmpresaForm.get('id_tipo_documento')?.value,
      id_empresa: this.id_documentoEmpresa,
    } : null;

    
    this.EmpresaService.crearApoyo(this.token, apoyos).subscribe(
      data => {
        console.log("funcionaaaaa el crearrr");
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

  cancel():void{
    this.cargarDatosEmpresa();

        // mostrar el botón de editar
        this.mostrarBotonEditar = true;

        // Ocultar los nuevos botones
        this.mostrarBotonesNuevos = false;

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




