import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { faLandmarkFlag } from '@fortawesome/free-solid-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faMountainCity } from '@fortawesome/free-solid-svg-icons';
import { Empresa } from '../../../../Modelos/empresa.model';
import { EmpresaService } from '../../../../servicios/empresa.service';
import { User } from '../../../../Modelos/user.model';
import { DepartamentoService } from '../../../../servicios/departamento.service'; 
import { MunicipioService } from '../../../../servicios/municipio.service';



@Component({
  selector: 'app-edit-empresa',
  templateUrl: './edit-empresa.component.html',
  styleUrl: './edit-empresa.component.css',
  providers:[]
})
export class EditEmpresaComponent implements OnInit {
  editEmpresaForm: FormGroup;
  empresa:Empresa;
  faIdCard = faIdCard;
  faMountainCity = faMountainCity;
  faLandmarkFlag = faLandmarkFlag;
  faLocationDot=faLocationDot;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  selectedDepartamento: string = '';
  token: string | null = null;
  user: any = null;
  documento: string = null;
  currentRolId: number;
  id_emprendedor: string = null;
  submitted = false; 

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private empresaService: EmpresaService,private router: Router,
    private departamentoService: DepartamentoService, private municipioService: MunicipioService, ) { 
    this.editEmpresaForm = this.fb.group({
      nombre: [''],
      correo: [''],
      id_tipo_documento: [''],
      documento: [''],
      razonSocial: [''],
      departamento: [''],
      municipio: [''],
      direccion: [''],
      telefono: [''],
      celular: [''],
      url_pagina: [''],
      profesion: [''],
      cargo: [''],
      experiencia: [''],
      funciones: ['']
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
        
      },
      err => {
        console.log('Error al cargar los datos de la empresa:', err);
      }
    )

       
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
    // Aquí implementarías la lógica para enviar los datos editados al servidor
    // Por ejemplo, podrías llamar a un servicio que actualice los datos de la empresa en la base de datos
    console.log(this.editEmpresaForm.value);
  }

 
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

}
