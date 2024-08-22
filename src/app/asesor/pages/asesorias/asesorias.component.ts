import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HorarioModalComponent } from '../horario-modal/horario-modal.component';
import { AsesoriaService } from '../../../servicios/asesoria.service';
import { Asesoria } from '../../../Modelos/asesoria.model';
import { AsesorService } from '../../../servicios/asesor.service';

@Component({
  selector: 'app-asesorias',
  templateUrl: './asesorias.component.html',
  styleUrls: ['./asesorias.component.css'],
  providers: [AsesorService]
})
export class AsesoriasComponent implements OnInit {
  asesorias: Asesoria[] = [];
  asesoriasConHorario: Asesoria[] = [];
  asesoriasSinHorario: Asesoria[] = [];
  showTrue: boolean = false; // Inicializa en false para no mostrar asesorías con horario al principio
  showFalse: boolean = true; // Inicializa en true para mostrar asesorías sin horario al principio
  token: string | null = null;
  user: any = null;
  filteredAsesorias: Asesoria[] = [];
  currentRolId: number;

  userFilter: any = { Nombre_sol: ''};
  Nombre_sol: string | null = null;

  constructor(
    private asesoriaService: AsesoriaService, 
    public dialog: MatDialog,
    private router: Router,
    private asesorService: AsesorService
  ) { }
 
  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.validateToken();
    this.loadAsesoriasFalse();    
    this.loadAsesoriasTrue();
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 4) {
          this.router.navigate(['home']);
        }
      }
    }

    if (!this.token) {
      this.router.navigate(['home']);
    } else {
      this.loadAsesoriasFalse();
    }
  }


  filterAsesorias(status: boolean): void {
    if (status) {
      this.showTrue = true;
      this.showFalse = false;
      this.filteredAsesorias = this.asesoriasConHorario;
    } else {
      this.showTrue = false;
      this.showFalse = true;
      this.filteredAsesorias = this.asesoriasSinHorario;
    }
  }

  loadAsesoriasFalse(): void {
 
    const idAsesor = this.user.id; // Obtener el ID del asesor del objeto de usuario
    const horario = false; // Cambia esto según sea necesario
    this.asesorService.mostrarAsesoriasAsesor(this.token, idAsesor, horario).subscribe(
      response => {
        this.asesoriasSinHorario = response;
      },
      error => {
        console.error('Error al cargar asesorías:', error);
      }
    );
  }

  loadAsesoriasTrue(): void {
   
    const idAsesor = this.user.id; // Obtener el ID del asesor del objeto de usuario
    const horario = true; // Cambia esto según sea necesario
    this.asesorService.mostrarAsesoriasAsesor(this.token, idAsesor, horario).subscribe(
      response => {
        this.asesoriasConHorario = response;
      },
      error => {
        console.error('Error al cargar asesorías:', error);
      }
    );
  }

  openModal(asesoria: any): void {
    if (!asesoria || !asesoria.id) {
      console.error('ID de asesoria no encontrado');
      return;
    }

    const dialogRef = this.dialog.open(HorarioModalComponent, {
      width: '400px',
      data: { asesoria }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Recargar las asesorías después de cerrar el modal
      this.loadAsesoriasFalse();
      this.loadAsesoriasTrue();
    });
  }
}
