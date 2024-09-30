import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { Orientador } from '../Modelos/orientador.model';

@Injectable({
  providedIn: 'root'
})
export class OrientadorService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + 'orientador/'

  /* Crea los encabezados HTTP con el token de acceso y el tipo de contenido */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* Crea los encabezados HTTP solo con el token de acceso */
  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* Crea un nuevo orientador */
  createOrientador(access_token: any, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "crearOrientador", formData, options);
  }

  /* Obtiene la información de un orientador específico */
  mostrarOrientador(access_token: any, id: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "listaOrientador/" + id, options);
  }

  /* Actualiza la información de un orientador existente */
  updateOrientador(access_token: any, orientadorId: number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}editarOrientador/${orientadorId}`, formData, options)
  }

  /* Obtiene el perfil de usuario de un orientador específico */
  getinformacionOrientador(access_token: any, orientadorId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}orientador/userProfileOrientador/${orientadorId}`;
    return this.http.get(url, options);
  }
}