import { Component, HostListener } from '@angular/core';
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

  constructor(private router: Router,
              private authservices: AuthService,
              private menuService: MenuService,
              private personalizacionService: SuperadminService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < 768;
  }

  getRolUser(): void {
    if (this.user.id_rol === 1){
      this.rolUser = 'Super Admin';
    }
    else if (this.user.id_rol === 2){
      this.rolUser = 'Orientador';
    }
    else if (this.user.id_rol === 3){
      this.rolUser = 'Aliado';
    }
    else if (this.user.id_rol === 4){
      this.rolUser = 'Asesor';
    }
    else if (this.user.id_rol === 5){
      this.rolUser = 'Emprendedor';
    }
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  validateToken(): void {
    this.token = localStorage.getItem("token");

    if (this.token) {
      const identityJSON = localStorage.getItem('identity');
      if (identityJSON) {
        this.user = JSON.parse(identityJSON);
        this.currentRolName = localStorage.getItem('currentRolName');
        this.currentRolId = this.user.id_rol?.toString();
        console.log(this.currentRolName);
      }
    }
  }

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
    //console.log(this.menuItems);
    this.personalizacionService.getPersonalizacion().subscribe(
      data => {
        this.colorPrincipal = data.color_principal;
        this.colorSecundario = data.color_secundario;
        //console.log(this.colorPrincipal, this.colorSecundario);
      },
      err => console.log(err)
    );
    
    this.checkIfMobile();
  }

  checkIfMobile() {
   this.isMobile = window.innerWidth < 768;
  }

  // getBackgroundColor(): string {
  //   return this.isMobile ? 'white' : this.colorPrincipal;
  // }

 
  getIconColor(): string {
    return this.isMobile ? '#00B3ED' : '#FFFFFF'; // Color blanco en pantallas grandes
  }
  
  logout() {
    if (this.token) {
      this.authservices.logout(this.token).subscribe(
        (data) => {
          console.log(data);
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
  

  private handleLogout() {
    localStorage.clear();
    this.isAuthenticated = false;
    this.router.navigate(['/home']);
  }
  
  
}