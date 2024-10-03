// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './servicios/auth.service';  // Ruta correcta al servicio de autenticación

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verificar si es un error 401 o 403
        if (error.status === 401 || error.status === 403) {
          const token = this.authService.getToken();  // Obtén el token del almacenamiento
          
          if (token) {
            // Llama a logout() y realiza el cierre de sesión en el backend
            this.authService.logout(token).subscribe(
              () => {
                // Limpia el token y redirige al login
                location.reload();
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
              },
              () => {
                // Incluso si la llamada al logout falla, se debe limpiar el token y redirigir al login
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
              }
            );
          }
        }
        return throwError(error);
      })
    );
  }
}
