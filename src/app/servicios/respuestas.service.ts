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

  saveAnswers(access_token: any, payload: { respuestas: Respuesta[] }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post(this.url+'/guardar-respuestas', payload, { headers });
  }

  saveAnswersRedis(access_token: string,id_empresa:number, sectionId: number, data:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.post(`${this.url}/form/section/${id_empresa}/${sectionId}`, JSON.stringify(data), { headers });
  }

  getAnwerRedis(access_token: string, id_empresa:number): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.get(this.url+'/getRespuestasRedis/'+id_empresa, {headers});
  }

  verificarEstadoForm(access_token:string, id_empresa:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.get(this.url+'/verificarEstadoForm/'+id_empresa, {headers});
  }

}
