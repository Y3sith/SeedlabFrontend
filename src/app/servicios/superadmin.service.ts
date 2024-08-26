


import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

import { Superadmin } from '../Modelos/superadmin.model';
import { Personalizaciones } from '../Modelos/personalizaciones.model';
import { Actividad } from '../Modelos/actividad.model';
import { Nivel } from '../Modelos/nivel.model';
import { Leccion } from '../Modelos/leccion.model';
import { Contenido_Leccion } from '../Modelos/contenido-leccion.model';
import { access } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class SuperadminService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + 'superadmin/'


  private CreacionHeaders(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    });
  }

  private CreacionHeaderss(access_token: any): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
  }

  createSuperadmin(access_token: any, superadmin: Superadmin,): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "crearSuperAdmin", superadmin, options);
  }

  updateAdmin(admin: Superadmin, access_token: any, id: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "editarAdmin/" + id, admin, options);
  }

  getInfoAdmin(access_token: any, id: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "userProfileAdmin/" + id, options);
  }

  getAdmins(access_token: any, estado: boolean): Observable<any> {
    const options = {headers: this.CreacionHeaders(access_token),
    params: new HttpParams().set('estado', estado)
    };
    return this.http.get<any>(this.url + "mostrarSuperAdmins/", options);
  }

  getInfoAdminxlista(access_token: any, adminId: number): Observable<any> {
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get<any>(this.url + "perfilAdmin/" + adminId, options);
  }

  asesorConAliado(access_token:any):Observable<any>{
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"asesor-aliado",options)
  }

  listarAliado(access_token:any):Observable<any>{
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"listAliado",options)
  }

  crearActividadSuperAdmin(access_token: any, actividad: Actividad):Observable<any>{
    const options = {headers: this.CreacionHeaders(access_token)};
    return this.http.post(environment.apiUrl+"actividad/crearActividad",actividad,options)
  }
  crearNivelSuperAdmin(access_token:any,nivel: Nivel):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.post(environment.apiUrl+"nivel/crearNivel",nivel,options)
    //return this.http.post(this.url+"nivel",nivel,options) 
  }
  
  crearLeccionSuperAdmin(access_token:any,leccion:Leccion):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.post(environment.apiUrl+"leccion/crearLeccion",leccion,options)
  }

  crearContenicoLeccionSuperAdmin(access_token:string, contenido_leccion:Contenido_Leccion):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.post(environment.apiUrl+"contenido_por_leccion/crearContenidoPorLeccion",contenido_leccion,options)
  }

  
  createPersonalizacion(access_token: any, formData: FormData, id): Observable<any> {
    const options = { headers: this.CreacionHeaderss(access_token) };
    return this.http.post(this.url + "personalizacion/"+ id, formData, options);
  }

  getPersonalizacion(): Observable<any> {
    return this.http.get(environment.apiUrl + "traerPersonalizacion");
  }

  restorePersonalization(access_token: any, id):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.post(this.url + "restaurarPersonalizacion/"+ id,{}, options);
  }

  dashboardAdmin(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token)};
    return this.http.get(this.url+"contar-usuarios",options)
  }

  contarRegistrosMensual(access_token:any):Observable<any>{
    const options = { headers:this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"listRegistrosAnioMes",options)
  }

  promedioAsesorias(access_token:any, year:number):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(`${this.url}averageAsesorias2024?year=${year}`, options);
  }

  emprendedoresPorDepartamento(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"emprendedor_departamento",options)
  }
  
//////////////////////////
  pdfEmpenrededorMunicipio(access_token:any):Observable<any>{
    const options = { headers: this.CreacionHeaders(access_token) };
    return this.http.get(this.url+"reporte-emprendedores",options)
  }
  
}
