import { Component, ElementRef, Injectable, Input, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Leccion } from '../../../Modelos/leccion.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../environment/env';
import { Contenido_Leccion } from '../../../Modelos/contenido-leccion.model';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { RutaService } from '../../../servicios/rutas.service';
import { Observable, tap } from 'rxjs';

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

  constructor(private router: Router,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private http : HttpClient,
    private rutaService: RutaService,
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
      // Si el índice del nivel no es el seleccionado, lo colapsamos.
      if (nivelIndex !== selectedNivelIndex) {
        nivel.expanded = false;
        nivel.lecciones.forEach((leccion) => {
          leccion.expanded = false; // Colapsamos todas las lecciones en los niveles no seleccionados.
        });
      } else {
        // Si es el nivel seleccionado, lo expandimos.
        nivel.expanded = true;
        nivel.lecciones.forEach((leccion, leccionIndex) => {
          // Solo la lección seleccionada debe expandirse, el resto debe colapsarse.
          if (leccionIndex !== selectedLeccionIndex) {
            leccion.expanded = false;
          } else {
            leccion.expanded = true;
          }
        });
      }
    });
  }
  
  goToNextContent() {
    let foundNextContent = false;
  
    // Buscar el siguiente contenido disponible
    for (let i = this.currentNivelIndex; i < this.niveles.length && !foundNextContent; i++) {
      const nivel = this.niveles[i];
      for (let j = (i === this.currentNivelIndex ? this.currentLeccionIndex : 0); j < nivel.lecciones.length && !foundNextContent; j++) {
        const leccion = nivel.lecciones[j];
        for (let k = (i === this.currentNivelIndex && j === this.currentLeccionIndex ? this.currentContenidoIndex + 1 : 0); k < leccion.contenido_lecciones.length; k++) {
          // Avanzar al siguiente contenido disponible
          this.currentNivelIndex = i;
          this.currentLeccionIndex = j;
          this.currentContenidoIndex = k;
          foundNextContent = true;
          break;
        }
      }
    }
  
    if (foundNextContent) {
      this.updateSelectedContent();
    } else {
      // Verificar si se ha recibido una nueva actividad
      if (this.actividad) {
        // Reiniciar los índices y actualizar los contenidos
        this.initializeNiveles();
        this.updateSelectedContent();
        this.router.navigate(['/ruta']);
      } else {
        // Navegar a la nueva ruta
        console.log("SI LLEGA AQUI");
      }
    }
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
  
    this.updateSelectedContent();
  }

  updateSelectedContent() {
    const currentNivel = this.niveles[this.currentNivelIndex];
    const currentLeccion = currentNivel.lecciones[this.currentLeccionIndex];
    const currentContenido = currentLeccion.contenido_lecciones[this.currentContenidoIndex];
    
    this.selectContenido(currentContenido, this.currentNivelIndex, this.currentLeccionIndex);
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
