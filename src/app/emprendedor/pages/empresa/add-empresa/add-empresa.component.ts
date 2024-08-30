import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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


@Component({
  selector: 'app-add-empresa',
  templateUrl: './add-empresa.component.html',
  styleUrl: './add-empresa.component.css',
  providers: [EmpresaService, DepartamentoService, MunicipioService, AlertService]
})

export class AddEmpresaComponent {
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  listTipoDocumento: []= [];
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private EmpresaService: EmpresaService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,
    private authService:AuthService,
    private route: ActivatedRoute, 

  ) {
    this.id_documentoEmpresa = this.route.snapshot.paramMap.get('documento');
    this.id_emprendedor = this.route.snapshot.paramMap.get('id_emprendedor'); 
    console.log("EMPRENDEDOR",this.id_emprendedor);
    console.log("DOCUMENTO",this.id_documentoEmpresa)
  }


  ngOnInit(): void {
    this.validateToken();
    this.cargarDepartamentos();
    this.tipodato();
    
    this.cargarDatosEmpresa();
    this.cargarDepartamentos();
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

  addEmpresaForm = this.fb.group({
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    id_tipo_documento: ['', Validators.required],
    documento: ['', Validators.required],
    razonSocial: ['', Validators.required],
    id_departamento: ['', Validators.required],
    id_municipio: ['', Validators.required],
    telefono: [''],
    celular: ['', Validators.required],
    url_pagina: ['', Validators.required],
    direccion: ['', Validators.required],
    profesion: ['', Validators.required],
    cargo: ['', Validators.required],
    experiencia: ['', Validators.required],
    funciones: ['', Validators.required],
  });

  addApoyoEmpresaForm = this.fb.group({
    documento: ['', Validators.required],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    cargo: ['', Validators.required],
    telefono: [''],
    celular: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    id_tipo_documento: ['', Validators.required],
  });

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
    // if (this.id_documentoEmpresa == null){
    //   if (this.addEmpresaForm || this.addApoyoEmpresaForm){

    //     this.submitted = true;
    //     console.log("Formulario enviado", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);
    
    //     if (this.addEmpresaForm.invalid) {
    //       this.submitted = true;
    //       console.log("aqui",this.submitted)   
    //     return; // Detiene la ejecución si el formulario es inválido
          
    //   }
    //   console.error('Formulario inválido');
    //   console.log('Errores empresa:', this.getFormValidationErrors(this.addEmpresaForm));
    //   console.log('Errores apoyo:', this.getFormValidationErrors(this.addApoyoEmpresaForm));
    //   return;
    //   }
    // }
    //const formData = new FormData();
    const empresa =  this.addEmpresaForm.value;
    // any = {
    //   documento: this.addEmpresaForm.get('documento')?.value,
    //   nombre: this.addEmpresaForm.get('nombre')?.value,
    //   correo: this.addEmpresaForm.get('correo')?.value,
    //   cargo: this.addEmpresaForm.get('cargo')?.value,
    //   razonSocial: this.addEmpresaForm.get('razonSocial')?.value,
    //   url_pagina: this.addEmpresaForm.get('url_pagina')?.value,
    //   telefono: this.addEmpresaForm.get('telefono')?.value,
    //   celular: this.addEmpresaForm.get('celular')?.value,
    //   direccion: this.addEmpresaForm.get('direccion')?.value,
    //   profesion: this.addEmpresaForm.get('profesion')?.value,
    //   experiencia: this.addEmpresaForm.get('experiencia')?.value,
    //   funciones: this.addEmpresaForm.get('funciones')?.value,
    //   id_tipo_documento: this.addEmpresaForm.get('id_tipo_documento')?.value,
    //   id_departamento: this.addEmpresaForm.get('id_departamento')?.value,
    //   id_municipio: this.addEmpresaForm.get('id_municipio')?.value,
    //   id_emprendedor: this.user?.emprendedor.documento,
    // };

  //   const specificFields = ['documento', 'nombre', 'correo', 'cargo', 'razonSocial', 'url_pagina', 'telefono', 'celular', 'direccion', 'profesion', 'experiencia', 'funciones', 'id_tipo_documento', 'id_departamento', 'id_municipio' ];
  // specificFields.forEach(field => {
  //   const value = this.addEmpresaForm.get(field)?.value;
  //   if (value !== null && value !== undefined && value !== '') {
  //     formData.append(field, value);
  //   }
  // });

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

    // if (this.id_documentoEmpresa != null){
    //   this.EmpresaService.updateEmpresas(this.token, this.id_documentoEmpresa, this.emprendedorDocumento).subscribe(
    //     data=>{
    //       console.log("empresa editada",data);
    //     },
    //     error => {
    //       console.error(error);
    //     }
    //   )
    // }else{
      this.EmpresaService.addEmpresa(this.token, empresa).subscribe(
        data => {
          console.log('Respuesta de la API (empresa creada):', data);
          this.alertService.successAlert('Éxito', 'Registro exitoso');
          this.router.navigate(['list-empresa']);
        },
        error => {
          this.alertService.errorAlert('Error', error.message);
          console.log('Respuesta de la API ERROR:', error);
        }
      );
  // }

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
    if (this.currentSubSectionIndex < this.subSectionPerSection[this.currentIndex] - 1) {
      this.currentSubSectionIndex++;
    } else {
      if (this.currentIndex < this.subSectionPerSection.length - 1) {
        this.currentIndex++;
        this.currentSubSectionIndex = 0;
      }
    }

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
}




