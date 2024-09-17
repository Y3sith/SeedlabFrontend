import { Component, ChangeDetectorRef } from '@angular/core';
import { MatToolbar} from '@angular/material/toolbar';

import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../servicios/auth.service';
import { SuperadminService } from '../../../servicios/superadmin.service';
import { Personalizaciones } from '../../../Modelos/personalizaciones.model';
import { Aliado } from '../../../Modelos/aliado.model';
import { AliadoService } from '../../../servicios/aliado.service';
import { ModalAliadosComponent } from '../modal-aliados/modal-aliados.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-todos-los-aliados',
  templateUrl: './todos-los-aliados.component.html',
  styleUrl: './todos-los-aliados.component.css',
  providers: [ AliadoService, MatToolbar]
})
export class TodosLosAliadosComponent {
  logoUrl: File;
  isLoggedIn: boolean = false;
  listFooter: Personalizaciones [] = [];
  id: number = 1;
  descripcion_footer: Text;
  paginaWeb: string;
  email: string;
  telefono: string;
  direccion: string;
  ubicacion: string;
  listAliados: Aliado[] = [];

  constructor(
    private authService: AuthService,
    private aliadoService: AliadoService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private personalizacionesService: SuperadminService,
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.getPersonalizacion();
    this.mostrarAliados();
  }

  mostrarAliados(): void {
    this.aliadoService.getaliados().subscribe(
      data => {
        console.log('Aliados:', data);
        this.listAliados = data;
        this.cdr.detectChanges();
      },
      error => {
        console.log(error);
      }
    );
  }
  
  openModal(idAliado: number): void {
    let dialogRef: MatDialogRef<ModalAliadosComponent>;
    dialogRef = this.dialog.open(ModalAliadosComponent, {
      data: { idAliado: idAliado }
    });
    // dialogRef.afterClosed().subscribe(() => {
    //   this.cargarSuperAdmin();
    // });
  }


  getPersonalizacion() {
    this.personalizacionesService.getPersonalizacion(this.id).subscribe(
      data => {
        this.logoUrl = data.imagen_logo;
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
}
