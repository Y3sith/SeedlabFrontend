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

  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
  }

  ulr = environment.apiUrl + 'contenido_por_leccion'

  updateContenidoLeccion(access_token:any,idCotenido:number,formData: FormData):Observable<any>{ //toca cambiar el headers para imagen y demas
    const options = {headers: this.CreacionHeaderss(access_token)};
    return this.htts.post(this.ulr+'/editarContenidoPorLeccion/'+idCotenido,formData,options)
  }

  getTipoDato(access_token:any): Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.htts.get(this.ulr+"/tipo_dato",options)
  }

  contenidoXleccion(access_token: any,idLeccion:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.htts.get(this.ulr+'/mostrarContenidoPorLeccion/'+idLeccion,options)
  }
}
