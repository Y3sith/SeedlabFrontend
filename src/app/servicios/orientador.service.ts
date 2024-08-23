import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { Orientador } from '../Modelos/orientador.model';


@Injectable({
  providedIn: 'root'
})
export class OrientadorService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + 'orientador/'
  
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }


  createOrientador(access_token: any, orientador: Orientador,): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url+"crearOrientador", orientador, options);
  }

  mostrarOrientador(access_token: any, id: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "listaOrientador/" + id, options);
}


  updateOrientador( access_token: any, orientadorId:number, orientador: Orientador):Observable<any>{
    const options={headers: this.CreacionHeaders(access_token)};
    const url = `${environment.apiUrl}orientador/editarOrientador/${orientadorId}`;
    return this.http.post(url, orientador, options);
    }


  getinformacionOrientador( access_token:any, orientadorId:number):Observable<any> {
    const options={headers: this.CreacionHeaders(access_token)};
    const url = `${environment.apiUrl}orientador/userProfileOrientador/${orientadorId}`;
    return this.http.get(url, options);
  }

  

  
}
