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

  /* Obtiene el reporte de roles para un período específico */
  getReporteRole(tipo_reporte: string, fecha_inicio: string, fecha_fin: string): Observable<any> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin };

    return this.http.post<Blob>(`${this.url}reporte_roles`, body, {
      responseType: 'blob' as 'json'
    });
  }

  /* Exporta un reporte en el formato especificado */
  exportarReporte(tipo_reporte: string, fecha_inicio: string, fecha_fin: string, formato: string): Observable<Blob> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin, formato };

    return this.http.post(`${this.url}exportar_reporte`, body, { responseType: 'blob' });
  }

  /* Obtiene el reporte de empresas para un período específico */
  getReporteEmpresas(tipo_reporte, fecha_inicio: string, fecha_fin: string): Observable<Blob> {
    const body = { tipo_reporte, fecha_inicio, fecha_fin };
    return this.http.post<Blob>(`${this.url}reporte_empresas`, body);
  }

  /* Obtiene los datos del reporte según los parámetros especificados */
  obtenerDatosReporte(tipo_reporte: string, fecha_inicio: string, fecha_fin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}obtener_datos_reporte`, {
      params: {
        tipo_reporte,
        fecha_inicio,
        fecha_fin
      }
    });
  }

  /* Obtiene el reporte de formulario para un emprendedor o empresa específica */
  getReporteFormulario(idEmprendedor: number, documentoEmpresa?: string): Observable<Blob> {
    let url = `${this.url}exportar-formExcel/${idEmprendedor}`;
    if (documentoEmpresa) {
      url += `/${documentoEmpresa}`;
    }

    return this.http.get<Blob>(url, { responseType: 'blob' as 'json' });
  }

  /* Obtiene los datos de asesoría de un aliado para un período específico */
  obtenerDatosAsesoriaAliado(tipo_reporte: string, id_aliado: number, fecha_inicio: string, fecha_fin: string): Observable<any> {
    return this.http.get<any[]>(`${this.url}obtener_datos_aliados`, {
      params: {
        tipo_reporte,
        id_aliado,
        fecha_inicio,
        fecha_fin
      }
    });
  }

  /* Exporta el reporte de asesoría de un aliado en el formato especificado */
  exportarReporteAsesoriaAliado(tipo_reporte: string, id_aliado: number, fecha_inicio: string, fecha_fin: string, formato: string): Observable<Blob> {
    const body = { tipo_reporte, id_aliado, fecha_inicio, fecha_fin, formato };
    return this.http.post(`${this.url}exportar_reporte_aliado`, body, { responseType: 'blob' });
  }

  /* Obtiene los datos del formulario de un emprendedor específico */
  obtenerDatosFormEmp(tipo_reporte: string, doc_emprendedor: number, empresa: number): Observable<any> {
    let params = new HttpParams()
      .set('tipo_reporte', tipo_reporte)
      .set('doc_emprendedor', doc_emprendedor)
      .set('empresa', empresa);

    return this.http.get<any[]>(`${this.url}obtener_datos_formEmprendedor`, { params });
  }
}