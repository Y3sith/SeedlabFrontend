import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faMagnifyingGlass, faPenToSquare, faPlus, faXmark, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { AliadoService } from '../../../servicios/aliado.service';
import { AsesorService } from '../../../servicios/asesor.service';
import { User } from '../../../Modelos/user.model';
import { Asesor } from '../../../Modelos/asesor.model';
import { AlertService } from '../../../servicios/alert.service';




@Component({
  selector: 'app-modal-add-asesores',
  templateUrl: './modal-add-asesores.component.html',
  styleUrl: './modal-add-asesores.component.css',
  providers: [AsesorService, AliadoService, AlertService]
})

export class ModalAddAsesoresComponent implements OnInit {
  @Input() isEditing: boolean;
  hide = true;
  boton = true;
  isActive: boolean = true;
  submitted: boolean = false;
  asesorId: any;
  user: User | null = null;
  currentRolId: string | null = null;
  listaAsesores: Asesor[] = [];
  estado: boolean;
  id: number | null = null;
  token: string | null = null;
  nombre: string | null = null;
  nombreAliado: string | null = null;
  tiempoEspera = 1800;
  falupa = faCircleQuestion;

  asesorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: ['', Validators.required],
    imagen_perfil: [null],
    genero: ['', Validators.required],
    fecha_nac: ['', Validators.required],
    direccion: ['', Validators.required],
    celular: ['', [Validators.required, Validators.maxLength(10)]],
    id_municipio: ['', Validators.required],
    aliado: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    estado: true,
  });

  constructor(
    public dialogRef: MatDialogRef<ModalAddAsesoresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private asesorService: AsesorService,
    private aliadoService: AliadoService,
    private alerService: AlertService,

  ) {
    this.asesorId = data.asesorId;
  }

  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();
    this.verEditar();
    /*para ver si lo estan editando salga la palabra editar */
    if (this.asesorId != null) {
      this.isEditing = true;
      this.asesorForm.get('password')?.setValidators([Validators.minLength(8)]);
      this.verEditar(); /* Llama a verEditar si estás editando un asesor */
    } else {
      this.asesorForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }

    this.asesorForm.get('password')?.updateValueAndValidity();
  }

  get f() { return this.asesorForm.controls; } //aquii

  /* Valida el token del login colocando el nombre del aliado para llenarlo automaticamente con el localstorage*/
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.nombreAliado = this.user.nombre;

        if (this.user && this.user.nombre) {
          this.nombreAliado = this.user.nombre;
          this.asesorForm.patchValue({ aliado: this.nombreAliado });
        } else {
          console.warn('El nombre del aliado no está definido en el objeto identity');
        }
      } else {
        console.error('No se encontró información de identity en localStorage');
      }
    }
  }

  /* Trae la informacion del asesor cuando el asesorId no sea nulo */
  verEditar(): void {
    if (this.asesorId != null) {
      this.aliadoService.getAsesorAliado(this.token, this.asesorId).subscribe(
        data => {
          this.asesorForm.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            imagen_perfil: data.imagen_perfil,
            genero: data.genero,
            fecha_nac: data.fecha_nac,
            direccion: data.direccion,
            celular: data.celular,
            id_municipio: data.id_municipio,
            aliado: data.id,
            email: data.email,
            password: '',
            estado: data.estado
          });
          this.isActive = data.estado === 'Activo';

          setTimeout(() => {
            this.asesorForm.get('estado')?.setValue(this.isActive);
          });
          console.log('wwwwwwwwww: ',this.user)
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  /* Crear asesor o actualiza dependendiendo del asesorId */
  addAsesor(): void {
    this.submitted = true;
    if (this.asesorForm.invalid) {
      return;
    }
    const asesor: Asesor = {
      nombre: this.asesorForm.get('nombre')?.value,
      apellido: this.asesorForm.get('apellido')?.value,
      imagen_perfil: this.asesorForm.get('')?.value,
      genero: this.asesorForm.get('genero')?.value,
      direccion:this.asesorForm.get('direccion')?.value,
      celular: this.asesorForm.get('celular')?.value,
      aliado: this.nombreAliado,
      email: this.asesorForm.get('email')?.value,
      password: this.asesorForm.get('password')?.value,
      estado: this.asesorForm.get('estado')?.value,
    };
    /* Actualiza asesor */
    if (this.asesorId != null) {
      this.alerService.alertaActivarDesactivar("¿Estas seguro de guardar los cambios?", 'question').then((result) => {
        if (result.isConfirmed) {
          this.asesorService.updateAsesor(this.token, this.asesorId, asesor).subscribe(
            data => {
              setTimeout(function () {
                location.reload();
              }, this.tiempoEspera);
              this.alerService.successAlert('Exito', data.message);
            },
            error => {
              this.alerService.errorAlert('Error', error.error.message);
              console.error('Error', error.error.message);
            }
          );
        }
      });
      /* Crea asesor */
    } else {
      this.asesorService.createAsesor(this.token, asesor).subscribe(
        data => {
          setTimeout(function () {
            location.reload();
          }, this.tiempoEspera);
          this.alerService.successAlert('Exito', data.message);
        },
        error => {
          //console.error('Error al crear el asesor:', error);
          this.alerService.errorAlert('Error', error.error.message);
        });
    }
  }

  /* Cerrar el modal */
  cancelarModal() {
    this.dialogRef.close();
  }

  /* Cambia el estado del toggle*/
  toggleActive() {
    this.isActive = !this.isActive;
    //this.asesorForm.patchValue({ estado: this.isActive ? 'Activo' : 'Inactivo' });
    this.asesorForm.patchValue({ estado: this.isActive ? true : false });
  }

  /* Muestra el toggle del estado dependiendo del asesorId que no sea nulo*/
  mostrarToggle(): void {
    if (this.asesorId != null) {
      this.boton = false;
    }
    this.boton = true;
  }


}
