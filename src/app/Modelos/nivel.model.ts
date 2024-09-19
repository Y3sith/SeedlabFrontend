export class Nivel {
    id?: number;
    nombre: string | null;
    id_asesor?:	number | null;
    id_actividad?: number

    constructor(id:number, nombre:string,id_actividad:number,id_asesor?: number,){
        this.id=id;
        this.nombre=nombre;
        this.id_asesor = id_asesor;
        this.id_actividad=id_actividad;
    }
}