import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AliadoService } from '../../../../servicios/aliado.service';
import { AsesoriaService } from '../../../../servicios/asesoria.service';
import { FormControl } from '@angular/forms';
import { AlertService } from '../../../../servicios/alert.service';


@Component({
  selector: 'app-crear-asesoria-modal',
  templateUrl: './crear-asesoria-modal.component.html',
  styleUrls: ['./crear-asesoria-modal.component.css'],
  providers: [AsesoriaService, AliadoService]
})
export class CrearAsesoriaModalComponent {
  asesoriaForm: FormGroup;
  token: string | null = null;
  documento: string | null = null;
  user: any;
  aliados: any[] = []; 
  currentRolId: string | null = null;
  docEmprendedor: string | null = null; 
  isorientador = new FormControl(false);


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearAsesoriaModalComponent>,
    private asesoriaService: AsesoriaService,
    private router: Router,
    private aliadoService: AliadoService,
    private alertService: AlertService,

  ) {
    this.asesoriaForm = this.fb.group({
      nombre: [''],
      notas: [''],
      isorientador: [false],
      asignacion: [false],
      fecha: [''],
      nom_aliado: ['']
    });

    this.validateToken();
  }

  ngOnInit() {
    this.loadAliados();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.documento = this.user.emprendedor.documento;
        // Asigna el valor del documento del emprendedor a la variable docEmprendedor
        this.docEmprendedor = this.documento;
      }
    }
    if (!this.token || !this.documento) {
      this.router.navigate(['home']);
    }
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

  // Método para controlar el cambio en el checkbox
  onCheckboxChange(event: any) {
    const isChecked = event.target.checked;
    const nomAliadoContainer = document.getElementById('nomAliadoContainer') as HTMLSelectElement; // Cambiar el tipo de nomAliadoContainer
    
    if (isChecked) {
      nomAliadoContainer.style.display = 'none';
      nomAliadoContainer.value = null; // Asignar valor null al contenedor
    } else {
      nomAliadoContainer.style.display = 'block';
      nomAliadoContainer.value = ''; // Restaurar valor por defecto
    }
  }
  

  onSubmit() {
    if (this.asesoriaForm.valid) {
      const formData = this.asesoriaForm.value;
      // Formatear la fecha actual en el formato 'YYYY-MM-DD HH:MM:SS'
      const fechaActual = new Date();
      const fechaFormateada = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')} ${fechaActual
        .getHours()
        .toString()
        .padStart(2, '0')}:${fechaActual.getMinutes().toString().padStart(2, '0')}:${fechaActual
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
      
      formData.fecha = fechaFormateada;
      
      // Utiliza this.docEmprendedor en lugar de obtener el documento del emprendedor del localStorage
      if (this.docEmprendedor) {
        formData.doc_emprendedor = this.docEmprendedor;
      } else {
        console.error('Documento del emprendedor no encontrado');
        return;
      }
  
      this.asesoriaService.crearAsesoria(this.token, formData).subscribe(
        response => {
          this.dialogRef.close(formData);
          this.alertService.successAlert('Exito', 'Asesoría creada correctamente');
        },
        error => {
          this.alertService.errorAlert('Error', 'Los campos de la asesoría estan vacios')
        }
      );
    }
  }

  /* Cerrar el modal */
  cancelarCrerAsesoria() {
    this.dialogRef.close();
  }
  
}
