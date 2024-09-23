import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { map, Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

  private cache: { [key: string]: any } = {}; // Objeto para almacenar la caché
  private cacheExpiration: { [key: string]: number } = {}; // Tiempos de expiración para cada gráfica

  private cacheDuration = 60 * 60 * 1000;

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + 'dashboard/';

  private getCachedData(key: string, access_token: string, apiEndpoint: string): Observable<any> {
    // Verifica si los datos están en caché y si no han expirado
    if (this.cache[key] && (Date.now() - this.cacheExpiration[key] < this.cacheDuration)) {
      return of(this.cache[key]); // Retorna los datos desde caché
    }

    // Si no están en caché o han expirado, realiza la solicitud HTTP
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}${apiEndpoint}`, options).pipe(
      tap(data => {
        // Almacena los datos en caché y actualiza el tiempo de expiración
        this.cache[key] = data;
        this.cacheExpiration[key] = Date.now();
      }),
      shareReplay(1) // Asegura que no se repitan múltiples solicitudes si hay varios suscriptores
    );
  }

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