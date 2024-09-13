import { ChangeDetectorRef, Component, ElementRef, Injectable, Input, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Leccion } from '../../../Modelos/leccion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../environment/env';
import { Contenido_Leccion } from '../../../Modelos/contenido-leccion.model';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { RutaService } from '../../../servicios/rutas.service';
import { Observable, tap } from 'rxjs';
import { Ruta } from '../../../Modelos/ruta.modelo';
import { AlertService } from '../../../servicios/alert.service';

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

  constructor(private router: Router,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private http: HttpClient,
    private rutaService: RutaService,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef
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

  ngOnInit() {
    this.validateToken();
    this.currentNivelIndex = 0;
    this.currentLeccionIndex = 0;
    this.currentContenidoIndex = -1;
    //this.expandCurrentPath();
    this.updateSelectedContent();
    this.loadYouTubeApi();
    this.listarRutaActiva();
    if (this.actividad) {
      console.log('Actividad recibida:', this.actividad);
      // Aquí puedes usar this.actividad.nombre, this.actividad.nivel, etc.
    } else {
      console.error('No se recibió información de la actividad');
      // Manejar el caso en que no se recibió la actividad
    }
  }

  validateToken(): void {
    this.token = localStorage.getItem("token");
    let identityJSON = localStorage.getItem('identity');

    if (identityJSON) {
      let identity = JSON.parse(identityJSON);
      this.user = identity;
      this.currentRolId = this.user.id_rol;

      if (this.currentRolId != 5) {
        this.router.navigate(['home']);
      } else {
        this.documento = this.user.emprendedor.documento;
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  listarRutaActiva(): void {
    if (this.token) {
      this.rutaService.ruta(this.token).subscribe(
        data => {
          this.rutaList = data;
          console.log('Rutas recibidas:', this.rutaList);

          if (this.rutaList.length > 0) {
            const primeraRuta = this.rutaList[0];
            this.rutaId = primeraRuta.id;
            console.log('ID de la primera ruta almacenado en this.rutaId:', this.rutaId);
            // Si quieres llamar otra función después de recibir el ID
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

  getUltimaActividad() {
    this.rutaService.ultimaActividad(this.token, this.rutaId).subscribe(
      (data) => {
        this.ultimoElemento = data.ultimo_elemento;
        this.ultimoContenidoId = data.ultimo_elemento.contenido_id;
        console.log('Último elemento:', this.ultimoElemento);
      },
      (error) => {
        console.error('Error fetching ultima actividad:', error);
      }
    );
  }

  ngAfterViewInit() {
    this.contenidoLeccion.forEach((contenido, index) => {
      if (this.getContentType(contenido) === 'video') {
        const videoId = this.getYouTubeVideoId(contenido.fuente_contenido);
        this.createYouTubePlayer(videoId, 'youtube-player-' + contenido.id);
      }
    });
  }

  // initializeNiveles() {
  //   this.niveles = this.actividad.nivel.map((nivel: any) => ({
  //     ...nivel,
  //     expanded: false,
  //     lecciones: nivel.lecciones.map((leccion: any) => ({
  //       ...leccion,
  //       expanded: false,
  //       contenido_lecciones: leccion.contenido_lecciones || []
  //     }))
  //   }));
  // }

  initializeNiveles() {
    this.niveles = this.actividad.nivel
      .map((nivel: any) => ({
        ...nivel,
        expanded: false,
        lecciones: nivel.lecciones
          .filter((leccion: any) => {
            // Filtrar lecciones que tienen contenido_lecciones no vacío
            return leccion.contenido_lecciones && leccion.contenido_lecciones.length > 0;
          })
          .map((leccion: any) => ({
            ...leccion,
            expanded: false,
            contenido_lecciones: leccion.contenido_lecciones || []
          }))
      }))
      .filter((nivel: any) => {
        // Filtrar niveles que tienen al menos una lección con contenido
        return nivel.lecciones.length > 0;
      });
  }

  toggleNivel(selectedNivelIndex: number) {
    this.niveles.forEach((nivel, nivelIndex) => {
      // Si el nivel es el seleccionado, se expande; si no, se colapsa
      if (nivelIndex === selectedNivelIndex) {
        nivel.expanded = !nivel.expanded;
      } else {
        nivel.expanded = false;  // Cierra todos los demás niveles
      }

      // Colapsa todas las lecciones de los otros niveles
      nivel.lecciones.forEach((leccion) => {
        leccion.expanded = false;
      });
    });
  }

  toggleLeccion(selectedNivelIndex: number, selectedLeccionIndex: number) {
    const nivel = this.niveles[selectedNivelIndex];
    nivel.lecciones.forEach((leccion, leccionIndex) => {
      // Si la lección es la seleccionada, se expande; si no, se colapsa
      if (leccionIndex === selectedLeccionIndex) {
        leccion.expanded = !leccion.expanded;
      } else {
        leccion.expanded = false;  // Cierra todas las demás lecciones dentro del mismo nivel
      }
    });
  }

  selectLeccion(leccion: any) {
    this.selectedLeccion = leccion;
    this.leccionForm.patchValue(leccion);
  }

  // selectContenido(contenido: any) {
  //   this.selectedContenido = contenido;
  //   this.contenidoForm.patchValue(contenido);
  // }

  selectContenido(contenido: any, nivelIndex: number, leccionIndex: number) {
    this.selectedContenido = contenido;
    this.currentNivelIndex = nivelIndex;
    this.currentLeccionIndex = leccionIndex;
    this.currentContenidoIndex = this.niveles[nivelIndex].lecciones[leccionIndex].contenido_lecciones.findIndex(c => c.id === contenido.id);
    this.closeAllExceptSelected(nivelIndex, leccionIndex, contenido.id);
  }

  closeAllExceptSelected(selectedNivelIndex: number, selectedLeccionIndex: number, selectedContenidoId: number) {
    this.niveles.forEach((nivel, nivelIndex) => {
      if (nivelIndex < selectedNivelIndex) {
        // Colapsar todos los niveles anteriores al seleccionado
        nivel.expanded = false;
        nivel.lecciones.forEach(leccion => {
          leccion.expanded = false;
        });
      } else if (nivelIndex === selectedNivelIndex) {
        // Expandir el nivel seleccionado
        nivel.expanded = true;
        nivel.lecciones.forEach((leccion, leccionIndex) => {
          if (leccionIndex < selectedLeccionIndex) {
            // Colapsar todas las lecciones anteriores a la seleccionada
            leccion.expanded = false;
          } else if (leccionIndex === selectedLeccionIndex) {
            // Expandir la lección seleccionada
            leccion.expanded = true;
          } else {
            // Colapsar todas las lecciones posteriores a la seleccionada
            leccion.expanded = false;
          }
        });
      } else {
        // Colapsar todos los niveles posteriores al seleccionado
        nivel.expanded = false;
        nivel.lecciones.forEach(leccion => {
          leccion.expanded = false;
        });
      }
    });
  }

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
          this.alertService.alertainformativa('¡Felicitaciones por haber completado la ruta! Ahora es momento de volver a llenar la encuesta de maduración. Esta te permitirá evaluar cuánto has avanzado con tu emprendimiento y cómo han influido los conocimientos que has adquirido en este tiempo. Es una gran oportunidad para reflexionar sobre tu progreso y seguir mejorando. ¡Sigue adelante!', 'success').then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['list-empresa']);
            }
          });
          return;
        }
  
        this.currentLeccionIndex++;
        if (this.currentLeccionIndex >= currentNivel.lecciones.length) {
          this.currentLeccionIndex = 0;
          this.currentNivelIndex++;
          if (this.currentNivelIndex >= this.niveles.length) {
            this.router.navigate(['ruta']);
            return;
          }
        }
        this.currentContenidoIndex = 0;
      }
    }
  
    // Obtener el contenido actual después de actualizar los índices
    const newCurrentNivel = this.niveles[this.currentNivelIndex];
    const newCurrentLeccion = newCurrentNivel.lecciones[this.currentLeccionIndex];
    const newCurrentContenido = newCurrentLeccion.contenido_lecciones[this.currentContenidoIndex];
  
    // Llamar a closeAllExceptSelected con los nuevos índices
    this.closeAllExceptSelected(this.currentNivelIndex, this.currentLeccionIndex, newCurrentContenido.id);
    this.selectedContenido = newCurrentContenido;
    this.updateSelectedContent();
  }

  onNextContentClick() {
    this.goToNextContent();
  }

  expandCurrentPath() {
    // Expandir todos los niveles hasta el actual
    for (let i = 0; i <= this.currentNivelIndex; i++) {
      if (this.niveles[i]) {
        this.niveles[i].expanded = true;
      }
    }

    // Expandir todas las lecciones del nivel actual
    if (this.niveles[this.currentNivelIndex]) {
      for (let j = 0; j <= this.currentLeccionIndex; j++) {
        if (this.niveles[this.currentNivelIndex].lecciones[j]) {
          this.niveles[this.currentNivelIndex].lecciones[j].expanded = true;
        }
      }
    }

    // Forzar la detección de cambios
    this.changeDetectorRef.detectChanges();
  }

  isCurrentContent(nivelIndex: number, leccionIndex: number, contenidoIndex: number): boolean {
    return this.currentNivelIndex === nivelIndex &&
           this.currentLeccionIndex === leccionIndex &&
           this.currentContenidoIndex === contenidoIndex;
  }

  getContentStyle(nivelIndex: number, leccionIndex: number, contenidoIndex: number): object {
    const isCurrent = this.isCurrentContent(nivelIndex, leccionIndex, contenidoIndex);
    return {
      'bg-slate-200': isCurrent,
      'hover:bg-slate-100': !isCurrent
    };
  }



  goToPreviousContent() {
    if (this.currentContenidoIndex > 0) {
      // Ir al contenido anterior en la misma lección
      this.currentContenidoIndex--;
    } else if (this.currentLeccionIndex > 0) {
      // Ir a la lección anterior
      this.currentLeccionIndex--;
      const previousLeccion = this.niveles[this.currentNivelIndex].lecciones[this.currentLeccionIndex];
      this.currentContenidoIndex = previousLeccion.contenido_lecciones.length - 1;
    } else if (this.currentNivelIndex > 0) {
      // Ir al nivel anterior
      this.currentNivelIndex--;
      const previousNivel = this.niveles[this.currentNivelIndex];
      this.currentLeccionIndex = previousNivel.lecciones.length - 1;
      const previousLeccion = previousNivel.lecciones[this.currentLeccionIndex];
      this.currentContenidoIndex = previousLeccion.contenido_lecciones.length - 1;
    } else {
      // No hay contenido anterior, deshabilitar el botón
      this.buttonPreviousDisabled = true;
    }
    const newCurrentNivel = this.niveles[this.currentNivelIndex];
    const newCurrentLeccion = newCurrentNivel.lecciones[this.currentLeccionIndex];
    const newCurrentContenido = newCurrentLeccion.contenido_lecciones[this.currentContenidoIndex];
  
    this.closeAllExceptSelected(this.currentNivelIndex, this.currentLeccionIndex, newCurrentContenido.id);
    this.updateSelectedContent();
    
  }

  updateSelectedContent() {
    
    if (this.showActivityDescription) {
      return; // No hacemos nada si estamos mostrando la descripción de la actividad
    }
    const currentNivel = this.niveles[this.currentNivelIndex];
    const currentLeccion = currentNivel.lecciones[this.currentLeccionIndex];
    this.selectedContenido = currentLeccion.contenido_lecciones[this.currentContenidoIndex];
    

    this.selectedContenido = currentLeccion.contenido_lecciones[this.currentContenidoIndex];
    this.currentLeccionDescripcion = null;
    this.currentLeccionFuente = null;
  }



  /////////////////////////////////////////////////////////////  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////    /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////    /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////   /////////////////////////////////////////////////////////////

  loadYouTubeApi() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

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

  getCorrectImageUrl(relativePath: string): string {
    // Elimina '/storage' del inicio si está presente
    const cleanPath = relativePath.replace(/^\/storage/, '');

    // Construye la URL completa
    return `${environment.apiUrl}/api//storage${cleanPath}`;
  }

  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.getYouTubeVideoId(url);
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

  getYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  getCorrectFileUrl(relativePath: string): string {
    // Asegúrate de que esta URL base sea correcta para tu configuración de backend
    const baseUrl = 'http://127.0.0.1:8000'; // Por ejemplo: 'http://localhost:8000'
    return `${baseUrl}${relativePath}`;
  }

  // getPdfUrl(url: string): SafeResourceUrl {
  //   // Remove any leading slashes and 'storage' from the URL
  //   const cleanUrl = url.replace(/^\/?(storage\/)?/, '');
  //   // Construct the full URL
  //   const fullUrl = `${environment.apiUrl}/storage/${cleanUrl}`;
  //   // Sanitize the URL
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  // }

  getPdfUrl(url: string): SafeResourceUrl {
    const cleanUrl = url.replace(/^\/?(storage\/)?/, '');
    const fullUrl = `${environment.apiUrl}/storage/${cleanUrl}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

  downloadPDF(contenidoId: number) {
    this.rutaService.descargarArchivo(contenidoId).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'documento.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/"/g, '').trim();
            // Elimina cualquier guión bajo al final del nombre
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

  handleIrAModulo(rutaId: number) {
    console.log('Ir a módulos de la ruta con ID:', rutaId);
    // Aquí puedes implementar la lógica para manejar el ID de la ruta
    // Por ejemplo, navegar a una nueva página o cargar datos específicos
  }

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

  getColor(): string {
    return this.actividad.colorIndex !== undefined
      ? this.getItemColor(this.actividad.colorIndex)
      : '#FA7D00'; // Color por defecto si no hay índice
  }

  getTextColor(): string {
    const color = this.getColor();
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  }

  getLighterColor(amount: number): string {
    const color = this.getColor();
    return this.lightenColor(color, amount);
  }

  lightenColor(color: string, amount: number): string {
    const num = parseInt(color.replace("#", ""), 16);

    // Multiplica el valor de 'amount' para un efecto de aclarado más fuerte
    const scaleFactor = 7; // Ajusta este factor según la claridad deseada

    const r = Math.min(255, ((num >> 16) + amount * scaleFactor));
    const g = Math.min(255, (((num >> 8) & 0x00FF) + amount * scaleFactor));
    const b = Math.min(255, ((num & 0x0000FF) + amount * scaleFactor));

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

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
