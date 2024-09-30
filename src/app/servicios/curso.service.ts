// enlace.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnlaceService {
  /* Array privado para almacenar los enlaces */
  private enlaces: {titulo: string, url: string}[] = [];

  constructor() { }

  /* Método para agregar un nuevo enlace al array */
  addEnlace(enlace: {titulo: string, url: string}) {
    this.enlaces.push(enlace);
  }

  /* Método para obtener todos los enlaces almacenados */
  getEnlaces() {
    return this.enlaces;
  }
}