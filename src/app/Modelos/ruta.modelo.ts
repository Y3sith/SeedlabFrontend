export class Ruta {
    id?:number;
    nombre: string | null;
    fecha_creacion: Date | null;
    estado: boolean;
    actividades?: any[];

    constructor(id:number,nombre: string, fecha_creacion: Date, estado: boolean, actividades: any[] = []) {
        this.id = id;
        this.nombre = nombre;
        this.fecha_creacion = fecha_creacion;
        this.estado = estado;
        this.actividades = actividades;
    }
}
