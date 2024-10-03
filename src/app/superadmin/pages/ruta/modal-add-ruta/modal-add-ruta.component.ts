import { Component, Inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { RutaService } from '../../../../servicios/rutas.service';
import { Ruta } from '../../../../Modelos/ruta.modelo';
import { User } from '../../../../Modelos/user.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from '../../../../servicios/alert.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../../Modelos/actividad.model';
import { Superadmin } from '../../../../Modelos/superadmin.model';




@Component({
  selector: 'app-modal-add-ruta',
  templateUrl: './modal-add-ruta.component.html',
  styleUrl: './modal-add-ruta.component.css',
  providers: [RutaService, DatePipe]

})
export class ModalAddRutaComponent implements OnInit {
  userFilter: any = { estado: 'Activo' };
  isEditing: boolean = false
  falupa = faCircleQuestion;
  ruta: any;
  rutaId: any;
  listRuta: Ruta[] = [];
  listAsesorConAliado: Superadmin[] = [];
  //createRutaForm: FormGroup;
  token = '';
  user: User | null = null;
  currentRolId: number;
  now = new Date();
  // formattedDate: Date = '';
  submitted: boolean = false;
  private modalSubscription: Subscription;
  isVisible = true;
  imagen_ruta: string = '';
  isActive: boolean = true;
  imagenUrl: SafeUrl | null = null;
  boton = true;
  rutaSeleccionada: any | null;
  tipoDeDato: Actividad[] = [];
  showActividadForm: boolean = false;

  rutaForm = this.fb.group({
    nombre: ['', [Validators.required]],
    fecha_creacion: [this.now],
    estado: [true],
  });



  constructor(public dialogRef: MatDialogRef<ModalAddRutaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rutaService: RutaService,
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,

  ) {

    this.rutaId = data.rutaId;
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    if (this.rutaId != null) {
      this.isEditing = true;
    }
    this.verEditar();
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
  Funcion para traer los datos de la ruta
  */
  verEditar(): void {
    if (this.rutaId != null) {
      this.rutaService.rutaXid(this.token, this.rutaId).subscribe(
        data => {
          this.rutaForm.patchValue({
            nombre: data.nombre,
            fecha_creacion: data.fecha_creacion,
            estado: data.estado,
          });

          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.rutaForm.get('estado')?.setValue(this.isActive);
          })
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  /*getter que facilita el acceso a los controles del formulario reactivo*/
  get f() { return this.rutaForm.controls; }

  /*
  Funcion para agregar o editar la ruta
  */
  addRuta(): void {
    this.submitted = true;
    if (this.rutaForm.invalid) {
      this.alertService.errorAlert('Error', 'Debes completar los campos.')
      return;
    }
    const nombreActividad = this.rutaForm.get('nombre')?.value?.trim(); // Trima espacios en blanco

    if (!nombreActividad) {
      this.alertService.errorAlert('Error', 'El campo nombre es obligatorio y no puede contener solo espacios en blanco.');
      return;
    }

    // Validación de longitud
    if (nombreActividad.length < 5) {
      this.alertService.errorAlert('Error', 'El nombre de la ruta debe tener al menos 5 caracteres.');
      return;
    }

    if (nombreActividad.length > 50) {
      this.alertService.errorAlert('Error', 'El nombre de la ruta no puede tener más de 50 caracteres.');
      return;
    }

    // Validación para otros campos obligatorios
    const camposObligatorios = ['nombre'];
    for (const key of camposObligatorios) {
      const control = this.rutaForm.get(key);
      if (control && (!control.value || control.value.trim() === '')) {
        this.alertService.errorAlert('Error', `El campo ${key} es obligatorio y no puede estar vacío o contener solo espacios en blanco.`);
        return;
      }
    }

    // const nombreActividad = this.rutaForm.get('nombre')?.value;
    // if (nombreActividad && nombreActividad.length < 5) {
    //   this.alertService.errorAlert('Error', 'El nombre de la ruta no puede tener menos de 5 caracteres');
    //   return;
    // } 

    // if (nombreActividad.length < 50) {
    //   this.alertService.errorAlert('Error', 'El nombre de la ruta no puede tener más de 50 caracteres');
    // }

    // const camposObligatorios = ['nombre'];
    // for (const key of camposObligatorios) {
    //     const control = this.rutaForm.get(key);
    //     if (control && control.value && control.value.trim() === '') {
    //         this.alertService.errorAlert('Error', `El campo ${key} no puede contener solo espacios en blanco.`);
    //         return;
    //     }
    // }

    const ruta: Ruta = {
      nombre: this.rutaForm.get('nombre')?.value,
      fecha_creacion: this.rutaForm.get('fecha_creacion')?.value,
      estado: this.rutaForm.get('estado')?.value,
    };
    if (this.rutaId != null) {
      this.alertService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question').then((result) => {
        if (result.isConfirmed) {
          this.rutaService.updateRutas(this.token, ruta, this.rutaId).subscribe(
            data => {
              this.alertService.successAlert('Exito', data.message);
              setTimeout(() => {
                location.reload();
              }, 2000);
            },
            error => {
              this.alertService.errorAlert('Error', error.error.message);
              console.error('Error', error.message);
            }
          );
        }
      });
    } else {
      this.rutaService.createRutas(this.token, ruta).subscribe(
        data => {
          this.alertService.successAlert('Exito', data.message);
          setTimeout(() => {
            location.reload();
          }, 2000);
        },
        error => {
          this.alertService.errorAlert('Error', error.error.message);
          console.error('Error', error.message);
          console.log(error)
        }
      )
    }
  }

  /*
  Funcion para activar o desactivar el estado de la ruta por medio de un toggle
   */
  toggleActive() {
    this.isActive = !this.isActive;
    this.rutaForm.patchValue({ estado: this.isActive ? true : false });
  }

  /* Muestra el toggle del estado dependiendo del adminId que no sea nulo*/
  mostrarToggle(): void {
    if (this.rutaId != null) {
      this.boton = false;
    }
    this.boton = true;
  }

  /*
  Funcion para cerrar el modal
  */
  closeModal() {
    this.dialogRef.close();
  }
}