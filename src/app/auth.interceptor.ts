// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './servicios/auth.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Si el token ha expirado o es inválido, realiza el logout
          const token = localStorage.getItem('token');
          
          if (token) {
            this.authService.logout(token).subscribe(
              () => this.authService.clearSession(),  // Llama a clearSession cuando se detecta un error
              () => this.authService.clearSession()
            );
          } else {
            this.authService.clearSession();  // Si no hay token, también cierra sesión
          }
        }
        return throwError(error);
      })
    );
  }
}
