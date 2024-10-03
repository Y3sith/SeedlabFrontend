import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';
import { Emprendedor } from '../Modelos/emprendedor.model';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = environment.apiUrl + 'auth/';

  constructor(private http: HttpClient, private router:Router) { }

  /* Realiza el proceso de inicio de sesión */
  login(email: any, password: any) {
    return this.http.post(this.url + "login", { email: email, password: password });
  }

  /* Registra un nuevo emprendedor */
  registrar(emprendedor: Emprendedor): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.url + "register_em", emprendedor, { headers });
  }

  /* Inicia el proceso de recuperación de contraseña */
  forgotPassword(email: any) {
    return this.http.post(this.url + "send-reset-password", { email: email });
  }

  /* Verifica el email del usuario con un código de verificación */
  verificarEmail(email: string, codigo: string): Observable<any> {
    const body = { email, codigo };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.url}validate_email_em`, body, { headers });
  }

  /* Realiza el proceso de cierre de sesión */
  logout(token: string): Observable<any> {
    return this.http.post(this.url + "logout", { token })
  }

  /* Verifica si el usuario está autenticado */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /* Obtiene los tipos de documento disponibles */
  tipoDocumento(): Observable<any> {
    return this.http.get(environment.apiUrl + "tipo_documento");
  }

  // Método para obtener el token almacenado en localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método clearSession para eliminar el token y redirigir
  clearSession() {
    // Elimina el token del localStorage
    localStorage.removeItem('token');
    
    // Redirige al usuario a la página de login
    this.router.navigate(['/login']);
  }
}