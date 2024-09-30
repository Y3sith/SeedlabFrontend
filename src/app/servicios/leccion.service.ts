import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeccionService {

  constructor(private http: HttpClient) { }

  /* Crea los encabezados HTTP con el token de acceso para las solicitudes */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* URL base para las operaciones relacionadas con lecciones */
  url = environment.apiUrl + 'leccion'

  /* Actualiza una lección específica */
  updateLeccion(access_token: any, id: number, leccion: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(this.url + '/editar_leccion/' + id, leccion, options)
  }

  /* Obtiene las lecciones de un nivel específico */
  LeccionxNivel(access_token: any, idNivel: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + '/leccionXnivel/' + idNivel, options);
  }

}