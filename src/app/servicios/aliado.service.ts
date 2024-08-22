import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environment/env'

import { Asesor } from '../Modelos/asesor.model';
import { Aliado } from '../Modelos/aliado.model';
import { AnyTxtRecord } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class AliadoService {
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

  url = environment.apiUrl + 'aliado'


  getinfoAliado(access_token: any, estado: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}aliado/${estado}`;
    return this.http.get(url, options);
  }

  getAliadoxid(access_token: any, idAliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/traeraliadoxid/${idAliado}`, options);
  }

  getBannerxid(access_token: any, id: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/bannerxid/${id}`, options);
  }

  crearBanner(access_token: string, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}/crearbannerr`, formData, options);
  }

  getBannerxAliado(access_token: any, idAliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.get(`${this.url}/banner/${idAliado}`, options);
  }

  editarBanner(access_token: string, id:number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}/editarbanner/${id}`, formData, options);
  }

  
  EliminarBanner(access_token: string, id:number): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.delete(`${this.url}/eliminarbanner/${id}`, options);
  }

  getbanner(): Observable<any> {
    const url = `${environment.apiUrl}banner/1`;
    return this.http.get(url);
  }

  //Listar asesores por aliados
  getinfoAsesor(access_token: any, id: number, estado: boolean): Observable<any> {
    const options = {
      headers: this.CreacionHeaders(access_token),
      params: new HttpParams().set('estado', estado)
    };
    return this.http.get<any>(`${this.url}/mostrarAsesorAliado/${id}`, options);
  }

  crearAliado(access_token: string, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}/create_aliado`, formData, options);
  }

  editarAliado(access_token: string, formData: FormData, idAliado:String): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    const url = `${environment.apiUrl}aliado/editaraliado/${idAliado}`;
    return this.http.post(url, formData, options);
  }

  mostrarAliado(access_token: any) {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${environment.apiUrl}orientador/listaAliado`, options);
  }

  getAsesorAliado(access_token: any, asesorId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}asesor/userProfileAsesor/${asesorId}`;
    return this.http.get(url, options);
  }

  updateAsesorAliado(access_token: any, asesorId: number, asesor: Asesor): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}aliado/editarAsesorAliado/${asesorId}`;
    return this.http.put(url, asesor, options);
  }

  getaliados(): Observable<any> {
    return this.http.get(this.url + "/" + 1);
  }

  
  /////////////////////////////////////////////////////////////

  crearActividad(access_token: any, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(environment.apiUrl + "actividad/actividad", aliado, options)
  }

  crearNivel(access_token: any, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "nivel", aliado, options)
  }

  crearLeccion(access_token: any, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "leccion", aliado, options)
  }

  crearContenicoLeccion(access_token: string, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "contenido_por_leccion", aliado, options)
  }


  

  // mostrarRutas(access_token: any, id: number): Observable<any> {
  //   const options = { headers: this.CreacionHeaders(access_token)};
  //   return this.http.get<any>(this.url+"ruta"+id, options)
  // }

}