import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { PerfilEmprendedor } from '../Modelos/perfil-emprendedor.model';

@Injectable({
  providedIn: 'root'
})
export class EmprendedorService {

  /* Crea los encabezados HTTP con el token de acceso y el tipo de contenido */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    })
  }

  /* Crea los encabezados HTTP solo con el token de acceso */
  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    })
  }

  private url = environment.apiUrl + 'emprendedor';

  constructor(private http: HttpClient) { }

  /* Obtiene las empresas asociadas a un emprendedor específico */
  getEmpresas(access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/emprendedor/${documento}`, options);
  }

  /* Actualiza la información de un emprendedor */
  updateEmprendedor(access_token: any, formData: FormData, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "/editarEmprededor/" + documento, formData, options);
  }

  /* Obtiene la información del perfil de un emprendedor específico */
  getInfoEmprendedor(access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/userProfileEmprendedor/${documento}`, options);
  }

  /* Elimina un emprendedor del sistema */
  destroy(access_token: any, documento: string): Observable<any> {  
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.delete(this.url + "/emprendedor/" + documento, options);
  }
}