import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {Observable} from 'rxjs';

import { environment } from '../../environment/env';


@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private CreacionHeaders(access_token: any): HttpHeaders { //para la creacion de los header y que sea autortizado
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    })
  }

  url = environment.apiUrl + 'empresa'

  constructor(private http: HttpClient) { }

  updateEmpresas(access_token:any, documento: string): Observable<any>{
    const options= { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"/updateEmpresa"+documento, options);
  }

  traerEmpresasola(access_token: any, id_emprendedor:string, documento: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/getEmpresa/${id_emprendedor}/${documento}`, options);
  }

  
  addEmpresa(access_token: any, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post(this.url+"createEmpresa", payload, { headers });
  }

  

}

