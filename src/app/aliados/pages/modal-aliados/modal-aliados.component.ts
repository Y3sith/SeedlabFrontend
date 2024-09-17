import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { AliadoService } from '../../../servicios/aliado.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Aliado } from '../../../Modelos/aliado.model';
import { environment } from '../../../../environment/env';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

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
  ){
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
        console.log('listAliados:', this.listAliados);
      },
      error => {
        console.error('Error al traer los aliados inactivos:', error);
      }
    );
  }

  getContentType(aliado: any): string {
    console.log('Aliado en getContentType:', aliado);
    if (!aliado || !aliado.ruta_multi) {
      console.log('Aliado o ruta_multi es undefined');
      return 'unknown';
    }
    const fuente = aliado.ruta_multi.toLowerCase();
    console.log('Fuente:', fuente);
    
    if (aliado.id_tipo_dato === 1) return 'video';
    if (fuente.includes('youtube.com') || fuente.includes('youtu.be')) return 'video';
    if (fuente.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif)$/i.test(fuente)) return 'image';
    return 'text';
  }


  getYouTubeEmbedUrl(url: string): string {
    console.log('URL original:', url);
    const videoId = this.getYouTubeVideoId(url);
    console.log('Video ID:', videoId);
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

  // ngAfterViewInit() {
  //   this.listAliados.forEach((contenido, index) => {
  //     if (this.getContentType(contenido) === 'video') {
  //       const videoId = this.getYouTubeVideoId(this.listAliados.ruta_multi);
  //       this.createYouTubePlayer(videoId, 'youtube-player-' + contenido.id);
  //     }
  //   });
  // }

  closeModal () :void{
    this.dialogRef.close();
  }

  getCorrectImageUrl(relativePath: string): string {
    console.log('Ruta relativa original:', relativePath);
    
    // Verifica si la ruta ya es una URL completa
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      console.log('URL completa:', relativePath);
      return relativePath;
    }
  
    // Si no es una URL completa, construye la URL
    // Elimina cualquier '/' inicial si existe
    const cleanPath = relativePath.replace(/^\//, '');
    console.log('Ruta limpia:', cleanPath);
    
    // Construye la URL completa
    const fullUrl = `${environment.apiUrl}/storage/${cleanPath}`;
    console.log('URL completa:', fullUrl);
    return fullUrl;
  }
}
