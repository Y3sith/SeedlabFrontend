import { User } from "./user.model";

export class Aliado {
    id?: number;
    nombre: string;
    descripcion: string;
    logo: File; 
    ruta_multi: File ;
    id_tipo_dato: number ;
    email: string;
    password: string;
    estado: boolean;

    constructor(id: number, nombre: string, descripcion: string, logo: File, ruta_multi: File | null, id_tipo_dato: number | null, email: string, password: string, estado: boolean) {
        this.id = id,
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.logo = logo;
       // this.banner = banner;
        this.ruta_multi = ruta_multi;
        this.id_tipo_dato = id_tipo_dato;
        this.email = email;
        this.password = password;
        this.estado = estado;
    }
}