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

  SaveAnswersRedis(access_token: string, sectionId: number, data:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.post(this.url+'/form/section/'+sectionId, JSON.stringify(data), { headers });
  }

  getAnwerRedis(access_token: string, sectionId:number): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+ access_token
    });
    return this.http.get(this.url+'/form/section/'+sectionId, {headers});
  }

}
