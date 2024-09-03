import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl;

  obtenerReportes(): Observable<any> {
    return this.http.get<any>(`${this.url}reportes_disponibles`);
  }

  getReporteRole(tipo_reporte: string, fecha_inicio: string, fecha_fin: string): Observable<any> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin };

    return this.http.post<Blob>(`${this.url}reporte_roles`, body, {
      responseType: 'blob' as 'json'  // Se especifica que se espera una respuesta de tipo Blob
    });
  }

  getReporteEmpresas(tipo_reporte,fecha_inicio: string, fecha_fin: string): Observable<Blob>{
    const body = {tipo_reporte, fecha_inicio, fecha_fin };
    return this.http.post<Blob>(`${this.url}reporte_empresas`, body);
  }

}
