import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { faMountainCity } from '@fortawesome/free-solid-svg-icons';
import { faLandmarkFlag } from '@fortawesome/free-solid-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { AlertService } from '../../../../servicios/alert.service';
import { DepartamentoService } from '../../../../servicios/departamento.service';
import { EmpresaService } from '../../../../servicios/empresa.service';
import { MunicipioService } from '../../../../servicios/municipio.service';
import { User } from '../../../../Modelos/user.model';
import { faRankingStar } from '@fortawesome/free-solid-svg-icons';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-empresa',
  templateUrl: './add-empresa.component.html',
  styleUrl: './add-empresa.component.css',
  providers: [EmpresaService, DepartamentoService, MunicipioService, AlertService]
})

export class AddEmpresaComponent {
  faGlobe = faGlobe;
  faCircleQuestion = faCircleQuestion;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  departamentoPredeterminado = '';
  submitted = false;
  token = '';
  documento: string;
  user: User | null = null;
  currentRolId: number;
  faIdCard = faIdCard;
  faMountainCity = faMountainCity;
  faLandmarkFlag = faLandmarkFlag;
  faLocationDot = faLocationDot;
  faEnvelope = faEnvelope;
  faUser = faUser;
  faPhone = faPhone;
  faMobileAlt = faMobileAlt;
  faBriefcase = faBriefcase;
  faBuilding = faBuilding;
  faAddressCard = faAddressCard;
  faUserTie = faUserTie;
  faLightbulb = faLightbulb;
  faTasks = faTasks;
  faRankingStar = faRankingStar;
  buttonText: string = 'Guardar Cambios';
  emprendedorDocumento: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private addEmpresaService: EmpresaService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,

  ) {

  }


  ngOnInit(): void {
    this.validateToken();
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
    if (apoyos) {
      apoyosList.push(apoyos);
    }
    const payload = {
      empresa: empresa,
      apoyos: apoyosList
    };

    console.log('Payload para la API:', payload);

    this.addEmpresaService.addEmpresa(this.token, payload).subscribe(
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

  mostrarOcultarContenido() {
    const checkbox = document.getElementById("mostrarContenido") as HTMLInputElement;
    const contenidoDiv = document.getElementById("contenido");
    const guardar = document.getElementById("guardar");
    if (contenidoDiv && guardar) {
      contenidoDiv.style.display = checkbox.checked ? "block" : "none";
      guardar.style.display = checkbox.checked ? "none" : "block";
    }
  }
}





