import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

import { Emprendedor } from '../Modelos/emprendedor.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url= environment.apiUrl+'auth/';

  constructor(private http: HttpClient) { }

  login(email: any, password: any) {
    return this.http.post(this.url + "login", { email: email, password: password });
  }

  registrar(emprendedor: Emprendedor): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.url+"register_em", emprendedor,{ headers });
  }

  forgotPassword(email: any){
    return this.http.post(this.url + "send-reset-password", { email: email });
  }

  verificarEmail(email: string, codigo: string): Observable<any> {
    const body = { email, codigo };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.url}validate_email_em`, body, { headers });
  }

  logout(token: string) : Observable<any>{
    return this.http.post(this.url+"logout",{token})
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  
  
  tipoDato(): Observable<any>{
    return this.http.get(environment.apiUrl+"tipo_documento");
  }
  
}