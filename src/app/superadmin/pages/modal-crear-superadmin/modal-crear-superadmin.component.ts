import { Component, OnInit, Input, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Superadmin } from '../../../Modelos/superadmin.model';
import { User } from '../../../Modelos/user.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from '../../../servicios/alert.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';
import { EmprendedorService } from '../../../servicios/emprendedor.service';
import { AuthService } from '../../../servicios/auth.service';

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
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  listTipoDocumento: any[] = [];


  superadminForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: '',
    imagen_perfil: [null, Validators.required],
    celular: ['', Validators.required],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    nombretipodoc: new FormControl({ value: '', disabled: false }, Validators.required),
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(10), this.passwordValidator]],
    departamento:['', Validators.required],
    municipio:['', Validators.required],
    estado: true,
  });

  constructor(public dialogRef: MatDialogRef<ModalCrearSuperadminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private superadminService: SuperadminService,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private authService: AuthService
  ) {
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
    this.cargarDepartamentos();
    this.tipoDocumento();
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

 

  /* Validaciones la contraseña */
  passwordValidator(control: AbstractControl) {
    const value = control.value;
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    if (hasUpperCase && hasSpecialChar) {
      return null;
    } else {
      return { passwordStrength: 'La contraseña debe contener al menos una letra mayúscula y un carácter especial *' };
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
            estado: data.estado,
            genero: data.genero,
            departamento: data.departamento,
            municipio:data.municipio
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
    console.log('Valor de municipio:', this.superadminForm.value.municipio);
    const superadmin: Superadmin = {
      nombre: this.superadminForm.value.nombre,
      apellido: this.superadminForm.value.apellido,
      documento: this.superadminForm.value.documento,
      celular: this.superadminForm.value.celular,
      genero: this.superadminForm.value.genero,
      direccion: this.superadminForm.value.direccion,
      fecha_nac: this.superadminForm.value.fecha_nac,
      email: this.superadminForm.value.email,
      password: this.superadminForm.value.password,
      estado: this.superadminForm.value.estado,
      id_tipo_documento: this.superadminForm.value.nombretipodoc,
      id_departamento:this.superadminForm.value.departamento,
      id_municipio:this.superadminForm.value.municipio
    };
    console.log('Superadmin Data:', superadmin);
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
              this.alertService.successAlert('Exito', 'Actualizacion exitosa')
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

  //Funcion para cargar los departamentos
  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
      },
      (err) => {
        console.log(err);
      }
    )
  }

  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast a HTMLSelectElement
    const selectedDepartamento = target.value;

    // Guarda el departamento seleccionado en el localStorage
    localStorage.setItem('departamento', selectedDepartamento);

    // Llama a cargarMunicipios si es necesario
    this.cargarMunicipios(selectedDepartamento);
  }

  cargarMunicipios(idDepartamento: string): void {
    this.municipioService.getMunicipios(idDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
        //console.log('Municipios cargados:', JSON.stringify(data));
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  tipoDocumento(): void {
    this.authService.tipoDocumento().subscribe(
      data => {
        this.listTipoDocumento = data;

        console.log('tipos de documentos', this.listTipoDocumento);
        //console.log('datos tipo de documento: ',data)
      },
      error => {
        console.log(error);
      }
    )
  }

}