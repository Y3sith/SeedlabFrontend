import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PersonalizacionesService } from '../servicios/personalizaciones.service';
import { SuperadminService } from '../servicios/superadmin.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('headerTitle') headerTitle!: ElementRef;
  @Input() title: string = 'Incubadora de Emprendimientos Tecnologicos';
  @Input() subtitle: string = '';
  logoUrl: string = '';

  constructor(
    private personalizacionService: SuperadminService
  ) {}

  ngAfterViewInit() {
    //this.setHeaderText();
    this.personalizacionService.getPersonalizacion().subscribe(
      data => {
        this.logoUrl = data.imagen_logo;
        //console.log('logoUrl', this.logoUrl);
        //console.log("personalizaciones obtenidas", data);
      },
      error => {
        console.error("no funciona", error);
      });
  }

  // setHeaderText() {
  //   if (this.headerTitle) {
  //     // Reemplazar el texto para incluir un salto de línea
  //     const titleWithLineBreak = this.title.replace('Incubadora de', 'Incubadora de<br>');
  //     this.headerTitle.nativeElement.innerHTML = titleWithLineBreak;
  //   }
  // }
}
