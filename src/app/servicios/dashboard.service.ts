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
  private cacheDuration = 60 * 60 * 1000; // Duración de 1 hora
  url = environment.apiUrl + 'dashboard/';

  constructor(private http: HttpClient) {}

  private getCachedData(key: string, access_token: string, apiEndpoint: string): Observable<any> {
    if (this.cache[key] && (Date.now() - this.cacheExpiration[key] < this.cacheDuration)) {
      return of(this.cache[key]); // Retorna los datos desde caché
    }

    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(`${this.url}${apiEndpoint}`, options).pipe(
      tap(data => {
        this.cache[key] = data; // Almacena en caché
        this.cacheExpiration[key] = Date.now(); // Actualiza tiempo de expiración
      }),
      shareReplay(1) // Para evitar múltiples solicitudes si hay varios suscriptores
    );
  }

  private CreacionHeaders(access_token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    });
  }

  dashboardAdmin(access_token: string): Observable<any> {
    return this.getCachedData('dashboardAdmin', access_token, 'contar-usuarios');
  }

  contarRegistrosMensual(access_token: string): Observable<any> {
    return this.getCachedData('contarRegistrosMensual', access_token, 'listRegistrosAnioMes');
  }

  promedioAsesorias(access_token: string, year: number): Observable<any> {
    return this.getCachedData(`promedioAsesorias_${year}`, access_token, `averageAsesorias2024?year=${year}`);
  }

  emprendedoresPorDepartamento(access_token: string): Observable<any> {
    return this.getCachedData('emprendedoresPorDepartamento', access_token, 'emprendedor_departamento');
  }

  // Aliados
  getDashboard(access_token: string, idAsesor: number): Observable<any> {
    return this.getCachedData(`dashboardAliado_${idAsesor}`, access_token, `dashboardAliado/${idAsesor}`);
  }

  graficaDatosGeneros(access_token: string): Observable<any> {
    return this.getCachedData('graficaDatosGeneros', access_token, 'generoAliado');
  }

  graficaFormulario(access_token: string, id_empresa: string, tipo: number): Observable<any> {
    const key = `graficaFormulario_${id_empresa}_${tipo}`;
    return this.getCachedData(key, access_token, `graficaFormulario/${id_empresa}/${tipo}`).pipe(
      map(response => {
        console.log('Respuesta original del servidor:', response);
        return response.items && response.items.length > 0 ? response.items[0] : response;
      })
    );
  }
}
