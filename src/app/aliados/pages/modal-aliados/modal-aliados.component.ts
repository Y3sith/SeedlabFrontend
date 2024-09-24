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

  ngOnInit(): void {
    this.traeraliados();
    this.loadYouTubeApi();
  }

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


  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.getYouTubeVideoId(url);
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

  getCorrectFileUrl(url: string): string {
    return url;
  }

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

  getYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  getCorrectImageUrl(relativePath: string): string {
    // Verifica si la ruta ya es una URL completa
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    // Si no es una URL completa, construye la URL
    // Elimina cualquier '/' inicial si existe
    const cleanPath = relativePath.replace(/^\//, '');

    // Construye la URL completa
    const fullUrl = `${environment.apiUrl}/storage/${cleanPath}`;
    return fullUrl;
  }
}
