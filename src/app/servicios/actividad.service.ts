import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {

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

  url = environment.apiUrl + 'actividad'

  /* Obtiene los tipos de datos de actividad */
  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"/tipo_dato",options)
  }

  /* Obtiene la actividad de un aliado específico */
  getActividadAliado(access_token:any,id:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+'/verActividadAliado/'+id,options)
  }

  /* Actualiza una actividad existente */
  updateActividad(access_token:any,idActividad:number,formData: FormData):Observable<any>{
    const options = { headers: this.CreacionHeaderss(access_token)};
    return this.http.post(this.url+'/editar_actividad/'+idActividad,formData,options)
  }

  /* Cambia el estado de una actividad (activar/desactivar) */
  estadoActividad(access_token:any, idActividad:number,estado:boolean):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.put(this.url+'/activar_desactivar_actividad/'+idActividad,{estado},options)
  }

  /* Obtiene información sobre el nivel, lección y contenido de una actividad */
  ActiNivelLeccionContenido(access_token:any, idActividad:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+'/ActiNivelLeccionContenido/'+idActividad,options)
  }

  /* Obtiene información sobre la actividad de un asesor */
  ActividadAsesor(access_token:any, idActividad:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+'/ActividadAsesor/'+idActividad,options)
  }
}