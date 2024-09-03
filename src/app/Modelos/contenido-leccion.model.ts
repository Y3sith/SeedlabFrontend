export class Contenido_Leccion {
    id?: number;
    titulo: string | null;
    descripcion: string | null;
    fuente_contenido: string | null;
    id_tipo_dato?: number;
    id_leccion?: number;
    
    constructor (id: number, titulo: string, descripcion: string, fuente_contenido: string, id_tipo_dato: number, id_leccion: number){
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fuente_contenido = fuente_contenido;
        this.id_tipo_dato = id_tipo_dato;
        this.id_leccion = id_leccion;
    }
}