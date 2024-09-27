import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Asesor } from '../../../Modelos/asesor.model';
import { ActividadService } from '../../../servicios/actividad.service';
import { faImage, faFilePdf, faCircleQuestion, } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../Modelos/actividad.model';
import { Aliado } from '../../../Modelos/aliado.model';
import { AliadoService } from '../../../servicios/aliado.service';
import { NivelService } from '../../../servicios/nivel.service';
import { Nivel } from '../../../Modelos/nivel.model';
import { AlertService } from '../../../servicios/alert.service';
import { LeccionService } from '../../../servicios/leccion.service';
import { Leccion } from '../../../Modelos/leccion.model';
import { ContenidoLeccionService } from '../../../servicios/contenido-leccion.service';
import { Contenido_Leccion } from '../../../Modelos/contenido-leccion.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ruta-asesor',
  templateUrl: './ruta-asesor.component.html',
  styleUrl: './ruta-asesor.component.css'
})
export class RutaAsesorComponent {
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;
  listaAsesorAliado: Asesor[] = [];
  listarTipoDato: Actividad[] = [];
  listarTipoDatoContenido: Contenido_Leccion[] = [];
  listarAliadoo: Aliado[] = [];
  listarNiveles: Nivel[] = [];
  listaNivelxActividadXasesor: Nivel[] = [];
  listarLeccion: Leccion[] = [];
  listActividadContenido: Actividad[] = [];
  listarAsesores: any[] = [];
  userFilter: any = { nombre: '', estado: 'Activo' };
  aliadoSeleccionado: any | null;
  rutaId: number | null = null;
  actividadId: number | null = null;
  nivelSeleccionado: any | null;
  currentIndex: number = 0;
  faImages = faImage;
  faFile = faFilePdf;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileInputs') fileInputs: ElementRef;
  fuentePreview: string | ArrayBuffer | null = null;
  fuentePreviewContenido: string | ArrayBuffer | null = null;
  selectedfuente: File | null = null;
  selectedfuenteContenido: File | null = null;
  idactividad: string | null;
  idcontenidoLeccion: string;
  camposDeshabilitados: boolean = false;
  fuente: string = '';
  fuente_contenido: string = '';
  submittedActividad = false;
  submittedNivel = false;
  submittedLeccion = false;
  submittedContent = false;
  submitted = false;
  niveles: any[] = [];
  leccioon: any[] = [];
  isEditing: any;
  isLoading: boolean = false;
  contenidoLeccion: any[] = [];
  selectedFromInput: any;
  showVideo: boolean = false;
  showImagen: boolean = false;
  showPdf: boolean = false;
  showTexto: boolean = false;
  Number = Number;
  idAliado: any;
  idAsesor: any;
  selectedNivelId: any | null = null;
  selectedLeccion: any | null = null;
  charCount: number = 0;
  charCountContenido: number = 0;
  falupa = faCircleQuestion;


  /*
    Este objeto representa el formulario `actividadForm` utilizado para gestionar la información de una actividad.
  */
  actividadForm = this.fb.group({
    id: [],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fuente: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_ruta: ['', Validators.required],
    id_aliado: ['']
  })


  /*
      Este objeto representa el formulario `nivelForm` utilizado para gestionar la información relacionada con un nivel.
    */
  nivelForm = this.fb.group({
    id_nivel: [],
    nombre: ['', Validators.required],
    id_asesor: [''],
    id_actividad: ['', Validators.required]
  })

  /*
      Este objeto representa el formulario `leccionForm` utilizado para gestionar la información relacionada con una lección.
    */
  leccionForm = this.fb.group({
    id_leccion: [''],
    nombre: ['', Validators.required],
    id_nivel: ['', Validators.required]
  })

