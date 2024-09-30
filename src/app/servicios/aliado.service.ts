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

  url = environment.apiUrl + 'aliado'

  /* Obtiene información de un aliado según su estado */
  getinfoAliado(access_token: any, estado: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}aliado/${estado}`;
    return this.http.get(url, options);
  }

  /* Obtiene una lista de aliados filtrada por estado */
  getAliadosparalistarbien(access_token: any, estado: boolean): Observable<any> {
    const options = {
      headers: this.CreacionHeaders(access_token),
      params: new HttpParams().set('estado', estado)
    };
    return this.http.get<any>(this.url + "/mostrarAliados", options);
  }

  /* Obtiene un aliado específico por su ID */
  getAliadoxid(access_token: any, idAliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/traeraliadoxid/${idAliado}`, options);
  }

  /* Obtiene un banner específico por su ID */
  getBannerxid(access_token: any, id: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/bannerxid/${id}`, options);
  }

  /* Crea un nuevo banner */
  crearBanner(access_token: string, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}/crearbannerr`, formData, options);
  }

  /* Obtiene los banners asociados a un aliado específico */
  getBannerxAliado(access_token: any, idAliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.get(`${this.url}/banner/${idAliado}`, options);
  }

  /* Edita un banner existente */
  editarBanner(access_token: string, id:number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}/editarbanner/${id}`, formData, options);
  }

  /* Elimina un banner específico */
  EliminarBanner(access_token: string, id:number): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.delete(`${this.url}/eliminarbanner/${id}`, options);
  }

  /* Obtiene un banner (posiblemente el principal o por defecto) */
  getbanner(): Observable<any> {
    const url = `${environment.apiUrl}banner/1`;
    return this.http.get(url);
  }

  /* Obtiene aliados sin autenticación (posiblemente para uso público) */
  getaliadosinau(id:number): Observable<any> {
    const url = `${environment.apiUrl}traerAliadosiau/${id}`;
    return this.http.get(url);
  }

  /* Obtiene información de asesores asociados a un aliado */
  getinfoAsesor(access_token: any, id: number, estado: boolean): Observable<any> {
    const options = {
      headers: this.CreacionHeaders(access_token),
      params: new HttpParams().set('estado', estado)
    };
    return this.http.get<any>(`${this.url}/mostrarAsesorAliado/${id}`, options);
  }

  /* Crea un nuevo aliado */
  crearAliado(access_token: string, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(`${this.url}/create_aliado`, formData, options);
  }

  /* Edita un aliado existente */
  editarAliado(access_token: string, formData: FormData, idAliado:String): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    const url = `${environment.apiUrl}aliado/editaraliado/${idAliado}`;
    return this.http.post(url, formData, options);
  }

  /* Muestra una lista de aliados (posiblemente para un orientador) */
  mostrarAliado(access_token: any) {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${environment.apiUrl}orientador/listaAliado`, options);
  }

  /* Obtiene información de un asesor específico asociado a un aliado */
  getAsesorAliado(access_token: any, asesorId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}asesor/userProfileAsesor/${asesorId}`;
    return this.http.get(url, options);
  }

  /* Actualiza la información de un asesor asociado a un aliado */
  updateAsesorAliado(access_token: any, asesorId: number, asesor: Asesor): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = `${environment.apiUrl}aliado/editarAsesorAliado/${asesorId}`;
    return this.http.put(url, asesor, options);
  }

  /* Obtiene una lista de aliados (posiblemente todos los activos) */
  getaliados(): Observable<any> {
    return this.http.get(this.url + "/" + 1);
  }

  /* Crea una nueva actividad asociada a un aliado */
  crearActividad(access_token: any, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(environment.apiUrl + "actividad/actividad", aliado, options)
  }

  /* Crea un nuevo nivel (posiblemente relacionado con actividades o cursos) */
  crearNivel(access_token: any, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "nivel", aliado, options)
  }

  /* Crea una nueva lección */
  crearLeccion(access_token: any, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "leccion", aliado, options)
  }

  /* Crea contenido para una lección específica */
  crearContenicoLeccion(access_token: string, aliado: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "contenido_por_leccion", aliado, options)
  }
}