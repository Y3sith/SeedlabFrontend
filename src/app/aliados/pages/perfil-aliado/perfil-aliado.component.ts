import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Banner } from '../../../Modelos/banner.model';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Aliado } from '../../../Modelos/aliado.model';
import { AlertService } from '../../../servicios/alert.service';
import { AliadoService } from '../../../servicios/aliado.service';
import { faImage } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-perfil-aliado',
  templateUrl: './perfil-aliado.component.html',
  styleUrl: './perfil-aliado.component.css'
})
export class PerfilAliadoComponent implements OnInit {

  logoPreview: string | ArrayBuffer | null = null;
  bannerPreview: string | ArrayBuffer | null = null;
  rutaPreview: string | ArrayBuffer | null = null;
  listBanners: Banner[] =[];
  bannerForm: FormGroup;
  aliadoForm: FormGroup;
  blockedInputs = true;
  token: string;
  user: User | null = null;
  aliado: Aliado;
  currentRolId: number;
  id: number | null = null;
  idAliado: any | null = null;
  formSubmitted = false;
  selectedBanner: File | null = null;
  selectedLogo: File | null = null;
  selectedruta: File | null = null;
  selectdVideo: string | null = null;
  hide = true;
  bloqueado = true;
  @ViewChild('fileInput') fileInput: ElementRef;
  faImages = faImage;


  constructor(
    private router: Router,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private aliadoService: AliadoService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.aliadoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      logo: [null, Validators.required],
      ruta_multi: [null, Validators.required],
      id_tipo_dato: [Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      estado: [true]
      
    });

    this.bannerForm = this.formBuilder.group({
      urlImagen: [Validators.required],
      estadobanner: [1],
    });
    }


  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.verEditarBanners();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.idAliado = this.user.id;
        this.currentRolId = this.user.id_rol;
        console.log(this.user);
        console.log("ASDDS",this.idAliado);
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  get f() { return this.aliadoForm.controls; }


  verEditar():void{
    this.aliadoService.getAliadoxid(this.token, this.idAliado).subscribe(
      data => {
        this.aliadoForm.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          logo: data.logo,
          //ruta_multi: data.ruta_multi,
          id_tipo_dato: data.id_tipo_dato,
          email: data.email,
          password: '',
          estado: data.estado === 'Activo' || data.estado === true || data.estado === 1
        });
        console.log("aaaa",data);
      },
      error => {
        console.log(error);
      }
    );
  }

  verEditarBanners():void {
    this.aliadoService.getBannerxAliado(this.token, this.idAliado).subscribe(
      data => {
        this.listBanners = data;
        console.log('Banners:', this.listBanners);
      },
      error => {
        console.error('Error al obtener los banners:', error);
      }
    )
  }

  addAliado(): void {
    if (this.idAliado == null){
      if (this.aliadoForm.invalid || this.bannerForm.invalid) {
        // Mostrar alert si algún formulario es inválido
        this.alertService.errorAlert('Error', 'Por favor, completa todos los campos requeridos.');
  
        this.formSubmitted = true;
  
      if (this.aliadoForm.invalid) {
        this.formSubmitted = true;
        console.log("aqui",this.formSubmitted)   
        return; // Detiene la ejecución si el formulario es inválido
      }
        
        console.error('Formulario inválido');
        console.log('Errores aliadoForm:', this.getFormValidationErrors(this.aliadoForm));
        console.log('Errores bannerForm:', this.getFormValidationErrors(this.bannerForm));
        return;
       }
    }

    
    const formData = new FormData();
    let estadoValue: string;
    if (this.idAliado == null) {
      // Es un nuevo aliado, forzar el estado a 'true'
      estadoValue = 'true';
    } else {
      // Es una edición, usar el valor del formulario
      estadoValue = this.aliadoForm.get('estado')?.value ? 'true' : 'false';
    }
  
    console.log('Estado antes de crear FormData:', estadoValue);
    
    formData.append('nombre', this.aliadoForm.get('nombre')?.value);
    formData.append('descripcion', this.aliadoForm.get('descripcion')?.value);
    formData.append('id_tipo_dato', this.aliadoForm.get('id_tipo_dato')?.value);
    formData.append('email', this.aliadoForm.get('email')?.value);
    formData.append('password', this.aliadoForm.get('password')?.value);
    formData.append('estado', estadoValue);


    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo, this.selectedLogo.name);
    }
    if (this.selectedruta) {
      formData.append('ruta_multi', this.selectedruta, this.selectedruta.name);
    } else{
      const rutaMultiValue = this.aliadoForm.get('ruta_multi')?.value;
      if (rutaMultiValue) {
        formData.append('ruta_multi', rutaMultiValue);
    }
  }
   
    this.aliadoService.editarAliado(this.token, formData, this.idAliado).subscribe(
      data =>{
        console.log("ACTUALIZAAAAAA", data);
        this.alertService.successAlert('Exito', data.message);
      },
      error => {
        console.error(error);
        this.alertService.successAlert('Error', error.error.message);

      });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
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
        if (field === 'urlImagen') {
          this.bannerForm.patchValue({ urlImagen: null });
          this.selectedBanner = null;
          this.bannerPreview = null; // Resetea la previsualización
        } else if (field === 'logo') {
          this.aliadoForm.patchValue({ logo: null });
          this.selectedLogo = null;
          this.logoPreview = null; // Resetea la previsualización
        } else if (field === 'ruta_multi') {
          this.aliadoForm.patchValue({ ruta_multi: null });
          this.selectedruta = null;
          this.rutaPreview = null; // Resetea la previsualización
        }
        this.resetFileField(field);
        return;
      }

      const reader = new FileReader();
    reader.onload = (e: any) => {
      const previewUrl = e.target.result;
      if (field === 'urlImagen') {
        this.bannerForm.patchValue({ urlImagen: previewUrl });
        this.bannerPreview = previewUrl;
      } else if (field === 'logo') {
        this.aliadoForm.patchValue({ logo: previewUrl });
        this.logoPreview = previewUrl;
      } else if (field === 'ruta_multi') {
        this.aliadoForm.patchValue({ ruta_multi: previewUrl });
        this.rutaPreview = previewUrl;
      }
    };
    reader.readAsDataURL(file);
  
      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'urlImagen') {
        this.selectedBanner = file;
        this.bannerForm.patchValue({ urlImagen: file });
      } else if (field === 'logo') {
        this.selectedLogo = file;
        this.aliadoForm.patchValue({ logo: file });
      } else if (field === 'ruta_multi') {
        this.selectedruta = file;
        this.aliadoForm.patchValue({ ruta_multi: file });
      } else if (field === 'ruta_documento') {
        this.selectedruta = file;
        this.aliadoForm.patchValue({ ruta_multi: file });
      }
      
  } else {
    this.resetFileField(field);
  }
  }

  resetFileField(field: string) {
    if (field === 'urlImagen') {
      this.bannerForm.patchValue({ urlImagen: null });
      this.selectedBanner = null;
      this.bannerPreview = null;
    } else if (field === 'logo') {
      this.aliadoForm.patchValue({ logo: null });
      this.selectedLogo = null;
      this.logoPreview = null;
    } else if (field === 'ruta_multi') {
      this.aliadoForm.patchValue({ ruta_multi: null });
      this.selectedruta = null;
      this.rutaPreview = null;
    }
  }

  generateImagePreview(file: File, field: string) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'logo') {
        this.logoPreview = e.target.result;
      } else if (field === 'urlImagen') {
        this.bannerPreview = e.target.result;
      } else if (field === 'ruta_multi') {
        this.rutaPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }
}
