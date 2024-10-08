import { User } from "./user.model";

export class Aliado {
    id?: number;
    nombre: string;
    descripcion: string;
    logo: string; 
    ruta_multi: File ;
    urlpagina: string;
    id_tipo_dato: number ;
    email: string;
    password: string;
    estado: boolean;

    constructor(id: number, nombre: string, descripcion: string, logo: string, ruta_multi: File | null, urlpagina: string, id_tipo_dato: number | null, email: string, password: string, estado: boolean) {
        this.id = id,
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.logo = logo;
        this.ruta_multi = ruta_multi;
        this.urlpagina = urlpagina;
        this.id_tipo_dato = id_tipo_dato;
        this.email = email;
        this.password = password;
        this.estado = estado;
    }
}