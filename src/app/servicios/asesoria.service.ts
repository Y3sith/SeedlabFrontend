import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

import { AsesorDisponible } from '../Modelos/AsesorDisponible.model';
import { Asesoria } from '../Modelos/asesoria.model';

@Injectable({
  providedIn: 'root'
})
export class AsesoriaService {

  private apiUrl = environment.apiUrl + 'asesorias/';

  constructor(private http: HttpClient) { }

  //ver asesorias - emprendedor
  getMisAsesorias(access_token: any, body: { documento: string, asignacion: boolean }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ` + access_token
    });
    return this.http.post<any>(`${this.apiUrl}mis_asesorias`, body, { headers });
  }

  //guardar asesoria - emprendedor
  crearAsesoria(access_token: any, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ` + access_token
    });
    return this.http.post<any>(`${this.apiUrl}solicitud_asesoria`, data, { headers });
  }

  // ver asesorias - orientador
  postAsesoriasOrientador(access_token: any, pendiente: boolean): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    const body = {
      pendiente: pendiente
    };
    return this.http.post<any>(`${this.apiUrl}asesoriaOrientador`, body, { headers });
  }

  // dar aliado a asesoria - orientador
  asignarAliado(access_token: any, id: number, nombreAliado: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    const body = { nombreAliado: nombreAliado };
    return this.http.post<any>(`${this.apiUrl}${id}/asignar-aliado`, body, { headers });
  }

  // Método para obtener asesorías por rol y estado
  getAsesoriasPorRolYEstado(access_token: any, id_aliado: number, estado: number): Observable<Asesoria[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    return this.http.get<Asesoria[]>(`${this.apiUrl}mostrarAsesorias/${id_aliado}/${estado}`, { headers });
  }

  //ver asesores disponibles por aliado
  listarAsesores(access_token: any, idaliado: number): Observable<AsesorDisponible[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    return this.http.get<AsesorDisponible[]>(`${this.apiUrl}asesores_disponibles/${idaliado}`, { headers });
  }

  //asignar asesoria - aliado
  asignarAsesoria(access_token: any, idAsesoria: number, idAsesor: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    const body = { id_asesoria: idAsesoria, id_asesor: idAsesor };
    return this.http.post(this.apiUrl + "asignar_asesoria", body, { headers });
  }

  //asignar horario - asesor
  rechazarAsesoria(access_token: any, id_asesoria: number, accion: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    const body = { id_asesoria, accion };
    return this.http.post<any>(this.apiUrl + "gestionar", body, { headers });
  }

  // Nueva función para agregar horario a una asesoría
  agregarHorarioAsesoria(access_token: any, observaciones: string | null, idAsesoria: string, fecha: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + access_token,
      'Content-Type': 'application/json'
    });
    const body = {
      observaciones: observaciones,
      id_asesoria: idAsesoria,
      fecha: fecha
    };
    return this.http.post<any>(this.apiUrl + "horario_asesoria", body, { headers });
  }
}
