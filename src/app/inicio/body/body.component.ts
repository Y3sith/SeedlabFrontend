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
  listBanner: Banner [] = [];
  listFooter: Personalizaciones [] = [];
  isLoggedIn: boolean = false;
  logoUrl: File;
  sidebarColor: string = '';
  botonesColor: string = '';
  logoFooter:File;
  descripcion_footer: Text;
  paginaWeb: string;
  email: string;
  telefono: string;
  direccion: string;
  ubicacion: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aliadoService: AliadoService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private personalizacionesService: SuperadminService,
  ) { }

  ngOnInit(): void {
  this.isLoggedIn = this.authService.isAuthenticated();
    this.getPersonalizacion();
    this.mostrarAliados();
    this.mostrarBanners();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.listAliados.length > 0) {
      this.initSwipers();
    }
  }

  mostrarAliados(): void {
    this.aliadoService.getaliados().subscribe(
      data => {
        console.log('Aliados:', data);
        this.listAliados = data.map(aliado => ({
          ...aliado,
          descripcion: this.splitDescription(aliado.descripcion, 50)
        }));
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

  mostrarBanners(): void {
    this.aliadoService.getbanner().subscribe(
      data => {
        this.listBanner = data;
       console.log('Banner:', data);
      },
      error => {
        console.log(error);
      }
    );
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

  getPersonalizacion() {
    this.personalizacionesService.getPersonalizacion().subscribe(
      data => {
        this.logoUrl = data.imagen_logo;
        this.sidebarColor = data.color_principal;
        this.botonesColor = data.color_color_secundario;
        this.logoFooter = data.logo_footer;
        this.descripcion_footer = data.descripcion_footer;
        this.paginaWeb = data.paginaWeb;
        this.email = data.email;
        this.telefono = data.telefono;
        this.direccion = data.direccion;
        this.ubicacion = data.ubicacion;

        //console.log(data);
        //console.log("personalizaciones obtenidas", data);
      },
      error => {
        console.error("no funciona", error);
      }
    );
  }

  private initBannerSwiper(): void {
    if (this.bannerSwiper) {
      this.bannerSwiper.destroy(true, true);
    }

    this.bannerSwiper = new Swiper('.banner-swiper-container', {
      modules: [Navigation, Autoplay, Pagination],
      slidesPerView: 1,
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

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.closest('.banner-image-container') as HTMLElement;
    if (container) {
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      container.style.paddingTop = `${aspectRatio * 100}%`;
    }
    this.cdr.detectChanges();
    this.initBannerSwiper();
  }
}