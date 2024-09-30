import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Personalizaciones } from '../Modelos/personalizaciones.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonalizacionesService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + 'superadmin/'

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* Crea una nueva personalización utilizando el token de acceso proporcionado */
  createPersonalizacion(access_token: any, personalizaciones: Personalizaciones,): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "personalizacion", personalizaciones, options);
  }
}