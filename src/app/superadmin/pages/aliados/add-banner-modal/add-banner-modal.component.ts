import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { User } from '../../../../Modelos/user.model';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AliadoService } from '../../../../servicios/aliado.service';
import { AlertService } from '../../../../servicios/alert.service';
import { faCircleQuestion, faImage } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-banner-modal',
  templateUrl: './add-banner-modal.component.html',
  styleUrl: './add-banner-modal.component.css'
})


export class AddBannerModalComponent implements OnInit {
  currentRolId: number;
  user: User | null = null;
  token: string;
  id: number | null = null;
  id_banner: number | null = null;
  bannerForm: FormGroup;
  selectedBanner: File | null = null;
  idAliado: string;
  bannerPreview: string | ArrayBuffer | null = null;
  isActive: boolean = true;
  boton: boolean;
  falupa = faCircleQuestion;
  faImages = faImage;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddBannerModalComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private aliadoService: AliadoService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.id_banner = data.id;
    this.idAliado = data.idAliado;

    this.bannerForm = this.formBuilder.group({
      urlImagen: [null, Validators.required],
      estadobanner: [1],
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

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    this.mostrarToggle();
    this.toggleActive();
  }

  /*
  Este método se encarga de cargar la lista de banners.
*/
  verEditar(): void {
    this.aliadoService.getBannerxid(this.token, this.id_banner).subscribe(
      data => {
        // Obtener la URL completa de la imagen
        const fullImageUrl = this.getFullImageUrl(data.urlImagenSmall);

        // Actualizar el formulario con los datos del banner
        this.bannerForm.patchValue({
          urlImagen: fullImageUrl, // Asignar la imagen completa al formulario
          estadobanner: data.estadobanner === 'Activo' || data.estadobanner === true || data.estadobanner === 1
        });

        // Actualizar el preview de la imagen con la URL completa
        this.bannerPreview = fullImageUrl;

        this.isActive = data.estadobanner === 'Activo' || data.estadobanner === true || data.estadobanner === 1;
        this.bannerForm.patchValue({ estadobanner: this.isActive });
      },
      error => {
        console.error(error);
      }
    );
  }



  // Path de imagen para el banner
  getFullImageUrl(path: string): string {
    return `${'http://127.0.0.1:8000/'}${path}`;
  }

  /*
  Funcion para crear o editar banners.
  */
  addBanner(): void {
    const formData = new FormData();
    let aliado_modal = this.idAliado;

    let estadoValue: string;
    if (this.id_banner == null) {
      estadoValue = '1';
    } else {
      estadoValue = this.isActive ? '1' : '0';
    }

    if (this.selectedBanner) {
      formData.append('urlImagen', this.selectedBanner, this.selectedBanner.name);
    }

    formData.append('estadobanner', estadoValue);
    formData.append('id_aliado', aliado_modal);



    if (this.id_banner != null) {
      this.aliadoService.editarBanner(this.token, this.id_banner, formData).subscribe(
        data => {
          this.alertService.successAlert('Exito', data.message);
          this.dialogRef.close();
        },
        error => {
          console.error(error);
          this.alertService.errorAlert('Error', error.error.message);
        }
      )

    } else {
      this.aliadoService.crearBanner(this.token, formData).subscribe(
        data => {
          this.alertService.successAlert('Exito', data.message);
          this.dialogRef.close();
        },
        error => {
          this.alertService.errorAlert('Error', error.error.message);


          console.error(error);
        });
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

      if (field === 'urlImagen') {
        maxSize = 5 * 1024 * 1024; // 5MB para imágenes
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
        }
      };
      reader.readAsDataURL(file);

      // Genera la previsualización solo si el archivo es de tamaño permitido
      this.generateImagePreview(file, field);

      if (field === 'urlImagen') {
        this.selectedBanner = file;
        this.bannerForm.patchValue({ urlImagen: file });
      }

    } else {
      this.resetFileField(field);
    }
  }

  /* 
  Actualiza el valor del campo 'ruta_multi' en el formulario con el valor ingresado en un campo de texto. 
  Se utiliza en un evento de entrada de texto (input).
  */
  resetFileField(field: string) {
    if (field === 'urlImagen') {
      this.bannerForm.patchValue({ urlImagen: null });
      this.selectedBanner = null;
      this.bannerPreview = null;
    }
  }

  /* 
  Reinicia el campo de archivo seleccionado en el formulario, eliminando el archivo y su previsualización.
  Aplica a los campos 'urlImagen', 'logo', o 'ruta_multi', según el campo proporcionado.
  */
  generateImagePreview(file: File, field: string) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'urlImagen') {
        this.bannerPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  /* Cerrar el modal */
  cancelarModal() {
    this.dialogRef.close();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /* Cambia el estado del toggle*/
  toggleActive() {
    this.isActive = !this.isActive;
    this.bannerForm.patchValue({ estadobanner: this.isActive });
  }

  /* Muestra el toggle del estado dependiendo del asesorId que no sea nulo*/
  mostrarToggle(): void {
    this.boton = this.id_banner != null;
  }

}
