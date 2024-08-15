import { Component, OnInit, ViewChild } from '@angular/core';
import { ColorPickerDirective } from 'ngx-color-picker';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../../Modelos/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Personalizaciones } from '../../../Modelos/personalizaciones.model';
import { Router } from '@angular/router';

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
  faImage = faImage;
  idPersonalizacion:number = 1;



  // crear personalización
  token = '';
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  selectedFile: File;
  currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  subSectionPerSection: number[] = [1, 1, 1];

  @ViewChild('colorPickerPrincipal') colorPickerPrincipal: ColorPickerDirective;
  @ViewChild('colorPickerSecundario') colorPickerSecundario: ColorPickerDirective;


  constructor(private fb: FormBuilder,
    private personalizacionesService: SuperadminService,
    private router: Router,) {
  }


  ngOnInit(): void {
    this.validateToken();
    this.personalizacionForm = this.fb.group({
      nombre_sistema: ['', Validators.required],
      imagen_logo: ['', Validators.required],
      //logo_footer: ['', Validators.required],
      color_principal: ['#C2FFFB', Validators.required],
      color_secundario: ['#C2FFFB', Validators.required],
      color_terciario: ['#C2FFFB', Validators.required],
      descripcion_footer: ['', Validators.required],
      paginaWeb: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      ubicacion: ['', Validators.required]
    })
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

  onColorChangeTerciario(color: string): void {
    this.selectedColorTerciario = color;
  }

  // Resto de tu código...


  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.personalizacionForm.patchValue({
          imagen_logo: reader.result // Guarda la imagen en base64 en el formulario
        });
      };
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

        const personalizaciones: Personalizaciones = {
          nombre_sistema: this.personalizacionForm.value.nombre_sistema,
          imagen_logo: this.personalizacionForm.value.imagen_logo,
          //logo_footer: this.personalizacionForm.value.logo_footer,
          color_principal: this.selectedColorPrincipal,
          color_secundario: this.selectedColorSecundario,
          color_terciario: this.selectedColorTerciario,
          descripcion_footer: this.personalizacionForm.value.descripcion_footer,
          paginaWeb: this.personalizacionForm.value.paginaWeb,
          email: this.personalizacionForm.value.email,
          telefono: this.personalizacionForm.value.telefono,
          direccion: this.personalizacionForm.value.direccion,
          ubicacion: this.personalizacionForm.value.ubicacion,
          id_superadmin: id_temp
        };

        console.log("Datos a enviar:", personalizaciones);

        this.personalizacionesService.createPersonalizacion(this.token, personalizaciones, this.idPersonalizacion).subscribe(
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