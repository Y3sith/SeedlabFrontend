import { ChangeDetectorRef, Component, Pipe, PipeTransform, } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';
import {  Router } from '@angular/router';
import { Leccion } from '../../../Modelos/leccion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../environment/env';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RutaService } from '../../../servicios/rutas.service';
import { Ruta } from '../../../Modelos/ruta.modelo';
import { AlertService } from '../../../servicios/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { CrearAsesoriaModalComponent } from '../asesorias/crear-asesoria-modal/crear-asesoria-modal.component';
import { Location } from '@angular/common';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) { }

  transform(value: string, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
      case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default: throw new Error(`Invalid safe type specified: ${type}`);
    }
  }
}
@Component({
  selector: 'app-curso-ruta-emprendedor',
  templateUrl: './curso-ruta-emprendedor.component.html',
  styleUrl: './curso-ruta-emprendedor.component.css'
})
export class CursoRutaEmprendedorComponent {

  actividad: any;
  niveles: any[] = [];
  lecciones: any[] = [];
  leccionForm: FormGroup;
  contenidoForm: FormGroup;
  selectedLeccion: any = null;
  selectedContenido: any = null;
  contenidoLeccion: any[] = [];
  fuente_contenido: string;
  currentNivelIndex: number = 0;
  currentLeccionIndex: number = 0;
  currentContenidoIndex: number = 0;
  buttonText: string = "Siguiente";
  buttonPreviousDisabled: boolean = false;
  colorIndex: number;
  errorMessage: string = '';
  token: string | null = null;
  documento: string | null;
  user: any = null;
  currentRolId: number;
  rutaId: number | null;
  ultimoElemento: any;
  rutaList: Ruta[] = [];
  ultimoContenidoId: any;
  currentLeccionFuente: any;
  currentLeccionDescripcion: any;
  showActivityDescription: boolean = true;
  isMenuOpen = true;
  botonAsesoria: boolean = false;

  constructor(private router: Router,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private http: HttpClient,
    private rutaService: RutaService,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private location: Location,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.actividad = navigation.extras.state['actividad'];
      this.initializeNiveles();
    }

    this.leccionForm = this.fb.group({
      id: [null],
      nombre: [''],
      contenido_lecciones: this.fb.array([])
    });

    this.contenidoForm = this.fb.group({
      id: [null],
      titulo: [''],
      descripcion: [''],
      fuente_contenido: [''],
    });
  }


/* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.currentNivelIndex = 0;
    this.currentLeccionIndex = 0;
    this.currentContenidoIndex = -1;
    this.updateSelectedContent();
    this.loadYouTubeApi();
    this.listarRutaActiva();
    if (this.actividad) {
      console.log('Actividad recibida');
    } else {
      console.error('No se recibió información de la actividad');
    }
  }

  /* Valida el token del login */
  validateToken(): void {
    this.token = localStorage.getItem("token");
    let identityJSON = localStorage.getItem('identity');
    if (identityJSON) {
      let identity = JSON.parse(identityJSON);
      this.user = identity;
      this.currentRolId = this.user.id_rol;

      if (this.currentRolId != 5 && this.currentRolId != 1 && this.currentRolId != 2) {
        this.router.navigate(['home']);
      } else {
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  /*
  Lista la ruta activa y obtiene la última actividad si hay rutas disponibles.
*/
  listarRutaActiva(): void {
    if (this.token) {
      this.rutaService.ruta(this.token).subscribe(
        data => {
          this.rutaList = data;

          if (this.rutaList.length > 0) {
            const primeraRuta = this.rutaList[0];
            this.rutaId = primeraRuta.id;
            this.getUltimaActividad();
          }
        },
        err => {
          console.error('Error al obtener rutas:', err);
        }
      );
    } else {
      console.log('No hay token disponible');
    }
  }

  /*
  Obtiene la última actividad de la ruta activa y guarda el contenido correspondiente.
*/
  getUltimaActividad() {
    this.rutaService.ultimaActividad(this.token, this.rutaId).subscribe(
      (data) => {
        this.ultimoElemento = data.ultimo_elemento;
        this.ultimoContenidoId = data.ultimo_elemento.contenido_id;
      },
      (error) => {
        console.error('Error fetching ultima actividad:', error);
      }
    );
  }

/*
  Inicializa el reproductor de YouTube para cada contenido de tipo video después de
   que la vista se haya inicializado.
*/
  ngAfterViewInit() {
    this.contenidoLeccion.forEach((contenido, index) => {
      if (this.getContentType(contenido) === 'video') {
        const videoId = this.getYouTubeVideoId(contenido.fuente_contenido);
        this.createYouTubePlayer(videoId, 'youtube-player-' + contenido.id);
      }
    });
  }

/*
  Inicializa los niveles a partir de la actividad, filtrando lecciones que tienen contenido y marcando cada nivel y lección como no expandido.
*/
  initializeNiveles() {
    this.niveles = this.actividad.nivel
      .map((nivel: any) => {
        const mappedNivel = {
          ...nivel,
          expanded: false,
          lecciones: nivel.lecciones
            .filter((leccion: any) => {
              return leccion.contenido_lecciones && leccion.contenido_lecciones.length > 0;
            })
            .map((leccion: any) => {
              const mappedLeccion = {
                ...leccion,
                expanded: false,
                contenido_lecciones: leccion.contenido_lecciones || []
              };
              return mappedLeccion;
            })
        };
        return mappedNivel;
      })
      .filter((nivel: any) => {
        const hasValidLecciones = nivel.lecciones.length > 0;
        return hasValidLecciones;
      });
  }

/*
  Alterna la expansión de un nivel seleccionado, cerrando otros niveles y asegurando que las lecciones no estén expandidas.
*/
  toggleNivel(selectedNivelIndex: number) {
    this.niveles.forEach((nivel, nivelIndex) => {
      if (nivelIndex === selectedNivelIndex) {
        nivel.expanded = !nivel.expanded;
      } else {
        nivel.expanded = false;
      }
      nivel.lecciones.forEach((leccion) => {
        leccion.expanded = false;
      });
    });
  }

/*
  Alterna la expansión de una lección en un nivel seleccionado, cerrando otras lecciones dentro del mismo nivel.
*/
  toggleLeccion(selectedNivelIndex: number, selectedLeccionIndex: number) {
    const nivel = this.niveles[selectedNivelIndex];
    nivel.lecciones.forEach((leccion, leccionIndex) => {
      if (leccionIndex === selectedLeccionIndex) {
        leccion.expanded = !leccion.expanded;
      } else {
        leccion.expanded = false;
      }
    });
  }

  /*
  Selecciona una lección y actualiza el formulario con sus datos.
*/

  selectLeccion(leccion: any) {
    this.selectedLeccion = leccion;
    this.leccionForm.patchValue(leccion);
  }

  /*
  Establece el contenido seleccionado y actualiza los índices del nivel y lección actuales.
*/
  selectContenido(contenido: any, nivelIndex: number, leccionIndex: number) {
    this.selectedContenido = contenido;
    this.currentNivelIndex = nivelIndex;
    this.currentLeccionIndex = leccionIndex;
    this.currentContenidoIndex = this.niveles[nivelIndex].lecciones[leccionIndex].contenido_lecciones.findIndex(c => c.id === contenido.id);
    this.closeAllExceptSelected(nivelIndex, leccionIndex, contenido.id);
  }

/*
  Cierra todos los niveles y lecciones excepto el seleccionado, asegurando que 
  la jerarquía de expansión se mantenga.
*/
  closeAllExceptSelected(selectedNivelIndex: number, selectedLeccionIndex: number, selectedContenidoId: number) {
    this.niveles.forEach((nivel, nivelIndex) => {
      if (nivelIndex < selectedNivelIndex) {
        nivel.expanded = false;
        nivel.lecciones.forEach(leccion => {
          leccion.expanded = false;
        });
      } else if (nivelIndex === selectedNivelIndex) {
        nivel.expanded = true;
        nivel.lecciones.forEach((leccion, leccionIndex) => {
          if (leccionIndex < selectedLeccionIndex) {
            leccion.expanded = false;
          } else if (leccionIndex === selectedLeccionIndex) {
            leccion.expanded = true;
          } else {
            leccion.expanded = false;
          }
        });
      } else {
        nivel.expanded = false;
        nivel.lecciones.forEach(leccion => {
          leccion.expanded = false;
        });
      }
    });
  }

/*
  Avanza al siguiente contenido en la lección actual.
*/
  goToNextContent() {
    if (this.showActivityDescription) {
      this.showActivityDescription = false;
      this.currentNivelIndex = 0;
      this.currentLeccionIndex = 0;
      this.currentContenidoIndex = 0;
    } else {
      const currentNivel = this.niveles[this.currentNivelIndex];
      const currentLeccion = currentNivel.lecciones[this.currentLeccionIndex];
      const nextContenidoIndex = this.currentContenidoIndex + 1;

      if (nextContenidoIndex < currentLeccion.contenido_lecciones.length) {
        this.currentContenidoIndex = nextContenidoIndex;
      } else {
        const lastContentId = currentLeccion.contenido_lecciones[currentLeccion.contenido_lecciones.length - 1].id;
        if (lastContentId === this.ultimoContenidoId) {
          if (this.currentRolId != 1 && this.currentRolId != 2) {
            this.alertService.alertainformativa('¡Felicitaciones por haber completado la ruta! Ahora es momento de volver a llenar la encuesta de maduración. Esta te permitirá evaluar cuánto has avanzado con tu emprendimiento y cómo han influido los conocimientos que has adquirido en este tiempo. Es una gran oportunidad para reflexionar sobre tu progreso y seguir mejorando. ¡Sigue adelante!', 'success').then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['list-empresa']);
              }
            });
          } else {
            this.router.navigate(['ruta']);
          }
          return;
        }

        this.currentLeccionIndex++;
        if (this.currentLeccionIndex >= currentNivel.lecciones.length) {
          this.currentLeccionIndex = 0;
          this.currentNivelIndex++;
          if (this.currentNivelIndex >= this.niveles.length) {
            this.botonAsesoria = true;
            this.router.navigate(['ruta']);
            return;
          }
        }
        this.currentContenidoIndex = 0;
      }
    }
    const newCurrentNivel = this.niveles[this.currentNivelIndex];
    const newCurrentLeccion = newCurrentNivel.lecciones[this.currentLeccionIndex];
    const newCurrentContenido = newCurrentLeccion.contenido_lecciones[this.currentContenidoIndex];
    this.closeAllExceptSelected(this.currentNivelIndex, this.currentLeccionIndex, newCurrentContenido.id);
    this.selectedContenido = newCurrentContenido;
    this.updateSelectedContent();
  }

  /*
  Regresa a la vista anterior en el historial de navegación.
*/
  goBack(): void {
    this.location.back();
  }

