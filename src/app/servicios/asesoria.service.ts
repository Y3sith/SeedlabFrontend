import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';

@Injectable({
  providedIn: 'root'
})
export class AsesoriaService {
  private apiUrl = `${environment.apiUrl}asesorias/`;

  constructor(private http: HttpClient) { }

  getMisAsesorias(body: { documento: string, asignacion: boolean }): Observable<any> {
    const token = localStorage.getItem('token'); // Obtén el token del localStorage
    if (!token) {
      console.error('Token no encontrado en el localStorage');
      return new Observable<any>();
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Incluye el token en las cabeceras
    });

    return this.http.post<any>(`${this.apiUrl}mis_asesorias`, body, { headers });
  }

  crearAsesoria(data: any): Observable<any> {
    const token = localStorage.getItem('token'); // Obtén el token del localStorage
    if (!token) {
      console.error('Token no encontrado en el localStorage');
      return new Observable<any>();
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Incluye el token en las cabeceras
    });

    return this.http.post<any>(`${this.apiUrl}solicitud_asesoria`, data, { headers });
  }
}
