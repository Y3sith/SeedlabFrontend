import { Component, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../Modelos/user.model';
import { AuthService } from '../../servicios/auth.service';
import { MenuService } from '../../servicios/menu.service';
import { SuperadminService } from '../../servicios/superadmin.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  isExpanded = false;
  logueado = false;
  flag = false;
  token: string | null = null;
  role: string | null = null;
  currentRolId: string | null = "";
  user: User | null = null;
  currentRolName: string | null = "";
  isAuthenticated: boolean = true;
  menuItems: any[] = [];
  colorPrincipal: string = '';
  colorSecundario: string = '';
  isMobile: boolean = false;
  iconColor: string = '#00B3ED';
  rolUser: String;
  id: number = 1;

  constructor(private router: Router,
    private authservices: AuthService,
    private menuService: MenuService,
    private personalizacionService: SuperadminService,
    private eRef: ElementRef) { }

   /* 
   Maneja el evento de cambio de tamaño de la ventana y actualiza el 
   estado de móvil 
   */

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < 768;
  }
    
  
/* Determina el rol del usuario basado en su id_rol */
  getRolUser(): void {
    if (this.user.id_rol === 1) {
      this.rolUser = 'Super Admin';
    }
    else if (this.user.id_rol === 2) {
      this.rolUser = 'Orientador';
    }
    else if (this.user.id_rol === 3) {
      this.rolUser = 'Aliado';
    }
    else if (this.user.id_rol === 4) {
      this.rolUser = 'Asesor';
    }
    else if (this.user.id_rol === 5) {
      this.rolUser = 'Emprendedor';
    }
  }

  /* Alterna la expansión del menú lateral */
  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

/* Valida el token del usuario almacenado en localStorage */
  validateToken(): void {
    this.token = localStorage.getItem("token");

    if (this.token) {
      const identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        this.user = JSON.parse(identityJSON);
        this.currentRolName = localStorage.getItem('currentRolName');
        this.currentRolId = this.user.id_rol?.toString();
      }
    }
  }

/* Inicializa el componente y valida el token de usuario */
  ngOnInit() {
    this.validateToken();
    this.isAuthenticated = this.authservices.isAuthenticated();
    this.logueado = this.token !== null;
    this.getRolUser();

    if (this.logueado && this.user) {
      this.currentRolId = this.user.id_rol?.toString();

    } else {
      console.log("No está logueado o no se pudo cargar el usuario.");
    }
    this.menuItems = this.menuService.getRoutesByRole(this.currentRolName);
    this.personalizacionService.getPersonalizacion(this.id).subscribe(
      data => {
        this.colorPrincipal = data.color_principal;
        this.colorSecundario = data.color_secundario;
      },
      err => console.log(err)
    );

    this.checkIfMobile();
  }

/* Verifica si la pantalla es móvil y ajusta el estado de isMobile */
  checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
  }
/* Devuelve el color del ícono basado en si es móvil o no */
  getIconColor(): string {
    return this.isMobile ? '#00B3ED' : '#FFFFFF'; 
  }

/* Maneja la salida del usuario, eliminando el token y redirigiendo */
  logout() {
    if (this.token) {
      this.authservices.logout(this.token).subscribe(
        (data) => {
          this.handleLogout();
        },
        (err) => {
          console.log(err);
          this.handleLogout();
        }
      );
    } else {
      this.handleLogout();
    }
  }

/* Limpia el almacenamiento local y redirige al usuario a la página de inicio */
  private handleLogout() {
    localStorage.clear();
    this.isAuthenticated = false;
    this.router.navigate(['/home']);
  }

/* Maneja el evento de clic en el documento, cerrando el menú si se hace clic fuera de él */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedInside = this.eRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isExpanded) {
      this.isExpanded = false;
    }
  }
/* Maneja el clic en el botón de alternancia del menú */
  onToggleClick(event: Event) {
    event.stopPropagation();
    this.toggleSidebar();
  }

}