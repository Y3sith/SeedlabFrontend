import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { faLandmarkFlag } from '@fortawesome/free-solid-svg-icons';
import { faMountainCity } from '@fortawesome/free-solid-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faVenusMars } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../servicios/auth.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { EmprendedorService } from '../../../servicios/emprendedor.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { PerfilEmprendedor } from '../../../Modelos/perfil-emprendedor.model';
import { User } from '../../../Modelos/user.model';
import { AlertService } from '../../../servicios/alert.service';


@Component({
  selector: 'app-perfil-emprendedor',
  templateUrl: './perfil-emprendedor.component.html',
  styleUrl: './perfil-emprendedor.component.css'
})
export class PerfilEmprendedorComponent implements OnInit {
  @Input() isEditing: boolean = false
  isActive: boolean = true;
  faVenusMars = faVenusMars;
  faMountainCity = faMountainCity;
  faLandmarkFlag = faLandmarkFlag;
  showPassword = faEye;
  faIdCard = faIdCard;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  hide = true;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  departamentoPredeterminado = '';
  submitted = false;
  errorMessage: string | null = null;
  email: string;
  token = '';
  blockedInputs = true; // Inicialmente bloqueados
  bloqueado = true;
  documento: string;
  user: User | null = null;
  currentRolId: number;
  emprendedorId: any;
  estado: boolean;
  isAuthenticated: boolean = true;
  //////
  imagenPreview: string | ArrayBuffer | null = null;
  selectedImagen_perfil: File | null = null;




  emprendedorForm = this.fb.group({
    documento: '',
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    celular: ['', [Validators.required, Validators.maxLength(10)]],
    imagen_perfil: [null ,Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    nombretipodoc: new FormControl({ value: '', disabled: true }, Validators.required), // Aquí se deshabilita el campo
    departamento: ['', Validators.required],
    municipio: ['', Validators.required],
    estado: true,
  });

  registerForm: FormGroup;  
  listEmprendedor: PerfilEmprendedor[] = [];
  originalData: any;
  perfil: '';
  boton: boolean;

  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private emprendedorService: EmprendedorService,
    private authServices: AuthService,
    private router: Router,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.validateToken();
    this.isAuthenticated = this.authServices.isAuthenticated();
    this.cargarDepartamentos(); 
    this.verEditar(); 
    this.isEditing = true;
  }

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

  verEditar(): void {
    if (this.token) {
      this.emprendedorService.getInfoEmprendedor(this.token, this.documento).subscribe(
        (data) => {
          // Cargar el departamento primero
          this.emprendedorForm.patchValue({
            departamento: data.id_departamento,
          });
          this.isActive = data.estado === 'Activo';
  
          // Cargar municipios después de cargar el departamento
          if (data.id_departamento) {
            this.cargarMunicipios(data.id_departamento);
          }
          console.log('trae la info',data);
          // Rellenar el formulario con los datos del emprendedor
          this.emprendedorForm.patchValue({
            documento: data.documento,
            nombre: data.nombre,
            apellido: data.apellido,
            imagen_perfil: data.imagen_perfil,
            celular: data.celular,
            email: data.email,
            password: data.password,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            departamento: data.id_departamento.toString(),
            municipio: data.id_municipio.toString(), 
            nombretipodoc: data.id_tipo_documento ? data.id_tipo_documento.toString() : '',
            estado: data.estado
          });
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }




  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
     this.emprendedorForm.patchValue({ imagen_perfil: null });
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
         this.emprendedorForm.patchValue({ imagen_perfil: null });
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
       this.emprendedorForm.patchValue({ imagen_perfil: previewUrl });
       this.imagenPreview = previewUrl;
     } 
   };
   reader.readAsDataURL(file);
 
     // Genera la previsualización solo si el archivo es de tamaño permitido
     this.generateImagePreview(file, field);

     if (field === 'imagen_perfil') {
       this.selectedImagen_perfil = file;
       this.emprendedorForm.patchValue({ imagen_perfil: file });
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


 updateEmprendedor(): void {
  const perfil: PerfilEmprendedor = {
    documento: this.emprendedorForm.get('documento')?.value,
    id_tipo_documento: this.emprendedorForm.get('nombretipodoc')?.value,
    nombre: this.emprendedorForm.get('nombre')?.value,
    apellido: this.emprendedorForm.get('apellido')?.value,
    celular: this.emprendedorForm.get('celular')?.value,
    email: this.emprendedorForm.get('email')?.value,
    password: this.emprendedorForm.get('password')?.value,
    genero: this.emprendedorForm.get('genero')?.value,
    fecha_nac: this.emprendedorForm.get('fecha_nac')?.value,
    direccion: this.emprendedorForm.get('direccion')?.value,  // Cambiado a 'direccion'
    id_departamento: this.emprendedorForm.get('departamento')?.value,
    id_municipio: this.emprendedorForm.get('municipio')?.value,
  }
  console.log(perfil);
  this.alertService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question',).then((result) => {
    if (result.isConfirmed) {
      this.emprendedorService.updateEmprendedor(perfil, this.token, this.documento).subscribe(
        (data) => {
          location.reload();
        },
        (err) => {
          console.log(err);
        }
      );
    }
  })
}


  desactivarEmprendedor(): void {
    // let confirmationText = this.token
    //   ? "¿Estás seguro de desactivar tu cuenta?"
    //   : "¿Estás seguro de desactivar tu cuenta?";
    if (this.token) {
      this.alertService.DesactivarEmprendedor("¿Estás seguro de desactivar tu cuenta?",
      "¡Ten en cuenta que si desactivas tu cuenta tendras que validarte nuevamente por medio de tu correo electronico al momnento de iniciar sección!", 'warning').then((result) => {
        if (result.isConfirmed) {
          this.emprendedorService.destroy(this.token, this.documento).subscribe(
            (data) => {
              console.log("desactivar", data);
              this.isAuthenticated = false;
              localStorage.clear();
              location.reload();
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });
    }
  }




  // console.log("Texto de confirmación para desactivar:", confirmationText);

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

  get f() { return this.registerForm.controls; }


  //Funcion para cargar los departamentos
  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
        this.cdRef.detectChanges(); // Forzar la detección de cambios
      },
      (err) => {
        console.log(err);
      }
    )
  }

  onDepartamentoSeleccionado(departamentoId: string): void {
    this.cargarMunicipios(departamentoId);
  }

  cargarMunicipios(departamentoId: string): void {
    this.municipioService.getMunicipios(departamentoId).subscribe(
      (data) => {
        this.listMunicipios = data;
  
        // Establecer el municipio actual en el select después de cargar los municipios
        const municipioId = this.emprendedorForm.get('id_municipio')?.value;
        if (municipioId) {
          this.emprendedorForm.patchValue({ municipio: municipioId });
        }
      },
      (err) => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }
  
  trackById(index: number, item: any): number {
    return item.id;
  }

  //para que no me deje editar el nombre del tipo del documento
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['documento', 'nombre', 'apellido', 'celular', 'email', 'password', 'genero', 'fecha_nac', 'direccion', 'municipio'];
    fieldsToToggle.forEach(field => {
      const control = this.emprendedorForm.get(field);
      if (control && field !== 'nombretipodoc') {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }

  // Restaura los datos originales
  onCancel(): void {
    this.verEditar();
  }

  mostrarGuardarCambios(): void {
    this.boton = false;
  }



}
