import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + 'dashboard/';

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  dashboardAdmin(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "contar-usuarios", options)
  }

  contarRegistrosMensual(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "listRegistrosAnioMes", options)
  }

  promedioAsesorias(access_token: any, year: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}averageAsesorias2024?year=${year}`, options);
  }

  emprendedoresPorDepartamento(access_token: any): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "emprendedor_departamento", options)
  }


  //Aliados
  getDashboard(access_token: any, idAsesor: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}dashboardAliado/${idAsesor}`, options);
  }

  graficaDatosGeneros(access_token: string): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "generoAliado", options)
  }

  graficaFormulario(access_token: string, id_empresa: string, tipo: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };

    // Agregamos el parámetro tipo a la URL
    return this.http.get<any>(`${this.url}graficaFormulario/${id_empresa}/${tipo}`, options)
      .pipe(
        map(response => {
          console.log('Respuesta original del servidor:', response);
          // Procesar la respuesta
          return response.items && response.items.length > 0 ? response.items[0] : response;
        })
      );
  }




}