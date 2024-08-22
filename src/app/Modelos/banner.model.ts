export class Banner {
    id?: number;
    urlImagen:File;
    estadobanner: boolean ;
    id_aliado: number;

    constructor(id: number, urlImagen:File, estadobanner:boolean, id_aliado: number){
        this.id = id;
        this.urlImagen = urlImagen;
        this.estadobanner = estadobanner;
        this.id_aliado = id_aliado;
    }
}
