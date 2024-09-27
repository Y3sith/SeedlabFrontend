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

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  onGuardar(): void {
    if (this.asignarForm.valid) {
      const { fecha, observaciones } = this.asignarForm.value;
      const idAsesoria = this.data.asesoria.id;

      this.asesoriaService.agregarHorarioAsesoria(this.token, observaciones, idAsesoria, fecha).subscribe(
        response => {
          this.dialogRef.close(response);
        },
        error => {
          console.error('Error al asignar el horario', error);
          console.log(error);
        }
      );
    } else {
      this.alertService.errorAlert('Error', 'Formulario inválido, debes asignar un horario correcto');
    }
  }

  /* Cerrar el modal */
  cancelarCrerAsesoria() {
    this.dialogRef.close();
  }
dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null; // Si no hay valor, no se valida
    }
  
    const selectedDate = new Date(value);
    const today = new Date();
    
    // Normalizamos la fecha de hoy para no tener en cuenta la hora
    today.setHours(0, 0, 0, 0);
  
    // Validación: No permitir fechas anteriores a hoy
    if (selectedDate <= today) {
      return { pastDate: 'No se permiten fechas anteriores a hoy *' };
    }
  
    return null; // Si la fecha es válida
  }

  get f() { return this.asignarForm.controls; }

}
