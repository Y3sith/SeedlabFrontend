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
import { environment } from '../../../../../environment/env';

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
  charCount: number = 0;
  private videoUrl: string = '';
  private imageUrl: string = '';
  urlparaperfil: any;
  Number = Number;
  isSubmitting = false;

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

  /*
    Este código define un formulario reactivo en Angular utilizando FormBuilder para crear y gestionar un grupo 
    de campos relacionados con los datos de un aliado. Se aplican validaciones específicas para garantizar que la entrada 
    de datos sea correcta, como la obligatoriedad, formatos adecuados (por ejemplo, solo letras, solo números, o formato 
    de correo electrónico), longitud mínima, y validaciones personalizadas para fechas. Adicionalmente, la estructura `sectionFields` 
    organiza los campos en secciones, facilitando su disposición o presentación en la interfaz de usuario. 
    El estado del aliado se inicializa como `true`, indicando que el aliado está activo por defecto.
  */
    this.aliadoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      logo: [null, Validators.required],
      ruta_multi: [null, Validators.required],
      urlpagina: ['', Validators.required],
      id_tipo_dato: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      estado: [true]

    });

  /*
    Este código define un formulario reactivo en Angular utilizando FormBuilder para crear y gestionar un grupo 
    de campos relacionados con los datos de un banner. Se aplican validaciones específicas para garantizar que la entrada 
    de datos sea correcta, como la obligatoriedad, formatos adecuados (por ejemplo, solo letras, solo números, o formato 
    de correo electrónico), longitud mínima, y validaciones personalizadas para fechas. Adicionalmente, la estructura `sectionFields` 
    organiza los campos en secciones, facilitando su disposición o presentación en la interfaz de usuario. 
    El estado del banner se inicializa como `true`, indicando que el banner está activo por defecto.
  */
    this.bannerForm = this.formBuilder.group({
      urlImagen: ['', Validators.required],
      estadobanner: [1],
    });
    this.isActive = true;
    this.idAliado = this.aRoute.snapshot.paramMap.get('id');

    this.aliadoForm.get('id_tipo_dato')?.valueChanges.subscribe(() => {
      if (this.aliadoForm.get('id_tipo_dato')?.value) {
        this.onTipoDatoChange();
      }
    });
  }

  /*
    Este método se utiliza cuando se desea regresar a la vista anterior sin recargar la página o perder el estado actual.
  */
  goBack(): void {
    this.location.back();
  }

  get f() { return this.aliadoForm.controls; }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.tipoDato();
    this.verEditar();
    this.obtenerValorBaseDatos();
    this.ocultosBotones();
    this.mostrarToggle();
    this.toggleActive();
    this.verEditarBanners();
  }

  /*
  Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
  formulario o cualquier otra parte de la aplicación.
  */
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

  limpiarPrefijoEnviroment() {
    const apiUrl = environment.apiUrl;
    this.urlparaperfil = apiUrl.replace(/^\/api\//, '');
    return this.urlparaperfil;
  }

    /*
  Este método maneja los cambios en el campo `ruta_multi` del formulario `aliadoForm` cuando el usuario actualiza su valor.
*/
onRutaMultiChange(event: any): void {
  const tipoDatoId = Number(this.aliadoForm.get('id_tipo_dato').value);
  const newValue = event.target.value;

  if (tipoDatoId === 1) {
    this.videoUrl = this.limpiarPrefijo(newValue);
  } else if (tipoDatoId === 2) {
    this.imageUrl = newValue;
  }

  this.aliadoForm.patchValue({ ruta_multi: newValue }, { emitEvent: false });
}


  /*
  Este método `limpiarPrefijo` elimina un prefijo específico de una URL si está presente.
*/
limpiarPrefijo(url: string): string {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  this.urlparaperfil = apiUrl.replace(/\/api\/?$/, '');
  const prefijo = `${this.urlparaperfil}/storage/`;

  if (url.startsWith(prefijo)) {
    return url.substring(prefijo.length);
  } else if (url.startsWith(`${apiUrl}/storage/`)) {
    return url.substring(`${apiUrl}/storage/`.length);
  }
  return url;
}

  /* 
  Este metodo lo que hace es abrir un modal para poder editar un banner del aliado
  */
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

  /*
  Este método se utiliza para mostrar u ocultar los botones para cuando esta creado o editando un aliado
  */
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

  /*
  Este método se utiliza para eliminar el banner del aliado
  */
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

  /*
  Este método se utiliza para mostrar traer los datos de los banners y que los vea el usuario
  */
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

  /*
  Valida si las dimensiones de la imagen están dentro de los límites dados.
  */
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

  /*
  Este método se utiliza para mostrar traer los datos de los aliados y que los vea el usuario 
  */
  verEditar(): void {
    this.isLoading = true;
    this.isEditing =true;
    this.aliadoService.getAliadoxid(this.token, this.idAliado).subscribe(
      data => {
        let rutaMulti = data.ruta_multi;
        if (data.id_tipo_dato === 1) {
          this.videoUrl = this.limpiarPrefijo(rutaMulti);
          rutaMulti = this.videoUrl;
        } else if (data.id_tipo_dato === 2) {
          this.imageUrl = rutaMulti;
        }
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
        this.updateCharCount();
        this.isActive = data.estado === 'Activo' || data.estado === true || data.estado === 1;
        this.aliadoForm.patchValue({ estado: this.isActive });
        this.previousImageUrl = data.id_tipo_dato === 2 ? data.ruta_multi : '';
        this.cdRef.detectChanges();
        this.onTipoDatoChange();
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

  /*
  Este método se utiliza para hacer el contador de caracteres de la descripcion del aliado
  */
  updateCharCount(): void {
    const descripcionValue = this.aliadoForm.get('descripcion')?.value || '';
    this.charCount = descripcionValue.length;
  }

  /*
    Este método gestiona la creación o actualización de un aliado mediante la recolección de datos desde un formulario reactivo (`aliadoForm`) 
    y la validación de la información ingresada. El método determina si se está editando un aliado existente o creando uno nuevo. 
    En el caso de una actualización, se solicita confirmación al usuario antes de realizar la actualización mediante el servicio `aliadoService`. 
    Si se trata de una creación de aliado, se realiza la llamada al servicio correspondiente, mostrando alertas de éxito o error según sea necesario.
  */
  addAliado(): void {
    this.isSubmitting = true;
    if (this.idAliado == null) {
      if (this.aliadoForm.invalid || this.bannerForm.invalid) {
        // Mostrar alert si algún formulario es inválido
        this.alertService.errorAlert('Error', 'Por favor, completa todos los campos requeridos.');
        this.isSubmitting = false;
        this.formSubmitted = true;
        if (this.aliadoForm.invalid) {
          this.formSubmitted = true;
          this.isSubmitting = false;
          return; 
        }
        return;
      }
    }

    const camposObligatorios = ['nombre', 'descripcion', 'urlpagina', 'celular','email' ];
    for (const key of camposObligatorios) {
        const control = this.aliadoForm.get(key);
        if (control && control.value && control.value.trim() === '') {
            this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
            this.isSubmitting = false;
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
    this.isSubmitting = false;
    return;
  }
}

    const nombreDescripcion = this.aliadoForm.get('descripcion')?.value;
    if (nombreDescripcion && nombreDescripcion.length > 312) {
      this.alertService.errorAlert('Error', 'La descripción no puede tener más de 312 caracteres.');
      this.isSubmitting = false;
      return;
    }
    if (nombreDescripcion && nombreDescripcion.length < 210) {
      this.alertService.errorAlert('Error', 'La descripción no puede tener menos de 210 caracteres.');
      this.isSubmitting = false;
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
            this.isSubmitting = false;
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

  /*
    El método se encarga de obtener una lista de tipos de datos de multimedia desde el servicio de autenticación (`authService`) 
    y almacenarla en la propiedad `tipoDeDato`. 
  */
  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          // Filtrar los datos para excluir el tipo de dato con ID 3
          this.tipoDeDato = data.filter(item => item.id !== 3);
          this.obtenerValorBaseDatos();
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  private previousImageUrl: string = '';

  /*
    El método se encarga de dependiendo del dato multimedia seleccioando aparezca en el selec con el input dispuesto completar
  */
    onTipoDatoChange(): void {
      const tipoDatoId = this.aliadoForm.get('id_tipo_dato').value;
      let currentRutaMulti = this.aliadoForm.get('ruta_multi').value;
  
      this.aliadoForm.get('ruta_multi').clearValidators();
      this.aliadoForm.get('Video')?.clearValidators();
      this.aliadoForm.get('Imagen')?.clearValidators();
      this.aliadoForm.get('PDF')?.clearValidators();
      this.aliadoForm.get('Texto')?.clearValidators();
  
      const tipoDatoIdNumber = Number(tipoDatoId);
      switch (tipoDatoIdNumber) {
        case 1:
          this.showVideo = true;
          this.showImagen = false;
          this.aliadoForm.get('ruta_multi').setValidators([Validators.required]);
          this.aliadoForm.patchValue({ ruta_multi: this.videoUrl });
          console.log('Mostrando Video');
          break;
        case 2:
          this.showImagen = true;
          this.aliadoForm.get('ruta_multi').setValidators([Validators.required]);
          this.aliadoForm.patchValue({ ruta_multi: this.imageUrl });
          console.log('Mostrando Imagen');
          break;
        default:
          break;
      }
      this.aliadoForm.get('ruta_multi').updateValueAndValidity();
      this.cdRef.detectChanges();
    }

    obtenerValorBaseDatos(): void {
      if (this.idAliado) {
        this.aliadoService.getAliadoxid(this.token, this.idAliado).subscribe(
          data => {
            if (data && data.id_tipo_dato) {
              this.aliadoForm.get('id_tipo_dato').setValue(data.id_tipo_dato);
              this.onTipoDatoChange(); // Llama a este método para actualizar la visibilidad de los campos
            }
          },
          error => {
            console.log('Error al obtener el valor de la base de datos:', error);
          }
        );
      }
    }

  /*
    Este método maneja la selección de archivos desde un input de tipo archivo. 
    Verifica si hay archivos seleccionados y, si es así, comprueba su tamaño.
  */
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
  
  /* 
  Procesa un archivo seleccionado (imagen o logo) y actualiza los campos correspondientes en el formulario. 
  Utiliza FileReader para convertir el archivo a un formato de URL y asigna esta URL al campo adecuado 
  ('urlImagen', 'logo', 'ruta_multi'). También genera una previsualización del archivo si es necesario y actualiza 
  el archivo seleccionado en las variables correspondientes según el campo ('selectedBanner', 'selectedLogo', etc.).
  */
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

  /*
    Este método utiliza `FileReader` para crear una vista previa de la imagen 
    seleccionada, actualizando la propiedad correspondiente en el componente.
  */
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

  /*
    Este método recorre los controles del formulario y recopila los errores 
    de validación, devolviendo un objeto que contiene los campos con errores para su posible 
    visualización.
  */
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

  /* 
  Alterna la visibilidad de la contraseña en un campo, mostrando u ocultando el texto según el valor de `passwordVisible`.
  */
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  /* 
  Obtiene las dimensiones (ancho y alto) de una imagen proporcionada como archivo. 
  Crea una promesa que se resuelve con las dimensiones cuando la imagen se carga.
  */
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

  /* 
  Verifica si un campo específico del formulario es inválido y si ha sido tocado o modificado, 
  lo que ayuda a gestionar la validación visual en el formulario.
  */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.aliadoForm.get(fieldName);
    return field && field.invalid && (field.dirty || field.touched);
  }

  /*
  funcion para cuando se esta editando el aliado cancelar los cambios realizados antes de dar click en el boton guardar
  */
  cancel(): void {
    this.verEditar();
  }
}



