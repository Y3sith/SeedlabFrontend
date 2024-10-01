import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  /* Crea los encabezados HTTP con el token de acceso */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    })
  }

  url = environment.apiUrl + 'empresa'

  constructor(private http: HttpClient) { }

  /* Actualiza la información de una empresa específica */
  updateEmpresas(access_token: any, id_documentoEmpresa: string, empresaData: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(`${this.url}/updateEmpresa/${id_documentoEmpresa}`, empresaData, options);
  }

  /* Obtiene la información de una empresa específica */
  traerEmpresasola(access_token: any, id_emprendedor: string, id_empresa: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/getEmpresa/${id_emprendedor}/${id_empresa}`, options);
  }

  /* Actualiza la información de apoyo de una empresa */
  updateApoyo(access_token: any, documento: any, apoyoData: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.put(`${this.url}/updateApoyo/${documento}`, apoyoData, options);
  }

  /* Crea un nuevo registro de apoyo para una empresa */
  crearApoyo(access_token: any, apoyoData: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(`${this.url}/createApoyo`, apoyoData, options);
  }

  /* Agrega una nueva empresa al sistema */
  addEmpresa(access_token: any, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post(this.url+"/createEmpresa", payload, { headers });
  }

  /* Obtiene la información de apoyo de una empresa específica */
  getApoyo(access_token: any, id_documentoEmpresa: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}/getApoyo/${id_documentoEmpresa}`, options);
  }

  /* Obtiene todas las empresas registradas en el sistema */
  getAllEmpresa(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"/getAllEmpresa", options)
  }

  /* Obtiene todas las empresas asociadas a un emprendedor específico */
  obtenerEmpresasPorEmprendedor(access_token: string, docEmprendedor: number): Observable<any[]> {
    const headers = this.CreacionHeaders(access_token);
    let params = new HttpParams().set('doc_emprendedor', docEmprendedor);
    const options = { headers, params };
    return this.http.get<any[]>(this.url+"/getEmpresaByEmprendedor", options);
  }
}