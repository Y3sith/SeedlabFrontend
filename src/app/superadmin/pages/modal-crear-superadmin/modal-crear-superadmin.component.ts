import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Superadmin } from '../../../Modelos/superadmin.model';
import { User } from '../../../Modelos/user.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-modal-crear-superadmin',
  templateUrl: './modal-crear-superadmin.component.html',
  styleUrl: './modal-crear-superadmin.component.css'
})
export class ModalCrearSuperadminComponent implements OnInit {
  @Input() isEditing: boolean = false
  submitted: boolean = false;
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: string | null = null;
  adminId: any;
  hide = true;
  falupa = faCircleQuestion;
  estado: boolean;
  isActive: boolean = true;
  boton = true;
  
  

  superadminForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    estado: true,
  })

  constructor(public dialogRef: MatDialogRef<ModalCrearSuperadminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private superadminService: SuperadminService) {
    this.adminId = data.adminId;
  }

  /* Inicializa con esas funciones al cargar la pagina, 
  con los validator verificando cuando es editando y cuando es creando para que no salga error el campo vacio */
  ngOnInit(): void {
    this.validateToken();
    if (this.adminId != null) {
      this.isEditing = true;
      this.superadminForm.get('password')?.setValidators([Validators.minLength(8)]);
      this.verEditar();
    } else {
      this.superadminForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }

    this.superadminForm.get('password')?.updateValueAndValidity();
  }

  get f() { return this.superadminForm.controls; } /* Validaciones */

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /* Trae la informacion del admin cuando el adminId no sea nulo */
  verEditar(): void {
    if (this.adminId != null) {
      this.superadminService.getInfoAdminxlista(this.token, this.adminId).subscribe(
        data => {
          this.superadminForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: '',
            estado: data.estado
          });
          this.isActive = data.estado === 'Activo';
          setTimeout(() => {
            this.superadminForm.get('estado')?.setValue(this.isActive);
          });
        },
        error => {
          console.error(error);
        }
      )
    }
  }

  /* Crear super admin o actualiza dependendiendo del adminId */
  addSuperadmin(): void {
    this.submitted = true;
    const superadmin: Superadmin = {
      nombre: this.superadminForm.value.nombre,
      apellido: this.superadminForm.value.apellido,
      email: this.superadminForm.value.email,
      password: this.superadminForm.value.password,
      estado: this.superadminForm.value.estado,
    };
    /* Actualiza superadmin */
    if (this.adminId != null) {
      let confirmationText = this.isActive
        ? "¿Estas seguro de guardar los cambios"
        : "¿Estas seguro de guardar los cambios?";

      this.alertService.alertaActivarDesactivar(confirmationText, 'question').then((result) => {
        if (result.isConfirmed) {
          this.superadminService.updateAdmin(superadmin, this.token, this.adminId).subscribe(
            data => {
              location.reload();
              console.log(data);
              this.alertService.successAlert('Exito','Actualizacion exitosa')
            },
            error => {
              console.error(error);
              if (error.status === 400) {
                this.alertService.errorAlert('Error', error.error.message)
              }
            }
          )
        }
      });
      /* Crea superadmin */
    } else {
      this.superadminService.createSuperadmin(this.token, superadmin).subscribe(
        data => {
          location.reload();
          console.log(data);
          this.alertService.successAlert('Exito', data.message);
        },
        error => {
          console.error(error);
          if (error.status === 400) {
            this.alertService.errorAlert('Error', error.error.message)
          }

        }
        
      );
    }
  }

  /* Cambia el estado del toggle*/
  toggleActive() {
    this.isActive = !this.isActive;
    this.superadminForm.patchValue({ estado: this.isActive ? true : false });

  }

  /* Muestra el toggle del estado dependiendo del adminId que no sea nulo*/
  mostrarToggle(): void {
    if (this.adminId != null) {
      this.boton = false;
    }
    this.boton = true;
  }

  /* Cerrar el modal */
  cancelarcrerSuperadmin() {
    this.dialogRef.close();
  }

  
  

}
