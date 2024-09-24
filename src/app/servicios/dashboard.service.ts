import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {
  url = environment.apiUrl + 'dashboard/';
  private cacheDuration = 60 * 60 * 1000; // Duración de 1 hora

  constructor(private http: HttpClient) {}

  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  private getFromLocalStorage(key: string): any {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < this.cacheDuration) {
        return data; // Retorna los datos si no han expirado
      }
      localStorage.removeItem(key); // Elimina el caché si ha expirado
    }
    return null; // Si no hay datos en caché
  }

  private saveToLocalStorage(key: string, data: any): void {
    const cacheData = {
      data: data,
      timestamp: Date.now() // Guarda el tiempo actual
    };
    localStorage.setItem(key, JSON.stringify(cacheData)); // Guarda los datos en localStorage
  }

  dashboardAdmin(access_token: any, year?: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    
    // Si el año está presente, lo añadimos a la URL, sino enviamos solo la URL base
    const url = year ? `${this.url}contar-usuarios?year=${year}` : `${this.url}contar-usuarios`;
  
    return this.http.get(url, options).pipe(
      map(data => {
        this.saveToLocalStorage('dashboardAdmin', data); // Guarda en localStorage
        return data; // Retorna los datos
      })
    );
  }
  
  

  contarRegistrosMensual(access_token: any): Observable<any> {
    const cachedData = this.getFromLocalStorage('contarRegistrosMensual');
    if (cachedData) {
      return of(cachedData); // Retorna los datos desde localStorage
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "listRegistrosAnioMes", options).pipe(
      map(data => {
        this.saveToLocalStorage('contarRegistrosMensual', data); // Guarda en localStorage
        return data; // Retorna los datos
      })
    );
  }

  promedioAsesorias(access_token: any, year: number): Observable<any> {
    const cachedData = this.getFromLocalStorage(`promedioAsesorias_${year}`);
    if (cachedData) {
      return of(cachedData); // Retorna los datos desde localStorage
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}averageAsesorias2024?year=${year}`, options).pipe(
      map(data => {
        this.saveToLocalStorage(`promedioAsesorias_${year}`, data); // Guarda en localStorage
        return data; // Retorna los datos
      })
    );
  }

  emprendedoresPorDepartamento(access_token: any): Observable<any> {
    const cachedData = this.getFromLocalStorage('emprendedoresPorDepartamento');
    if (cachedData) {
      return of(cachedData); // Retorna los datos desde localStorage
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url + "emprendedor_departamento", options).pipe(
      map(data => {
        this.saveToLocalStorage('emprendedoresPorDepartamento', data); // Guarda en localStorage
        return data; // Retorna los datos
      })
    );
  }

  // Aliados
  getDashboard(access_token: any, idAsesor: number): Observable<any> {
    const cachedData = this.getFromLocalStorage(`dashboardAliado_${idAsesor}`);
    if (cachedData) {
      return of(cachedData); // Retorna los datos desde localStorage
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}dashboardAliado/${idAsesor}`, options).pipe(
      map(data => {
        this.saveToLocalStorage(`dashboardAliado_${idAsesor}`, data); // Guarda en localStorage
        return data; // Retorna los datos
      })
    );
  }

  graficaDatosGeneros(access_token: string): Observable<any> {
    const cachedData = this.getFromLocalStorage('graficaDatosGeneros');
    if (cachedData) {
      return of(cachedData); // Retorna los datos desde localStorage
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "generoAliado", options).pipe(
      map(data => {
        this.saveToLocalStorage('graficaDatosGeneros', data); // Guarda en localStorage
        return data; // Retorna los datos
      })
    );
  }

  graficaFormulario(access_token: string, id_empresa: string, tipo: number): Observable<any> {
    const cachedData = this.getFromLocalStorage(`graficaFormulario_${id_empresa}_${tipo}`);
    if (cachedData) {
      return of(cachedData); // Retorna los datos desde localStorage
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}graficaFormulario/${id_empresa}/${tipo}`, options).pipe(
      map(response => {
        this.saveToLocalStorage(`graficaFormulario_${id_empresa}_${tipo}`, response); // Guarda en localStorage
        console.log('Respuesta original del servidor:', response);
        return response.items && response.items.length > 0 ? response.items[0] : response;
      })
    );
  }
}
