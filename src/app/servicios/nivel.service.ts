import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NivelService {

  constructor(private http: HttpClient) { }

  /* Crea los encabezados HTTP con el token de acceso */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  url = environment.apiUrl + 'nivel'

  /* Actualiza la información de un nivel específico */
  updateNivel(access_token: any, id: number, nivel: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(this.url + '/editar_nivel/' + id, nivel, options)
  }

  /* Obtiene la lista de todos los niveles */
  getNivel(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + '/listar_Nivel', options)
  }

  /* Obtiene los niveles asociados a una actividad específica */
  mostrarNivelXidActividad(access_token: any, idActividad: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + '/nivelXactividad/' + idActividad, options)
  }

  /* Obtiene los niveles asociados a una actividad y un asesor específicos */
  mostrarNivelxidActividadxidAsesor(access_token: any, idActividad: number, idAsesor: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + '/NivelxActividadxAsesor/' + idActividad + '/' + idAsesor, options)
  }
}