import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Banner } from '../../../Modelos/banner.model';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { Aliado } from '../../../Modelos/aliado.model';
import { AlertService } from '../../../servicios/alert.service';
import { AliadoService } from '../../../servicios/aliado.service';
import { faCircleQuestion, faImage } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../Modelos/actividad.model';
import { ActividadService } from '../../../servicios/actividad.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddBannerComponent } from '../add-banner/add-banner.component';


@Component({
  selector: 'app-perfil-aliado',
  templateUrl: './perfil-aliado.component.html',
  styleUrl: './perfil-aliado.component.css'
})
export class PerfilAliadoComponent implements OnInit {

  logoPreview: string | ArrayBuffer | null = null;
  bannerPreview: string | ArrayBuffer | null = null;
  rutaPreview: string | ArrayBuffer | null = null;
  listBanners: Banner[] = [];
  bannerForm: FormGroup;
  aliadoForm: FormGroup;
  blockedInputs = true;
  falupa = faCircleQuestion;
  isLoading: boolean = false;
  activeField: string = '';
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
  tipoDeDato: Actividad[] = [];
  bloqueado = true;
  @ViewChild('fileInput') fileInput: ElementRef;
  faImages = faImage;
  showVideo: boolean = false;
  showImagen: boolean = false;
  showPDF: boolean = false;
  showTexto: boolean = false;
  Number = Number;
  tiempoEspera = 1800;
  showEditButton = false;
  mostrarRutaMulti: boolean = true;
  private videoUrl: string = '';
  private imageUrl: string = '';
  charCount: number = 0;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private aliadoService: AliadoService,
    private cdRef: ChangeDetectorRef,
    private actividadService: ActividadService,
    public dialog: MatDialog,
  ) {
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

    this.bannerForm = this.formBuilder.group({
      urlImagen: [Validators.required],
      estadobanner: [1],
    });
  }


  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.verEditarBanners();
    this.tipoDato();
    this.obtenerValorBaseDatos();
    this.initializeFormState();

    this.aliadoForm.get('id_tipo_dato')?.valueChanges.subscribe(() => {
      if (this.aliadoForm.get('id_tipo_dato')?.value) {
        this.onTipoDatoChange();
      }
    });
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
        this.idAliado = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }
  /*
  Este método abre un modal para asignar un asesor a una 
  asesoría específica. Utiliza el componente 
  `AsignarAsesorModalComponent` para la interacción.
*/
  openModal(id: number | null): void {
    let dialogRef: MatDialogRef<AddBannerComponent>;

    dialogRef = this.dialog.open(AddBannerComponent, {
      data: { id: id },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.verEditarBanners();
    });
  }

  /*
    Este método maneja la lógica para eliminar un banner de un aliado 
    y notificar al usuario sobre la acción.
  */
  eliminarBanner(id_aliado: number): void {
    this.alertService.alertaActivarDesactivar('¿Estas seguro de eliminar el banner?, no se mostrara en la pagina principal', 'question').then((result) => {
      if (result.isConfirmed) {
        this.aliadoService.EliminarBanner(this.token, id_aliado).subscribe(
          (data) => {
            setTimeout(function () {
              location.reload();
            }, this.tiempoEspera);
            localStorage.removeItem(`banners:activo`);
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
  Este método cancela la operación actual y recarga la página.
*/
  onCancel(): void {
    location.reload();
  }

  get f() { return this.aliadoForm.controls; }

  /*
    Este método obtiene los tipos de datos desde el servicio `actividadService` 
    y filtra aquellos con `id` diferente de 3.
  */

  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          this.tipoDeDato = data.filter(item => item.id !== 3);
          this.obtenerValorBaseDatos();
        },
        error => {
          console.log(error);
        }
      )
    }
  }
  /*
    Este método obtiene los datos de un aliado específico desde la base de datos 
    y actualiza el campo `id_tipo_dato` en el formulario `aliadoForm` si los datos son válidos.
  */
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
  private previousImageUrl: string = '';


  /*
  Este método maneja los cambios en el campo `id_tipo_dato` del formulario `aliadoForm` y ajusta los validadores 
  y la visibilidad de los campos de acuerdo al tipo de dato seleccionado.
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
    Este método se encarga de cargar y mostrar la información de un asesor en un formulario para su edición. 
  */
  verEditar(): void {
    this.isLoading = true;
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
          id_tipo_dato: data.id_tipo_dato,
          ruta_multi: data.ruta_multi,
          urlpagina: data.urlpagina,
          email: data.email,
          password: '',
          estado: data.estado === 'Activo' || data.estado === true || data.estado === 1
        });
        this.updateCharCount();
        this.previousImageUrl = data.id_tipo_dato === 2 ? data.ruta_multi : '';
        this.cdRef.detectChanges();
        this.onTipoDatoChange();
        this.isLoading = false;
      },
      error => {
        console.log(error);
        this.isLoading = false;
      }
    );
  }

  /*
  Este método `limpiarPrefijo` elimina un prefijo específico de una URL si está presente.
*/
  limpiarPrefijo(url: string): string {
    const prefijo = 'http://127.0.0.1:8000/storage/';
    return url.startsWith(prefijo) ? url.substring(prefijo.length) : url;
  }

  /*
  Este método inicializa el estado del formulario `aliadoForm` deshabilitando ciertos campos.
*/
  initializeFormState(): void {
    const fieldsToDisable = ['nombre', 'descripcion', 'logo', 'ruta_multi', 'id_tipo_dato', 'urlpagina'];
    fieldsToDisable.forEach(field => {
      const control = this.aliadoForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  /*
    Este método alterna el estado de bloqueo de los campos del formulario `aliadoForm`.
  */
  toggleInputsLock(): void {
    this.blockedInputs = !this.blockedInputs;
    const fieldsToToggle = ['nombre', 'descripcion', 'logo', 'ruta_multi', 'id_tipo_dato', 'urlpagina'];

    fieldsToToggle.forEach(field => {
      const control = this.aliadoForm.get(field);
      if (control) {
        if (this.blockedInputs) {
          control.disable();
        } else {
          control.enable();
        }
      } else {
        console.warn(`Control for field ${field} not found in form`);
      }
    });
    this.cdRef.detectChanges();
  }

  /*
    Este método habilita los campos del formulario `aliadoForm` para su edición.
  */
  onEdit() {
    this.blockedInputs = false;
    this.showEditButton = true;
    this.toggleInputsLock();
  }

  /*
    Este método obtiene los banners asociados a un aliado utilizando el servicio `aliadoService`.
  */
  verEditarBanners(): void {
    this.aliadoService.getBannerxAliado(this.token, this.idAliado).subscribe(
      data => {
        this.listBanners = data;
      },
      error => {
        console.error('Error al obtener los banners:', error);
      }
    )
  }

  updateCharCount(): void {
    const descripcionValue = this.aliadoForm.get('descripcion')?.value || '';
    this.charCount = descripcionValue.length;
  }

  

  /*
    Este método se encarga de actualizar la información del aliado y sus banners.
  */
  upadateAliado(): void {
    if (this.aliadoForm.invalid || this.bannerForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar los campos requeridos.');
      this.formSubmitted = true;
      return;
    }
    const formData = new FormData();
    let estadoValue: string;
    if (this.idAliado == null) {
      estadoValue = 'true';
    } else {
      estadoValue = this.aliadoForm.get('estado')?.value ? 'true' : 'false';
    }
    Object.keys(this.aliadoForm.controls).forEach((key) => {
      const control = this.aliadoForm.get(key);
      if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
        if (key === 'password') {
          if (control.value.trim() !== '') {
            formData.append(key, control.value);
          }
        } else if (key === 'estado') {
          formData.append(key, control.value ? 'true' : 'false');
        } else {
          formData.append(key, control.value);
        }
      }
    });
    const nombreDescripcion = this.aliadoForm.get('descripcion')?.value;
    if (nombreDescripcion && nombreDescripcion.length > 312) {
      this.alertService.errorAlert('Error', 'La descripción no puede tener más de 312 caracteres.');
      return;
    }
    if (nombreDescripcion && nombreDescripcion.length < 210) {
      this.alertService.errorAlert('Error', 'La descripción no puede tener menos de 210 caracteres.');
      return;
    }
    // Agregar campos específicos que se deben asegurar que estén en el FormData
    const specificFields = ['nombre', 'descripcion', 'email', 'id_tipo_dato'];
    specificFields.forEach(field => {
      const value = this.aliadoForm.get(field)?.value;
      if (value !== null && value !== undefined && value !== '') {
        formData.append(field, value);
      }
    });
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
    this.alertService.alertaActivarDesactivar('¿Estás seguro de guardar los cambios?', 'question').then((result) => {
      if (result.isConfirmed) {
        this.aliadoService.editarAliado(this.token, formData, this.idAliado).subscribe(
          (data) => {
            setTimeout(() => {
              location.reload();
            }, this.tiempoEspera);
            this.alertService.successAlert('Éxito', data.message);
          },
          (error) => {
            console.error('Error desde el servidor:', error);
            this.alertService.errorAlert('Error', error.error.message);
          }
        );
      }
    });
  }

  /*
    Este método simula un clic en el campo de entrada de archivos para abrir el selector de archivos.
  */
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

  /*
     Este método maneja la selección de archivos desde un input de tipo archivo. 
     Verifica si hay archivos seleccionados y, si es así, comprueba su tamaño.
   */
  onFileSelecteds(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let maxSize = 0;
      if (field === 'urlImagen' || field === 'logo' || field === 'ruta_multi') {
        maxSize = 5 * 1024 * 1024;
      } else if (field === 'ruta_documento') {
        maxSize = 18 * 1024 * 1024;
      }
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertService.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField(field);

        event.target.value = '';
        return;
      }
      if (field === 'logo') {
        const img = new Image();
        img.onload = () => {
          if (img.width > 1751 || img.height > 1751) {
            this.alertService.errorAlert('Error', 'La imagen del logo debe tener como máximo 1751 x 1751 píxeles.');
            this.resetFileField(field);
            event.target.value = '';
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
    Este método procesa un archivo seleccionado y actualiza el formulario correspondiente con la información del archivo.
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

  /*
  Este método maneja la entrada de texto en el campo `ruta_multi` del formulario `aliadoForm`.
*/
  onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.aliadoForm.patchValue({ ruta_multi: value });
  }

  /*
    Este método se encarga de restablecer el campo de archivo a su estado inicial, 
    eliminando cualquier valor previamente asignado.
  */
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
}
