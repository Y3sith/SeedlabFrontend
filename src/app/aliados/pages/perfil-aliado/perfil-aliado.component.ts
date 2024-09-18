import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Banner } from '../../../Modelos/banner.model';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Aliado } from '../../../Modelos/aliado.model';
import { AlertService } from '../../../servicios/alert.service';
import { AliadoService } from '../../../servicios/aliado.service';
import { faImage } from '@fortawesome/free-solid-svg-icons';
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
  listBanners: Banner[] =[];
  bannerForm: FormGroup;
  aliadoForm: FormGroup;
  blockedInputs = true;
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


  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.verEditarBanners();
    this.tipoDato();
    this.obtenerValorBaseDatos();
    this.initializeFormState();

    console.log('Tipos de dato disponibles:', this.tipoDeDato);
    this.aliadoForm.get('id_tipo_dato')?.valueChanges.subscribe(() => {
      if (this.aliadoForm.get('id_tipo_dato')?.value) {
        this.onTipoDatoChange();
      }
    });
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
  
  openModal(id:number | null): void{
    let dialogRef: MatDialogRef<AddBannerComponent>;

    dialogRef = this.dialog.open(AddBannerComponent, {
      data: { id: id },
    });
   // console.log("aliado", idAliado);

    dialogRef.afterClosed().subscribe(result => {
      this.verEditarBanners();
    });
  }

  eliminarBanner(id_aliado: number): void {
    this.alertService.alertaActivarDesactivar('¿Estas seguro de eliminar el banner?, no se mostrara en la pagina principal', 'question').then((result) => {
      if (result.isConfirmed) {
        this.aliadoService.EliminarBanner(this.token, id_aliado).subscribe(
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

  onCancel(): void {
    location.reload();
  }

  get f() { return this.aliadoForm.controls; }

  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          this.tipoDeDato = data.filter(item => item.id !== 3);
          console.log("DATO",data);
          this.obtenerValorBaseDatos();
        },
        error => {
          console.log(error);
        }
      )
    }
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
  private previousImageUrl: string = '';

  onTipoDatoChange(): void {
    const tipoDatoId = this.aliadoForm.get('id_tipo_dato').value;
    let currentRutaMulti = this.aliadoForm.get('ruta_multi').value;
    
    this.aliadoForm.get('ruta_multi').clearValidators();
    this.aliadoForm.get('Video')?.clearValidators();
    this.aliadoForm.get('Imagen')?.clearValidators();
    this.aliadoForm.get('PDF')?.clearValidators();
    this.aliadoForm.get('Texto')?.clearValidators();

    const tipoDatoIdNumber = Number(tipoDatoId);
  
    // Establecer el validador y mostrar el campo correspondiente según la selección
    switch (tipoDatoIdNumber) {
      case 1: // Video
        this.showVideo = true;
        this.showImagen = false;
        this.aliadoForm.get('ruta_multi').setValidators([Validators.required]);
        this.aliadoForm.patchValue({ruta_multi: this.videoUrl});
      console.log('Mostrando Video');
        break;
      case 2: // Imagen
        this.showImagen = true;
        this.aliadoForm.get('ruta_multi').setValidators([Validators.required]);
        this.aliadoForm.patchValue({ruta_multi: this.imageUrl});
        //this.previousImageUrl = currentRutaMulti;
        console.log('Mostrando Imagen');
        break;
      default:
        console.log('Caso no manejado:', tipoDatoId);
        break;
    }
    // Actualizar la validez del campo ruta_multi
    this.aliadoForm.get('ruta_multi').updateValueAndValidity();
    // Forzar la detección de cambios
    this.cdRef.detectChanges();
  }

  onRutaMultiChange(event: any): void {
    const tipoDatoId = Number(this.aliadoForm.get('id_tipo_dato').value);
    const newValue = event.target.value;

    if (tipoDatoId === 1) { // Video
      this.videoUrl = this.limpiarPrefijo(newValue);
    } else if (tipoDatoId === 2) { // Imagen
      this.imageUrl = newValue;
    }

    this.aliadoForm.patchValue({ruta_multi: newValue}, {emitEvent: false});
  }

  verEditar(): void {
    this.aliadoService.getAliadoxid(this.token, this.idAliado).subscribe(
      data => {
        let rutaMulti = data.ruta_multi;
        if (data.id_tipo_dato === 1) { // Video
          this.videoUrl = this.limpiarPrefijo(rutaMulti);
          rutaMulti = this.videoUrl;
        } else if (data.id_tipo_dato === 2) { // Imagen
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
        this.previousImageUrl = data.id_tipo_dato === 2 ? data.ruta_multi : '';
        // Establecer una variable para controlar la visibilidad de ruta_multi
        //this.mostrarRutaMulti = data.id_tipo_dato !== 2;
        
        console.log("aaaa", data);
        this.onTipoDatoChange();
      },
      error => {
        console.log(error);
      }
    );
  }

  limpiarPrefijo(url: string): string {
    const prefijo = 'http://127.0.0.1:8000/storage/';
    return url.startsWith(prefijo) ? url.substring(prefijo.length) : url;
  }

  initializeFormState(): void {
    const fieldsToDisable = ['nombre', 'descripcion', 'logo', 'ruta_multi', 'id_tipo_dato', 'urlpagina'];
    fieldsToDisable.forEach(field => {
      const control = this.aliadoForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  /* Bloqueo de inputs */
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
        console.log(`Field ${field} is ${control.disabled ? 'disabled' : 'enabled'}`);
      } else {
        console.warn(`Control for field ${field} not found in form`);
      }
    });
  
    // Force change detection
    this.cdRef.detectChanges();
  
    // Log the entire form state
    console.log('Form state after toggling:', this.aliadoForm);
  }

  onEdit() {
    this.blockedInputs = false;
    this.showEditButton = true;
    this.toggleInputsLock();
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

  upadateAliado(): void {
    if (this.aliadoForm.invalid || this.bannerForm.invalid) {
      console.log("Formulario Invalido", this.aliadoForm.value);
      this.alertService.errorAlert('Error', 'Debes completar los campos requeridos.');
      this.formSubmitted = true;
      return; // Detener si el formulario es inválido
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
  
    // Manejar los campos especiales y evitar duplicaciones
    Object.keys(this.aliadoForm.controls).forEach((key) => {
      const control = this.aliadoForm.get(key);
      if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
        if (key === 'password') {
          // Solo incluir la contraseña si no está vacía
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
  
    // Mostrar alerta de confirmación antes de proceder con la actualización
    this.alertService.alertaActivarDesactivar('¿Estás seguro de guardar los cambios?', 'question').then((result) => {
      if (result.isConfirmed) {
        this.aliadoService.editarAliado(this.token, formData, this.idAliado).subscribe(
          (data) => {
            console.log('Respuesta del servidor:', data);
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
