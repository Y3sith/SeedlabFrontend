import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {
  url = environment.apiUrl + 'dashboard/';
  private cacheDuration = 60 * 60 * 1000; 

  constructor(private http: HttpClient) { }

  /* Crea los encabezados HTTP con el token de acceso */
  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  /* Obtiene datos del almacenamiento local si están disponibles y no han expirado */
  private getFromLocalStorage(key: string): any {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < this.cacheDuration) {
        return data; 
      }
      localStorage.removeItem(key); 
    }
    return null; 
  }

  /* Guarda datos en el almacenamiento local con una marca de tiempo */
  private saveToLocalStorage(key: string, data: any): void {
    const cacheData = {
      data: data,
      timestamp: Date.now() 
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  }

  /* Obtiene el dashboard del administrador, usando caché si está disponible */
  dashboardAdmin(access_token: any, year?: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    const url = year ? `${this.url}contar-usuarios?year=${year}` : `${this.url}contar-usuarios`;
    const localData = this.getFromLocalStorage('dashboardAdmin');

    if (localData) {
      return of(localData);
    }

    return this.http.get(url, options).pipe(
      map(data => {
        this.saveToLocalStorage('dashboardAdmin', data);
        return data; 
      })
    );
  }

  /* Obtiene el dashboard de un asesor específico, usando caché si está disponible */
  getDashboard(access_token: any, idAsesor: number): Observable<any> {
    const cachedData = this.getFromLocalStorage(`dashboardAliado_${idAsesor}`);
    if (cachedData) {
      return of(cachedData);
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}dashboardAliado/${idAsesor}`, options).pipe(
      map(data => {
        this.saveToLocalStorage(`dashboardAliado_${idAsesor}`, data); 
        return data; 
      })
    );
  }

  /* Obtiene datos para la gráfica de formulario, usando caché si está disponible */
  graficaFormulario(access_token: string, id_empresa: string, tipo: number): Observable<any> {
    const cachedData = this.getFromLocalStorage(`graficaFormulario_${id_empresa}_${tipo}`);
    if (cachedData) {
      return of(cachedData); 
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}graficaFormulario/${id_empresa}/${tipo}`, options).pipe(
      map(response => {
        this.saveToLocalStorage(`graficaFormulario_${id_empresa}_${tipo}`, response);
        console.log('Respuesta original del servidor:', response);
        return response.items && response.items.length > 0 ? response.items[0] : response;
      })
    );
  }
}