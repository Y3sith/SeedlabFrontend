import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContenidoLeccionService {

  constructor(private htts:HttpClient) { }

  /* Crea los encabezados HTTP con el token de acceso para las solicitudes JSON */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* Crea los encabezados HTTP solo con el token de acceso para solicitudes no JSON */
  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
  }

  ulr = environment.apiUrl + 'contenido_por_leccion'

  /* Actualiza el contenido de una lección específica */
  updateContenidoLeccion(access_token:any,idCotenido:number,formData: FormData):Observable<any>{
    const options = {headers: this.CreacionHeaderss(access_token)};
    return this.htts.post(this.ulr+'/editarContenidoPorLeccion/'+idCotenido,formData,options)
  }

  /* Obtiene los tipos de datos disponibles */
  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.htts.get(this.ulr+"/tipo_dato",options)
  }

  /* Obtiene el contenido de una lección específica */
  contenidoXleccion(access_token: any,idLeccion:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.htts.get(this.ulr+'/mostrarContenidoPorLeccion/'+idLeccion,options)
  }
}