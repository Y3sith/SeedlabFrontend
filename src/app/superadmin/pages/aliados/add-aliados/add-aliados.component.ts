
import { FormGroup, FormControl, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AliadoService } from '../../../../servicios/aliado.service';
import { ActividadService } from '../../../../servicios/actividad.service';
import { AlertService } from '../../../../servicios/alert.service';
import { User } from '../../../../Modelos/user.model';
import { Aliado } from '../../../../Modelos/aliado.model';
import Pica from 'pica';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { faEye, faEyeSlash, faFileUpload, faFileLines, faL, faCircleQuestion, faImage, faTrashCan, faPaintBrush, } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../../Modelos/actividad.model';
import { data } from 'jquery';
import { Console, error } from 'console';
import { Banner } from '../../../../Modelos/banner.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddBannerModalComponent } from '../add-banner-modal/add-banner-modal.component';
@Component({
  selector: 'app-add-aliados',
  templateUrl: './add-aliados.component.html',
  styleUrls: ['./add-aliados.component.css'],
  providers: [AliadoService, ActividadService, AlertService]
})
export class AddAliadosComponent {
  nombre: string = '';
  logo: string = '';
  banner: string = '';
  descripcion: string = '';
  ruta: string = ''; // Ruta para la imagen o el video
  pdfRuta: string = ''; // Ruta para el PDF
  email: string = '';
  password: string = '';
  estado: true;
  token: string;
  hide = true;
  user: User | null = null;
  passwordVisible: boolean = false;
  rutaSeleccionada: string = '';
  pdfFileName: string = '';
  currentRolId: number;
  compressedImage: string;
  id: number | null = null;
  bannerFile: File | null = null;
  selectedBanner: File | null = null;
  selectedLogo: File | null = null;
  selectedruta: File | null = null;
  selectdVideo: string | null = null;
  faEye = faEye;
  tipoDeDato: Actividad[] = [];
  faEyeSlash = faEyeSlash;
  faFileUpload = faFileUpload;
  faFileLines = faFileLines;
  fatrash = faTrashCan;
  fapaint = faPaintBrush;
  idAliado: string; ///
  bannerForm: FormGroup;
  aliadoForm: FormGroup;
  showFirstSection = true;
  showSecondSection = false;

  showThirdSection = false;
  logoPreview: string | ArrayBuffer | null = null;
  bannerPreview: string | ArrayBuffer | null = null;
  rutaPreview: string | ArrayBuffer | null = null;
  currentIndex: number = 0;
  showErrors: boolean = false;
  submittedSection: number = -1;
  aliadoId: number;
  isActive: boolean = true;
  boton: boolean;
  formSubmitted = false;
  falupa = faCircleQuestion;
  faImages = faImage;
  @ViewChild('fileInput') fileInput: ElementRef;
  listBanners: Banner[] =[];
  
  constructor(private aliadoService: AliadoService,
    private actividadService: ActividadService,
    private alertService: AlertService,
    private router: Router,
    private formBuilder: FormBuilder,
    private imageCompress: NgxImageCompressService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private aRoute: ActivatedRoute) {

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
    this.isActive = true;
    this.idAliado = this.aRoute.snapshot.paramMap.get('id');
   // console.log("IDDDD",this.idAliado);

   
  }

  get f() { return this.aliadoForm.controls; }

  ngOnInit(): void {
    this.validateToken();
    this.tipoDato();
    this.verEditar();
    this.ocultosBotones();
    this.mostrarToggle();
    this.toggleActive();
    this.verEditarBanners();
    console.log('Initial estado value:', this.aliadoForm.get('estado')?.value);
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  openModal(id:number | null, idAliado: string): void{
    let dialogRef: MatDialogRef<AddBannerModalComponent>;

    dialogRef = this.dialog.open(AddBannerModalComponent, {
      data: { id: id, idAliado: this.idAliado 
      },
    });
   // console.log("aliado", idAliado);

    dialogRef.afterClosed().subscribe(result => {
      this.verEditarBanners();
    });
  }

  ocultosBotones(): void {
    if (this.idAliado != null) {
      this.boton = false;
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  eliminarBanner(id_aliado: number): void {
    this.aliadoService.EliminarBanner(this.token, id_aliado).subscribe(
      data=>{
        this.alertService.successAlert('Exito', data.message);
        //console.log("eliminaaa", data)
        location.reload();
      },
      error => {
       // console.error(error);
        this.alertService.successAlert('Error', error.error.message);
      }
    )
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

  validateImageDimensions(file: File, minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        if (width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight) {
          resolve(true);
        } else {
          reject(`La imagen debe tener dimensiones entre ${minWidth}x${minHeight} y ${maxWidth}x${maxHeight} píxeles.`);
        }
      };
      img.onerror = () => {
        reject('Error al cargar la imagen.');
      };
      img.src = URL.createObjectURL(file);
    });
  }

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
        this.isActive = data.estado === 'Activo' || data.estado === true || data.estado === 1;
        this.aliadoForm.patchValue({ estado: this.isActive });

        console.log("Estado cargado:", this.isActive);
      },
      error => {
        console.log(error);
      }
    );
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

    formData.append('nombre', this.aliadoForm.get('nombre')?.value);


    if (this.selectedBanner) {
      formData.append('banner_urlImagen', this.selectedBanner, this.selectedBanner.name);
    }
    formData.append('banner_estadobanner', this.bannerForm.get('estadobanner')?.value);

    console.log("SSSSSSSSSSSSSSSSSSSSSSSS", formData);
   
        
    if ( this.idAliado != null ) {
    this.aliadoService.editarAliado(this.token, formData, this.idAliado).subscribe(
      data =>{
        console.log("ACTUALIZAAAAAA", data);
        this.alertService.successAlert('Exito', data.message);
      },
      error => {
        console.error(error);
        this.alertService.successAlert('Error', error.error.message);

      }
    )
      
    }else {
      this.aliadoService.crearAliado(this.token, formData).subscribe(
        data => {
         this.alertService.successAlert('Exito', data.message);
         this.router.navigate(['list-aliados'])
        },
        error => {
          if (error.status === 400) {
            this.alertService.errorAlert('Error', error.error.message);
          }
        });
    }
  }

