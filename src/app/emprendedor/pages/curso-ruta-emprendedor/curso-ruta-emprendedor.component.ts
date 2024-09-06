import { Component, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Leccion } from '../../../Modelos/leccion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../environment/env';
import { Contenido_Leccion } from '../../../Modelos/contenido-leccion.model';

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

  constructor(private router: Router,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
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
    this.loadYouTubeApi();

    if (this.actividad) {
      console.log('Actividad recibida:', this.actividad);
      // Aquí puedes usar this.actividad.nombre, this.actividad.nivel, etc.
    } else {
      console.error('No se recibió información de la actividad');
      // Manejar el caso en que no se recibió la actividad
    }
  }

  ngAfterViewInit() {
    this.contenidoLeccion.forEach((contenido, index) => {
      if (this.getContentType(contenido) === 'video') {
        const videoId = this.getYouTubeVideoId(contenido.fuente_contenido);
        this.createYouTubePlayer(videoId, 'youtube-player-' + contenido.id);
      }
    });
  }

  initializeNiveles() {
    this.niveles = this.actividad.nivel.map((nivel: any) => ({
      ...nivel,
      expanded: false,
      lecciones: nivel.lecciones.map((leccion: any) => ({
        ...leccion,
        expanded: false,
        contenido_lecciones: leccion.contenido_lecciones || []
      }))
    }));
  }

  toggleNivel(index: number) {
    this.niveles[index].expanded = !this.niveles[index].expanded;
  }

  toggleLeccion(nivelIndex: number, leccionIndex: number) {
    this.niveles[nivelIndex].lecciones[leccionIndex].expanded = 
      !this.niveles[nivelIndex].lecciones[leccionIndex].expanded;
  }

  selectLeccion(leccion: any) {
    this.selectedLeccion = leccion;
    this.leccionForm.patchValue(leccion);
  }

  selectContenido(contenido: any) {
    this.selectedContenido = contenido;
    this.contenidoForm.patchValue(contenido);
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

  getPdfUrl(url: string): SafeResourceUrl {
    // Remove any leading slashes and 'storage' from the URL
    const cleanUrl = url.replace(/^\/?(storage\/)?/, '');
    // Construct the full URL
    const fullUrl = `${environment.apiUrl}/storage/${cleanUrl}`;
    // Sanitize the URL
    return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
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

  getContentType(contenido: any): string {
    if (!contenido || !contenido.fuente_contenido) return 'unknown';
    const fuente = contenido.fuente_contenido.toLowerCase();

    if (contenido.id_tipo_dato === 3) return 'video';
    if (fuente.includes('youtube.com') || fuente.includes('youtu.be')) return 'video';
    if (fuente.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif)$/i.test(fuente)) return 'image';
    return 'text';
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


}
