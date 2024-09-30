import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environment/env';
import { Superadmin } from '../Modelos/superadmin.model';
import { Personalizaciones } from '../Modelos/personalizaciones.model';
import { Actividad } from '../Modelos/actividad.model';
import { Nivel } from '../Modelos/nivel.model';
import { Leccion } from '../Modelos/leccion.model';
import { Contenido_Leccion } from '../Modelos/contenido-leccion.model';
import { access } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class SuperadminService {

  url = environment.apiUrl + 'superadmin/';

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

  /* Crea un nuevo superadmin */
  createSuperadmin(access_token: any, formData: FormData,): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "crearSuperAdmin", formData, options);
  }

  /* Actualiza la información de un admin */
  updateAdmin(access_token: any, idSuperadmin: number, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "editarAdmin/" + idSuperadmin, formData, options);
  }

  /* Obtiene la información de un admin específico */
  getInfoAdmin(access_token: any, id: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "userProfileAdmin/" + id, options);
  }

  /* Obtiene una lista de admins filtrada por estado */
  getAdmins(access_token: any, estado: boolean): Observable<any> {
    const options = {
      headers: this.CreacionHeaders(access_token),
      params: new HttpParams().set('estado', estado)
    };
    return this.http.get<any>(this.url + "mostrarSuperAdmins", options);
  }

  /* Obtiene información de un superadmin específico */
  getsuperadmin(access_token: any, adminId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "userProfileAdmin/" + adminId, options);
  }

  /* Obtiene información de asesores con sus aliados asociados */
  asesorConAliado(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "asesor-aliado", options)
  }

  /* Obtiene una lista de aliados */
  listarAliado(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "listAliado", options)
  }

  /* Crea una nueva actividad como superadmin */
  crearActividadSuperAdmin(access_token: any, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(environment.apiUrl + "actividad/crearActividad", formData, options)
  }

  /* Crea un nuevo nivel como superadmin */
  crearNivelSuperAdmin(access_token: any, nivel: Nivel): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(environment.apiUrl + "nivel/crearNivel", nivel, options)
  }

  /* Crea una nueva lección como superadmin */
  crearLeccionSuperAdmin(access_token: any, leccion: Leccion): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(environment.apiUrl + "leccion/crearLeccion", leccion, options)
  }

  /* Crea contenido para una lección como superadmin */
  crearContenicoLeccionSuperAdmin(access_token: string, formData: FormData): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(environment.apiUrl + "contenido_por_leccion/crearContenidoPorLeccion", formData, options)
  }

  /* Crea una nueva personalización */
  createPersonalizacion(access_token: any, formData: FormData, id): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "personalizacion/" + id, formData, options);
  }

  /* Restaura una personalización */
  restorePersonalization(access_token: any, id): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "restaurarPersonalizacion/" + id, {}, options);
  }

  /* Guarda la personalización en el almacenamiento local */
  savePersonalizationToLocalStorage(data: any): void {
    const personalization = {
      ...data,
      savedAt: new Date().getTime(), 
    };
    localStorage.setItem('personalization', JSON.stringify(personalization));
  }

  /* Obtiene la personalización, primero del almacenamiento local y si no está disponible o ha expirado, del servidor */
  getPersonalizacion(id: number): Observable<any> {
    const cachedData = localStorage.getItem('personalization');

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const currentTime = new Date().getTime();
      const cacheDuration = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

      if (currentTime - parsedData.savedAt < cacheDuration) {
        return new Observable(observer => {
          observer.next(parsedData);
          observer.complete();
        });
      }
    }

    return this.http.get(environment.apiUrl + "traerPersonalizacion/" + id).pipe(
      tap(data => {
        this.savePersonalizationToLocalStorage(data);
      })
    );
  }
}