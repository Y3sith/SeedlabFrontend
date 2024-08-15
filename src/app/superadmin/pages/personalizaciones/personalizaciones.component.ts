import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ColorPickerDirective } from 'ngx-color-picker';
import { User } from '../../../Modelos/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Personalizaciones } from '../../../Modelos/personalizaciones.model';
import { Router } from '@angular/router';
import { faArrowRight, faImage } from '@fortawesome/free-solid-svg-icons';

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
  email: string ;
  telefono: string ;
  direccion: string ;
  ubicacion: string;  
  previewUrl: any = null;
  PreviewLogoFooter: any = null;
  idPersonalizacion:number = 1;
  ImagenPreview: string | ArrayBuffer | null = null;


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


  constructor(private fb: FormBuilder,
    private personalizacionesService: SuperadminService,
    private router: Router,
    private cdRef: ChangeDetectorRef,) {

      this.personalizacionForm = this.fb.group({
        nombre_sistema: ['', Validators.required],
        imagen_logo: [Validators.required],
        //logo_footer: ['', Validators.required],
        color_principal: ['#C2FFFB', Validators.required],
        color_secundario: ['#C2FFFB', Validators.required],
        //color_terciario: ['#C2FFFB', Validators.required],
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
      //console.log(this.token);
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

  onColorChangePrincipal(color: string): void {
    this.selectedColorPrincipal = color;
  }



  onColorChangeSecundario(color: string): void {
    this.selectedColorSecundario = color;
  }

  // onColorChangeTerciario(color: string): void {
  //   this.selectedColorTerciario = color;
  // }

  // Resto de tu código...


  onFileSelecteds(event: any, field: string): void {

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.generateImagePreview(file, field);
      if (field === 'imagen') {
          this.selectedImagen = file;
          this.personalizacionForm.patchValue({ imagen_logo: file });
        } else {
          this.resetFileField(field);
        }
    }
    // const input = event.target as HTMLInputElement;
    // if (input.files && input.files.length) {
    //   const file = input.files[0];
    //   const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     this.previewUrl = reader.result;
    //     this.personalizacionForm.patchValue({
    //       imagen_logo: reader.result // Guarda la imagen en base64 en el formulario
    //     });
    //   };
    // }


  // } else if (field === 'logo') {
  //   this.selectedLogo = file;
  //   this.aliadoForm.patchValue({ logo: file });
  // } 
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
      if (this.personalizacionForm.valid) {
        const itemslocal = localStorage.getItem('identity');
        if (!itemslocal) {
          console.error("No se encontró 'identity' en el almacenamiento local.");
          return;
        }
        const id_temp = JSON.parse(itemslocal).id;
        console.log("ID Superadmin:", id_temp);
       
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


        // const personalizaciones: Personalizaciones = {
        //   nombre_sistema: this.personalizacionForm.value.nombre_sistema,
        //   imagen_logo: this.personalizacionForm.value.imagen_logo,
        //   //logo_footer: this.personalizacionForm.value.logo_footer,
        //   color_principal: this.selectedColorPrincipal,
        //   color_secundario: this.selectedColorSecundario,
        //   //color_terciario: this.selectedColorTerciario,
        //   descripcion_footer: this.personalizacionForm.value.descripcion_footer,
        //   paginaWeb: this.personalizacionForm.value.paginaWeb,
        //   email: this.personalizacionForm.value.email,
        //   telefono: this.personalizacionForm.value.telefono,
        //   direccion: this.personalizacionForm.value.direccion,
        //   ubicacion: this.personalizacionForm.value.ubicacion,
        //   id_superadmin: id_temp
        // };
        if (this.selectedImagen) {
          formData.append('imagen_logo', this.selectedImagen, this.selectedImagen.name);
        }


        console.log("Datos a enviar:");

        this.personalizacionesService.createPersonalizacion(this.token, formData, this.idPersonalizacion).subscribe(
          data => {
            console.log("personalizacion creada", data);
            // console.log("Imagen en base64:", this.personalizacionForm.value.imagen_Logo);
            // alert("Imagen en base64:\n");

            location.reload();
          },
          error => {
            console.error("no funciona", error);
          }
        );
      } else {
        console.error("El formulario no es válido");
        console.log(this.personalizacionForm);
        this.logFormErrors();

      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  }

  restorePersonalizacion():void{
    this.personalizacionesService.restorePersonalization(this.token, this.idPersonalizacion).subscribe(
      data => {
        console.log("Personalización restaurada", data);
        // this.personalizacionForm.patchValue({
        //   nombre_sistema: data.nombre_sistema,
        //   color_principal: data.color_principal,
        //   color_secundario: data.color_secundario,
        //   color_terciario: data.color_terciario,
        //   imagen_Logo: '' // Limpiar o actualizar según necesites
        // });
        location.reload();
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
    if (this.currentSubSectionIndex < this.subSectionPerSection[this.currentIndex] - 1) {
      this.currentSubSectionIndex++;
    } else {
      if (this.currentIndex < this.subSectionPerSection.length - 1) {
        this.currentIndex++;
        this.currentSubSectionIndex = 0;
      }
    }

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