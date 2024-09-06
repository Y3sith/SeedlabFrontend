import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {

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

  url = environment.apiUrl + 'actividad'

  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"/tipo_dato",options)
  }

  getActividadAliado(access_token:any,id:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+'/verActividadAliado/'+id,options)
  }

  updateActividad(access_token:any,id:number,actividad:any):Observable<any>{
    const options = { headers: this.CreacionHeaderss(access_token)};
    return this.http.post(this.url+'/editar_actividad/'+id,actividad,options)
  }

  estadoActividad(access_token:any, idActividad:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.put(this.url+'/activar_desactivar_actividad/'+idActividad,options)
  }

 
}
