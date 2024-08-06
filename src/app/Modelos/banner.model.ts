export class Banner {
    id?: number;
    urlImagen:File;
    estadobanner: string | null;
    id_aliado: number;

    constructor(id: number, urlImagen:File, estadobanner:string, id_aliado: number){
        this.id = id;
        this.urlImagen = urlImagen;
        this.estadobanner = estadobanner;
        this.id_aliado = id_aliado;
    }
}