/*
  Activa el botón de asesoría si se está en el último contenido de la última lección.
*/
  boton() {
    const currentNivel = this.niveles[this.currentNivelIndex];
    const currentLeccion = currentNivel.lecciones[this.currentLeccionIndex];
    if (
      this.currentNivelIndex === this.niveles.length - 1 &&
      this.currentLeccionIndex === currentNivel.lecciones.length - 1 &&
      this.currentContenidoIndex === currentLeccion.contenido_lecciones.length - 1
    ) {
      this.botonAsesoria = true;
    }
  }

/*
  Maneja el clic en el botón para avanzar al siguiente contenido.
*/
  onNextContentClick() {
    this.goToNextContent();
  }

/*
  Expande todos los niveles hasta el índice del nivel actual.
*/
  expandCurrentPath() {
    for (let i = 0; i <= this.currentNivelIndex; i++) {
      if (this.niveles[i]) {
        this.niveles[i].expanded = true;
      }
    }
    if (this.niveles[this.currentNivelIndex]) {
      for (let j = 0; j <= this.currentLeccionIndex; j++) {
        if (this.niveles[this.currentNivelIndex].lecciones[j]) {
          this.niveles[this.currentNivelIndex].lecciones[j].expanded = true;
        }
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  /*
  Verifica si el contenido actual corresponde a los índices proporcionados.
*/
  isCurrentContent(nivelIndex: number, leccionIndex: number, contenidoIndex: number): boolean {
    return this.currentNivelIndex === nivelIndex &&
      this.currentLeccionIndex === leccionIndex &&
      this.currentContenidoIndex === contenidoIndex;
  }

/*
  Devuelve un objeto de estilo para el contenido basado en si es el actual.
*/
  getContentStyle(nivelIndex: number, leccionIndex: number, contenidoIndex: number): object {
    const isCurrent = this.isCurrentContent(nivelIndex, leccionIndex, contenidoIndex);
    return {
      'bg-slate-200': isCurrent,
      'hover:bg-slate-100': !isCurrent
    };
  }

  /*
  Abre el modal para crear una asesoría y maneja el cierre.
*/
  openCrearAsesoriaModal() {
    const dialogRef = this.dialog.open(CrearAsesoriaModalComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Asesoría creada');
      }
    });
  }


/*
  Navega al contenido anterior y actualiza el estado de los niveles y lecciones seleccionados.
*/
  goToPreviousContent() {
    if (this.currentContenidoIndex > 0) {
      this.currentContenidoIndex--;
    } else if (this.currentLeccionIndex > 0) {
      this.currentLeccionIndex--;
      const previousLeccion = this.niveles[this.currentNivelIndex].lecciones[this.currentLeccionIndex];
      this.currentContenidoIndex = previousLeccion.contenido_lecciones.length - 1;
    } else if (this.currentNivelIndex > 0) {
      this.currentNivelIndex--;
      const previousNivel = this.niveles[this.currentNivelIndex];
      this.currentLeccionIndex = previousNivel.lecciones.length - 1;
      const previousLeccion = previousNivel.lecciones[this.currentLeccionIndex];
      this.currentContenidoIndex = previousLeccion.contenido_lecciones.length - 1;
    } else {
      this.buttonPreviousDisabled = true;
    }
    const newCurrentNivel = this.niveles[this.currentNivelIndex];
    const newCurrentLeccion = newCurrentNivel.lecciones[this.currentLeccionIndex];
    const newCurrentContenido = newCurrentLeccion.contenido_lecciones[this.currentContenidoIndex];

    this.closeAllExceptSelected(this.currentNivelIndex, this.currentLeccionIndex, newCurrentContenido.id);
    this.updateSelectedContent();

  }


/*
  Actualiza el contenido seleccionado basado en el índice actual de nivel, lección y contenido.
*/
  updateSelectedContent() {

    if (this.showActivityDescription) {
      return;
    }
    const currentNivel = this.niveles[this.currentNivelIndex];
    const currentLeccion = currentNivel.lecciones[this.currentLeccionIndex];
    this.selectedContenido = currentLeccion.contenido_lecciones[this.currentContenidoIndex];
    this.selectedContenido = currentLeccion.contenido_lecciones[this.currentContenidoIndex];
    this.currentLeccionDescripcion = null;
    this.currentLeccionFuente = null;
  }

/*
  Carga la API de YouTube al añadir un script al documento.
*/
  loadYouTubeApi() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

/*
  Crea un reproductor de YouTube con el ID del video y el ID del elemento contenedor.
*/
  createYouTubePlayer(videoId: string, elementId: string) {
    return new (window as any).YT.Player(elementId, {
      height: '360',
      width: '640',
      videoId: videoId,
      playerVars: {
        'playsinline': 1
      }
    });
  }

  /*
  Obtiene la URL completa de la imagen a partir de la ruta relativa.
*/
  getCorrectImageUrl(relativePath: string): string {
    const cleanPath = relativePath.replace(/^\/storage/, '');
    return `${environment.apiUrl}/api//storage${cleanPath}`;
  }

  /*
  Genera la URL de inserción de un video de YouTube a partir de su URL original.
*/
  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.getYouTubeVideoId(url);
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

/*
  Extrae el ID de un video de YouTube a partir de su URL.
*/
  getYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

/*
  Genera la URL correcta para un archivo a partir de una ruta relativa.
*/
  getCorrectFileUrl(relativePath: string): string { 
    let baseUrl = environment.apiUrl.replace('/api/', '/');
    baseUrl = baseUrl.replace(/\/+$/, '');
    relativePath = relativePath.replace(/^\/+/, '');
    return `${baseUrl}/${relativePath}`;
}

/*
  Crea una URL segura para un archivo PDF a partir de una URL dada.
*/
  getPdfUrl(url: string): SafeResourceUrl {
    const cleanUrl = url.replace(/^\/?(storage\/)?/, '');
    const fullUrl = `${environment.apiUrl}/storage/${cleanUrl}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

/*
  Descarga un archivo PDF dado su ID de contenido.
*/
  downloadPDF(contenidoId: number) {
    this.rutaService.descargarArchivo(contenidoId).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'documento.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/"/g, '').trim();
            filename = filename.replace(/_+$/, '');
          }
        }
        const blob: Blob = response.body || new Blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar el archivo:', error);
      }
    });
  }
  
/*
  Obtiene el color correspondiente a un índice dado.
*/
  getItemColor(index: number): string {
    const colors = [
      '#F4384B', // Rojo
      '#FFA300', // Amarillo oscuro
      '#80981A', // Verde
      '#683466', // Morado
      '#F42CCF', // Fucsia
      '#FFCE00', // Amarillo
      '#00BF9E', // Agua marina
      '#FF5F27', // Naranja
      '#0E54A8'  // Azul oscuro
    ];
    return colors[index % colors.length];
  }

/*
  Obtiene el color para la actividad.
*/
  getColor(): string {
    return this.actividad.colorIndex !== undefined
      ? this.getItemColor(this.actividad.colorIndex)
      : '#FA7D00';
  }

/*
  Obtiene el color del texto en función del color de fondo.
*/
  getTextColor(): string {
    const color = this.getColor();
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  }

/*
  Obtiene un color más claro a partir del color actual.
*/
  getLighterColor(amount: number): string {
    const color = this.getColor();
    return this.lightenColor(color, amount);
  }

/*
  Aclara un color dado en función de la cantidad especificada.
*/
  lightenColor(color: string, amount: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const scaleFactor = 7;
    const r = Math.min(255, ((num >> 16) + amount * scaleFactor));
    const g = Math.min(255, (((num >> 8) & 0x00FF) + amount * scaleFactor));
    const b = Math.min(255, ((num & 0x0000FF) + amount * scaleFactor));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

/*
  Determina el tipo de contenido basado en la fuente y el tipo de dato.
*/
  getContentType(contenido: any): string {
    if (!contenido || !contenido.fuente_contenido) return 'unknown';
    const fuente = contenido.fuente_contenido.toLowerCase();

    if (contenido.id_tipo_dato === 1) return 'video';
    if (fuente.includes('youtube.com') || fuente.includes('youtu.be')) return 'video';
    if (fuente.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif)$/i.test(fuente)) return 'image';
    return 'text';
  }

}
