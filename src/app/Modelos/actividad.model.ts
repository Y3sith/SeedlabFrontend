export class Actividad {
    id?: number;
    nombre: string | null;
    descripcion: string | null;
    fuente: string | null;
    id_tipo_dato?: number;
    id_asesor?:	number | null;
    id_ruta?: number;
    id_aliado?:number;
    estado: boolean;

    constructor(id: number, nombre: string, descripcion: string, 
        fuente: string,  estado: boolean, id_tipo_dato?: number, id_asesor?: number,
        id_ruta?: number,id_aliado?: number) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fuente = fuente;
        this.id_tipo_dato = id_tipo_dato;
        this.id_asesor = id_asesor;
        this.id_ruta = id_ruta;
        this.id_aliado = id_aliado;
        this.estado = estado;
    }
}