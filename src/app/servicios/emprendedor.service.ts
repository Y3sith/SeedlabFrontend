import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

import { PerfilEmprendedor } from '../Modelos/perfil-emprendedor.model';

@Injectable({
  providedIn: 'root'
})
export class EmprendedorService {

  private CreacionHeaders(access_token: any): HttpHeaders { //para la creacion de los header y que sea autortizado
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    })
  }

  private url = environment.apiUrl + 'emprendedor';

  constructor(private http: HttpClient) { }

  getEmpresas(access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/emprendedor/${documento}`, options);
  }

  updateEmprendedor(emprendedor: PerfilEmprendedor, access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(this.url + "/emprendedor/" + documento, emprendedor, options);
    
  }

  getInfoEmprendedor(access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/userProfileEmprendedor/${documento}`, options);
  }

  destroy(access_token: any, documento: string): Observable<any>{  
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.delete(this.url + "/emprendedor/" + documento, options);
  }

  tipoDato(): Observable<any>{
    return this.http.get(environment.apiUrl+"tipo_documento");
  }
  


}