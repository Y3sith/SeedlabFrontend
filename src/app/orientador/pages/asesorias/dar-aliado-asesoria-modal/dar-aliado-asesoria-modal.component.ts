import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AsesoriaService } from '../../../../servicios/asesoria.service';
import { AliadoService } from '../../../../servicios/aliado.service';
import { AlertService } from '../../../../servicios/alert.service';

@Component({
  selector: 'app-dar-aliado-asesoria-modal',
  templateUrl: './dar-aliado-asesoria-modal.component.html',
  styleUrls: ['./dar-aliado-asesoria-modal.component.css'],
  providers: [AsesoriaService, AliadoService]
})
export class DarAliadoAsesoriaModalComponent {
  asignarForm: FormGroup;
  aliados: any[] = []; 
  token: string | null = null;
  currentRolId: number;
  docEmprendedor: string | null = null;

  user: any;

  constructor(
    public dialogRef: MatDialogRef<DarAliadoAsesoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private asesoriaService: AsesoriaService,
    private aliadoService: AliadoService,
    private router: Router,
    private alertService: AlertService

  ) {
    this.asignarForm = this.fb.group({
      nom_aliado: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.validateToken();
    this.loadAliados();
  }
  
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
      const nombreAliado = this.asignarForm.get('nom_aliado')?.value;
      this.asesoriaService.asignarAliado(this.token, this.data.id, nombreAliado).subscribe(
        response => {
          this.alertService.successAlert('Exito',response.message);
          this.dialogRef.close(true); // Cerrar el modal y enviar un valor de éxito si lo deseas
        },
        error => {
          this.alertService.errorAlert('Error', 'Error al asignar la asesoria');
          console.error('Error al asignar asesoría:', error);
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadAliados(): void {
    this.aliadoService.mostrarAliado(this.token).subscribe(
      (data: any[]) => {
        this.aliados = data;
      },
      error => {
        console.error('Error al obtener la lista de aliados:', error);
      }
    );
  }
}
