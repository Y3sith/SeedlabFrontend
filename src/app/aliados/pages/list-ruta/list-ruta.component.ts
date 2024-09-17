import { Component, OnInit } from '@angular/core';
import {
  faEye,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { RutaService } from '../../../servicios/rutas.service';
import { Ruta } from '../../../Modelos/ruta.modelo';
import { User } from '../../../Modelos/user.model';
import { SwitchService } from '../../../servicios/switch.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalAddRutaComponent } from '../../../superadmin/pages/ruta/modal-add-ruta/modal-add-ruta.component';
import { AlertService } from '../../../servicios/alert.service';

@Component({
  selector: 'app-list-ruta',
  templateUrl: './list-ruta.component.html',
  styleUrl: './list-ruta.component.css',
  providers: [RutaService],
})
export class ListRutaComponent implements OnInit {
  userFilter: any = { nombre: '', estado: 'Activo', fecha_creacion: '' };

  public page: number = 1;
  listaRutas: Ruta[] = [];
  fax = faXmark;
  falupa = faMagnifyingGlass;
  faeye = faEye;
  token: string | null = null;
  user: User | null = null;
  currentRolId: number;
  modalSwitch: boolean;
  listaRutasFiltrada: Ruta[] = [];
  isLoading: boolean = false;
  rutaId: any;
  idAliado: any;

  constructor(
    private rutaService: RutaService,
    private router: Router,
    private modalSS: SwitchService,
    public dialog: MatDialog,
    public alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.validateToken();
    this.cargarRutas();
    this.modalSS.$modal.subscribe((valor) => {
      this.modalSwitch = valor;
    });
  }

  openModal(rutaId: number | null): void {
    let dialogRef: MatDialogRef<ModalAddRutaComponent>;
    dialogRef = this.dialog.open(ModalAddRutaComponent, {
      data: { rutaId: rutaId },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.idAliado = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  cargarRutas(): void {
    this.isLoading = true;
    if (this.token) {
      this.isLoading = true;
      this.rutaService
        .getAllRutas(this.token, this.userFilter.estado)
        .subscribe(
          (data) => {
            this.listaRutas = data;
            console.log('listaRutas filtrada:', this.listaRutas);
            this.isLoading = false;
          },
          (err) => {
            console.log(err);
            this.isLoading = false;
          }
        );
    } else {
      console.error('Token is not available');
    }
  }

  onEstadoChange(event: any): void {
    // const estado = event.target.value;
    // this.userFilter.estado = estado === '1' ? 'Activo' : 'Inactivo';
    this.cargarRutas();
  }

  limpiarFiltro(): void {
    this.userFilter = { nombre: '', estado: 'Activo', fecha_creacion: '' };
    this.cargarRutas();
  }

  openModalSINId(): void {
    this.openModal(null);
  }

  canGoPrevious(): boolean {
    return this.page > 1;
  }
  canGoNext(): boolean {
    const totalItems = this.listaRutas.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return this.page < totalPages;
  }

  changePage(page: number | 'previous' | 'next'): void {
    if (page === 'previous' && this.canGoPrevious()) {
      this.page--;
    } else if (page === 'next' && this.canGoNext()) {
      this.page++;
    } else if (typeof page === 'number') {
      this.page = page;
    }
  }

  getPages(): number[] {
    const totalItems = this.listaRutas.length;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // listarActividad():void {
  //   this.router.navigate(['list-actividades'], {queryParams: {id_ruta: this.rutaId}});
  // }
  listarActividad(rutaId: number, estado: any): void {
    console.log("AQUI ESTADO", estado);
    if (estado === 'Inactivo'){
      this.alertService.alertainformativa('No puedes editar actividades en una ruta que este inactiva, debes activar la ruta para poderla editar', 'error').then((result) => {
        if (result.isConfirmed) {
          
        }
      });
    }else{
      this.router.navigate(['list-actividades-aliado'], {queryParams: { id_ruta: rutaId},
      });
    }
  }

}

