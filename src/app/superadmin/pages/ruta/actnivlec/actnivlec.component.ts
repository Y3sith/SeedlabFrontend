import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperadminService } from '../../../../servicios/superadmin.service';
import { Asesor } from '../../../../Modelos/asesor.model';
import { ActividadService } from '../../../../servicios/actividad.service';
import { Actividad } from '../../../../Modelos/actividad.model';
import { Aliado } from '../../../../Modelos/aliado.model';
import { Superadmin } from '../../../../Modelos/superadmin.model';
import { AliadoService } from '../../../../servicios/aliado.service';
import Pica from 'pica';
import { NivelService } from '../../../../servicios/nivel.service';
import { Nivel } from '../../../../Modelos/nivel.model';

@Component({
  selector: 'app-actnivlec',
  templateUrl: './actnivlec.component.html',
  styleUrl: './actnivlec.component.css'
})
export class ActnivlecComponent implements OnInit {
  ////
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  listaAsesorAliado: Asesor[] = [];
  listarTipoDato: Actividad[] = [];
  listarAliadoo: Aliado[] = [];
  listarNiveles: Nivel[] = [];
  ///
  listarAsesores: any[] = [];
  userFilter: any = { nombre: '', estado: 'Activo' };
  aliadoSeleccionado: any | null;
  rutaId: number | null = null;
  //nivelSeleccionado: any | null;
  ////
  // currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  /////


  ////
  fuente: string = '';
  submittedActividad = false;
  submittedNivel = false;
  submittedLeccion = false;
  submittedContent = false;
  submitted = false;
  ////añadir actividad

  actividadForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    ruta_multi: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_asesor: ['', Validators.required],
    id_ruta: ['', Validators.required],
    id_aliado: ['', Validators.required]
  })
  ////anadir nivel

  nivelForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    id_actividad: ['', Validators.required]
  })
  mostrarNivelForm: boolean = false;

  ///// añadir leccion
  leccionForm = this.fb.group({
    nombre: ['', Validators.required],
    id_nivel: ['', Validators.required]
  })
  mostrarLeccionForm: boolean = false;

  ///añadir contenido por leccion

  contenidoLeccionForm = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    fuente: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_leccion: ['', Validators.required]
  })
  mostrarContenidoLeccionForm: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private superAdminService: SuperadminService,
    private actividadService: ActividadService,
    private aliadoService: AliadoService,
    private route: ActivatedRoute,
    private nivelService: NivelService,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.rutaId = +params['id_ruta'];
      this.actividadForm.patchValue({ id_ruta: this.rutaId.toString() });
    });

    this.validateToken();
    this.tipoDato();
    this.listaAliado();
    this.onAliadoChange();
    this.verNivel();
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
        if (this.currentRolId != 1) {
          this.router.navigate(['/home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['/home']);
    }
  }

  //me trae el tipo de dato que requiere la actividad
  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          this.listarTipoDato = data;
          console.log('tipo de dato:', data);
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  //me lista los aliados existentes activos
  listaAliado(): void {
    if (this.token) {
      this.superAdminService.listarAliado(this.token).subscribe(
        data => {
          this.listarAliadoo = data;
          console.log('Aliado: ', data)
        },
        error => {
          console.log(error);
        }
      )
    }
  }
  selectAliado(aliado: any): void {
    this.aliadoSeleccionado = aliado;
    console.log("el aliado seleccionado fue: ", this.aliadoSeleccionado)
  }

  onAliadoChange(event?: any): void {
    const aliadoId = event.target.value;
    const aliadoSeleccionado = this.listarAliadoo.find(aliado => aliado.id == aliadoId);

    if (aliadoSeleccionado) {
      console.log("El aliado seleccionado fue: ", {
        id: aliadoSeleccionado.id,
        nombre: aliadoSeleccionado.nombre
      });

      // Aquí puedes hacer lo que necesites con el aliado seleccionado
      this.aliadoSeleccionado = aliadoSeleccionado;

      if (this.token) {
        this.aliadoService.getinfoAsesor(this.token, this.aliadoSeleccionado.id, this.userFilter.estado).subscribe(
          data => {
            this.listarAsesores = data;
            console.log('Asesores: ', data);
          },
          error => {
            console.log(error);
          }
        );
      }
    }
  }

  verNivel(): void {
    if (this.token) {
      this.nivelService.getNivel(this.token).subscribe(
        data => {
          this.listarNiveles = data;
          console.log('Niveles: ', data);
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  // selectNivel(nivel:any):void{
  //   this.nivelSeleccionado = nivel;
  //   console.log("el nivel seleccionado fue: ", this.nivelSeleccionado)
  // }

  //agregar una actividad
  addActividadSuperAdmin(): void {
    this.submittedActividad = true;
    if (this.actividadForm.invalid) {
      return;
    }
    const actividad: Actividad = {
      nombre: this.actividadForm.value.nombre,
      descripcion: this.actividadForm.value.descripcion,
      ruta_multi: this.actividadForm.value.ruta_multi,
      id_tipo_dato: parseInt(this.actividadForm.value.id_tipo_dato),
      id_asesor: parseInt(this.actividadForm.value.id_asesor),
      id_ruta: this.rutaId,
      id_aliado: parseInt(this.actividadForm.value.id_aliado)
    };
    this.superAdminService.crearActividadSuperAdmin(this.token, actividad).subscribe(
      (data: any) => {
        const actividadCreada = data[0];
        this.nivelForm.patchValue({ id_actividad: actividadCreada.id });
        this.mostrarNivelForm = true;
        this.avanzarSeccion();
        this.currentIndex = 1;
      },
      error => {
        console.log(error);
      }
    );
  }

  addNivelSuperAdmin(): void {
    this.submittedNivel = true;
    if (this.actividadForm.invalid) {
      return;
    }
    const nivel: any = {
      nombre: this.nivelForm.value.nombre,
      descripcion: this.nivelForm.value.descripcion,
      id_actividad: this.nivelForm.value.id_actividad
    }
    console.log('nivel data', nivel);
    this.superAdminService.crearNivelSuperAdmin(this.token, nivel).subscribe(
      (data: any) => {
        console.log('datos recibidos', data);
        this.leccionForm.patchValue({ id_nivel: data.id })
        this.verNivel();
        this.mostrarLeccionForm = true;
        console.log('id nivel: ', data.id);
        this.avanzarSeccion();
        this.currentIndex = 2;


      },
      error => {
        console.log(error);
      }
    )
  }

  agregarOtroNivel(): void {
    this.submittedNivel = true;
    if (this.nivelForm.invalid) {
      return;
    }
    const nivel: any = {
      nombre: this.nivelForm.value.nombre,
      descripcion: this.nivelForm.value.descripcion,
      id_actividad: this.nivelForm.value.id_actividad
    };
    console.log('nivel data', nivel);
    this.superAdminService.crearNivelSuperAdmin(this.token, nivel).subscribe(
      (data: any) => {
        console.log('datos recibidos', data);
        // Resetea el formulario para agregar otro nivel
        this.nivelForm.reset();
        this.nivelForm.patchValue({ id_actividad: nivel.id_actividad });

      },
      error => {
        console.log(error);
      }
    );
  }

  addLeccionSuperAdmin(): void {
    this.submittedLeccion = true;
    if (this.actividadForm.invalid) {
      return;
    }
    //submittedLeccion
    const leccion: any = {
      nombre: this.leccionForm.value.nombre,
      id_nivel: this.leccionForm.value.id_nivel
    }
    console.log('leccion data', leccion);
    this.superAdminService.crearLeccionSuperAdmin(this.token, leccion).subscribe(
      (data: any) => {
        console.log('datos recibidos', data);
        this.contenidoLeccionForm.patchValue({ id_leccion: data.id })
        this.mostrarContenidoLeccionForm = true;
        console.log('id leccion: ', data.id);
        //this.avanzarSeccion();
        //this.currentIndex = 3;
      },
      error => {
        console.log(error);
      }
    )
  }
  addContenidoLeccionSuperAdmin(): void {
    this.submittedContent = true;
    if (this.actividadForm.invalid) {
      return;
    }
    const contLeccion: any = {
      titulo: this.contenidoLeccionForm.value.titulo,
      descripcion: this.contenidoLeccionForm.value.descripcion,
      fuente: this.contenidoLeccionForm.value.fuente,
      id_tipo_dato: parseInt(this.actividadForm.value.id_tipo_dato),
      id_leccion: this.contenidoLeccionForm.value.id_leccion
    }
    this.superAdminService.crearContenicoLeccionSuperAdmin(this.token, contLeccion).subscribe(
      (data: any) => {
        console.log('datos recibidos: ', data);
        location.reload();
        //this.currentIndex = 2;
        // this.currentIndex = 3;
      },
      error => {
        console.log(error);
      }
    )
  }

  onTipoDatoChange(): void {
    const tipoDatoId = this.actividadForm.get('id_tipo_dato').value;
    this.actividadForm.get('id_tipo_dato').clearValidators();

    switch (tipoDatoId) {
      case '1': // Video
        this.actividadForm.get('Video').setValidators([Validators.required]);
        break;
      case '2': // Imagen
        this.actividadForm.get('Imagen').setValidators([Validators.required]);
        break;
      case '3': // PDF
        this.actividadForm.get('PDF').setValidators([Validators.required]);

        break;
      case '4': // Texto
        this.actividadForm.get('Texto').setValidators([Validators.required]);
        break;
      default:
        this.actividadForm.get('fuente').clearValidators();
        break
    }

    // Actualizar validaciones y detectar cambios
    this.actividadForm.get('fuente').updateValueAndValidity();
    //this.cdRef.detectChanges();
  }



  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300; // Nueva anchura
          canvas.height = 300; // Nueva altura
          const pica = Pica();
          pica.resize(img, canvas)
            .then((result) => pica.toBlob(result, 'image/jpeg', 0.90))
            .then((blob) => {
              const reader2 = new FileReader();
              reader2.onload = (e2: any) => {
                this.contenidoLeccionForm.patchValue({ fuente: e2.target.result });
              };
              reader2.readAsDataURL(blob);
            });
        };
      };
      reader.readAsDataURL(file);
    }
  }

  cancelarcrearActividad(): void {
    this.router.navigate(['/list-ruta'])
    this.actividadForm.patchValue({
      nombre: '',
      descripcion: '',
      ruta_multi: '',
      id_tipo_dato: '',
      id_asesor: '',
      id_aliado: '',
    });
  }

  cancelarGlobal(): void {
    this.nivelForm.patchValue({
      nombre: '',
      descripcion: '',
    });
    this.leccionForm.patchValue({
      nombre: '',

    });
    this.contenidoLeccionForm.patchValue({
      titulo: '',
      descripcion: '',
      fuente: '',
      id_tipo_dato: '',
    })
  }

  avanzarSeccion() {
    if (this.currentIndex < 3) {
      this.currentIndex++;
      if (this.currentIndex === 3) {
        this.verNivel();  //me muestra los niveles que cree
      }
    }
  }

}
