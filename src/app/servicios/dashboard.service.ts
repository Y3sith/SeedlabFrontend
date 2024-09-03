import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

  constructor(private http:HttpClient) { }

  url = environment.apiUrl + 'dashboard/';

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  dashboardAdmin(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"contar-usuarios",options)
  }

  contarRegistrosMensual(access_token:any):Observable<any>{
    const options = { headers:this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"listRegistrosAnioMes",options)
  }

  promedioAsesorias(access_token:any, year:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}averageAsesorias2024?year=${year}`, options);
  }

  emprendedoresPorDepartamento(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"emprendedor_departamento",options)
  }


  //Aliados
  getDashboard(access_token: any, idAsesor: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}/dashboardAliado/${idAsesor}`, options);
  }

  graficaDatosGeneros(access_token: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "generoAliado", options)
  }

  graficaFormulario(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url+"graficaFormulario", options);
  }



}