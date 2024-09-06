import { Component } from '@angular/core';
import { SuperadminService } from './servicios/superadmin.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SeedLabFrontend';
  mostrarMenu: boolean = true;
  titleText: string = '';
  id: number = 1;

  constructor(
    private superadminService:SuperadminService
  ){}

  ngOnInit(): void {
    this.superadminService.getPersonalizacion(this.id).subscribe(
      data => {
        this.titleText = data.nombre_sistema;
    });
  }
}
