import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

import { Ruta } from '../Modelos/ruta.modelo';

@Injectable({
  providedIn: 'root'
})
export class RutaService {

  url = environment.apiUrl + 'ruta';
  url2 = environment.apiUrl + 'nivel';

  constructor(private http:HttpClient) { }

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  getAllRutas(access_token:any, estado: boolean): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token),
      params: new HttpParams().set('estado', estado) };
    return this.http.get(this.url+'/ruta', options);
  }

  rutasActivas(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url+'/rutasActivas',options)
  }

  createRutas(access_token:any, ruta:Ruta): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url+'/ruta', ruta,options);
  }

  
  rutaXid(access_token:any, rutaId: number):Observable<any>{
    const options= { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+'/rutaXid/'+rutaId, options);
  }
   
  contenidoRuta(access_token:any, idRuta: number):Observable<any>{
    const options= { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+'/mostrarRutaContenido/'+idRuta,options);
  }

  
  //////  editar
  updateRutas(access_token:any, ruta:Ruta,id:number):Observable<any>{
    const options= { headers: this.CreacionHeaders(access_token)};
    return this.http.put(this.url+'/ruta/'+id,ruta,options);
  }

  // updateActividad(access_token:any,actividad:any):Observable<any>{
  //   const options = { headers: this.CreacionHeaders(access_token)};
  //   return this.http.put(this.url+'/editarActividad',actividad,options)
  // }

  updateNivel(access_token:any,id:number,nivel:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.put(this.url+'/editar_nivel/'+id,nivel,options)
  }

  updateLeccion(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.put(this.url+'leccion',options)
  }

  updateContenidoLecciones(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.put(this.url+'contenido_por_leccion',options)
  }

  

}
