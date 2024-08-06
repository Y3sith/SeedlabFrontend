
import { FormGroup, FormControl, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AliadoService } from '../../../../servicios/aliado.service';
import { ActividadService } from '../../../../servicios/actividad.service';
import { User } from '../../../../Modelos/user.model';
import { Aliado } from '../../../../Modelos/aliado.model';
import Pica from 'pica';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { faEye, faEyeSlash, faFileUpload, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../../Modelos/actividad.model';
@Component({
  selector: 'app-add-aliados',
  templateUrl: './add-aliados.component.html',
  styleUrls: ['./add-aliados.component.css'],
  providers: [AliadoService, ActividadService]
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
  estado: boolean = true;
  token: string;
  hide = true;
  user: User | null = null;
  passwordVisible: boolean = false;
  rutaSeleccionada: string = '';
  pdfFileName: string = '';
  currentRolId: number;
  id: number | null = null;
  compressedImage: string;
  bannerFile: File | null = null;
  selectedBanner: File | null = null;
  selectedLogo: File | null = null;
  selectedruta: File | null = null;
  faEye = faEye;
  tipoDeDato: Actividad[] = [];
  faEyeSlash = faEyeSlash;
  faFileUpload = faFileUpload;
  faFileLines = faFileLines;
  imagePreview: string | ArrayBuffer | null = null;
  aliadoid: string;

  bannerForm: FormGroup;
  aliadoForm: FormGroup;

  constructor(private aliadoService: AliadoService,
    private actividadService: ActividadService,
    private router: Router,
    private formBuilder: FormBuilder,
    private imageCompress: NgxImageCompressService,
    private cdRef: ChangeDetectorRef) {

    this.aliadoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      logo: [''],
      ruta_multi: [''],
      id_tipo_dato: [],
      email: ['', Validators.required],
      password: ['', Validators.required],
      estado: [1]
    });

    this.bannerForm = this.formBuilder.group({
      urlImagen: [''],
      estadobanner: ['Activo'],
    });

  }

  ngOnInit(): void {
    this.validateToken();    
    this.tipoDato();
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

  addAliado(): void {
    if (this.aliadoForm.invalid || this.bannerForm.invalid) {
      console.error('Formulario inválido');
      console.log('Errores aliadoForm:', this.getFormValidationErrors(this.aliadoForm));
      console.log('Errores bannerForm:', this.getFormValidationErrors(this.bannerForm));
      return;
    }

    const formData = new FormData();

    formData.append('nombre', this.aliadoForm.get('nombre')?.value);
    formData.append('descripcion', this.aliadoForm.get('descripcion')?.value);
    formData.append('id_tipo_dato', this.aliadoForm.get('id_tipo_dato')?.value);
    formData.append('email', this.aliadoForm.get('email')?.value);
    formData.append('password', this.aliadoForm.get('password')?.value);
    formData.append('estado', this.aliadoForm.get('estado')?.value ?? '1');
  

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo, this.selectedLogo.name);
    }
    if (this.selectedruta) {
      formData.append('ruta_multi', this.selectedruta, this.selectedruta.name);
    }

    formData.append('nombre', this.aliadoForm.get('nombre')?.value);


    if (this.selectedBanner) {
      formData.append('banner_urlImagen', this.selectedBanner, this.selectedBanner.name);
    }
    formData.append('banner_estadobanner', this.bannerForm.get('estadobanner')?.value);

    this.aliadoService.crearAliado(this.token, formData).subscribe(
      data => {
        console.log('Aliado creado', formData);
        this.aliadoid = data.banner.id_aliado;
        console.log('Banner creado', this.aliadoid);
      },
      err => {
        console.error('Error al crear aliado', err);
        if (err.error && err.error.message) {
          alert(err.error.message);
        } else {
          alert('Ocurrió un error al crear el aliado');
        }
      }
    );
  }

  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          this.tipoDeDato = data;
          console.log(data);
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  //  onFileSelecteds(event: any, field: string){
  //   if (event.target.files && event.target.files.length > 0) {
  //     const file = event.target.files[0];
      // try {
      //   if (field === 'urlImagen') {
      //     await this.validateImageDimensions(file, 800, 300, 8100, 3100); // Validar dimensiones para el banner
      //     this.selectedBanner = file;
      //     this.bannerForm.patchValue({ urlImagen: file });
      //   } else {
      //     await this.validateImageDimensions(file, 100, 100, 600, 600); // Validar dimensiones para el logo
      //     this.selectedLogo = file;
      //     this.aliadoForm.patchValue({ logo: file });
      //   }
      //   this.generateImagePreview(file);
      // } catch (error) {
      //   console.error(error);
      //   alert(error);
  
      //   // Limpiar el input file directamente en el DOM
      //   if (field === 'urlImagen') {
      //     this.selectedBanner = null;
      //   } else {
      //     this.selectedLogo = null;
      //   }
      //   event.target.value = ''; // Esta línea limpia el input de tipo file
      // }
  //   }
  // }

  onFileSelecteds(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (field === 'urlImagen') {
        this.selectedBanner = file;
        this.bannerForm.patchValue({ urlImagen: file });
      }
      if (field === 'logo'){
        this.selectedLogo = file;
        this.aliadoForm.patchValue({ logo: file });
      }
      if (field === 'ruta_multi'){
        this.selectedruta = file;
        this.aliadoForm.patchValue({ruta_multi: file});
      }
      }
  }




  generateImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
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

}