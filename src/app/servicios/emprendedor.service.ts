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

  private CreacionHeaderss(access_token: any): HttpHeaders { //para la creacion de los header y que sea autortizado
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    })
  }

  private url = environment.apiUrl + 'emprendedor';

  constructor(private http: HttpClient) { }

  getEmpresas(access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/emprendedor/${documento}`, options);
  }

  updateEmprendedor( access_token: any, formData: FormData, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "/editarEmprededor/" + documento, formData, options);
    
  }

  getInfoEmprendedor(access_token: any, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/userProfileEmprendedor/${documento}`, options);
  }

  destroy(access_token: any, documento: string): Observable<any>{  
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.delete(this.url + "/emprendedor/" + documento, options);
  }

  


}
