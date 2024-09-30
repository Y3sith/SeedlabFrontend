import { Injectable } from '@angular/core';
import { environment } from '../../environment/env';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
 providedIn: 'root'
})
export class PuntajesService {

 constructor(private http: HttpClient ) {}
 url = environment.apiUrl + 'puntajes';

 /* Guarda el puntaje de una sección para una empresa específica */
 savePuntajeSeccion(puntajes: any, documentoEmpresa: number): Observable<any> {
   const headers = new HttpHeaders({
     'Content-Type': 'application/json'
   });
   return this.http.post<any>(`${this.url}/${documentoEmpresa}`,puntajes, { headers });
 }

 /* Obtiene los puntajes para una empresa específica */
 getPuntajes(id_empresa:number): Observable<any> {
   const headers = new HttpHeaders({
     'Content-Type': 'application/json'
   });
   return this.http.get<any>(this.url + id_empresa, { headers });
 }
}