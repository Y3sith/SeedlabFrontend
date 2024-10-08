import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/env';

@Injectable({
  providedIn: 'root'
})
export class MunicipioService {

  /* URL base para las operaciones relacionadas con municipios */
  url = environment.apiUrl + 'mun';

  constructor(private http: HttpClient) { }

  /* Obtiene los municipios, opcionalmente filtrados por departamento */
  getMunicipios(idDepartamento: string): Observable<any> {
    const numericDepId = idDepartamento ? Number(idDepartamento) : null;
    const url = numericDepId ? `${this.url}?dep_id=${numericDepId}` : this.url;
    return this.http.get(url);
  }
}