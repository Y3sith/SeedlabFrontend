import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperadminService } from '../../../../servicios/superadmin.service';
import { Asesor } from '../../../../Modelos/asesor.model';
import { ActividadService } from '../../../../servicios/actividad.service';
import { faEye, faEyeSlash, faFileUpload, faFileLines, faL, faCircleQuestion, faImage, faTrashCan, faPaintBrush, faFile, faFilePdf, } from '@fortawesome/free-solid-svg-icons';
import { Actividad } from '../../../../Modelos/actividad.model';
import { Aliado } from '../../../../Modelos/aliado.model';
import { Superadmin } from '../../../../Modelos/superadmin.model';
import { AliadoService } from '../../../../servicios/aliado.service';
import Pica from 'pica';
import { NivelService } from '../../../../servicios/nivel.service';
import { Nivel } from '../../../../Modelos/nivel.model';
import { AlertService } from '../../../../servicios/alert.service';
import { LeccionService } from '../../../../servicios/leccion.service';
import { Leccion } from '../../../../Modelos/leccion.model';
import { ContenidoLeccionService } from '../../../../servicios/contenido-leccion.service';
import { Contenido_Leccion } from '../../../../Modelos/contenido-leccion.model';

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
  listarTipoDatoContenido: Contenido_Leccion[] = [];
  listarAliadoo: Aliado[] = [];
  listarNiveles: Nivel[] = [];
  listarLeccion: Leccion[] = [];
  ///
  listarAsesores: any[] = [];
  userFilter: any = { nombre: '', estado: 'Activo' };
  aliadoSeleccionado: any | null;
  rutaId: number | null = null;
  nivelSeleccionado: any | null;
  ////
  // currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  /////
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


  ////
  fuente: string = '';
  fuente_contenido: string = '';
  submittedActividad = false;
  submittedNivel = false;
  submittedLeccion = false;
  submittedContent = false;
  submitted = false;
  ////añadir actividad

  actividadForm = this.fb.group({
    id: [],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fuente: ['', Validators.required],
    id_tipo_dato: ['', Validators.required],
    id_asesor: ['', Validators.required],
    id_ruta: ['', Validators.required],
    id_aliado: ['', Validators.required]
  })
  ////anadir nivel

  nivelForm = this.fb.group({
    nombre: [{value:'',disabled:true}, Validators.required],
    id_actividad: [{value:'',disabled:true}, Validators.required]
  })
  mostrarNivelForm: boolean = false;

  ///// añadir leccion
  leccionForm = this.fb.group({
    nombre: [{value:'',disabled:true}, Validators.required],
    id_nivel: [{value:'',disabled:true}, Validators.required]
  })
  mostrarLeccionForm: boolean = false;

  ///añadir contenido por leccion

  contenidoLeccionForm = this.fb.group({
    titulo: [{value:'',disabled:true}, Validators.required],
    descripcion: [{value:'',disabled:true}, Validators.required],
    fuente_contenido: [{value:'',disabled:true}, Validators.required],
    id_tipo_dato: [{value:'',disabled:true}, Validators.required],
    id_leccion: [{value:'',disabled:true}, Validators.required]
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
    private alertServices: AlertService,
    private leccionService: LeccionService,
    private contenidoLeccionService: ContenidoLeccionService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.rutaId = +params['id_ruta'];
      this.actividadForm.patchValue({ id_ruta: this.rutaId.toString() });
    });

    this.validateToken();
    this.tipoDato();
    this.tipoDatoContenido();
    this.verLeccicon();
    this.verNivel();
    this.listaAliado();
    this.onAliadoChange();
    this.bloquearBotones();
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

  tipoDatoContenido(): void {
    if (this.token) {
      this.contenidoLeccionService.getTipoDato(this.token).subscribe(
        data => {
          this.listarTipoDatoContenido = data;
          console.log('tipo de dato contenido:', data);
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
    let aliadoId: any;

    // Comprueba si event existe y tiene la estructura esperada
    if (event && event.target && event.target.value) {
      aliadoId = event.target.value;
    } else if (this.aliadoSeleccionado) {
      // Si no hay evento, usa el ID del aliado seleccionado actualmente
      aliadoId = this.aliadoSeleccionado.id;
    } else {
      console.error('No se pudo obtener el ID del aliado');
      return;
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
            console.log('Asesores: ', data);
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

  verNivel(): void {
    if (this.token) {
      this.nivelService.mostrarNivelXidActividad(this.token, parseInt(this.nivelForm.value.id_actividad)).subscribe(
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

  addActividadSuperAdmin(): void {
    this.submitted = true;
    const formData = new FormData();
    let estadoValue: string;
    if (this.actividadForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos de la actividad');
      return;
    }
    if (this.idactividad == null) {
      estadoValue = 'true'
    } else {
    }
    formData.append('nombre', this.actividadForm.get('nombre')?.value);
    formData.append('descripcion', this.actividadForm.get('descripcion')?.value);
    formData.append('id_tipo_dato', this.actividadForm.get('id_tipo_dato')?.value);
    formData.append('id_asesor', this.actividadForm.get('id_asesor')?.value);
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
      console.log('datos enviados: ', formData)
    }
    if (this.idactividad == null) {
      this.alertServices.alertaActivarDesactivar("¿Estas seguro de guardar los cambios? Verifica los datos ingresados, una vez guardados solo se podran modificar en el apartado de editar", 'question').then((result) => {
        if (result.isConfirmed) {
          this.superAdminService.crearActividadSuperAdmin(this.token, formData).subscribe(
            (data: any) => {
              const actividadCreada = data[0];
              this.nivelForm.patchValue({ id_actividad: actividadCreada.id });
              this.mostrarNivelForm = true;
              this.alertServices.successAlert('Exito', data.message);
              this.desactivarcamposActividad();
              console.log('datos enviados: ', data)
              this.activarformularios();
              this.habilitarBotones();
            },
            error => {
              console.log(error);
              this.alertServices.errorAlert('Error', error.error.message);
            }
          );
        }
      })
    }
  }

  desactivarcamposActividad(): void {
    this.actividadForm.disable();

    const guardarBtn = document.getElementById('guardarBtn') as HTMLButtonElement;
    if (guardarBtn) {
      guardarBtn.disabled = true;
      guardarBtn.style.cursor = 'not-allowed'; // Cambia el cursor para indicar que está deshabilitado
    }

    const fuente = document.getElementById('fuente') as HTMLButtonElement;
    if (fuente) {
      fuente.disabled = true;
      fuente.classList.add('disabled-btn');
    }
  }

  activarformularios(): void {
    this.nivelForm.enable(); // Habilita el formulario de niveles
    this.leccionForm.enable();
    this.contenidoLeccionForm.enable();
  }

  bloquearBotones(): void {
    const agregarNivelBtn = document.getElementById('agregarNivelBtn') as HTMLAnchorElement;
    if (agregarNivelBtn) {
      agregarNivelBtn.style.pointerEvents = 'none';
      agregarNivelBtn.style.opacity = '0.5';
    }

    const agregarLeccionBtn = document.getElementById('agregarLeccionBtn') as HTMLAnchorElement;
    if (agregarLeccionBtn) {
      agregarLeccionBtn.style.pointerEvents = 'none';
      agregarLeccionBtn.style.opacity = '0.5';
    }

    const agregarContenidoBtn = document.getElementById('agregarContenidoBtn') as HTMLAnchorElement;
    if (agregarContenidoBtn) {
      agregarContenidoBtn.style.pointerEvents = 'none';
      agregarContenidoBtn.style.opacity = '0.5';
    }
  }
  habilitarBotones(): void {
    const agregarNivelBtn = document.getElementById('agregarNivelBtn') as HTMLAnchorElement;
    if (agregarNivelBtn) {
      agregarNivelBtn.style.pointerEvents = 'auto';
      agregarNivelBtn.style.opacity = '1';
    }

    const agregarLeccionBtn = document.getElementById('agregarLeccionBtn') as HTMLAnchorElement;
    if (agregarLeccionBtn) {
      agregarLeccionBtn.style.pointerEvents = 'auto';
      agregarLeccionBtn.style.opacity = '1';
    }

    const agregarContenidoBtn = document.getElementById('agregarContenidoBtn') as HTMLAnchorElement;
    if (agregarContenidoBtn) {
      agregarContenidoBtn.style.pointerEvents = 'auto';
      agregarContenidoBtn.style.opacity = '1';
    }

  }

  addNivelSuperAdmin(): void {
    this.submittedNivel = true;
    //this.submitted = true;
    if (this.nivelForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos del nivel');
      return;
    }

    const nivel: any = {
      nombre: this.nivelForm.value.nombre,
      id_actividad: this.nivelForm.value.id_actividad
    }
    console.log('nivel data', nivel);
    this.superAdminService.crearNivelSuperAdmin(this.token, nivel).subscribe(
      (data: any) => {
        this.alertServices.successAlert('Exito', data.message);
        console.log('datos recibidos', data);
        this.leccionForm.patchValue({ id_nivel: data.id })
        this.verNivel();
        this.mostrarLeccionForm = true;
        this.nivelForm.reset();
        this.submittedNivel = false;
        this.nivelForm.patchValue({ id_actividad: nivel.id_actividad });
        //this.alertServices.successAlert('Éxito', 'Nivel creado correctamente')
      },
      error => {
        this.alertServices.errorAlert('Error', error.message);
        console.log(error);
      }
    )
  }

  agregarOtroNivel(): void {
    this.submittedNivel = true;
    if (this.nivelForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos del nivel');
      return;
    }
    const nivel: any = {
      nombre: this.nivelForm.value.nombre,
      id_actividad: this.nivelForm.value.id_actividad
    };
    console.log('nivel data', nivel);
    this.superAdminService.crearNivelSuperAdmin(this.token, nivel).subscribe(
      (data: any) => {
        this.alertServices.successAlert('Exito', data.message);
        console.log('datos recibidos', data);
        // Resetea el formulario para agregar otro nivel
        this.nivelForm.reset();
        this.submittedNivel = false;
        this.nivelForm.patchValue({ id_actividad: nivel.id_actividad });
        this.verNivel();
      },
      error => {
        console.log(error);
      }
    );
  }

  addLeccionSuperAdmin(): void {
    this.submittedLeccion = true;
    if (this.leccionForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos de la lección');
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
        this.alertServices.successAlert('Exito', data.message);
        this.contenidoLeccionForm.patchValue({ id_leccion: data.id })
        this.verLeccicon();
        this.mostrarContenidoLeccionForm = true;
        this.leccionForm.reset();
        this.submittedLeccion = false;
        this.leccionForm.patchValue({ id_nivel: leccion.id_nivel });
        console.log('id leccion: ', data.id);
      },
      error => {
        console.log(error);
      }
    )
  }

  agregarOtraLeccion(): void {
    this.submittedLeccion = true;
    if (this.leccionForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos de la lección');
      return;
    }
    const leccion: any = {
      nombre: this.leccionForm.value.nombre,
      id_nivel: this.leccionForm.value.id_nivel
    };
    console.log('leccion data', leccion);
    this.superAdminService.crearLeccionSuperAdmin(this.token, leccion).subscribe(
      (data: any) => {
        this.alertServices.successAlert('Exito', data.message);
        console.log('datos recibidos', data);
        this.leccionForm.reset();
        this.submittedLeccion = false;
        this.leccionForm.patchValue({ id_nivel: leccion.id_nivel });
        this.verLeccicon();
      },
      error => {
        console.log(error);
      }
    );
  }

  verLeccicon(): void {
    this.leccionService.LeccionxNivel(this.token, parseInt(this.leccionForm.value.id_nivel)).subscribe(
      data => {
        this.listarLeccion = data;
        console.log('lecciones: ', data)
      }
    )
  }

  onNivelChange(id_nivel: string): void {
    this.leccionForm.patchValue({ id_nivel: id_nivel }); // Actualizar el formulario con el nivel seleccionado
    this.leccionService.LeccionxNivel(this.token, parseInt(id_nivel)).subscribe(
      data => {
        this.listarLeccion = data;
        console.log('Lecciones: ', data);
      },
      error => {
        console.log(error);
      }
    );
  }

  addContenidoLeccionSuperAdmin(): void {
    this.submittedContent = true
    if (this.contenidoLeccionForm.invalid) {
      this.alertServices.errorAlert('Error', 'Debes completar todos los campos requeridos del contenido');
      return;
    }
    const formData = new FormData();
    let estadoValue: string;
    if (this.idcontenidoLeccion == null) {
      estadoValue = 'true'
    } else {
    }
    formData.append('titulo', this.contenidoLeccionForm.get('titulo')?.value);
    formData.append('descripcion', this.contenidoLeccionForm.get('descripcion')?.value);
    formData.append('id_tipo_dato', this.contenidoLeccionForm.get('id_tipo_dato')?.value);
    formData.append('id_leccion', this.contenidoLeccionForm.get('id_leccion')?.value);

    if (this.selectedfuenteContenido) {
      formData.append('fuente_contenido', this.selectedfuenteContenido, this.selectedfuenteContenido.name);
    } else {
      const rutaMultiValues = this.contenidoLeccionForm.get('fuente_contenido')?.value;
      if (rutaMultiValues) {
        formData.append('fuente_contenido', rutaMultiValues);
      }
    }
    this.superAdminService.crearContenicoLeccionSuperAdmin(this.token, formData).subscribe(
      (data: any) => {
        this.alertServices.successAlert('Exito', data.message);
        console.log('datos recibidos: ', data);
        this.contenidoLeccionForm.reset();
        this.submittedContent = false;
        //location.reload();
      },
      error => {
        console.log(error);
      }
    )
  }

  ///////////////////////////////////////////////////////////////////////////////
  onTipoDatoChange(): void {
    const tipoDatoId = this.actividadForm.get('id_tipo_dato').value;
    this.resetFuenteField();
    this.actividadForm.get('fuente').clearValidators();

    switch (tipoDatoId) {
      case '1': // Video
      case '2': // Imagen
      case '3': // PDF
      case '4': // Texto
        this.actividadForm.get('fuente').setValidators([Validators.required]);
        break;
      default:
        // Si no es ninguno de los anteriores, elimina cualquier validador
        this.actividadForm.get('fuente').clearValidators();
        break;
    }
    this.actividadForm.get('fuente').updateValueAndValidity();
  }

  onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.actividadForm.patchValue({ fuente: value });
    //console.log('fuente actualizada:', value);  // Para depuración
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelecteds(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let maxSize = 0;
      if (field === 'fuente') {
        maxSize = 5 * 1024 * 1024; // Tamaño máximo para imágenes
      } else if (field === 'fuente_documento') {
        maxSize = 18 * 1024 * 1024;
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        this.alertServices.errorAlert('Error', `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB} MB.`)
        this.resetFileField(field);
        event.target.value = '';
        return;
      }
      if (field === 'fuente' || field === 'fuente_documento') {
        this.selectedfuente = file;
        this.actividadForm.patchValue({ fuente: file });
      }
    } else {
      this.resetFileField(field);
    }
  }

  resetFileField(field: string) {
    if (field === 'fuente') {
      this.actividadForm.patchValue({ fuente: null });
      this.selectedfuente = null;
      this.fuentePreview = null;
    }
  }
  resetFuenteField(): void {
    this.actividadForm.patchValue({ fuente: '' });
    this.selectedfuente = null;
    this.fuentePreview = null;
  }

  ////////////////////////////////////////////////////////////////////////////////////////

  onTipoDatoChangeContenido(): void {
    const tipoDatoIdContenido = this.contenidoLeccionForm.get('id_tipo_dato').value;
    this.resetFuenteFieldContenido();
    this.contenidoLeccionForm.get('fuente_contenido').clearValidators();

    switch (tipoDatoIdContenido) {
      case '1': // Video
      case '2': // Imagen
      case '3': // PDF
      case '4': // Texto
        this.contenidoLeccionForm.get('fuente_contenido').setValidators([Validators.required]);
        break;
      default:
        // Si no es ninguno de los anteriores, elimina cualquier validador
        this.contenidoLeccionForm.get('fuente_contenido').clearValidators();
        break;
    }
    this.contenidoLeccionForm.get('fuente_contenido').updateValueAndValidity();
  }

  onTextInputContenido(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.contenidoLeccionForm.patchValue({ fuente_contenido: value });
    //console.log('fuente actualizada:', value);  // Para depuración
  }

  triggerFileInputContenido() {
    this.fileInputs.nativeElement.click();
  }

  onFileSelectedsContenido(event: any, field: string) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let maxSize = 0;
      if (field === 'fuente_contenido') {
        maxSize = 5 * 1024 * 1024; // Tamaño máximo para imágenes
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
      }
    } else {
      this.resetFileField(field);
    }
  }

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

  ////////////////////////////////////////////////////////////////////////
 
}
