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

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });

  }

  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });

  }

  url = environment.apiUrl + 'asesor/'


  createAsesor(access_token: any, formData: FormData,): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}asesor`, formData, options);
  }

  getAsesorID(access_token: any, asesorId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}userProfileAsesor/${asesorId}`, options);
  }

  updateAsesor(access_token: any, asesorId: number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}editarAsesor/${asesorId}`, formData, options);
  }

  updateAsesorxaliado(access_token: any, asesorId: number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}editarAsesorxaliado/${asesorId}`, formData, options);
  }

  mostrarAsesoriasAsesor(access_token: any, idAsesor: number, conHorario: boolean): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}mostrarAsesoriasAsesor/${idAsesor}/${conHorario}`, options);
  }

  listarAsesores(access_token:any):Observable<any>{
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"listadoAsesores/",options)
  } 

  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"/tipo_dato",options)
  }
}

