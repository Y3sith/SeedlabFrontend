import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContenidoLeccionService {

  constructor(private htts:HttpClient) { }

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  ulr = environment.apiUrl + 'contenido_por_leccion'

  updateContenidoLeccion(access_token:any,id:number,contenidoLeccion:any):Observable<any>{
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.htts.put(this.ulr+'/editarContenidoPorLeccion/'+id,contenidoLeccion,options)
  }

  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.htts.get(this.ulr+"/tipo_dato",options)
  }
}
