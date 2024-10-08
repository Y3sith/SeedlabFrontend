import { Component, AfterViewInit, PLATFORM_ID, Inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { catchError, forkJoin, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Usando estrategia OnPush
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
  isLoaded = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aliadoService: AliadoService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private personalizacionesService: SuperadminService,
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    
    forkJoin({
      banners: this.aliadoService.getbanner().pipe(
        tap((banners) => this.precargarImagenes(banners)) // Precarga de banners 
      ),
      personalizacion: this.getPersonalizacion(),
      aliados: this.aliadoService.getaliados().pipe(
        tap((aliados) => this.preloadLogos(aliados)) // Precarga de logos 
      )
    }).subscribe({
      next: (results) => {
        this.listBanner = results.banners;
        this.listAliados = results.aliados;
        this.isLoaded = true; // Cambiar el estado a cargado cuando se completa la carga
        this.cdr.markForCheck();
        this.initSwipers(); // Inicializar Swipers después de cargar los datos
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.isLoaded = true;
      }
    });
  }

  ngAfterViewInit() {
  }

  // Implementamos trackBy en ngFor para mejorar el rendimiento
  trackByAliado(index: number, aliado: Aliado): number {
    return aliado.id;
  }

  trackByBanner(index: number, banner: Banner): number {
    return banner.id;
  }

  // Precarga de logos optimizada
  preloadLogos(aliados: Aliado[]): void {
    if (isPlatformBrowser(this.platformId)) {
      aliados.forEach(aliado => {
        const img = new Image();
        img.src = aliado.logo as string;
      });
    }
  }

  // Precarga de imágenes optimizada
  precargarImagenes(banners: Banner[]): void {
    if (isPlatformBrowser(this.platformId)) {
      banners.forEach(banner => {
        const img = new Image();
        img.src = banner.urlImagen as string;
        console.log("preload", img.src);
      });
    }
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/default-image.jpg';
  }

  private initSwipers(): void {
    setTimeout(() => {
      this.initBannerSwiper();
      this.initAlliesSwiper();
    }, 0);
  }

  getPersonalizacion(): Observable<any> {
    const expirationTime = 3600;
    const currentTime = Math.floor(Date.now() / 1000);
    const storedData = JSON.parse(localStorage.getItem(`personalization:${this.id}`));

    if (storedData && (currentTime - storedData.timestamp < expirationTime)) {
      const data = storedData.data;
      this.asignarPersonalizacion(data);
      return of(data);
    } else {
      return this.personalizacionesService.getPersonalizacion(this.id).pipe(
        tap(data => {
          localStorage.setItem(`personalization:${this.id}`, JSON.stringify({
            data: data,
            timestamp: currentTime
          }));
          this.asignarPersonalizacion(data);
        }),
        catchError(error => {
          console.error("Error al obtener la personalización", error);
          return of(null);
        })
      );
    }
  }

  private asignarPersonalizacion(data: any): void {
    this.logoUrl = data.imagen_logo;
    this.sidebarColor = data.color_principal;
    this.botonesColor = data.color_secundario;
    this.descripcion_footer = data.descripcion_footer;
    this.paginaWeb = data.paginaWeb;
    this.email = data.email;
    this.telefono = data.telefono;
    this.direccion = data.direccion;
    this.ubicacion = data.ubicacion;
  }

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

}
