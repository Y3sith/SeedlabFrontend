import { Component, AfterViewInit, PLATFORM_ID, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AliadoService } from '../../servicios/aliado.service';
import Swiper from 'swiper';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { Aliado } from '../../Modelos/aliado.model';
import { Banner } from '../../Modelos/banner.model';
import { MatToolbar } from '@angular/material/toolbar';
import { AuthService } from '../../servicios/auth.service';
import { SuperadminService } from '../../servicios/superadmin.service';
import { Personalizaciones } from '../../Modelos/personalizaciones.model';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  providers: [AliadoService, MatToolbar, AuthService]
})
export class BodyComponent implements OnInit, AfterViewInit {
  bannerSwiper: Swiper | undefined;
  alliesSwiper: Swiper | undefined;
  listAliados: Aliado[] = [];
  listBanner: Banner[] = [];
  listFooter: Personalizaciones[] = [];
  isLoggedIn: boolean = false;
  logoUrl: File;
  sidebarColor: string = '';
  botonesColor: string = '';
  logoFooter: File;
  descripcion_footer: Text;
  paginaWeb: string;
  email: string;
  telefono: string;
  direccion: string;
  ubicacion: string;
  id: number = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aliadoService: AliadoService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private personalizacionesService: SuperadminService,
  ) { }

  /* Inicializa con esas funciones al cargar la página */
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.mostrarBanners();
    this.getPersonalizacion();
    this.mostrarAliados();
  }

    /*
     Inicializa el swiper para el banner después de que la vista se haya inicializado 
    */
  ngAfterViewInit() {
    const swiper = new Swiper('.banner-swiper-container', {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

/* Obtiene la lista de aliados y la procesa para mostrar en la interfaz */
  mostrarAliados(): void {
    this.aliadoService.getaliados().subscribe(
      data => {
        this.listAliados = data.map(aliado => ({
          ...aliado,
          descripcion: this.splitDescription(aliado.descripcion, 50)
        }));

        this.preloadLogos(this.listAliados);

        this.cdr.detectChanges();
        if (isPlatformBrowser(this.platformId)) {
          this.initSwipers();
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  /* Precarga los logos de los aliados para optimizar el rendimiento de la carga de imágenes */
  preloadLogos(aliados: any[]): void {
    aliados.forEach(aliado => {
      if (aliado.logoUrl) { 
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = aliado.logoUrl; 
        link.as = 'image';
        document.head.appendChild(link);
      }
    });
  }

/* Muestra los banners activos, utilizando almacenamiento local para mejorar el rendimiento */
  mostrarBanners(): void {
    const status = 'activo'; 
    const expirationTime = 3600; 
    const currentTime = Math.floor(Date.now() / 1000); 

    const storedBanners = JSON.parse(localStorage.getItem(`banners:${status}`));
    if (storedBanners && (currentTime - storedBanners.timestamp < expirationTime)) {
      this.listBanner = storedBanners.data;
      this.precargarImagenes(this.listBanner);
    } else {
      this.aliadoService.getbanner().subscribe(
        data => {
          this.listBanner = data;
          localStorage.setItem(`banners:${status}`, JSON.stringify({
            data: this.listBanner,
            timestamp: currentTime 
          }));

          this.precargarImagenes(this.listBanner);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  // Método para precargar imágenes
  precargarImagenes(banners: any[]): void {
    banners.forEach(banner => {
      if (typeof banner.urlImagen === 'string' && banner.urlImagen) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = banner.urlImagen; 
        link.as = 'image';
        document.head.appendChild(link);
      }
    });
  }

  /* Maneja el error de carga de imágenes, asignando una imagen predeterminada */
  handleImageError(event: any) {
    event.target.src = 'assets/images/default-image.jpg';
  }

  private initSwipers(): void {
    setTimeout(() => {
      this.initBannerSwiper();
      this.initAlliesSwiper();
    }, 0);
  }

  /* Obtiene la personalización del usuario desde el almacenamiento local o mediante una llamada al servicio */
  getPersonalizacion() {
    const expirationTime = 3600; 
    const currentTime = Math.floor(Date.now() / 1000); 
    const storedData = JSON.parse(localStorage.getItem(`personalization`));
    if (storedData && (currentTime - storedData.timestamp < expirationTime)) {
      const data = storedData.data;
      this.logoUrl = data.imagen_logo;
      this.sidebarColor = data.color_principal;
      this.botonesColor = data.color_secundario;
      this.descripcion_footer = data.descripcion_footer;
      this.paginaWeb = data.paginaWeb;
      this.email = data.email;
      this.telefono = data.telefono;
      this.direccion = data.direccion;
      this.ubicacion = data.ubicacion;
    } else {
      this.personalizacionesService.getPersonalizacion(this.id).subscribe(
        data => {
          localStorage.setItem(`personalization:${this.id}`, JSON.stringify({
            data: data,
            timestamp: currentTime
          }));
          this.logoUrl = data.imagen_logo;
          this.sidebarColor = data.color_principal;
          this.botonesColor = data.color_secundario;
          this.descripcion_footer = data.descripcion_footer;
          this.paginaWeb = data.paginaWeb;
          this.email = data.email;
          this.telefono = data.telefono;
          this.direccion = data.direccion;
          this.ubicacion = data.ubicacion;
        },
        error => {
          console.error("Error al obtener la personalización", error);
        }
      );
    }
  }


/* Inicializa el Swiper para el banner, configurando 
sus opciones y destruyendo la instancia anterior si existe 
*/
  private initBannerSwiper(): void {
    if (this.bannerSwiper) {
      this.bannerSwiper.destroy(true, true);
    }

    this.bannerSwiper = new Swiper('.banner-swiper-container', {
      modules: [Navigation, Autoplay, Pagination],
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        bulletClass: 'swiper-pagination-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active',
      },
    });
  }


  private initAlliesSwiper(): void {
    if (this.alliesSwiper) {
      this.alliesSwiper.destroy(true, true);
    }

    this.alliesSwiper = new Swiper('.allies-swiper-container', {
      modules: [Pagination],
      slidesPerView: 'auto',
      spaceBetween: 30,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        bulletClass: 'swiper-pagination-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active',
        dynamicBullets: true,
        dynamicMainBullets: 3,
      },
    });

  }

  private splitDescription(description: string, wordsPerLine: number): string[] {
    const words = description.split(' ');
    const lines = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }
    return lines;
  }

  /* 
  Maneja el evento de carga de imágenes, ajustando el contenedor y 
  la imagen para mantener la proporción 
  */

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.closest('.banner-image-container') as HTMLElement;

    if (container) {
      const fixedWidth = 1840;
      const fixedHeight = 684;
      const aspectRatio = fixedHeight / fixedWidth;
      container.style.paddingTop = `${aspectRatio * 100}%`;
      container.style.width = `${fixedWidth}px`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
    }

    this.cdr.detectChanges();
    this.initBannerSwiper();
  }
}