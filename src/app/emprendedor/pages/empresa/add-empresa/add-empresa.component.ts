import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmprendedorService } from '../../../../servicios/emprendedor.service';
import { AlertService } from '../../../../servicios/alert.service';
import { DepartamentoService } from '../../../../servicios/departamento.service';
import { EmpresaService } from '../../../../servicios/empresa.service';
import { MunicipioService } from '../../../../servicios/municipio.service';
import { User } from '../../../../Modelos/user.model';
import { AuthService } from '../../../../servicios/auth.service';
import { ApoyoEmpresa } from '../../../../Modelos/apoyo-empresa.modelo';


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
  documento: string;
  user: User | null = null;
  currentRolId: number;
  buttonText: string = 'Guardar Cambios';
  emprendedorDocumento: string;
  currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  id_empresa: string;
  apoyo: ApoyoEmpresa;
  isActive: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private empresaService: EmpresaService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,
    private authService: AuthService,
    private route: ActivatedRoute,

  ) {

  }


  ngOnInit(): void {
    this.validateToken();
    this.cargarDepartamentos();
    this.tipodato();
    this.id_empresa = this.route.snapshot.paramMap.get('id_empresa');
    console.log('ID de la empresa desde la URL:', this.id_empresa);

    if (this.id_empresa) {
      this.verEditar();  // Llama al método para editar si tienes un id_empresa válido
    } else {
      console.log('ID de la empresa no encontrado en la URL');
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


  //Funcion para cargar los departamentos
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

  //Funcion para traer el nombre del departamento seleccionado
  onDepartamentoSeleccionado(nombreDepartamento: string): void {
    this.cargarMunicipios(nombreDepartamento);
  }

  //Funcion para cargar los municipios
  cargarMunicipios(nombreDepartamento: string): void {
    this.municipioService.getMunicipios(nombreDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  tipodato(): void {
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


  crearEmpresa(): void {
    this.submitted = true;
    console.log("Formulario enviado", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);

    if (this.addEmpresaForm.invalid) {
      console.log("Formulario inválido", this.addEmpresaForm.value, this.addApoyoEmpresaForm.value);
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
    this.id_empresa = empresa.documento;
    if (apoyos) {
      apoyosList.push(apoyos);
    }


    const payload = {
      empresa: empresa,
      apoyos: apoyosList
    };

    console.log('Payload para la API:', payload);

    if (!this.id_empresa) {
      let confirmationText = this.isActive
        ? "¿Estas seguro de guardar los cambios"
        : "¿Estas seguro de guardar los cambios?";

      this.alertService.alertaActivarDesactivar(confirmationText, 'question').then((response) => {
        this.empresaService.updateEmpresas(this.token, this.id_empresa, empresa).subscribe(
          data => {
            console.log('Respuesta de la API (empresa actualizada):', data);
            this.alertService.successAlert('Éxito', 'Registro exitoso');
            this.router.navigate(['list-empresa']);
          },
          error => {
            this.alertService.errorAlert('Error', error.message);
            console.log('Respuesta de la API ERROR:', error);
          }
        )
      });
    } else {
      this.empresaService.addEmpresa(this.token, payload).subscribe(
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
    }

  }

  verEditar(): void {
    if (this.id_empresa !== null) {
      console.log("id_empresa en ver editar", this.id_empresa);
      this.empresaService.traerEmpresasola(this.token, this.documento, this.id_empresa).subscribe(
        data => {
          this.apoyo = data.apoyo;
          this.addEmpresaForm.patchValue({
            nombre: data.nombre || '',
            correo: data.correo || '',
            id_tipo_documento: data.id_tipo_documento || '',
            documento: data.documento || '',
            razonSocial: data.razonSocial || '',
            id_departamento: data.id_departamento || '',
            id_municipio: data.id_municipio || '',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            celular: data.celular || '',
            url_pagina: data.url_pagina || '',
            profesion: data.profesion || '',
            cargo: data.cargo || '',
            experiencia: data.experiencia || '',
            funciones: data.funciones || ''
          });

          if (this.apoyo) {
            this.addApoyoEmpresaForm.patchValue({
              documento: this.apoyo.documento || '',
              nombre: this.apoyo.nombre || '',
              apellido: this.apoyo.apellido || '',
              cargo: this.apoyo.cargo || '',
              telefono: this.apoyo.telefono || '',
              celular: this.apoyo.celular || '',
              email: this.apoyo.email || '',
              id_tipo_documento: this.apoyo.id_tipo_documento || ''
            });
          }
          console.log('datos empresa:', data);
          console.log('datos apoyo:', this.apoyo);


        }
      )
    }
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
}




