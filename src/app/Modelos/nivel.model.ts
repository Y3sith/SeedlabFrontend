export class Nivel {
    id?: number;
    nombre: string | null;
    id_actividad?: number

    constructor(id:number, nombre:string, id_actividad:number){
        this.id=id;
        this.nombre=nombre;
        this.id_actividad=id_actividad;
    }
}