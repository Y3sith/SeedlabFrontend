import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AsesoriaService } from '../../../servicios/asesoria.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-horario-modal',
  templateUrl: './horario-modal.component.html',
  styleUrls: ['./horario-modal.component.css']
})
export class HorarioModalComponent implements OnInit {
  asignarForm: FormGroup;
  token: string | null = null;
  user: any = null;
  currentRolId: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<HorarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private asesoriaService: AsesoriaService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.asignarForm = this.fb.group({
      fecha: ['', [this.dateRangeValidator, Validators.required]],
      observaciones: ['']
    });
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
  }

  /*
      Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
      formulario o cualquier otra parte de la aplicación.
  */  
 validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
  Esta función se encarga de guardar la asignación del horario para una asesoría específica.
*/
  onGuardar(): void {
    if (this.asignarForm.valid) {
      this.isSubmitting = true;
      const { fecha, observaciones } = this.asignarForm.value;
      const idAsesoria = this.data.asesoria.id;

      this.asesoriaService.agregarHorarioAsesoria(this.token, observaciones, idAsesoria, fecha).subscribe(
        response => {
          this.alertService.successAlert('Exito',response.message);
          this.dialogRef.close(true);
        },
        error => {
          console.error('Error al asignar el horario', error);
          console.log(error);
        }
      );
    } else {
      this.alertService.errorAlert('Error', 'Formulario inválido, debes asignar un horario correcto');
    }
    setTimeout(() => {
      this.isSubmitting = false;
      this.dialogRef.close(this.asignarForm.value);
    }, 2000);
  }

  /* Cerrar el modal */
  cancelarCrerAsesoria() {
    this.dialogRef.close();
  }

/*
  Validador que verifica si la fecha seleccionada en el control es válida, asegurando que no sea una fecha anterior a hoy.
*/
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      return { pastDate: 'No se permiten fechas anteriores a hoy *' };
    }
    return null;
  }

  get f() { return this.asignarForm.controls; }

}
