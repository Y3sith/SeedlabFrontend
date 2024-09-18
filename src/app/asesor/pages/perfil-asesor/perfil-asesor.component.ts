import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
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
  /////
  selectedImagen_Perfil: File | null = null;
  perfilPreview: string | ArrayBuffer | null = null;
  isHidden = true;
  showEditButton = false;
  tiempoEspera = 1800;
  asesorId: any;

  asesorForm = this.fb.group({
    nombre: ['', [Validators.required,this.noNumbersValidator ,Validators.minLength(4)]],
    apellido: ['', [Validators.required,this.noNumbersValidator ,Validators.minLength(4)]],
    documento: ['', [Validators.required, this.documentoValidator, this.noLettersValidator]],
    id_tipo_documento: ['', Validators.required],
    imagen_perfil: [null],
    genero: ['', Validators.required],
    fecha_nac: ['', [Validators.required, this.dateRangeValidator]],
    direccion: ['', [Validators.required, this.noLettersValidator]],
    celular: ['', [Validators.required,Validators.maxLength(10),this.noLettersValidator ]],
    id_departamento: ['',Validators.required],
    id_municipio: ['',Validators.required],
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
    this.initializeFormState();
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
            id_departamento: data.id_departamento,
            id_municipio: data.id_municipio,
            aliado: data.id,
            email: data.email,
            password: '',
            estado: data.estado
        });
        console.log('xxxxxx: ',data);
        this.cargarDepartamentos();

        setTimeout(() => {
          // Establecer el departamento seleccionado
          this.asesorForm.patchValue({ id_municipio: data.id_departamentos });

          // Cargar los municipios de ese departamento
          this.cargarMunicipios(data.id_departamento);

          setTimeout(() => {
            // Establecer el municipio seleccionado
            this.asesorForm.patchValue({ id_municipio: data.id_municipio });
          }, 500);
        }, 500);
      
      },
      error => {
        console.log(error);
      }
    )
  }

  /* Actualiza los datos del asesor */
  editAsesor(): void {
    const formData = new FormData();
    let estadoValue: string;

  // First pass: handle special cases and avoid duplication
  Object.keys(this.asesorForm.controls).forEach((key) => {
    const control = this.asesorForm.get(key);
    if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
      if (key === 'password') {
        // Only include password if it's not empty
        if (control.value.trim() !== '') {
          formData.append(key, control.value);
        }
      } else if (key === 'fecha_nac') {
        const date = new Date(control.value);
        if (!isNaN(date.getTime())) {
          formData.append(key, date.toISOString().split('T')[0]);
        }
      } else if (key === 'estado') {
        formData.append(key, control.value ? '1' : '0');
      } else if (key !== 'imagen_perfil') {
        formData.append(key, control.value);
      }
    }
  });

  const specificFields = ['nombre', 'apellido', 'documento', 'celular', 'genero', 'id_tipo_documento', 'id_departamento', 'id_municipio', 'email'];
  specificFields.forEach(field => {
    const value = this.asesorForm.get(field)?.value;
    if (value !== null && value !== undefined && value !== '') {
      formData.append(field, value);
    }
  });

 
  if (this.asesorForm.get('direccion')?.value) {
    formData.append('direccion', this.asesorForm.get('direccion')?.value);
  }

  if (this.selectedImagen_perfil) {
    formData.append('imagen_perfil', this.selectedImagen_perfil, this.selectedImagen_perfil.name);
  }

  formData.append('aliado', this.nombreAliado);

  this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
    if (result.isConfirmed) {
      this.asesorService.updateAsesor(this.token, this.id, formData).subscribe(
        (data) => {
          console.log('Response from server:', data);
          setTimeout(function () {
            location.reload();
          }, this.tiempoEspera);
          this.alertService.successAlert('Exito', data.message);
        },
        (error) => {
          console.error('Error from server:', error);
          this.alertService.errorAlert('Error', error.error.message);
        }
      );
    }
  });
}

get a() { return this.asesorForm.controls; }

initializeFormState(): void {
  const fieldsToDisable = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
  fieldsToDisable.forEach(field => {
    const control = this.asesorForm.get(field);
    if (control) {
      control.disable();
    }
  });
}

  /* Bloqueo de inputs */
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'password', 'genero', 'fecha_nac', 'direccion', 'id_municipio', 'id_departamento', 'id_tipo_documento'];
    
    fieldsToToggle.forEach(field => {
      const control = this.asesorForm.get(field);
      if (control) {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
        console.log(`Field ${field} is ${control.disabled ? 'disabled' : 'enabled'}`);
      } else {
        console.warn(`Control for field ${field} not found in form`);
      }
    });
  
    // Force change detection
    this.cdRef.detectChanges();
  
    // Log the entire form state
    console.log('Form state after toggling:', this.asesorForm);
  }

  // Restaura los datos originales
  onCancel(): void {
    location.reload();
  }

  mostrarGuardarCambios(): void {
    this.boton = false;
  }

  onEdit() {
    this.blockedInputs = false;
    this.showEditButton = true;
    this.toggleInputsLock();
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
  
        //Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input
  
        // Resetea el campo correspondiente en el formulario y la previsualización
        if (field === 'imagen_perfil') {
          this.asesorForm.patchValue({ imagen_perfil: null });
          this.selectedImagen_perfil = null;
          this.perfilPreview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
    reader.onload = (e: any) => {
      const previewUrl = e.target.result;
      if (field === 'imagen_perfil') {
        this.asesorForm.patchValue({ imagen_perfil: previewUrl });
        this.perfilPreview = previewUrl;
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

  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast a HTMLSelectElement
    const selectedDepartamento = target.value;

    // Guarda el departamento seleccionado en el localStorage
    localStorage.setItem('departamento', selectedDepartamento);
    this.asesorForm.get('id_municipio')?.setValue(null);
    this.listMunicipios = [];
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

  tipodatoDocumento(): void {
    if (this.token) {
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

  noLettersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasLetters = /[a-zA-Z]/.test(value);
  
    if (hasLetters) {
      return { hasLetters: 'El campo no debe contener letras *' };
    } else {
      return null;
    }
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null; // Si no hay valor, no se valida
    }
  
    const selectedDate = new Date(value);
    const today = new Date();
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
  
    if (selectedDate > today) {
      return { futureDate: 'La fecha no es válida *' };
    } else if (selectedDate < hundredYearsAgo) {
      return { tooOld: 'La fecha no es válida *' };
    } else if (selectedDate > eighteenYearsAgo) {
      return { tooRecent: 'Debe tener al menos 18 años *' };
    } else {
      return null;
    }
  }

}
