import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AliadoService } from '../../../../servicios/aliado.service';
import { AlertService } from '../../../../servicios/alert.service';
import { Router } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';
import { User } from '../../../../Modelos/user.model';
import { ActividadService } from '../../../../servicios/actividad.service';
import { Actividad } from '../../../../Modelos/actividad.model';

@Component({
  selector: 'app-edit-aliados',
  templateUrl: './edit-aliados.component.html',
  styleUrl: './edit-aliados.component.css'
})
export class EditAliadosComponent {

  bannerForm: FormGroup;
  aliadoForm: FormGroup;
  token: string;
  user: User | null = null;
  currentRolId: number;
  id: number | null = null;
  aliadoId: number;
  isActive: boolean = true;
  tipoDeDato: Actividad[] = [];
  hide = true;
  logo: string = '';
  selectedLogo: File | null = null;
  selectedruta: File | null = null;

  constructor(private aliadoService: AliadoService,
    private alertService: AlertService,
    private actividadService: ActividadService,
    private router: Router,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef) {

    this.aliadoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      logo: [Validators.required],
      ruta_multi: [Validators.required],
      id_tipo_dato: [Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      estado: [1]
      
    });

    this.bannerForm = this.formBuilder.group({
      urlImagen: [Validators.required],
      estadobanner: ['Activo'],
    });
}

ngOnInit(): void {
  this.validateToken();
  this.tipoDato();
  this.traerAliadosxId();
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


  traerAliadosxId():void{
    this.aliadoService.getAliadoxid(this.token, this.aliadoId).subscribe(
      data => {
        this.aliadoForm.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          logo: data.logo,
          ruta_multi: data.ruta_multi,
          id_tipo_dato: data.id_tipo_dato,
          email: data.email,
          password: '',
          estado: data.estado
        });
        console.log("aaaa",data);
        this.isActive = data.estado === 'Activo';
        setTimeout(() => {
          this.aliadoForm.get('estado')?.setValue(this.isActive);
        });
      },
      error => {
        console.log(error);
      }
    )
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

  updateAliado(): void{
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
      formData.append('estado', this.aliadoForm.get('estado')?.value ? '1' : '0');
  
  
      if (this.selectedLogo) {
        formData.append('logo', this.selectedLogo, this.selectedLogo.name);
      }
      if (this.selectedruta) {
        formData.append('ruta_multi', this.selectedruta, this.selectedruta.name);
      } else if (this.aliadoForm.get('ruta_multi')?.value) {
        formData.append('ruta_multi', this.aliadoForm.get('ruta_multi')?.value);
      }
  
      formData.append('nombre', this.aliadoForm.get('nombre')?.value);
  
  
      this.aliadoService.editarAliado(this.token, formData, this.aliadoId).subscribe(
        data => {
         this.alertService.successAlert('Exito', 'yeiiiii');
        },
        error => {
          if (error.status === 400) {
            this.alertService.errorAlert('Error', error.error.message);
            console.error('Errores', error);
          }
        });
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
}
