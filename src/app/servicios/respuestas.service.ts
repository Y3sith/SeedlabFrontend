import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { Respuesta } from '../Modelos/respuesta.model';

@Injectable({
  providedIn: 'root'
})
export class RespuestasService {
  
  url = environment.apiUrl + 'respuestas';
 
  constructor(private http: HttpClient) { }

  /* Guarda las respuestas del usuario en el servidor */
  saveAnswers(access_token: any, payload: { respuestas: Respuesta[] }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post(this.url+'/guardar-respuestas', payload, { headers });
  }

  /* Guarda las respuestas de una sección específica en Redis */
  saveAnswersRedis(access_token: string, id_empresa: number, sectionId: number, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.post(`${this.url}/form/section/${id_empresa}/${sectionId}`, JSON.stringify(data), { headers });
  }

  /* Obtiene las respuestas almacenadas en Redis para una empresa específica */
  getAnwerRedis(access_token: string, id_empresa: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.get(this.url+'/getRespuestasRedis/'+id_empresa, {headers});
  }

  /* Verifica el estado del formulario para una empresa específica */
  verificarEstadoForm(access_token: string, id_empresa: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.get(this.url+'/verificarEstadoForm/'+id_empresa, {headers});
  }
}