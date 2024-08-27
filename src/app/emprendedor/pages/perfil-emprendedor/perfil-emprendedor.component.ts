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
import { Console } from 'console';


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
  listTipoDocumento: any[] = [];
  tiempoEspera = 1800;
  emprendedorForm: FormGroup;
  registerForm: FormGroup;  
  listEmprendedor: PerfilEmprendedor[] = [];
  originalData: any;
  perfil: '';
  boton: boolean;
  selectedImagen_perfil: File | null = null;
  bannerPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private emprendedorService: EmprendedorService,
    private authServices: AuthService,
    private router: Router,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
  ) { 
    this.emprendedorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      documento: ['', Validators.required],
      imagen_perfil: [Validators.required],
      celular: ['', [Validators.required, Validators.maxLength(10)]],
      genero: ['', Validators.required],
      direccion: [],
      id_tipo_documento: [Validators.required],
      id_departamento: [Validators.required],
      id_municipio: [Validators.required],
      fecha_nac: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      estado: true,
    });
  }

  ngOnInit(): void {
    this.validateToken();
    this.isAuthenticated = this.authServices.isAuthenticated();
    this.verEditar(); 
    this.tipoDocumento();
    this.cargarDepartamentos(); 
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

    //Funcion para cargar los departamentos
    cargarDepartamentos(): void {
      this.departamentoService.getDepartamento().subscribe(
        (data: any[]) => {
          console.log("DEPARTAMENTO",data);
          this.listDepartamentos = data;
          //this.cdRef.detectChanges(); // Forzar la detección de cambios
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
  
    cargarMunicipios(departamentoId: string): void {
      this.municipioService.getMunicipios(departamentoId).subscribe(
        (data) => {
          this.listMunicipios = data;
        console.log("MUNICIPIOS",data);
          // Establecer el municipio actual en el select después de cargar los municipios
          //const municipioId = this.emprendedorForm.get('id_municipio')?.value;
          // if (municipioId) {
          //   this.emprendedorForm.patchValue({ id_municipio: municipioId });
          // }
        },
        (err) => {
          console.log('Error al cargar los municipios:', err);
        }
      );
    }
  
    

  verEditar(): void {
    if (this.token) {
      this.emprendedorService.getInfoEmprendedor(this.token, this.documento).subscribe(
        (data) => {
          // Cargar el departamento primero
          // this.emprendedorForm.patchValue({
          //   departamento: data.id_departamento,
          // });
          this.isActive = data.estado === 'Activo';
  
          // Cargar municipios después de cargar el departamento
          // if (data.id_departamento || data.id_tipo_documento) {
          //   this.cargarMunicipios(data.id_departamento);
          //   this.tipoDocumento();
          // }
          console.log('trae la info',data);
          // Rellenar el formulario con los datos del emprendedor
          this.emprendedorForm.patchValue({
            documento: data.documento,
            nombre: data.nombre,
            apellido: data.apellido,
            imagen_perfil: data.imagen_perfil,
            celular: data.celular,
            email: data.email,
            password: "",
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            id_departamento: data.id_departamento,
            id_municipio: data.id_municipio, 
            id_tipo_documento: data.id_tipo_documento,
            estado: data.estado
          });

          this.cargarDepartamentos();

          setTimeout(() => {
            // Establecer el departamento seleccionado
            this.emprendedorForm.patchValue({ id_municipio: data.id_departamentos });

            // Cargar los municipios de ese departamento
            this.cargarMunicipios(data.id_departamento);

            setTimeout(() => {
              // Establecer el municipio seleccionado
              this.emprendedorForm.patchValue({ id_municipio: data.id_municipio });
            }, 500);
          }, 500);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  tipoDocumento(): void {
    this.authServices.tipoDocumento().subscribe(
      data => {
        this.listTipoDocumento = data;

        console.log('tipos de documentos', this.listTipoDocumento);
        //console.log('datos tipo de documento: ',data)
      },
      error => {
        console.log(error);
      }
    )
  }


  resetFileField(field: string) {
    if (field === 'imagen_perfil') {
     this.emprendedorForm.patchValue({ imagen_perfil: null });
     this.selectedImagen_perfil = null;
     this.bannerPreview = null;
   } 
 }

 generateImagePreview(file: File, field: string) {
   const reader = new FileReader();
   reader.onload = (e: any) => {
     if (field === 'imagen_perfil') {
       this.bannerPreview = e.target.result;
     } 
     this.cdRef.detectChanges();
   };
   reader.readAsDataURL(file);
 }


 updateEmprendedor(): void {
  const formData = new FormData();
  let estadoValue: string;
  formData.append('nombre', this.emprendedorForm.get('nombre')?.value);
  formData.append('apellido', this.emprendedorForm.get('apellido')?.value);
  formData.append('documento', this.emprendedorForm.get('documento')?.value);
  formData.append('celular', this.emprendedorForm.get('celular')?.value);
  formData.append('genero', this.emprendedorForm.get('genero')?.value);
  if (this.emprendedorForm.get('direccion')?.value) {
    formData.append('direccion', this.emprendedorForm.get('direccion')?.value);
  } else { }
  //formData.append('direccion', this.asesorForm.get('direccion')?.value);
  formData.append('id_tipo_documento', this.emprendedorForm.get('id_tipo_documento')?.value);
  formData.append('id_departamento', this.emprendedorForm.get('id_departamento')?.value);
  formData.append('id_municipio', this.emprendedorForm.get('id_municipio')?.value);
  formData.append('email', this.emprendedorForm.get('email')?.value);
  formData.append('password', this.emprendedorForm.get('password')?.value);

  if (this.selectedImagen_perfil) {
    formData.append('imagen_perfil',this.selectedImagen_perfil,this.selectedImagen_perfil.name);
  }

  Object.keys(this.emprendedorForm.controls).forEach((key) => {
    const control = this.emprendedorForm.get(key);
    if (control?.value !== null && control?.value !== undefined) {

      if (key === 'password' && control.value === '') {
        // No incluir la contraseña si está vacía
        return;
      }

      if (key !== 'imagen_perfil') {
        formData.append(key, control.value);
      }
      
      // Manejar otros campos como antes
      if (key === 'fecha_nac') {
        if (control.value) {
          const date = new Date(control.value);
          if (!isNaN(date.getTime())) {
            formData.append(key, date.toISOString().split('T')[0]);
          }
        }
      } else if (key === 'estado') {
        formData.append(key, control.value ? '1' : '0');
      } else {
        formData.append(key, control.value);
      }
    }
  });
  // Agregar la imagen de perfil si se ha seleccionado una nueva

  // Alternativa para imprimir los valores del FormData
  // console.log('Datos enviados en el FormData:');
  // formData.forEach((value, key) => {
  // console.log(`${key}: ${value}`);
  // });

  console.log('Datos del formulario:', this.emprendedorForm.value);


  /* Actualiza emprendedor */


    this.alertService.alertaActivarDesactivar('¿Estas seguro de guardar los cambios?', 'question').then((result) => {
      if (result.isConfirmed) {
        this.emprendedorService.updateEmprendedor(this.token, formData, this.documento).subscribe(
          (data) => {
            setTimeout(function () {
              location.reload();
            }, this.tiempoEspera);
            this.alertService.successAlert('Exito', data.message);
          },
          (error) => {
            this.alertService.errorAlert('Error', error.error.message);
            console.error(error);
            //console.log('error: ', error)
          }
        );
      }
    });
    /* Crea asesor */
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
          this.emprendedorForm.patchValue({ imagen_perfil: null });
          this.selectedImagen_perfil = null;
          this.bannerPreview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
    reader.onload = (e: any) => {
      const previewUrl = e.target.result;
      if (field === 'imagen_perfil') {
        this.emprendedorForm.patchValue({ imagen_perfil: previewUrl });
        this.bannerPreview = previewUrl;
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
 



  desactivarEmprendedor(): void {
    // let confirmationText = this.token
    //   ? "¿Estás seguro de desactivar tu cuenta?"
    //   : "¿Estás seguro de desactivar tu cuenta?";
    if (this.token) {
      this.alertService.DesactivarEmprendedor("¿Estás seguro de desactivar tu cuenta?",
      "¡Ten en cuenta que si desactivas tu cuenta tendras que validarte nuevamente por medio de tu correo electronico al momento de iniciar sección!", 'warning').then((result) => {
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
