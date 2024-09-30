import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { Asesor } from '../Modelos/asesor.model';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {

  constructor(private http: HttpClient) { }

  /* Crea y devuelve un objeto HttpHeaders con el token de acceso y el tipo de contenido */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* Crea y devuelve un objeto HttpHeaders solo con el token de acceso */
  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
  }

  url = environment.apiUrl + 'asesor/'

  /* Crea un nuevo asesor */
  createAsesor(access_token: any, formData: FormData,): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}asesor`, formData, options);
  }

  /* Obtiene información de un asesor específico por su ID */
  getAsesorID(access_token: any, asesorId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}userProfileAsesor/${asesorId}`, options);
  }

  /* Actualiza la información de un asesor */
  updateAsesor(access_token: any, asesorId: number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}editarAsesor/${asesorId}`, formData, options);
  }

  /* Actualiza la información de un asesor asociado a un aliado */
  updateAsesorxaliado(access_token: any, asesorId: number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}editarAsesorxaliado/${asesorId}`, formData, options);
  }

  /* Obtiene las asesorías de un asesor específico, con opción de incluir horarios */
  mostrarAsesoriasAsesor(access_token: any, idAsesor: number, conHorario: boolean): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}mostrarAsesoriasAsesor/${idAsesor}/${conHorario}`, options);
  }

  /* Obtiene una lista de todos los asesores */
  listarAsesores(access_token:any):Observable<any>{
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"listadoAsesores/",options)
  } 

  /* Obtiene los tipos de datos (posiblemente relacionados con los asesores) */
  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"/tipo_dato",options)
  }
}