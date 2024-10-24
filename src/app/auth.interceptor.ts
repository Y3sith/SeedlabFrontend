import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './servicios/auth.service';
import moment from 'moment';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expires_at');

    if (token && expiresAt) {
      const now = moment();
      const expiration = moment(expiresAt);

      if (now.isAfter(expiration)) {
        this.authService.clearSession();
        this.authService.logout(token).subscribe();
        return throwError({ status: 401, message: 'Token expired' });
      }
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.authService.clearSession();
        }
        return throwError(error);
      })
    );
  }
}
