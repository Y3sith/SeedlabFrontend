import { FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AliadoService } from '../../../../servicios/aliado.service';
import { ActividadService } from '../../../../servicios/actividad.service';
import { AlertService } from '../../../../servicios/alert.service';
import { User } from '../../../../Modelos/user.model';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ChangeDetectorRef } from '@angular/core';
import { faEye, faEyeSlash, faCircleQuestion, faImage } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../../Modelos/actividad.model';
import { Banner } from '../../../../Modelos/banner.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddBannerModalComponent } from '../add-banner-modal/add-banner-modal.component';
import { Location } from '@angular/common';

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
  idAliado: string; ///
  bannerForm: FormGroup;
  aliadoForm: FormGroup;
  showFirstSection = true;
  showSecondSection = false;
  tiempoEspera = 1800;

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
  @ViewChild('fileInputs') fileInputs: ElementRef;
  listBanners: Banner[] = [];
  showVideo: boolean = false;
  showImagen: boolean = false;
  showPDF: boolean = false;
  showTexto: boolean = false;
  isEditing: boolean = false;
  isLoading: boolean = false;

  constructor(private aliadoService: AliadoService,
    private actividadService: ActividadService,
    private alertService: AlertService,
    private router: Router,
    private formBuilder: FormBuilder,
    private imageCompress: NgxImageCompressService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private aRoute: ActivatedRoute,
    private location: Location
  ) {

    this.aliadoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      logo: [null, Validators.required],
      ruta_multi: [null, Validators.required],
      urlpagina: ['', Validators.required],
      id_tipo_dato: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      estado: [true]

    });

    this.bannerForm = this.formBuilder.group({
      urlImagen: ['', Validators.required],
      estadobanner: [1],
    });
    this.isActive = true;
    this.idAliado = this.aRoute.snapshot.paramMap.get('id');
  }

  goBack(): void {
    this.location.back();
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

  openModal(id: number | null, idAliado: string): void {
    let dialogRef: MatDialogRef<AddBannerModalComponent>;

    dialogRef = this.dialog.open(AddBannerModalComponent, {
      data: {
        id: id, idAliado: this.idAliado
      },
    });

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

  triggerFileInputs() {
    this.fileInputs.nativeElement.click();
  }

  eliminarBanner(id_aliado: number): void {
    this.alertService.alertaActivarDesactivar('¿Estas seguro de eliminar el banner?, no se mostrara en la pagina principal', 'question').then((result) => {
      if (result.isConfirmed) {
        this.aliadoService.EliminarBanner(this.token, id_aliado).subscribe(
          (data) => {
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

  verEditarBanners(): void {
    this.isLoading = true;
    this.aliadoService.getBannerxAliado(this.token, this.idAliado).subscribe(
      data => {
        this.listBanners = data;
        this.isLoading = false;
      },
      error => {
        console.error('Error al obtener los banners:', error);
        this.isLoading = false;
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

  verEditar(): void {
    this.isLoading = true;
    this.aliadoService.getAliadoxid(this.token, this.idAliado).subscribe(
      data => {
        this.aliadoForm.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          logo: data.logo,
          urlpagina: data.urlpagina,
          id_tipo_dato: data.id_tipo_dato,
          email: data.email,
          password: '',
          estado: data.estado === 'Activo' || data.estado === true || data.estado === 1
        });
        this.isActive = data.estado === 'Activo' || data.estado === true || data.estado === 1;
        this.aliadoForm.patchValue({ estado: this.isActive });
        this.isEditing = true;
        this.isLoading = false;
      },
      error => {
        console.log(error);
        this.isEditing = false;
        this.isLoading = false;
      }
    );
  }

  addAliado(): void {
    if (this.idAliado == null) {
      if (this.aliadoForm.invalid || this.bannerForm.invalid) {
        // Mostrar alert si algún formulario es inválido
        this.alertService.errorAlert('Error', 'Por favor, completa todos los campos requeridos.');

        this.formSubmitted = true;

        if (this.aliadoForm.invalid) {
          this.formSubmitted = true;
          return; // Detiene la ejecución si el formulario es inválido
        }
        return;
      }
    }


    const formData = new FormData();
    let estadoValue: boolean;
    if (this.idAliado == null) {
      // Es un nuevo aliado, forzar el estado a 'true'
      estadoValue = true;
    } else {
      // Es una edición, usar el valor del formulario
      estadoValue = this.aliadoForm.get('estado')?.value;
    }

const nombreAliado = this.aliadoForm.get('nombre')?.value;
if (nombreAliado){
  if (/^\d+$/.test(nombreAliado)) {
    this.alertService.errorAlert('Error', 'El nombre no puede estar compuesto solamente de numeros');
    return;
  }
}

    const nombreDescripcion = this.aliadoForm.get('descripcion')?.value;
    if (nombreDescripcion && nombreDescripcion.length > 312) {
      this.alertService.errorAlert('Error', 'La descripción no puede tener más de 312 caracteres.');
      return;
    }
    if (nombreDescripcion && nombreDescripcion.length < 210) {
      this.alertService.errorAlert('Error', 'La descripción no puede tener menos de 210 caracteres.');
      return;
    }

    formData.append('nombre', this.aliadoForm.get('nombre')?.value);
    formData.append('descripcion', this.aliadoForm.get('descripcion')?.value);
    formData.append('urlpagina', this.aliadoForm.get('urlpagina')?.value);
    formData.append('id_tipo_dato', this.aliadoForm.get('id_tipo_dato')?.value);
    formData.append('email', this.aliadoForm.get('email')?.value);
    formData.append('password', this.aliadoForm.get('password')?.value);
    formData.append('estado', estadoValue.toString());


    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo, this.selectedLogo.name);
    }
    if (this.selectedruta) {
      formData.append('ruta_multi', this.selectedruta, this.selectedruta.name);
    } else {
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

    console.log(formData);

    if (this.idAliado != null) {
      this.aliadoService.editarAliado(this.token, formData, this.idAliado).subscribe(
        data => {
          this.alertService.successAlert('Exito', data.message);
          this.router.navigate(['list-aliados']);
        },
        error => {
          this.alertService.successAlert('Error', error.error.message);

        }
      )

    } else {
      this.aliadoService.crearAliado(this.token, formData).subscribe(
        data => {
          this.alertService.successAlert('Exito', data.message);
          this.router.navigate(['list-aliados']);
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
    this.aliadoForm.patchValue({ estado: this.isActive ? true : false });
  }
  /* Muestra el toggle del estado dependiendo del asesorId que no sea nulo*/
  mostrarToggle(): void {
    this.boton = this.idAliado != null;
  }


  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          // Filtrar los datos para excluir el tipo de dato con ID 3
          this.tipoDeDato = data.filter(item => item.id !== 3);
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
        maxSize = 18 * 1024 * 1024; // 18MB para documentos
      }
  
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField(field);
  
        // Limpia el archivo seleccionado y resetea la previsualización
        event.target.value = ''; // Borra la selección del input
        return;
      }
  
      // Nueva validación para las dimensiones del logo
      if (field === 'logo') {
        const img = new Image();
        img.onload = () => {
          if (img.width > 1751 || img.height > 1751) {
            this.alertService.errorAlert('Error', 'La imagen del logo debe tener como máximo 1751 x 1751 píxeles.');
            this.resetFileField(field);
            event.target.value = ''; // Borra la selección del input
            return;
          } else {
            this.processFile(file, field);
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        this.processFile(file, field);
      }
    }
  }
  
  private processFile(file: File, field: string) {
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
  }
  
  onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.aliadoForm.patchValue({ ruta_multi: value });
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.aliadoForm.get(fieldName);
    return field && field.invalid && (field.dirty || field.touched);
  }

  cancel(): void {
    this.verEditar();
  }
}



