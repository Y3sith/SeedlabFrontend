import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { AliadoService } from '../../../servicios/aliado.service';
import { AsesorService } from '../../../servicios/asesor.service';
import { User } from '../../../Modelos/user.model';
import { Asesor } from '../../../Modelos/asesor.model';
import { AlertService } from '../../../servicios/alert.service';
import { AuthService } from '../../../servicios/auth.service';
import { EmprendedorService } from '../../../servicios/emprendedor.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';




@Component({
  selector: 'app-modal-add-asesores',
  templateUrl: './modal-add-asesores.component.html',
  styleUrl: './modal-add-asesores.component.css',
  providers: [AsesorService, AliadoService, AlertService]
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

  constructor(
    public dialogRef: MatDialogRef<ModalAddAsesoresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private asesorService: AsesorService,
    private aliadoService: AliadoService,
    private alerService: AlertService,
    private authService: AuthService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,

  ) {
    this.asesorId = data.asesorId;
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.tipodato();
    this.cargarDepartamentos();
    /*para ver si lo estan editando salga la palabra editar */
    if (this.asesorId != null) {
      this.isEditing = true;
      this.asesorForm.get('password')?.setValidators([Validators.minLength(8)]);
      this.verEditar(); /* Llama a verEditar si estás editando un asesor */
    } else {
      this.asesorForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }

    this.asesorForm.get('password')?.updateValueAndValidity();
  }

  get f() { return this.asesorForm.controls; } //aquii

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
          console.warn('El nombre del aliado no está definido en el objeto identity');
        }
      } else {
        console.error('No se encontró información de identity en localStorage');
      }
    }
  }

  tipodato(): void {
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
      data => {
        this.listMunicipios = data;
        //console.log('Municipios cargados:', JSON.stringify(data));
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  /* Trae la informacion del asesor cuando el asesorId no sea nulo */
  verEditar(): void {
    if (this.asesorId != null) {
      this.aliadoService.getAsesorAliado(this.token, this.asesorId).subscribe(
        data => {
          console.log('datossssss: ', data);
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

          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.asesorForm.get('estado')?.setValue(this.isActive);
          });

          // Cargar los departamentos y municipios
          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.asesorForm.patchValue({ municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.asesorForm.patchValue({ municipio: data.id_municipio });
            }, 500);
          }, 500);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  /* Crear asesor o actualiza dependendiendo del asesorId */
  addAsesor(): void {
    this.submitted = true;
    if (this.asesorForm.invalid) {
      return;
    }
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
    console.log('Asesor:', asesor);
    /* Actualiza asesor */
    if (this.asesorId != null) {
      this.alerService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question').then((result) => {
        if (result.isConfirmed) {
          this.asesorService.updateAsesor(this.token, this.asesorId, asesor).subscribe(
            data => {
              setTimeout(function () {
                location.reload();
              }, this.tiempoEspera);
              this.alerService.successAlert('Exito', data.message);
            },
            error => {
              //this.alerService.errorAlert('Error', error.error.message);
              //console.error('Error', error.error.message);
              console.log('error: ',error)
            }
          );
        }
      });
      /* Crea asesor */
    } else {
      this.asesorService.createAsesor(this.token, asesor).subscribe(  
        data => {
          setTimeout(function () {
            location.reload();
          }, this.tiempoEspera);
          this.alerService.successAlert('Exito', data.message);
        },
        error => {
          console.error('Error al crear el asesor:', error);
          //this.alerService.errorAlert('Error', error.error.message);
        });
    }
  }

  /* Cerrar el modal */
  cancelarModal() {
    this.dialogRef.close();
  }

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
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
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

}