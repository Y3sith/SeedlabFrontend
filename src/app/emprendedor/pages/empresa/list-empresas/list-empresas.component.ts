import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { faMagnifyingGlass, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { EmprendedorService } from '../../../../servicios/emprendedor.service';
import { Empresa } from '../../../../Modelos/empresa.model';
import { User } from '../../../../Modelos/user.model';


@Component({
  selector: 'app-list-empresas',
  templateUrl: './list-empresas.component.html',
  styleUrls: ['./list-empresas.component.css'],
  providers: [EmprendedorService],
})
export class ListEmpresasComponent implements OnInit {
  faPen = faPenToSquare;
  listaEmpresas: Empresa[] = [];
  listaUser: User[] = [];
  documento: string | null;
  page: number = 1; // Inicializa la página actual
  token: string | null = null;
  isLoading: boolean = true; // Variable para gestionar el estado de carga
  userFilter: any = { nombre: '' };
  falupa = faMagnifyingGlass;
  user: any = null;
  currentRolId: number;
  totalEmpresas: number = 0; // Variable para almacenar el total de empresas
  itemsPerPage: number = 5; // Número de empresas por página
  empresaId: number;

  constructor(
    private emprendedorService: EmprendedorService,
    private router: Router,
    
    
  ) {
    
  }

  ngOnInit(): void {
    this.validarToken();
    this.cargarEmpresas();
    
  }

  validarToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.currentRolId = this.user.id_rol;

        if (this.currentRolId != 5) {
          this.router.navigate(['home']);
        } else {
          this.documento = this.user.emprendedor.documento;
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  cargarEmpresas(): void {
    this.isLoading = true;
    if (this.token) {
      this.emprendedorService.getEmpresas(this.token, this.documento).subscribe(
        (data) => {
          setTimeout(() => {
            this.listaEmpresas = data;
            this.totalEmpresas = data.length; // Actualiza el total de empresas
            this.isLoading = false;
          }, 500);
        },
        (err) => {
          console.log(err);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        }
      );
    }
  }

  changePage(pageNumber: number | string): void {
    if (pageNumber === 'previous') {
      if (this.page > 1) {
        this.page--;
        this.cargarEmpresas(); // Carga las empresas de la página anterior
      }
    } else if (pageNumber === 'next') {
      if (this.page < this.getTotalPages()) {
        this.page++;
        this.cargarEmpresas(); // Carga las empresas de la página siguiente
      }
    } else {
      this.page = pageNumber as number;
      this.cargarEmpresas(); // Carga las empresas de la página seleccionada
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalEmpresas / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  canGoPrevious(): boolean {
    return this.page > 1;
  }

  canGoNext(): boolean {
    return this.page < this.getTotalPages();
  }

  editEmpresa(id_emprendedor: string ,documento: string): void {
    // Implementa la lógica para editar una empresa
    this.router.navigate(['edit-empresa', id_emprendedor, documento ]);
  }
}
