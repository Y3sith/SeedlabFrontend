import { Component, Inject, OnInit } from '@angular/core';

import { SwitchService } from '../../../../servicios/switch.service';
import { AliadoService } from '../../../../servicios/aliado.service';
import { RutaService } from '../../../../servicios/rutas.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actividad } from '../../../../Modelos/actividad.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Ruta } from '../../../../Modelos/ruta.modelo';
import { AddLevelComponent } from '../add-level/add-level.component';
import { AlertService } from '../../../../servicios/alert.service';
import { ActividadService } from '../../../../servicios/actividad.service';
import { User } from '../../../../Modelos/user.model';
import { Asesor } from '../../../../Modelos/asesor.model';


@Component({
  selector: 'app-add-actividad',
  templateUrl: './add-actividad.component.html',
  styleUrl: './add-actividad.component.css'
})
export class AddActividadComponent implements OnInit {
  modalSwitch: boolean;
  actividadId: any;
  token: string | null = null;
  aliadoId: any;
  submitted: boolean = false;
  rutaSeleccionada: any | null;
  //activityName: any;
  listRuta: Ruta[] = [];
  listActividadAliado: Actividad[] = [];
  tipoDeDato: Actividad[] = [];
  listAsesor: Asesor[] = [];
  user: User | null = null;
  currentRolId: number;
  estado: boolean | null = null;
  id: number | null = null;
  userFilter: any = { nombre: '', estado: 'Activo' };
  

  id_tipo_dato: boolean;

  actividadForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fuente: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_asesor: ['', Validators.required],
    id_ruta: ['', Validators.required],
    id_aliado: ['', Validators.required],
    estado: ['', Validators.required]
  })


  constructor(
    // public dialogRef: MatDialogRef<SuperAdminComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private modalSS: SwitchService,
    public dialog: MatDialog,
    private router: Router,
    private aliadoService: AliadoService,
    private rutaService: RutaService,
    private actividadService: ActividadService,
    private alertService: AlertService,
  ) {

  }


  ngOnInit(): void {
    this.validateToken();
    this.verRuta();
    this.tipoDato();
    this.verAsesor();
    //this.verActividad();

    //this.modalSS.$modal.subscribe((valor) => { this.modalSwitch = valor })
    if (this.actividadId) {
      this.actividadForm.get('password')?.setValidators([Validators.minLength(8)]);
    } else {
      this.actividadForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.actividadForm.get('password')?.updateValueAndValidity();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      //console.log('currentrol',identityJSON);

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        //console.log('ererer',this.id)
        if (this.currentRolId != 3) {
          this.router.navigate(['/home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['/home']);
    }
  }

  verAsesor(): void {
    if (this.token) {
      this.aliadoService.getinfoAsesor(this.token, this.user.id, this.userFilter.estado).subscribe(
        data => {
          this.listAsesor = data;
          //console.log("info del asesor: ", data);
        },
        error => {
          console.log(error);
        }
      )
    }
  }


  selectRuta(ruta: any): void {
    this.rutaSeleccionada = ruta;
    console.log("la ruta seleccionada fue: ",this.rutaSeleccionada)
  }
  
  addActividad(): void {
    // if (!this.rutaSeleccionada) {
    //   console.log("debes seleccionar una ruta para poder crear la actividad")
    //   return;
    // }
    this.submitted = true;
    // const actividad: Actividad = {
    //   nombre: this.actividadForm.value.nombre,
    //   descripcion: this.actividadForm.value.descripcion,
    //   fuente: this.actividadForm.value.fuente,
    //   id_tipo_dato: parseInt(this.actividadForm.value.id_tipo_dato),
    //   id_asesor: parseInt(this.actividadForm.value.id_asesor),
    //   id_ruta: this.rutaSeleccionada.id,
    //   id_aliado: this.user.id
    //   estado: this.actividadForm.value.estado,
    // }
    // this.aliadoService.crearActividad(this.token, actividad).subscribe(
    //   data => {
    //     location.reload();
    //     console.log(data);
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // )
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

  verRuta(): void {
    if (this.token) {
      this.rutaService.rutasActivas(this.token).subscribe(
        data => {
          this.listRuta = data;
          console.log('id ruta',this.listRuta);
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  // verActividad(): void {
  //   if (this.token) {
  //     this.actividadService.getActividadAliado(this.token, this.id).subscribe(
  //       data => {

  //         this.listActividadAliado = data;
  //         console.log('algoooo', data);
  //       },
  //       error => {
  //         console.log(error);
  //       }
  //     );
  //   }
  // }



  addNivelModal() {

    // if (this.activityName.trim() === '') {
    //   // Mostrar algún mensaje de error o manejar la situación según tu requerimiento
    //   //console.log('Nombre de actividad no puede estar vacío.');
    //   this.alertService.errorAlert('Error', 'No le has asignado nombre a la actividad')
    //   return; // Salir del método si el nombre de actividad está vacío
    // }
    const dialogRef = this.dialog.open(AddLevelComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerro y se devolvio', result);
    });

  }
  // activityName: string = ''; // Nombre de la actividad
  levels: any[] = []; // Lista de niveles
  showAddLevelButton: boolean = false; // Control para mostrar el botón "Añadir Nivel"

  // Método para agregar un nuevo nivel
  addLevel() {
    this.levels.push({}); // Puedes definir la estructura del nivel según tus necesidades
  }

  // Método para avanzar al siguiente paso
  goToNext() {
    // Aquí puedes implementar la lógica para avanzar al siguiente paso
    // console.log('Niveles:', this.levels);
    // console.log('Nombre de la actividad:', this.activityName);

    // Mostrar el botón "Añadir Nivel" después de dar clic en "Siguiente"
    this.showAddLevelButton = true;
  }

  cancelarcrearActividad(): void {
    this.rutaSeleccionada = null;
    //this.activityName = null;
    this.actividadForm.patchValue({
      nombre: '',
      descripcion: '',
      fuente: '',
      id_tipo_dato: '',
      id_asesor: ''
    });
  }
}