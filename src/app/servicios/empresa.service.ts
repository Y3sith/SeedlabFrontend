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

  updateEmpresas(access_token: any, id_documentoEmpresa: string, empresaData: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(`${this.url}/updateEmpresa/${id_documentoEmpresa}`, empresaData, options);
  }

  traerEmpresasola(access_token: any, id_emprendedor:string, id_empresa: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/getEmpresa/${id_emprendedor}/${id_empresa}`, options);
  }

  updateApoyo(access_token: any, documento: any, apoyoData: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(`${this.url}/updateApoyo/${documento}`,apoyoData, options);
  }

  crearApoyo(access_token: any, apoyoData: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(`${this.url}/createApoyo`,apoyoData, options);
  }

  addEmpresa(access_token: any, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post(this.url+"/createEmpresa", payload, { headers });
  }

  getApoyo(access_token:any, id_documentoEmpresa:string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/getApoyo/${id_documentoEmpresa}`, options);
  }

}

