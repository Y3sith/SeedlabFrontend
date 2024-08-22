import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';

import { AsesorService } from '../../../servicios/asesor.service';

import { Asesor } from '../../../Modelos/asesor.model';
import { User } from '../../../Modelos/user.model';
import { AlertService } from '../../../servicios/alert.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { EmprendedorService } from '../../../servicios/emprendedor.service';
import { AuthService } from '../../../servicios/auth.service';

@Component({
  selector: 'app-perfil-asesor',
  templateUrl: './perfil-asesor.component.html',
  styleUrl: './perfil-asesor.component.css',
  providers: [AsesorService]
})
export class PerfilAsesorComponent implements OnInit {
  // iconoes
  faEnvelope = faEnvelope;
  faMobileAlt = faMobileAlt;
  faUser = faUser;

  token: string | null = null;
  blockedInputs = true;
  id: number | null = null;
  nombre: string | null = null;
  currentRolId: number;
  user: User
  boton: boolean;
  hide = true;
  bloqueado = true;
  imagenPreview: string | ArrayBuffer | null = null;
  selectedImagen_perfil: File | null = null;
  submitted = false;
  listDepartamentos: any[]= [];
  listMunicipios: any[]= [];
  nombreAliado: string | null = null;
  listTipoDocumento: [] = [];

  asesorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: ['', Validators.required],
    id_tipo_documento: ['', Validators.required],
    imagen_perfil: [null],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    celular: ['', [Validators.required, Validators.maxLength(10)]],
    municipio: ['',Validators.required],
    aliado: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    estado: true,
  });

  constructor(private fb: FormBuilder,
    private router: Router,
    private asesorService: AsesorService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService: AuthService,
  ) { }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.tipodatoDocumento();
    this.cargarDepartamentos();
    
    
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /* Trae los datos del asesor para poder editarlo en el input, de acuerdo al id del usuario logueado */
  verEditar(): void {
    this.asesorService.getAsesorID(this.token, this.id).subscribe(
      data => {
        this.asesorForm.patchValue({
          nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            id_tipo_documento: data.id_tipo_documento,
            imagen_perfil: data.imagen_perfil,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            celular: data.celular,
            municipio: data.municipio,
            aliado: data.id,
            email: data.email,
            password: '',
            estado: data.estado
        });
        console.log('xxxxxx: ',data);
      },
      error => {
        console.log(error);
      }
    )
  }

  /* Actualiza los datos del asesor */
  editAsesor(): void {
    const asesor: Asesor = {
      nombre: this.asesorForm.get('nombre')?.value,
      apellido: this.asesorForm.get('apellido')?.value,
      documento: this.asesorForm.get('documento')?.value,
      id_tipo_documento: this.asesorForm.get('id_tipo_documento')?.value,
      imagen_perfil: this.asesorForm.get('')?.value,
      genero: this.asesorForm.get('genero')?.value,
      fecha_nac: this.asesorForm.get('')?.value,
      direccion: this.asesorForm.get('direccion')?.value,
      celular: this.asesorForm.get('celular')?.value,
      municipio: +this.asesorForm.get('municipio')?.value,
      aliado: this.nombreAliado,
      email: this.asesorForm.get('email')?.value,
      password: this.asesorForm.get('password')?.value,
      estado: this.asesorForm.get('estado')?.value,
    };
    this.asesorService.updateAsesor(this.token, this.id, asesor).subscribe(
      data => {
        location.reload();
      },
      error => {
        console.error(error);
      }
    )
  }

  /* Bloqueo de inputs */
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['nombre', 'apellido', 'celular'];
    fieldsToToggle.forEach(field => {
      const control = this.asesorForm.get(field);
      if (this.blockedInputs) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }

 /* Restaura los datos originales */
  onCancel(): void {
    this.verEditar();
  }

  /* Muesta el boton de guardar cambios */
  mostrarGuardarCambios(): void {
    this.boton = false;
  }

  onFileSelecteds(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      let maxSize = 0;

      if (field === 'urlImagen' || field === 'logo' || field === 'ruta_multi') {
        maxSize = 5 * 1024 * 1024; // 5MB para imágenes
      } else if (field === 'ruta_documento') {
        maxSize = 18 * 1024 * 1024; // 20MB para documentos
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField(field);

        ////Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input

        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: null });
          this.selectedImagen_perfil = null;
          this.imagenPreview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.asesorForm.patchValue({ imagen_perfil: file });
      }

    } else {
      this.resetFileField(field);
    }
  }

  generateImagePreview(file: File, field: string) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'imagen_perfil') {
        this.imagenPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.asesorForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.imagenPreview = null;
    }
  }
  
  get f() {
    return this.asesorForm.controls;
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
        console.log('Municipios cargados:', JSON.stringify(data));
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  tipodatoDocumento(): void {
    if (this.token) {
      this.authService.tipoDato().subscribe(
        data => {
          this.listTipoDocumento = data;
          //console.log('datos tipo de documento: ',data)
        },
        error => {
          console.log(error);
        }
      )
    }
  }

}