  /*
      Este objeto representa el formulario `contenidoLeccionForm` utilizado para gestionar la información relacionada con el contenido de una lección.
    */
  contenidoLeccionForm = this.fb.group({
    id_contenido: [''],
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    fuente_contenido: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_leccion: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private superAdminService: SuperadminService,
    private actividadService: ActividadService,
    private aliadoService: AliadoService,
    private route: ActivatedRoute,
    private nivelService: NivelService,
    private cdRef: ChangeDetectorRef,
    private alertServices: AlertService,
    private leccionService: LeccionService,
    private contenidoLeccionService: ContenidoLeccionService,
    private location: Location,
  ) { }


/* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.validateToken();

    this.route.queryParams.subscribe(params => {
      if (params['id_ruta']) {
        this.rutaId = +params['id_ruta'];
        this.actividadForm.patchValue({ id_ruta: this.rutaId.toString() });
      }
      if (params['id_actividad']) {
        this.actividadId = +params['id_actividad'];
        this.actividadForm.patchValue({ id: this.actividadId.toString() });
      }
      if (params['isEditing']) {
        this.isEditing = params['isEditing'] === 'true';
      }
      if (this.idAliado) {
        this.actividadForm.patchValue({
          id_aliado: this.idAliado
        });
        this.onAliadoChange();
      }
    });
    this.tipoDato();
    this.initializeNivelForm();
    this.tipoDatoContenido();
    this.verLeccicon();
    this.verEditar();
    this.verNivel();
    this.listaAliado();
    this.initializeFormState();
    this.onAliadoChange();
    const idLeccion = this.contenidoLeccionForm.get('id_leccion')?.value;
    if (idLeccion) {
      this.onLeccionChange(idLeccion);
    }
    this.selectedFromInput = false;
  }

  /*
    Este método asegura que el token y la identidad del usuario estén disponibles para su uso en el 
    formulario o cualquier otra parte de la aplicación.
  */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.idAsesor = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

/*
    Este método se encarga de obtener los tipos de dato disponibles a través del servicio `actividadService`.
  */  tipoDato(): void {
    if (this.token) {
      this.actividadService.getTipoDato(this.token).subscribe(
        data => {
          this.listarTipoDato = data.filter((tipo: any) => tipo.nombre === 'Imagen');
        },
        error => {
          console.log(error);
        }
      )
    }
  }
 /*
    Este método se encarga de inicializar el estado del formulario `actividadForm` deshabilitando ciertos campos.
  */
  initializeFormState(): void {
    const fieldsToDisable = ['id_aliado'];
    fieldsToDisable.forEach(field => {
      const control = this.actividadForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

/*
    Este método permite regresar a la página anterior en la navegación.
  */
  goBack(): void {
    this.location.back();
  }

  get a() {
    return this.actividadForm.controls;
  }
  get n() {
    return this.nivelForm.controls;
  }
  get l() {
    return this.leccionForm.controls;
  }
  get cl() {
    return this.contenidoLeccionForm.controls;
  }

  /*
    Este método se encarga de obtener los tipos de datos para el contenido de la lección 
    utilizando el servicio `contenidoLeccionService`.
  */
  tipoDatoContenido(): void {
    if (this.token) {
      this.contenidoLeccionService.getTipoDato(this.token).subscribe(
        data => {
          this.listarTipoDatoContenido = data;
          //console.log('tipo de dato contenido:', data);
        },
        error => {
          console.log(error);
        }
      )
    }
  }

/*
    Este método se encarga de obtener la lista de aliados utilizando el servicio `superAdminService`.
  */
  listaAliado(): void {
    if (this.token) {
      this.superAdminService.listarAliado(this.token).subscribe(
        data => {
          this.listarAliadoo = data;
          if (this.idAliado) {
            this.aliadoSeleccionado = this.listarAliadoo.find(aliado => aliado.id == this.idAliado);
            this.onAliadoChange();
          }
        },
        error => {
          console.log(error);
        }
      );
    }
  }

/*
    Este método permite seleccionar un aliado específico.
  */
  selectAliado(aliado: any): void {
    this.aliadoSeleccionado = aliado;
  }

 /*
    Este método maneja los cambios en la selección de un aliado.
  */ 
  onAliadoChange(event?: any): void {
    let aliadoId: any;

    if (event && event.target && event.target.value) {
      aliadoId = event.target.value;
    } else {
      aliadoId = this.actividadForm.get('id_aliado').value;
    }
    const aliadoSeleccionado = this.listarAliadoo.find(aliado => aliado.id == aliadoId);
    if (aliadoSeleccionado) {
      console.log("El aliado seleccionado fue: ", {
        id: aliadoSeleccionado.id,
        nombre: aliadoSeleccionado.nombre
      });
      this.aliadoSeleccionado = aliadoSeleccionado;
      if (this.token) {
        this.aliadoService.getinfoAsesor(this.token, this.aliadoSeleccionado.id, this.userFilter.estado).subscribe(
          data => {
            this.listarAsesores = data;
          },
          error => {
            console.log(error);
          }
        );
      }
    } else {
      console.error('No se encontró el aliado seleccionado');
    }
  }

/*
    Este método se encarga de cargar los datos de una actividad existente para editarla.
  */
  verEditar(): void {
    if (this.actividadId !== null) {
      this.isLoading = true;
      this.actividadService.ActividadAsesor(this.token, this.actividadId).subscribe(
        data => {
          this.listActividadContenido = data;
          this.aliadoService.getinfoAsesor(this.token, data.id_aliado, this.userFilter.estado).subscribe(
            asesoresData => {
              this.listarAsesores = asesoresData;
              this.actividadForm.patchValue({
                nombre: data.nombre,
                descripcion: data.descripcion,
                id_tipo_dato: data.id_tipo_dato,
                id_aliado: data.id_aliado,
                fuente: data.fuente,
                id_ruta: data.id_ruta,
              });
              this.nivelForm.patchValue({ id_actividad: this.actividadId.toString() });
              this.selectedFromInput = false;
              this.initializeNivelForm();
              this.updateCharCount();
              this.isLoading = false;
            },
            error => {
              console.log('Error al cargar los asesores:', error);
              this.isLoading = false;
            }
          );
        },
        error => {
          console.log('Error al cargar la actividad: ', error);
          this.isLoading = false;
        }
      );
    }
  }

/*
    Este método inicializa el formulario de niveles y, si hay contenido de lección disponible, lo carga en el formulario correspondiente.
  */
  initializeNivelForm(): void {
    this.isLoading = true;
    if (this.niveles && this.niveles.length > 0) {
      const primerNivel = this.niveles[0];
      this.nivelForm.patchValue({
        id_nivel: primerNivel.id,
        nombre: primerNivel.nombre,
        id_asesor: primerNivel.id_asesor
      });
      this.nivelForm.get('id_asesor')?.disable();
      this.onNivelChange(primerNivel.id.toString());
    } else {
      this.nivelForm.patchValue({
        id_nivel: '',
        nombre: ''
      });
    }
    if (this.contenidoLeccion && this.contenidoLeccion.length > 0) {
      const primerContenido = this.contenidoLeccion[0];
      this.contenidoLeccionForm.patchValue({
        id_leccion: primerContenido.id,
        titulo: primerContenido.titulo,
        descripcion: primerContenido.descripcion,
        id_tipo_dato: primerContenido.id_tipo_dato,
        fuente_contenido: primerContenido.fuente_contenido
      })
    }
    this.isLoading = false;
  }

/*
  Actualiza el contador de caracteres basado en el valor del campo 'descripcion' del formulario.
*/
  updateCharCount(): void {
    const descripcionValue = this.actividadForm.get('descripcion')?.value || '';
    this.charCount = descripcionValue.length;
  }

/*
  Agrega o actualiza una actividad en el sistema dependiendo del estado de `actividadId`.
*/
  addActividadSuperAdmin(): void {
    this.submitted = true;
    const formData = new FormData();
    let estadoValue: string;
    const nombreActividad = this.actividadForm.get('nombre')?.value;
    if (nombreActividad && nombreActividad.length > 39) {
      this.alertServices.errorAlert('Error', 'El nombre de la actividad no puede tener más de 39 caracteres');
      return;
    } else if (nombreActividad && nombreActividad.length < 5) {
      this.alertServices.errorAlert('Error', 'El nombre de la actividad debe tener más de 5 caracteres');
      return;
    }
    if (this.actividadForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos de la actividad');
      return;
    }
    if (this.idactividad == null) {
      estadoValue = '1'
    } else {
    }
    formData.append('nombre', this.actividadForm.get('nombre')?.value);
    formData.append('descripcion', this.actividadForm.get('descripcion')?.value);
    formData.append('id_tipo_dato', this.actividadForm.get('id_tipo_dato')?.value);
    formData.append('id_asesor', this.actividadForm.get('id_asesor')?.value || '');
    formData.append('id_ruta', this.rutaId.toString());
    formData.append('id_aliado', this.actividadForm.get('id_aliado')?.value);
    formData.append('estado', estadoValue);
    if (this.selectedfuente) {
      formData.append('fuente', this.selectedfuente, this.selectedfuente.name);
    } else {
      const rutaMultiValue = this.actividadForm.get('fuente')?.value;
      if (rutaMultiValue) {
        formData.append('fuente', rutaMultiValue);
      }
    }
    if (this.actividadId == null) {
      this.alertServices.alertaActivarDesactivar("¿Estas seguro de guardar los cambios? Verifica los datos ingresados, una vez guardados solo se podran modificar en el apartado de editar", 'question').then((result) => {
        if (result.isConfirmed) {

          this.superAdminService.crearActividadSuperAdmin(this.token, formData).subscribe(
            (data: any) => {
              const actividadCreada = data[0];
              this.nivelForm.patchValue({ id_actividad: actividadCreada.id });
              this.alertServices.successAlert('Exito', data.message);
            },
            error => {
              console.log(error);
              this.alertServices.errorAlert('Error', error.error.message);
            }
          );
        }
      })
    } else {
      this.alertServices.alertaActivarDesactivar("¿Estas seguro de guardar los cambios? Verifica los datos ingresados, una vez guardados solo se podran modificar en el apartado de editar", 'question').then((result) => {
        if (result.isConfirmed) {
          this.actividadService.updateActividad(this.token, this.actividadId, formData).subscribe(
            data => {
              this.alertServices.successAlert('Exito', data.message);
            },
            error => {
              console.log(error);
              const errorMessage = error.error?.error || 'Ocurrió un error inesperado';
              this.alertServices.errorAlert('Error', error.error.message);
            }
          )
        }
      })
    }
  }

  /*
    Este método obtiene los niveles asociados a una actividad específica mediante el ID de la actividad,
    utilizando un servicio para hacer la solicitud y procesar la respuesta.
  */
  verNivel(): void {
    if (this.token) {
      this.nivelService.mostrarNivelxidActividadxidAsesor(this.token, this.actividadId, this.idAsesor).subscribe(
        data => {
          this.listarNiveles = data;
          this.niveles = data;
          if (this.isEditing && this.niveles && this.niveles.length > 0) {
            const primerNivel = this.niveles[0];
            this.nivelForm.patchValue({
              id_nivel: primerNivel.id,
              nombre: primerNivel.nombre,
              id_asesor: primerNivel.id_asesor,
            });
            this.onNivelChange(primerNivel.id.toString());
          }
        },
        error => {
          console.log(error);
        }
      )
    }
  }

/*
    Este método maneja la creación o actualización de un nivel en el sistema. 
    Valida la entrada del formulario y realiza las operaciones correspondientes
    utilizando los servicios apropiados.
  */
  addNivelSuperAdmin(): void {
    this.submittedNivel = true;
    const nombreNivel = this.nivelForm.get('nombre')?.value;
    if (nombreNivel && nombreNivel.length > 70) {
      this.alertServices.errorAlert('Error', 'El nombre del nivel no puede tener más de 70 caracteres');
      return;
    } else if (nombreNivel && nombreNivel.length < 5) {
      this.alertServices.errorAlert('Error', 'El nombre del nivel debe tener más de 5 caracteres');
      return;
    }
    const idAsesor = this.nivelForm.get('id_asesor')?.value;
    const nivel: any = {
      nombre: nombreNivel,
      id_asesor: idAsesor,
      id_actividad: this.nivelForm.value.id_actividad
    };
    if (this.nivelForm.value.id_nivel && this.nivelForm.value.id_nivel !== '0') {
      const nivelId = this.nivelForm.get('id_nivel')?.value;
      this.nivelService.updateNivel(this.token, nivelId, nivel).subscribe(
        (data) => {
          this.alertServices.successAlert('Exito', 'Nivel actualizado correctamente');
          this.verNivel();
          this.niveles.push({
            id: data.id,
            nombre: data.nombre
          });
          this.nivelForm.patchValue({
            id_nivel: data.id
          });
          this.nivelForm.reset();
          this.submittedNivel = false;
          this.nivelForm.patchValue({ id_actividad: nivel.id_actividad, id_asesor: idAsesor });
        },
        error => {
          this.alertServices.errorAlert('Error', error.error.message);
          console.log(error);
        }
      );
    } else {
    }
  }

 /*
    Este método maneja la creación o actualización de una lección en el sistema. 
    Valida la entrada del formulario y realiza las operaciones correspondientes
    utilizando los servicios apropiados.
  */
  addLeccionSuperAdmin(): void {
    this.submittedLeccion = true;
    const nombreLeccion = this.leccionForm.get('nombre')?.value;
    if (nombreLeccion && nombreLeccion.length > 70) {
      this.alertServices.errorAlert('Error', 'El nombre de la lección no puede tener más de 70 caracteres');
      return;
    } else if (nombreLeccion && nombreLeccion.length < 5) {
      this.alertServices.errorAlert('Error', 'El nombre de la lección debe tener más de 5 caracteres');
      return;
    }
    if (this.leccionForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos de la lección');
      return;
    }
    const leccion: any = {
      nombre: nombreLeccion,
      id_nivel: this.leccionForm.value.id_nivel
    }
    const leccionId = +this.leccionForm.get('id_leccion')?.value;
    if (leccionId) {
      const leccionId = +this.leccionForm.get('id_leccion')?.value;
      this.leccionService.updateLeccion(this.token, leccionId, leccion).subscribe(
        (data) => {
          this.alertServices.successAlert('Exito', data.message);
          this.onNivelChange(this.leccionForm.value.id_nivel);
          this.leccionForm.reset();
          this.submittedLeccion = false;
          this.leccionForm.patchValue({ id_nivel: leccion.id_nivel });
        },
        error => {
          this.alertServices.errorAlert('Error', error.error.message);
          console.log(error);
        }
      )
    } else {
      this.superAdminService.crearLeccionSuperAdmin(this.token, leccion).subscribe(
        (data: any) => {
          this.alertServices.successAlert('Exito', data.message);
          this.onNivelChange(this.leccionForm.value.id_nivel);
          this.contenidoLeccionForm.patchValue({ id_leccion: data.id })
          this.leccionForm.reset();
          this.submittedLeccion = false;
          this.leccionForm.patchValue({ id_nivel: leccion.id_nivel });
        },
        error => {
          this.alertServices.errorAlert('Error', error.error.message);
          console.log(error);
        }
      )
    }
  }

 /*
    Este método recupera las lecciones asociadas a un nivel específico y actualiza
    el formulario con la información de la primera lección, si existe.
  */
  verLeccicon(): void {
    this.leccionService.LeccionxNivel(this.token, parseInt(this.leccionForm.value.id_nivel)).subscribe(
      data => {
        this.listarLeccion = data;
        if (data.length > 0) {
          const primeraLeccion = data[0];
          this.leccionForm.patchValue({
            id_leccion: primeraLeccion.id.toString(),
            nombre: primeraLeccion.nombre
          });
          this.cargarContenidoLeccion(primeraLeccion.id);
        } else {
          this.leccionForm.patchValue({
            id_leccion: '',
            nombre: ''
          });
        }
      },
      error => {
        console.log(error);
      }
    )
  }
/*
    Este método se ejecuta cuando se cambia el nivel seleccionado en el formulario.
    Actualiza el formulario de lecciones y recupera las lecciones asociadas al nuevo
    nivel seleccionado.
  */

  onNivelChange(id_nivel: string): void {
    this.leccionForm.patchValue({ id_nivel: id_nivel });
    this.leccionService.LeccionxNivel(this.token, parseInt(id_nivel)).subscribe(
      data => {
        this.listarLeccion = data;
        if (this.isEditing && data.length > 0) {
          const primeraLeccion = data[0];
          this.leccionForm.patchValue({
            id_leccion: primeraLeccion.id.toString(),
            nombre: primeraLeccion.nombre
          });
          this.cargarContenidoLeccion(primeraLeccion.id);
        } else {
          this.leccionForm.patchValue({
            id_leccion: '',
            nombre: ''
          });
          this.contenidoLeccionForm.reset(); 
          this.contenidoLeccion = [];
        }
      },
      error => {
        console.log(error);
      }
    );
  }

   /*
    Este método se ejecuta cuando se cambia la lección seleccionada en el formulario.
    Actualiza el formulario de lección y el formulario de contenido de lección con
    los datos de la lección seleccionada.
  */
  onLeccionChange(id_leccion: string): void {
    if (id_leccion && id_leccion !== '') {
      const selectedLeccion = this.listarLeccion.find(leccion => leccion.id === parseInt(id_leccion));
      if (selectedLeccion) {
        this.leccionForm.patchValue({
          id_leccion: selectedLeccion.id.toString(),
          nombre: selectedLeccion.nombre
        });
        this.contenidoLeccionForm.patchValue({
          id_leccion: selectedLeccion.id.toString()
        });

        this.cargarContenidoLeccion(parseInt(id_leccion));
      }
    } else {
      this.leccionForm.patchValue({
        nombre: ''
      });
      this.contenidoLeccionForm.patchValue({
        titulo: '',
        descripcion: '',
        id_contenido: '',
        id_leccion: '',
        id_tipo_dato: ''
      })
      this.contenidoLeccion = [];
    }
  }

 /*
    Este método se encarga de cargar el contenido relacionado con una lección específica.
    Realiza una llamada al servicio para obtener el contenido según el ID de la lección.
  */
  cargarContenidoLeccion(id_leccion: number): void {
    this.contenidoLeccionService.contenidoXleccion(this.token, id_leccion).subscribe(
      data => {
        this.contenidoLeccion = data;
        if (this.isEditing && data.length > 0) {
          const primerContenido = data[0];
          this.contenidoLeccionForm.patchValue({
            id_leccion: id_leccion.toString(),
            id_contenido: primerContenido.id.toString(),
            titulo: primerContenido.titulo,
            descripcion: primerContenido.descripcion,
            id_tipo_dato: primerContenido.id_tipo_dato,
            fuente_contenido: primerContenido.fuente_contenido
          });
          this.updateCharCountContenido();
        } else {
          this.contenidoLeccionForm.reset({
            id_leccion: id_leccion.toString(),
          });
        }
        this.onTipoDatoChangeContenido();
      },
      error => {
        console.error('Error al cargar el contenido de la lección:', error);
      }
    );
  }

  /*
    Este método se ejecuta cuando se selecciona un nivel en el formulario.
  */
  onNivelSelect(event: any): void {
    const selectedNivelId = event.target.value;
    this.selectedNivelId = selectedNivelId !== '0' ? parseInt(selectedNivelId) : null;
    if (selectedNivelId === '0') {
      this.nivelForm.patchValue({ nombre: '', id_nivel: 0 });
      this.nivelForm.patchValue({ id_actividad: this.actividadId.toString() });
      this.contenidoLeccionForm.patchValue({
        titulo: '',
        descripcion: '',
        id_contenido: '',
        id_leccion: '',
        id_tipo_dato: ''
      })
      this.contenidoLeccion = [];
    } else {
      const selectedNivel = this.niveles.find(nivel => nivel.id === parseInt(selectedNivelId));
      if (selectedNivel) {
        this.nivelForm.patchValue({
          id_nivel: selectedNivel.id,
          nombre: selectedNivel.nombre
        });
      }
    }
  }

/*
  Actualiza el contador de caracteres para el campo 'descripcion' en el formulario de contenido de la lección.
*/
  updateCharCountContenido() {
    const descripcionContenido = this.contenidoLeccionForm.get('descripcion')?.value || '';
    this.charCountContenido = descripcionContenido.length;
  }

/*
  Agrega o actualiza el contenido de una lección en el sistema, dependiendo de si el contenido ya existe o no.
*/
  addContenidoLeccionSuperAdmin(): void {
    this.submittedContent = true
    const idLeccion = this.contenidoLeccionForm.get('id_leccion')?.value;

    const tituloContenidoLeccion = this.contenidoLeccionForm.get('titulo')?.value;
    if (tituloContenidoLeccion && tituloContenidoLeccion.length > 70) {
      this.alertServices.errorAlert('Error', 'El titulo no puede tener más de 70 caracteres');
      return;
    } else if (tituloContenidoLeccion && tituloContenidoLeccion.length < 5) {
      this.alertServices.errorAlert('Error', 'El titulo debe tener más de 5 caracteres');
      return;
    }
    const descripcionContenidoLeccion = this.contenidoLeccionForm.get('descripcion')?.value;
    if (descripcionContenidoLeccion && descripcionContenidoLeccion.length > 1200) {
      this.alertServices.errorAlert('Error', 'La descripción no puede tener más de 1200 caracteres');
      return;
    }

    const formData = new FormData();
    formData.append('id_leccion', idLeccion);
    let estadoValue: string;
    if (this.idcontenidoLeccion == null) {
      estadoValue = 'true'
    } else {
    }
    formData.append('titulo', this.contenidoLeccionForm.get('titulo')?.value);
    formData.append('descripcion', this.contenidoLeccionForm.get('descripcion')?.value);
    formData.append('id_tipo_dato', this.contenidoLeccionForm.get('id_tipo_dato')?.value);
    formData.append('id_leccion', idLeccion);

    if (this.selectedfuenteContenido) {
      formData.append('fuente_contenido', this.selectedfuenteContenido, this.selectedfuenteContenido.name);
    } else {
      const rutaMultiValues = this.contenidoLeccionForm.get('fuente_contenido')?.value;
      if (rutaMultiValues) {
        formData.append('fuente_contenido', rutaMultiValues);
      }
    }
    const contenidoLeccionId = +this.contenidoLeccionForm.get('id_contenido')?.value;
    if (contenidoLeccionId) {
      this.contenidoLeccionService.updateContenidoLeccion(this.token, contenidoLeccionId, formData).subscribe(
        (data) => {
          this.alertServices.successAlert('Exito', data.message);
          this.cargarContenidoLeccion(+idLeccion);
          this.contenidoLeccionForm.reset();
          this.submittedContent = false;
        },
        error => {
          this.alertServices.errorAlert('Error', error.error.message);
          console.log(error);
        }
      )
    } else {
      this.superAdminService.crearContenicoLeccionSuperAdmin(this.token, formData).subscribe(
        (data: any) => {
          this.alertServices.successAlert('Exito', data.message);
          this.cargarContenidoLeccion(+idLeccion);
          this.contenidoLeccionForm.reset();
          this.submittedContent = false;
        },
        error => {
          this.alertServices.errorAlert('Error', error.error.message);
          console.log(error);
        }
      )
    }
  }

/*
    Este método se utiliza para agregar o actualizar el contenido de una lección en el sistema.
  */
 
  onContenidoSelect(contenidoId: string): void {
    const currentIdLeccion = this.contenidoLeccionForm.get('id_leccion').value;

    if (contenidoId === 'nuevo') {
      this.contenidoLeccionForm.patchValue({
        id_leccion: currentIdLeccion,
        id_contenido: 'nuevo',
        titulo: '',
        descripcion: '',
        id_tipo_dato: '',
        fuente_contenido: ''
      });
      this.updateCharCountContenido();
    } else if (contenidoId) {
      const selectedContenido = this.contenidoLeccion.find(c => c.id.toString() === contenidoId);
      if (selectedContenido) {
        this.contenidoLeccionForm.patchValue({
          id_leccion: currentIdLeccion,
          id_contenido: selectedContenido.id.toString(),
          titulo: selectedContenido.titulo,
          descripcion: selectedContenido.descripcion,
          id_tipo_dato: selectedContenido.id_tipo_dato,
          fuente_contenido: selectedContenido.fuente_contenido
        });
        this.updateCharCountContenido();
      }
    }
  }

/*
    Este método busca el nombre del tipo de dato basado en el ID proporcionado.
  */
  getTipoDatoNombre(id: string): string {
    const tipoDato = this.listarTipoDatoContenido.find(t => t.id === +id);
    return tipoDato ? tipoDato.fuente_contenido : '';
  }

/*
    Este método se llama cuando cambia el tipo de dato. 
  */
  onTipoDatoChange(): void {
    this.resetFuenteField();
    this.actividadForm.get('fuente').setValidators([Validators.required]); // Siempre requerir fuente
    this.actividadForm.get('fuente').updateValueAndValidity();
  }

/*
  Actualiza el valor del campo 'fuente' en el formulario de actividad cuando se detecta una entrada de texto.
*/
  onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.actividadForm.patchValue({ fuente: value });
  }
/*
    Este método simula un clic en el campo de entrada de archivo.
  */

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /*
     Este método maneja la selección de archivos desde un input de tipo archivo. 
     Verifica si hay archivos seleccionados y, si es así, comprueba su tamaño.
  */
  onFileSelecteds(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const maxSize = 5 * 1024 * 1024; // Tamaño máximo para imágenes

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertServices.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        this.resetFileField('fuente');
        event.target.value = '';
        return;
      }

      this.selectedfuente = file;
      this.selectedFromInput = true;
      this.actividadForm.patchValue({ fuente: file });
    } else {
      this.resetFileField('fuente');
    }
  }

  /*
    Este método se encarga de restablecer el campo de archivo a su estado inicial, 
    eliminando cualquier valor previamente asignado.
  */
  resetFileField(field: string) {
    this.actividadForm.patchValue({ fuente: null });
    this.selectedfuente = null;
    this.fuentePreview = null;
  }
  resetFuenteField(): void {
    this.actividadForm.patchValue({ fuente: '' });
    this.selectedfuente = null;
    this.fuentePreview = null;
  }

/*
  Este método gestiona los cambios en el campo 'id_tipo_dato' del formulario de contenido de lección.
*/
  onTipoDatoChangeContenido(): void {
    const tipoDatoIdContenido = this.contenidoLeccionForm.get('id_tipo_dato').value;
    this.resetFuenteFieldContenido();
    this.contenidoLeccionForm.get('fuente_contenido').clearValidators();

    const tipoDatoIdnumber = Number(tipoDatoIdContenido);
    switch (tipoDatoIdnumber) {
      case 1:
      case 2:
      case 3:
      default:
        this.contenidoLeccionForm.get('fuente_contenido').clearValidators();
        break;
    }
    this.contenidoLeccionForm.get('fuente_contenido').updateValueAndValidity();
    this.cdRef.detectChanges();
  }

/*
  Este método gestiona la entrada de texto en el campo 'fuente_contenido' del formulario de contenido de lección.
*/
  onTextInputContenido(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.contenidoLeccionForm.patchValue({ fuente_contenido: value });
  }

/*
  Este método simula un clic en el elemento de entrada de archivos para permitir que el usuario seleccione un archivo.
*/
  triggerFileInputContenido() {
    this.fileInputs.nativeElement.click();
  }

/*
  Maneja la selección de archivos en el formulario de contenido de lección y valida su tamaño.
*/
  onFileSelectedsContenido(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let maxSize = 0;
      if (field === 'fuente_contenido') {
        maxSize = 5 * 1024 * 1024;
      } else if (field === 'fuente_documentos') {
        maxSize = 18 * 1024 * 1024;
      }
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertServices.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`)
        this.resetFileField(field);
        event.target.value = '';
        return;
      }
      if (field === 'fuente_contenido' || field === 'fuente_documentos') {
        this.selectedfuenteContenido = file;
        this.contenidoLeccionForm.patchValue({ fuente_contenido: file });

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.fuentePreviewContenido = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    } else {
      this.resetFileField(field);
    }
  }

/*
  Este método maneja la selección de archivos en un campo de formulario específico. 
*/
  resetFileFieldContenido(field: string) {
    if (field === 'fuente_contenido') {
      this.contenidoLeccionForm.patchValue({ fuente_contenido: null });
      this.selectedfuenteContenido = null;
      this.fuentePreviewContenido = null;
    }
  }

  resetFuenteFieldContenido(): void {
    this.contenidoLeccionForm.patchValue({ fuente_contenido: '' });
    this.selectedfuenteContenido = null;
    this.fuentePreviewContenido = null;
  }
}