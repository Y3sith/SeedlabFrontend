import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

@Injectable({
  providedIn: 'root'
})
export class MunicipioService {

  url = environment.apiUrl + 'mun/';

  constructor(private http: HttpClient) { }

  getMunicipios(idDepartamento: string): Observable<any> {
    const url = idDepartamento ? `${this.url}?dep_id=${idDepartamento}` : this.url;
    return this.http.get(url);
  }


}
