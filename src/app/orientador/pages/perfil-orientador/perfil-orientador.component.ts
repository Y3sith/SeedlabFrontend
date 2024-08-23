import { Component, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { OrientadorService } from '../../../servicios/orientador.service';
import { Orientador } from '../../../Modelos/orientador.model';
import { User } from '../../../Modelos/user.model';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { faEnvelope, faMobileAlt, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-perfil-orientador',
  templateUrl: './perfil-orientador.component.html',
  styleUrl: './perfil-orientador.component.css'
})


export class PerfilOrientadorComponent {
  // iconos
  faEnvelope = faEnvelope;
  faMobileAlt = faMobileAlt;
  faUser = faUser;
  user: User | null = null;
  token = '';
  currentRolId: number;
  id: number;
  blockedInputs = true;
  boton: boolean;
  hide = true;
  bloqueado = true;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  imagenPreview: string | ArrayBuffer | null = null;
  selectedImagen_perfil: File | null = null;
  submitted = false;
  errorMessage: string | null = null;


  perfilorientadorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: ['', Validators.required],
    imagen_perfil: [null, Validators.required],
    celular: ['', Validators.required],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    nombretipodoc: new FormControl({ value: '', disabled: true }, Validators.required),
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    estado: [true],
  });

  constructor(
    private orientadorService: OrientadorService,
    private router: Router,
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private municipioService: MunicipioService
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.cargarDepartamentos();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 2) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  verEditar(): void {
    if (this.token) {
      this.orientadorService.getinformacionOrientador(this.token, this.id).subscribe(
        (data) => {
          this.perfilorientadorForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            celular: data.celular,
            email: data.email,
            password: data.password,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            nombretipodoc: data.id_tipo_documento ? data.id_tipo_documento.toString() : '',
            imagen_perfil: data.imagen_perfil,
            estado: data.estado,
          });
          console.log(data);
        },
        (err) => {
          console.log(err);
        }
      )
    }
  }

  
  updateOrientador(): void {
    const perfil: Orientador = {
      nombre: this.perfilorientadorForm.get('nombre')?.value,
      apellido: this.perfilorientadorForm.get('apellido')?.value,
      documento: this.perfilorientadorForm.get('documento')?.value,
      celular: this.perfilorientadorForm.get('celular')?.value,
      email: this.perfilorientadorForm.get('email')?.value,
      password: this.perfilorientadorForm.get('password')?.value,
      genero: this.perfilorientadorForm.get('genero')?.value,
      fecha_nac: this.perfilorientadorForm.get('fecha_nac')?.value,
      direccion: this.perfilorientadorForm.get('direccion')?.value,
      id_tipo_documento: this.perfilorientadorForm.get('nombretipodoc')?.value,
      id_municipio: this.perfilorientadorForm.get('municipio')?.value,
    };
    this.orientadorService.updateOrientador(this.token, this.id, perfil).subscribe(
      (data) => {
        location.reload();
      },
      (err) => {
        console.log(err);
      }
    )
  }
  get f() {
    return this.perfilorientadorForm.controls;
  }


  passwordValidator(control: AbstractControl) {
    const value = control.value;
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    if (hasUpperCase && hasSpecialChar) {
      return null;
    } else {
      return { passwordStrength: 'La contraseña debe contener al menos una letra mayúscula y un carácter especial *' };
    }
  }

  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['nombre', 'apellido', 'celular', 'email', 'password'];
    fieldsToToggle.forEach(field => {
      const control = this.perfilorientadorForm.get(field);
      if (this.blockedInputs) {
        control.disable();
      } else {
        control.enable();
      }
    })
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
        console.log('Municipios cargados:', JSON.stringify(data)); // Agrega esto para ver los municipios en la consola
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }
  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
      this.perfilorientadorForm.patchValue({ imagen_perfil: null });
      this.selectedImagen_perfil = null;
      this.imagenPreview = null;
    }
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: null });
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
          this.perfilorientadorForm.patchValue({ imagen_perfil: previewUrl });
          this.imagenPreview = previewUrl;
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'imagen_perfil') {
        this.selectedImagen_perfil = file;
        this.perfilorientadorForm.patchValue({ imagen_perfil: file });
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
    /* Restaura los datos originales */
    onCancel(): void {
      this.verEditar();
    }
  
    /* Muesta el boton de guardar cambios */
    mostrarGuardarCambios(): void {
      this.boton = false;
    }
}