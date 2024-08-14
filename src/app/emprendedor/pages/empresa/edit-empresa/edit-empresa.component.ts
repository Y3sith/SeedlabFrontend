import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faIdCard, faLandmarkFlag, faLocationDot, faMountainCity } from '@fortawesome/free-solid-svg-icons';
import { Empresa } from '../../../../Modelos/empresa.model';
import { EmpresaService } from '../../../../servicios/empresa.service';
import { DepartamentoService } from '../../../../servicios/departamento.service'; 
import { MunicipioService } from '../../../../servicios/municipio.service';
import { ApoyoEmpresa } from '../../../../Modelos/apoyo-empresa.modelo';

@Component({
  selector: 'app-edit-empresa',
  templateUrl: './edit-empresa.component.html',
  styleUrls: ['./edit-empresa.component.css'],
  providers: []
})
export class EditEmpresaComponent implements OnInit {
  editEmpresaForm: FormGroup;
  editApoyoForm: FormGroup;
  empresa: Empresa;
  apoyo: ApoyoEmpresa;
  faIdCard = faIdCard;
  faMountainCity = faMountainCity;
  faLandmarkFlag = faLandmarkFlag;
  faLocationDot = faLocationDot;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  selectedDepartamento: string = '';
  token: string | null = null;
  user: any = null;
  documento: string | null = null;
  currentRolId: number;
  id_emprendedor: string | null = null;
  submitted = false; 

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private empresaService: EmpresaService,
    private router: Router,
    private departamentoService: DepartamentoService, 
    private municipioService: MunicipioService
  ) { 
    this.editEmpresaForm = this.fb.group({
      nombre: [''],
      correo: [''],
      id_tipo_documento: [''],
      documento: [''],
      razonSocial: [''],
      id_departamento: [''],
      id_municipio: [''],
      direccion: [''],
      telefono: [''],
      celular: [''],
      url_pagina: [''],
      profesion: [''],
      cargo: [''],
      experiencia: [''],
      funciones: ['']
    });

    this.editApoyoForm = this.fb.group({
      documento: [''],
      nombre: [''],
      apellido: [''],
      cargo: [''],
      telefono: [''],
      celular: [''],
      email: [''],
      id_tipo_documento: [''],
    });
  }

  ngOnInit(): void {
    this.validarToken();
    this.cargarDepartamentos();
    const documento = this.route.snapshot.paramMap.get('documento');
    const id_emprendedor = this.route.snapshot.paramMap.get('id_emprendedor'); 
    this.cargarDatosEmpresa(id_emprendedor, documento);
  }

  validarToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
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

  cargarDatosEmpresa(id_emprendedor: string, documento: string): void {
    this.empresaService.traerEmpresasola(this.token, id_emprendedor, documento).subscribe(
      data => {
        this.empresa = data;
        this.apoyo = data.apoyo;
        console.log('empresa', data); // Verifica los datos cargados
        this.setFormValues();
        if (this.empresa.id_departamento) {
          this.onDepartamentoSeleccionado(this.empresa.id_departamento);
        }
      },
      err => {
        console.log('Error al cargar los datos de la empresa:', err);
      }
    );
  }
  
  setFormValues(): void {
    if (!this.empresa) {
      console.error('No se ha cargado la empresa, no se puede establecer los valores del formulario.');
      return; // Salir de la función si empresa es undefined
    }
  
    // Establece los valores para el formulario de empresa
    this.editEmpresaForm.patchValue({
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
      this.editApoyoForm.patchValue({
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

  mostrarOcultarContenido() {
    const checkbox = document.getElementById("mostrarContenido") as HTMLInputElement;
    const contenidoDiv = document.getElementById("contenido");
    const guardar = document.getElementById("guardar");
    if (contenidoDiv && guardar) {
      contenidoDiv.style.display = checkbox.checked ? "block" : "none";
      guardar.style.display = checkbox.checked ? "none" : "block";
    }
  }

  onSubmit(): void {
    this.submitted = true;
  
    // Verifica si el formulario es inválido
    if (this.editEmpresaForm.invalid) {
      console.log('Formulario inválido');
      return;
    }
  
    const empresaData = this.editEmpresaForm.value;
    const apoyoData = this.editApoyoForm.value;
  
    // Incluye `apoyo` solo si tiene datos
    if (Object.keys(apoyoData).length > 0) {
      // Verifica si el campo documento está vacío y no lo envíes si es así
      if (!apoyoData.documento) {
        delete apoyoData.documento;
      }
      empresaData.apoyo = apoyoData;
    } else {
      empresaData.apoyo = null; // Puedes establecerlo en null si el backend lo permite
    }
  
    this.empresaService.updateEmpresas(this.token, empresaData.documento, empresaData).subscribe(
      response => {
        console.log('Datos actualizados:', response);
      },
      error => {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar la empresa: ' + error.message);
      }
    );
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

  onDepartamentoSeleccionado(idDepartamento: string): void {
    this.cargarMunicipios(idDepartamento);
  }

  cargarMunicipios(idDepartamento: string): void {
    this.municipioService.getMunicipios(idDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
        console.log('Municipios cargados:', this.listMunicipios); // Verifica los municipios cargados
        // Asegúrate de que el municipio seleccionado esté en la lista después de cargar
        if (this.empresa && this.empresa.id_municipio) {
          this.editEmpresaForm.patchValue({ id_municipio: this.empresa.id_municipio });
        }
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }
}
