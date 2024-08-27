import { Component, OnInit, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../../../Modelos/user.model';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Orientador } from '../../../../Modelos/orientador.model';
import { OrientadorService } from '../../../../servicios/orientador.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SuperadminService } from '../../../../servicios/superadmin.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../../servicios/alert.service';
import { DepartamentoService } from '../../../../servicios/departamento.service';
import { MunicipioService } from '../../../../servicios/municipio.service';
import { AuthService } from '../../../../servicios/auth.service';

@Component({
  selector: 'app-modal-crear-orientador',
  templateUrl: './modal-crear-orientador.component.html',
  styleUrls: ['./modal-crear-orientador.component.css'],
  providers: [OrientadorService, AlertService]
})
export class ModalCrearOrientadorComponent implements OnInit {
  @Input() isEditing: boolean = false;
  submitted: boolean = false;
  boton = true;
  estado: boolean;
  isActive: boolean = true;
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  falupa = faCircleQuestion;
  currentRolId: number;
  orientadorId: any;
  hide = true;
  //////
  listTipoDocumento: [] = [];
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  ////
  imagenPerlil_Preview: string | ArrayBuffer | null = null;
  selectedImagen_Perfil: File | null = null;
  formSubmitted = false;
  currentIndex: number = 0;
  currentSubSectionIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  /////
  tiempoEspera = 1800;

  orientadorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: ['', Validators.required],
    id_tipo_documento: ['', Validators.required],
    imagen_perfil: [null, Validators.required],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    id_municipio: ['', Validators.required],
    celular: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    estado: true,
  });

  constructor(
    private fb: FormBuilder,
    private orientadorServices: OrientadorService,
    private router: Router,
    private alertService: AlertService,
    private alerService: AlertService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,

  ) {
    //this.orientadorId = data.orientadorId;
  }

  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.tipodato();
    this.cargarDepartamentos();
    if (this.orientadorId != null) {
      this.isEditing = true;
      this.orientadorForm.get('password')?.setValidators([Validators.minLength(8)]);
      this.verEditar(); // Llama a verEditar si estás editando un orientador
    } else {
      this.orientadorForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.orientadorForm.get('password')?.updateValueAndValidity();

  }

  get f() { return this.orientadorForm.controls; } //aquii


  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  tipodato(): void {
    if (this.token) {
      this.authService.tipoDocumento().subscribe(
        data => {
          this.listTipoDocumento = data;
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

  verEditar(): void {
    if (this.orientadorId != null) {
      this.orientadorServices.getinformacionOrientador(this.token, this.orientadorId).subscribe(
        data => {
          console.log('datossssss: ', data);
          this.orientadorForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            id_tipo_documento: data.id_tipo_documento,
            imagen_perfil: data.imagen_perfil,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            id_municipio: data.id_municipio,
            celular: data.celular,
            email: data.email,
            password: '',
            estado: data.estado // Esto establece el valor del estado en el formulario
          });
          this.isActive = data.estado === 'Activo'; // Asegura que el estado booleano es correcto
          // Forzar cambio de detección de Angular
          setTimeout(() => {
            this.orientadorForm.get('estado')?.setValue(this.isActive);
          });

          // Cargar los departamentos y municipios
          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.orientadorForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.orientadorForm.patchValue({ id_municipio: data.id_municipio });
            }, 500);
          }, 500);

        },
        error => {
          console.log(error);
        }
      )
    }
  }

  addOrientador(): void {
    const formData = new FormData();
    let estadoValue: string;
    if (this.orientadorId == null) {
      estadoValue = '1';
    } else {
      // Es una edición, usar el valor del formulario
      //estadoValue = this.asesorForm.get('estado')?.value ? 'true' : 'false';
    }
    formData.append('nombre', this.orientadorForm.get('nombre')?.value);
    formData.append('apellido', this.orientadorForm.get('apellido')?.value);
    formData.append('documento', this.orientadorForm.get('documento')?.value);
    formData.append('id_tipo_documento', this.orientadorForm.get('id_tipo_documento')?.value);
    formData.append('genero', this.orientadorForm.get('genero')?.value);
    formData.append('direccion', this.orientadorForm.get('direccion')?.value);
    formData.append('celular', this.orientadorForm.get('celular')?.value);
    formData.append('id_municipio', this.orientadorForm.get('id_municipio')?.value);
    formData.append('email', this.orientadorForm.get('email')?.value);
    formData.append('password', this.orientadorForm.get('password')?.value);

    Object.keys(this.orientadorForm.controls).forEach(key => {
      const control = this.orientadorForm.get(key);

      if (control?.value !== null && control?.value !== undefined) {
        if (key === 'fecha_nac') {
          if (control.value) {
            const date = new Date(control.value);
            if (!isNaN(date.getTime())) {
              formData.append(key, date.toISOString().split('T')[0]);
            }
          }
        }
        else if (key === 'estado') {
          formData.append(key, control.value ? '1' : '0');
        } else if (key !== 'imagen_perfil') {
          formData.append(key, control.value);
        }
      }
    });
    if (this.selectedImagen_Perfil) {
      formData.append('imagen_perfil', this.selectedImagen_Perfil, this.selectedImagen_Perfil.name);
    }
    if (this.orientadorId != null) {
      this.alerService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question').then((result) => {
        if (result.isConfirmed) {
          this.orientadorServices.updateOrientador(this.token, this.orientadorId, formData).subscribe(
            data => {
              setTimeout(function () {
                location.reload();
              }, this.tiempoEspera);
              this.alerService.successAlert('Exito', data.message);
            },
            error => {
              this.alerService.errorAlert('Error', error.error.message);
              console.error('Error', error.error.message);
              console.log(error);
            }
          );
        }
      });
    } else {
      console.log('Hola');
      this.orientadorServices.createOrientador(this.token, formData).subscribe(
        data => {
          console.log(data); // Verifica el mensaje de éxito
          this.alerService.successAlert('Exito', data.message);
          
            this.router.navigate(['/list-orientador']);
          this.alerService.successAlert('Exito', data.message);
        },
        error => {
          this.alerService.errorAlert('Error', error.error.message);
          console.error('Error', error.error.message);
          console.log(error);
        });
    }
  }

  toggleActive() {
    this.isActive = !this.isActive;
    //this.orientadorForm.patchValue({ estado: this.isActive });
    //console.log("Estado después de toggle:", this.isActive); // Verifica el estado después de toggle
    //this.orientadorForm.patchValue({ estado: this.isActive ? true : false });
    this.orientadorForm.patchValue({ estado: this.isActive ? true : false });
    //console.log("Estado después de toggle:", this.isActive); // Verifica el estado después de toggle
  }
  mostrarToggle(): void {
    if (this.orientadorId != null) {
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
          this.orientadorForm.patchValue({ imagen_perfil: null });
          this.imagenPerlil_Preview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        if (field === 'imagen_perfil') {
          this.orientadorForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPerlil_Preview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_Perfil = file;
        this.orientadorForm.patchValue({ imagen_perfil: file });
      }

    } else {
      this.resetFileField(field);
    }
  }
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.orientadorForm.patchValue({ imagen_perfil: null });
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
