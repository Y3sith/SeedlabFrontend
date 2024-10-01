import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { PersonalizacionesService } from '../servicios/personalizaciones.service';
import { SuperadminService } from '../servicios/superadmin.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('headerTitle') headerTitle!: ElementRef;
  @Input() title: string = 'Incubadora de Emprendimientos Tecnologicos';
  @Input() subtitle: string = '';
  logoUrl: string;
  id: number = 1;

  constructor(
    private personalizacionService: SuperadminService
  ) {}

/*
  Inicializa el gráfico después de que la vista se ha inicializado.
  Se llama a la función para configurar el gráfico.
*/
  ngOnInit() {
    this.personalizacionService.getPersonalizacion(this.id).subscribe(
      data => {
        this.logoUrl = data.imagen_logo;
      });
  }
}
