import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  /* URL para obtener todos los departamentos */
  url = environment.apiUrl + 'deps/all/';

  constructor(private http: HttpClient) { }

  /* Obtiene la lista de todos los departamentos */
  getDepartamento(): Observable<any> {
    return this.http.get(this.url);
  }
}