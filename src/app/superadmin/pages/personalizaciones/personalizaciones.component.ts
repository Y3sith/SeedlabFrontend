import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ColorPickerDirective } from 'ngx-color-picker';
import { User } from '../../../Modelos/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Router } from '@angular/router';
import { faArrowRight, faImage } from '@fortawesome/free-solid-svg-icons';
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
      imagen_logo: ['', Validators.required],
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


  ngOnInit(): void {
    this.validateToken();
  }



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

  goBack() {
    this.location.back();
  }

  onColorChangePrincipal(color: string): void {
    this.selectedColorPrincipal = color;
    this.personalizacionForm.get('color_principal')?.setValue(color, { emitEvent: false });
  }

  onColorChangeSecundario(color: string): void {
    this.selectedColorSecundario = color;
    this.personalizacionForm.get('color_secundario')?.setValue(color, { emitEvent: false });
  }


  onFileSelecteds(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImagen = file;

      // Generate a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


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

  resetFileField(field: string) {
    if (field === 'imagen') {
      this.personalizacionForm.patchValue({ imagen_logo: null });
      this.selectedImagen = null;
      this.ImagenPreview = null;
    }
  }

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



  // metodo agregar personalizacion
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

      const nombreSistema = this.personalizacionForm.get('nombre_sistema')?.value;
      if (nombreSistema && nombreSistema.length > 50) {
        this.alertService.errorAlert('Error', 'El nombre del sistema no puede tener más de 50 caracteres');
        return;
      }
      const direccionSistema = this.personalizacionForm.get('direccion')?.value;
      if (direccionSistema && direccionSistema.length > 50) {
        this.alertService.errorAlert('Error', 'La direccion del sistema no puede tener más de 50 caracteres');
        return;
      }

      const paginaSistema = this.personalizacionForm.get('paginaWeb')?.value;
      if (paginaSistema && paginaSistema.length > 50) {
        this.alertService.errorAlert('Error', 'La pagina Web del sistema no puede tener más de 50 caracteres');
        return;
      }

      const ubicacionSistema = this.personalizacionForm.get('ubicacion')?.value;
      if (ubicacionSistema && ubicacionSistema.length > 50) {
        this.alertService.errorAlert('Error', 'La ubicacion del sistema no puede tener más de 50 caracteres');
        return;
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
            console.log("Personalización creada");

            // Aquí puedes actualizar o limpiar el localStorage
            // 1. Eliminar la personalización anterior de la caché
            localStorage.removeItem(`personalization`);

            // Recargar la página o hacer alguna otra acción después
            location.reload();
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



  restorePersonalizacion(): void {
    this.personalizacionesService.restorePersonalization(this.token, this.idPersonalizacion).subscribe(
      data => {
        console.log("Personalización restaurada!!!!!!");
        location.reload();
        localStorage.removeItem(`personalization`);
      },
      error => {
        console.error("No funciona", error);
      }
    );
  }

  logFormErrors(): void {
    Object.keys(this.personalizacionForm.controls).forEach(key => {
      const controlErrors = this.personalizacionForm.get(key)?.errors;
      if (controlErrors) {
        console.error(`Error en el control ${key}:`, controlErrors);
      }
    });
  }

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

  // Función auxiliar para mostrar mensajes de error
  private showErrorMessage(message: string) {
    console.error(message);
    this.alertService.errorAlert('Error', message);
    this.errorMessage = message;
  }

  // Función auxiliar para limpiar el mensaje de error
  private clearErrorMessage() {
    this.errorMessage = '';
  }

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
}