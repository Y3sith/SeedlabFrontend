import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { AliadoService } from '../../../servicios/aliado.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environment/env';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string, type: string): SafeResourceUrl | SafeUrl {
    switch (type) {
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      default:
        throw new Error(`Invalid safe type specified: ${type}`);
    }
  }
}

@Component({
  selector: 'app-modal-aliados',
  templateUrl: './modal-aliados.component.html',
  styleUrl: './modal-aliados.component.css'
})
export class ModalAliadosComponent {

  idAliado: number;
  listAliados: any[] = [];

  constructor(
    private aliadoService: AliadoService,
    public dialogRef: MatDialogRef<ModalAliadosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.idAliado = data.idAliado;
  }


  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit(): void {
    this.traeraliados();
    this.loadYouTubeApi();
  }


/*
  Este método se encarga de obtener la lista de aliados 
  inactivos asociados a un ID de aliado específico.
*/
  traeraliados(): void {
    this.aliadoService.getaliadosinau(this.idAliado).subscribe(
      data => {
        this.listAliados = Array.isArray(data) ? data : [data];
      },
      error => {
        console.error('Error al traer los aliados inactivos:', error);
      }
    );
  }

  /*
  Este método determina el tipo de contenido de un aliado 
  basado en su propiedad `ruta_multi` y su tipo de dato.
*/
  getContentType(aliado: any): string {
    if (!aliado || !aliado.ruta_multi) {
      console.log('Aliado o ruta_multi es undefined');
      return 'unknown';
    }
    const fuente = aliado.ruta_multi.toLowerCase();

    if (aliado.id_tipo_dato === 1) return 'video';
    if (fuente.includes('youtube.com') || fuente.includes('youtu.be')) return 'video';
    if (fuente.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fuente)) return 'image';
    return 'text';
  }

/*
  Este método genera la URL de incrustación para un video de YouTube 
  basado en la URL original proporcionada.
*/
  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.getYouTubeVideoId(url);
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

/*
  Este método retorna la URL del archivo tal como se recibe, 
  sin realizar modificaciones.
*/
  getCorrectFileUrl(url: string): string {
    return url;
  }


/*
  Este método carga la API de YouTube para permitir 
  la integración de videos en un iframe.
*/
  loadYouTubeApi() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

/*
  Este método crea un reproductor de YouTube embebido 
  utilizando la API de YouTube.
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
  Este método extrae el ID de un video de YouTube 
  a partir de su URL.
*/
  getYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }
/*
  Este método cierra el modal actual que se está mostrando 
  en la aplicación.

*/
  closeModal(): void {
    this.dialogRef.close();
  }

/*
  Esta función construye la URL completa de una imagen a partir de una ruta relativa.
  */
  getCorrectImageUrl(relativePath: string): string {
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    const cleanPath = relativePath.replace(/^\//, '');
    const fullUrl = `${environment.apiUrl}/storage/${cleanPath}`;
    return fullUrl;
  }
}
