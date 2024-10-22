import { Component, AfterViewInit, PLATFORM_ID, Inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Renderer2, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { AliadoService } from '../../servicios/aliado.service';
import Swiper from 'swiper';
import { Aliado } from '../../Modelos/aliado.model';
import { Banner } from '../../Modelos/banner.model';
import { AuthService } from '../../servicios/auth.service';
import { SuperadminService } from '../../servicios/superadmin.service';
import { Personalizaciones } from '../../Modelos/personalizaciones.model';
import { catchError, forkJoin, Observable, of, Subscription, tap } from 'rxjs';
import { environment } from '../../../environment/env';


@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Usando estrategia OnPush
})
export class BodyComponent implements OnInit, AfterViewInit, OnDestroy {
  bannerSwiper: Swiper | undefined;
  alliesSwiper: Swiper | undefined;
  listAliados: Aliado[] = [];
  listBanner: Banner[] = [];
  listFooter: Personalizaciones[] = [];
  isLoggedIn: boolean = false;
  logoUrl: string = ''; // Cambiado de File a string
  sidebarColor: string = '';
  botonesColor: string = '';
  logoFooter: string = ''; // Cambiado de File a string
  descripcion_footer: string = '';
  paginaWeb: string = '';
  email: string = '';
  telefono: string = '';
  direccion: string = '';
  ubicacion: string = '';
  id: number = 1;
  isLoaded = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aliadoService: AliadoService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private personalizacionesService: SuperadminService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();

    const banners$ = this.loadBanners();
    const aliados$ = this.loadAliados();
    const personalizacion$ = this.getPersonalizacion();

    const combined$ = forkJoin([banners$, aliados$, personalizacion$]);

    this.subscriptions.add(
      combined$.subscribe(() => {
        this.isLoaded = true;
        this.cdr.markForCheck();
        this.initBannerSwiper();
        this.initAlliesSwiper();
        this.precargarBannerPrincipal();
      })
    );
    
  }

  ngAfterViewInit() {
    // Inicialización de Swiper ya manejada en ngOnInit
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.bannerSwiper) {
      this.bannerSwiper.destroy(true, true);
    }
    if (this.alliesSwiper) {
      this.alliesSwiper.destroy(true, true);
    }
  }

  private loadBanners(): Observable<Banner[]> {
    return this.aliadoService.getbanner().pipe(
      tap((banners: Banner[]) => {
        this.listBanner = banners.map(banner => new Banner(
          banner.urlImagenSmall,
          banner.urlImagenMedium,
          banner.urlImagenLarge,
          banner.estadobanner,
        ));
        console.log(this.listBanner);
      }),
      catchError(err => {
        console.error('Error al cargar banners:', err);
        return of([]);
      })
    );
  }

  private loadAliados(): Observable<Aliado[]> {
    return this.aliadoService.getaliados().pipe(
      tap((aliados) => {
        this.listAliados = aliados;
      }),
      catchError(err => {
        console.error('Error al cargar aliados:', err);
        return of([]);
      })
    );
  }


  private precargarBannerPrincipal(): void {
    try {
      if (this.listBanner && this.listBanner.length > 0) {
        const firstBanner = this.listBanner[0];
        if (firstBanner && firstBanner.urlImagenSmall) {
          console.log('Preloading first banner image:', firstBanner.urlImagenSmall);
          const preloadLink = this.renderer.createElement('link');
          preloadLink.rel = 'preload';
          preloadLink.href = firstBanner.urlImagenSmall;
          preloadLink.as = 'image';
          this.renderer.appendChild(this.document.head, preloadLink);
        }
      }
    } catch (error) {
      console.error('Error during preloading banner:', error);
    }
  }

  getFullImageUrl(path: string): string {
    // Asumimos que environment.apiUrl no incluye una barra al final
    return `${'https://api.uccemprende.com/'}${path}`;
  }


  // Implementamos trackBy en ngFor para mejorar el rendimiento
  trackByAliado(index: number, aliado: Aliado): number {
    return aliado.id;
  }

  trackByBanner(index: number, banner: Banner): number {
    return banner.id;
  }

  // Manejo de errores en imágenes
  handleImageError(event: any) {
    event.target.src = 'assets/images/default-image.jpg';
  }

  private initSwipers(): void {
    this.initBannerSwiper();
    this.initAlliesSwiper();
  }

  getPersonalizacion(): Observable<any> {
    const expirationTime = 3600; // 1 hora
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
    this.cdr.markForCheck(); // Marcar para detección de cambios después de asignar
  }

  private initBannerSwiper(): void {
    if (this.bannerSwiper) {
      return; // Evita re-inicializar si ya está inicializado
    }

    this.bannerSwiper = new Swiper('.banner-swiper-container', {
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
      return; // Evita re-inicializar si ya está inicializado
    }

    this.alliesSwiper = new Swiper('.allies-swiper-container', {
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
}