/* Cambia el estado del toggle*/
toggleActive() {
  this.isActive = !this.isActive;
  this.aliadoForm.patchValue({ estado: this.isActive });
  console.log("Toggle activado, nuevo estado:", this.isActive);
  console.log("Estado en el formulario después del toggle:", this.aliadoForm.get('estado')?.value);
}
/* Muestra el toggle del estado dependiendo del asesorId que no sea nulo*/
mostrarToggle(): void {
  this.boton = this.idAliado != null;
}


  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          this.tipoDeDato = data;
          console.log("DATO",data);
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  onTipoDatoChange(): void {
    const tipoDatoId = this.aliadoForm.get('id_tipo_dato').value;
    this.aliadoForm.get('ruta_multi').clearValidators();

    switch (tipoDatoId) {
      case '1': // Video
        this.aliadoForm.get('Video').setValidators([Validators.required]);
        break;
      case '2': // Imagen
        this.aliadoForm.get('Imagen').setValidators([Validators.required,]);
        break;
      case '3': // PDF
        this.aliadoForm.get('PDF').setValidators([Validators.required,]);
        break;
      case '4': // Texto
        this.aliadoForm.get('Texto').setValidators([Validators.required]);
        break;
      default:
        this.aliadoForm.get('fuente').clearValidators();
        break;
    }

    this.aliadoForm.get('fuente').updateValueAndValidity();
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

  // onTextInput(event: any) {
  //   const value = event.target.value;
  //   this.aliadoForm.patchValue({ ruta_multi: value });
  // }
  
  onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.aliadoForm.patchValue({ ruta_multi: value });
    console.log('ruta_multi actualizada:', value);  // Para depuración
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

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  private getDimensiones(file: File): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  next() {
    if (this.currentIndex === 0) {
      this.showFirstSection = false;
      this.showSecondSection = true;
      this.showThirdSection = false;
      this.currentIndex = 1;
    } else if (this.currentIndex === 1) {
      this.showFirstSection = false;
      this.showSecondSection = false;
      this.showThirdSection = true;
      this.currentIndex = 2;
    }
  }
  

  isFieldInvalid(fieldName: string): boolean {
    const field = this.aliadoForm.get(fieldName);
    return field && field.invalid && (field.dirty || field.touched);
  }

  previous() {
    if (this.currentIndex === 1) {
      this.showFirstSection = true;
      this.showSecondSection = false;
      this.showThirdSection = false;
      this.currentIndex = 0;
    } else if (this.currentIndex === 2) {
      this.showFirstSection = false;
      this.showSecondSection = true;
      this.showThirdSection = false;
      this.currentIndex = 1;
    }
  }
  }

  // isFirstSectionValid(): boolean {
  //   const nombreValid = this.aliadoForm.get('nombre').valid;
  //   const emailValid = this.aliadoForm.get('email').valid;
  //   const passwordValid = this.aliadoForm.get('password').valid;
    
  //   // Marcar los campos como tocados para que se muestren los errores
  //   if (!nombreValid) this.aliadoForm.get('nombre').markAsTouched();
  //   if (!emailValid) this.aliadoForm.get('email').markAsTouched();
  //   if (!passwordValid) this.aliadoForm.get('password').markAsTouched();
    
  //   return nombreValid && emailValid && passwordValid;
  // }
  
  // isSecondSectionValid(): boolean {
  //   const descripcionValid = this.aliadoForm.get('descripcion').valid;
  //   const idTipoDatoValid = this.aliadoForm.get('id_tipo_dato').valid;
  //   const rutaMultiValid = this.aliadoForm.get('ruta_multi').valid;
    
  //   // Marcar los campos como tocados para que se muestren los errores
  //   if (!descripcionValid) this.aliadoForm.get('descripcion').markAsTouched();
  //   if (!idTipoDatoValid) this.aliadoForm.get('id_tipo_dato').markAsTouched();
  //   if (!rutaMultiValid) this.aliadoForm.get('ruta_multi').markAsTouched();
    
  //   return descripcionValid && idTipoDatoValid && rutaMultiValid;
  // }

