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



  getReporteRole(tipo_reporte: string, fecha_inicio: string, fecha_fin: string): Observable<any> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin };

    return this.http.post<Blob>(`${this.url}reporte_roles`, body, {
      responseType: 'blob' as 'json'
    });
  }

  exportarReporte(tipo_reporte: string, fecha_inicio: string, fecha_fin: string): Observable<Blob> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin };

    return this.http.post(`${this.url}exportar_reporte`, body, { responseType: 'blob' });
  }


  getReporteEmpresas(tipo_reporte, fecha_inicio: string, fecha_fin: string): Observable<Blob> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin };
    return this.http.post<Blob>(`${this.url}reporte_empresas`, body);
  }

  obtenerDatosReporte(tipo_reporte: string, fecha_inicio: string, fecha_fin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}obtener_datos_reporte`, {
      params: {
        tipo_reporte,
        fecha_inicio,
        fecha_fin
      }
    });
  }

  getReporteFormulario(id_emprendedor:string): Observable<Blob> {
    return this.http.get<Blob>(`${this.url}exportar-formExcel/${id_emprendedor}`, {
      responseType: 'blob' as 'json' 
    });
  }

}
