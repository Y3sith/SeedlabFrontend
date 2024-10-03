import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AsesoriaService } from '../../../servicios/asesoria.service';
import { AsesorDisponible } from '../../../Modelos/AsesorDisponible.model';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-dar-asesor-modal',
  templateUrl: './asignar-asesor-modal.component.html',
  styleUrls: ['./asignar-asesor-modal.component.css'],
  providers: [AsesoriaService, AlertService]
})
export class AsignarAsesorModalComponent implements OnInit {
  asignarForm: FormGroup;
  asesores: AsesorDisponible[] = [];
  token: string | null = null;
  user: any = null;
  currentRolId: string | null = null;
  submitted = false;
  isSubmitting = false;
  @Output() asesoriaAsignada = new EventEmitter<void>();
  @Output() RechazarAsesoria = new EventEmitter<number>();

  constructor(
    public dialogRef: MatDialogRef<AsignarAsesorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private asesoriaService: AsesoriaService,
  ) {
    this.asignarForm = this.fb.group({
      nom_asesor: ['', Validators.required]
    });
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
  }

  /*
  Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
  formulario o cualquier otra parte de la aplicación.
  */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      const identityJSON = localStorage.getItem('identity');

      const identity = JSON.parse(identityJSON);
      const idAliado = identity.id;
      this.cargarAsesores(idAliado);
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  get f() { return this.asignarForm.controls; }

  /*
    Este método se encarga de manejar la acción de guardar la 
    asignación de un asesor a una asesoría en un formulario.
  */
  onGuardar(): void {
    this.submitted = true;
    if (this.asignarForm.valid) {
      this.isSubmitting = true;
      const idAsesor = this.asignarForm.get('nom_asesor')?.value;
      const idAsesoria = this.data.asesoria.id_asesoria;

      this.asesoriaService.asignarAsesoria(this.token, idAsesoria, idAsesor).subscribe(
        data => {
          this.asesoriaAsignada.emit(); // Emit the event
          this.dialogRef.close(true);
          this.alertService.successAlert('Exito', data.message);
        },
        error => {
          console.error('Error al asignar asesoría:', error);
          //this.alertService.errorAlert('Error', error.error.message);
        }
      );
    }
  }
  /*
    Este método se utiliza para manejar la acción de cancelar 
    una operación en un diálogo o modal.
  */
  onCancel(): void {
    this.dialogRef.close();
  }

  /*
    Este método se encarga de manejar la acción de rechazar la
    asesoría asignada por el emprendedor o el orientador, si no tiene relación
    con el aliado, entonces la envía al orientador para que la asigne correctamente.
  */
  onReject() {
    const id_asesoria = this.data.asesoria.id_asesoria;
    const accion = 'rechazar';

    // Verifica si el ID de la asesoría es válido
    if (!id_asesoria) {
      // Si no es válido, muestra un mensaje de error en la consola
      console.error('ID de asesoría no válido');
      return; // Sale del método si el ID no es válido
    }

    // Llama al servicio para rechazar la asesoría, pasando el token y el ID
    this.asesoriaService.rechazarAsesoria(this.token, id_asesoria, accion).subscribe({
      next: (response) => {
        this.alertService.successAlert('Exito', response.message);
        this.dialogRef.close(true);
        this.RechazarAsesoria.emit(id_asesoria);
        location.reload();
      },
      // Maneja los errores que puedan ocurrir durante la solicitud
      error: (error) => {
        console.error('Error al rechazar asesoría:', error.error);
      }
    });
  }

  /*
    Este método se encarga de cargar la lista de 
    asesores disponibles para un aliado específico.
  */
  cargarAsesores(idaliado: number): void {
    this.asesoriaService.listarAsesores(this.token, idaliado).subscribe(
      data => {
        this.asesores = data;
      },
      error => {
        console.error('Error al obtener los asesores disponibles:', error);
      }
    );
  }
}
