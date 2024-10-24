import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ColorPickerDirective } from 'ngx-color-picker';
import { User } from '../../../Modelos/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Router } from '@angular/router';
import { faArrowRight, faCircleQuestion, faImage } from '@fortawesome/free-solid-svg-icons';
import { Location } from '@angular/common';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-personalizaciones',
  templateUrl: './personalizaciones.component.html',
  styleUrls: ['./personalizaciones.component.css'], // Cambiado a plural
})
export class PersonalizacionesComponent implements OnInit {
  personalizacionForm: FormGroup;
  selectedColorPrincipal = '#C2FFFB';
  selectedColorSecundario = '#C2FFFB';
  selectedColorTerciario = '#C2FFFB';
  descripcion_footer: Text;
  paginaWeb: string;
  email: string;
  telefono: string;
  direccion: string;
  ubicacion: string;
  previewUrl: any = null;
  PreviewLogoFooter: any = null;
  idPersonalizacion: number = 1;
  ImagenPreview: string | ArrayBuffer | null = null;
  errorMessage: string = '';
  currentLogoUrl: string | null = null;



  // crear personalización
  token = '';
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  selectedFile: File;
  currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];
  selectedImagen: File | null = null;
  faArrowRight = faArrowRight;
  faImage = faImage;
  falupa = faCircleQuestion;
  charCount: number = 0;


  @ViewChild('colorPickerPrincipal') colorPickerPrincipal: ColorPickerDirective;
  @ViewChild('colorPickerSecundario') colorPickerSecundario: ColorPickerDirective;

  sectionFields: string[][] = [
    ['descripcion_footer', 'paginaWeb', 'email', 'telefono', 'direccion', 'ubicacion'], // Sección 1
    ['nombre_sistema', 'color_principal', 'color_secundario', 'imagen_logo'], // Sección 2
  ];

  constructor(private fb: FormBuilder,
    private personalizacionesService: SuperadminService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private location: Location,
    private alertService: AlertService
  ) {

    this.personalizacionForm = this.fb.group({
      nombre_sistema: ['', Validators.required],
      imagen_logo: [],
      //logo_footer: ['', Validators.required],
      color_principal: ['', Validators.required],
      color_secundario: ['', Validators.required],
      descripcion_footer: ['', Validators.required],
      paginaWeb: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      ubicacion: ['', Validators.required]
    })
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    if (this.idPersonalizacion !== null) {
      this.loadCurrentPersonalizacion();
    } else {
      console.error('No se pudo cargar el ID de personalización');
      this.alertService.errorAlert('Error', 'No se pudo determinar el ID de personalización');
    }
  }


  /*
  Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
  formulario o cualquier otra parte de la aplicación.
  */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
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

  /*
  Navega hacia atrás en el historial de la aplicación usando el servicio Location.
  */
  goBack() {
    this.location.back();
  }

  /*
  Actualiza el color principal seleccionado en el formulario de personalización cuando el usuario cambia el color.
  */
  onColorChangePrincipal(color: string): void {
    this.selectedColorPrincipal = color;
    this.personalizacionForm.get('color_principal')?.setValue(color, { emitEvent: false });
  }

  /*
  Similar a la función anterior, actualiza el color secundario en el formulario de personalización cuando el usuario cambia el color.
  */
  onColorChangeSecundario(color: string): void {
    this.selectedColorSecundario = color;
    this.personalizacionForm.get('color_secundario')?.setValue(color, { emitEvent: false });
  }

  /*
  Maneja la selección de un archivo (como una imagen) desde un input tipo file, asigna el archivo seleccionado y genera una vista previa de la imagen.
  */
  onFileSelecteds(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImagen = file;
      this.previewUrl = URL.createObjectURL(file);
      this.currentLogoUrl = null;
      this.personalizacionForm.patchValue({
        imagen_logo: file
      });
      this.personalizacionForm.get('imagen_logo').markAsTouched();
      // Generate a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /*
  Genera una vista previa de una imagen seleccionada (archivo) y la muestra en el campo adecuado, como el logo o imagen de personalización.
  */
  generateImagePreview(file: File, field: string) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'imagen') {
        this.ImagenPreview = e.target.result;
      }
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  /*
  Resetea un campo de archivo en el formulario, eliminando tanto la imagen seleccionada como la vista previa correspondiente.
  */
  resetFileField(field: string) {
    if (field === 'imagen') {
      this.personalizacionForm.patchValue({ imagen_logo: null });
      this.selectedImagen = null;
      this.ImagenPreview = null;
    }
  }

  /*
  Procesa el cambio del logo en el pie de página (footer), genera una vista previa del logo y guarda la imagen en el formulario en formato base64.
  */
  onFooterChangeLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.PreviewLogoFooter = reader.result;
        this.personalizacionForm.patchValue({
          logo_footer: reader.result // Guarda la imagen en base64 en el formulario
        });
      };
    }
  }

  /*
  Valida si el valor de un campo específico excede un número máximo de caracteres y muestra un mensaje de error si no cumple.
  */
  validateMaxLength(field: string, maxLength: number, errorMessage: string): boolean {
    const fieldValue = this.personalizacionForm.get(field)?.value;
    if (fieldValue && fieldValue.length > maxLength) {
      this.alertService.errorAlert('Error', errorMessage);
      return false;
    }
    return true;
  }

  /*
   Actualiza el contador de caracteres del campo de descripción del footer a medida que el usuario escribe.
  */
  updateCharCount(): void {
    const descripcionValue = this.personalizacionForm.get('descripcion_footer')?.value || '';
    this.charCount = descripcionValue.length;
  }

  /*
  Realiza las validaciones necesarias para agregar una personalización. Si las validaciones son exitosas,
   envía los datos del formulario al backend para crear una nueva personalización. Si hay errores, 
   los muestra y detiene el proceso.
  */
  addPersonalizacion(): void {
    try {
      // Verificar si los campos de la segunda sección son válidos
      const seccion2Fields = ['nombre_sistema', 'color_principal', 'color_secundario', 'imagen_logo'];

      // Revisar si todos los campos de la sección 2 son válidos
      const seccion2Invalido = seccion2Fields.some(field => {
        const control = this.personalizacionForm.get(field);
        return control?.invalid;
      });

      // Si algún campo de la sección 2 es inválido, no enviar el formulario
      if (seccion2Invalido) {
        console.error("Los campos de la segunda sección son inválidos");
        this.alertService.errorAlert('Error', 'Los campos de la segunda sección son inválidos');
        seccion2Fields.forEach(field => {
          const control = this.personalizacionForm.get(field);
          control?.markAsTouched(); // Marcar el campo como "tocado" para que se muestren los errores
        });
        return; // Evitar el envío del formulario
      }

      // Continuar con la validación general del formulario
      if (this.personalizacionForm.valid) {
        const itemslocal = localStorage.getItem('identity');
        if (!itemslocal) {
          console.error("No se encontró 'identity' en el almacenamiento local.");
          return;
        }

        if (!this.validateMaxLength('nombre_sistema', 50, 'El nombre del sistema no puede tener más de 50 caracteres') ||
          !this.validateMaxLength('direccion', 50, 'La dirección del sistema no puede tener más de 50 caracteres') ||
          !this.validateMaxLength('paginaWeb', 50, 'La página web no puede tener más de 50 caracteres') ||
          !this.validateMaxLength('ubicacion', 50, 'La ubicación no puede tener más de 50 caracteres') ||
          !this.validateMaxLength('telefono', 13, 'El telefono no puede tener más de 13 caracteres') ||
          !this.validateMaxLength('email', 50, 'El email no puede tener más de 50 caracteres') ||
          !this.validateMaxLength('descripcion_footer', 600, 'La descripción no puede tener más de 600 caracteres')) {
          return; // Si alguna validación falla, se detiene el envío
        }

        const camposObligatorios = ['nombre_sistema', 'descripcion_footer', 'paginaWeb', 'direccion', 'ubicacion'];
        for (const key of camposObligatorios) {
          const control = this.personalizacionForm.get(key);
          if (control && control.value && control.value.trim() === '') {
            this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
            return;
          }
        }


        const id_temp = JSON.parse(itemslocal).id;
        const formData = new FormData();
        formData.append('nombre_sistema', this.personalizacionForm.get('nombre_sistema')?.value);
        formData.append('color_principal', this.personalizacionForm.get('color_principal')?.value);
        formData.append('color_secundario', this.personalizacionForm.get('color_secundario')?.value);
        formData.append('descripcion_footer', this.personalizacionForm.get('descripcion_footer')?.value);
        formData.append('paginaWeb', this.personalizacionForm.get('paginaWeb')?.value);
        formData.append('email', this.personalizacionForm.get('email')?.value);
        formData.append('telefono', this.personalizacionForm.get('telefono')?.value);
        formData.append('direccion', this.personalizacionForm.get('direccion')?.value);
        formData.append('ubicacion', this.personalizacionForm.get('ubicacion')?.value);
        formData.append('id_superadmin', id_temp);

        if (this.selectedImagen) {
          formData.append('imagen_logo', this.selectedImagen, this.selectedImagen.name);
        }

        this.personalizacionesService.createPersonalizacion(this.token, formData, this.idPersonalizacion).subscribe(
          data => {
            //console.log("Personalización creada");
            this.alertService.successAlert('Exito', data.message);
            // Aquí puedes actualizar o limpiar el localStorage
            // 1. Eliminar la personalización anterior de la caché
            localStorage.removeItem(`personalization`);

            // Recargar la página o hacer alguna otra acción después
            setTimeout(() => {
              location.reload();
            }, 2000);
          },
          error => {
            console.error("No se pudo crear la personalización", error);
          }
        );
      } else {
        console.error("El formulario no es válido");
        this.logFormErrors(); // Si tienes una función para mostrar los errores
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  }

  /*
  Restaura una personalización previamente guardada, eliminando la anterior y recargando la página.
  */
  restorePersonalizacion(): void {
    this.personalizacionesService.restorePersonalization(this.token, this.idPersonalizacion).subscribe(
      data => {
        this.alertService.successAlert('Exito', data.message);
        console.log(data.message);
        localStorage.removeItem(`personalization`);
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        console.error("No funciona", error);
      }
    );
  }

  /*
  Recorre el formulario, detecta los errores en cada campo y los muestra en la consola.
  */
  logFormErrors(): void {
    Object.keys(this.personalizacionForm.controls).forEach(key => {
      const controlErrors = this.personalizacionForm.get(key)?.errors;
      if (controlErrors) {
        console.error(`Error en el control ${key}:`, controlErrors);
      }
    });
  }

  /*
  Controla el avance a la siguiente sección/subsección del formulario de personalización, verificando que la sección actual sea válida antes de avanzar.
  */
  next() {
    const form = this.personalizacionForm;
    let sectionIsValid = true;

    // Obtener los campos de la sección actual
    const currentSectionFields = this.sectionFields[this.currentIndex];

    currentSectionFields.forEach(field => {
      const control = form.get(field);
      if (control.invalid) {
        control.markAsTouched();
        control.markAsDirty();
        sectionIsValid = false;
      }
    });

    // Validaciones especiales
    if (this.currentIndex === 1) { // Asumiendo que email y fecha_nac están en la sección 2
      const emailControl = form.get('email');
      if (emailControl.value && emailControl.invalid) {
        emailControl.markAsTouched();
        emailControl.markAsDirty();
        sectionIsValid = false;
      }
    }

    if (!sectionIsValid) {
      this.showErrorMessage('Por favor, complete correctamente todos los campos de esta sección antes de continuar.');
      return;
    }

    // Si llegamos aquí, la sección actual es válida
    if (this.currentSubSectionIndex < this.subSectionPerSection[this.currentIndex] - 1) {
      this.currentSubSectionIndex++;
    } else {
      if (this.currentIndex < this.subSectionPerSection.length - 1) {
        this.currentIndex++;
        this.currentSubSectionIndex = 0;
      }
    }

    // Limpiar el mensaje de error si existe
    this.clearErrorMessage();
  }

  /*
  Muestra un mensaje de error en la interfaz y en la consola.
  */
  private showErrorMessage(message: string) {
    console.error(message);
    this.alertService.errorAlert('Error', message);
    this.errorMessage = message;
  }

  /*
  Limpia cualquier mensaje de error que esté siendo mostrado.
  */
  private clearErrorMessage() {
    this.errorMessage = '';
  }

  /*
  Controla el retroceso entre las secciones/subsecciones del formulario de personalización, permitiendo que el usuario navegue hacia la sección anterior.
  */
  previous(): void {
    if (this.currentSubSectionIndex > 0) {
      this.currentSubSectionIndex--;
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.currentSubSectionIndex = this.subSectionPerSection[this.currentIndex] - 1;
      }
    }
  }

  loadCurrentPersonalizacion() {
    if (this.idPersonalizacion === null) {
      console.error("ID de personalización no disponible");
      this.alertService.errorAlert('Error', 'No se pudo determinar el ID de personalización');
      return;
    }

    this.personalizacionesService.getPersonalizacion(this.idPersonalizacion).subscribe(
      (data: any) => {
        if (data && this.isValidPersonalizationData(data)) {
          this.personalizacionForm.patchValue({
            nombre_sistema: data.nombre_sistema,
            color_principal: data.color_principal,
            color_secundario: data.color_secundario,
            descripcion_footer: data.descripcion_footer,
            paginaWeb: data.paginaWeb,
            email: data.email,
            telefono: data.telefono,
            direccion: data.direccion,
            ubicacion: data.ubicacion
          });

          if (data.imagen_logo) {
            this.currentLogoUrl = data.imagen_logo;
            this.previewUrl = null;
          }
        } else {
          console.error('Datos de personalización no válidos:', data);
          this.alertService.errorAlert('Error', 'Los datos de personalización no son válidos');
        }
      },
      error => {
        console.error("Error al cargar la personalización actual", error);
        this.alertService.errorAlert('Error', 'No se pudo cargar la personalización actual');
      }
    );
  }

  isValidPersonalizationData(data: any): boolean {
    const requiredFields = [
      'nombre_sistema', 'color_principal', 'color_secundario', 'descripcion_footer',
      'paginaWeb', 'email', 'telefono', 'direccion', 'ubicacion'
    ];
    return requiredFields.every(field => data.hasOwnProperty(field));
  }
}