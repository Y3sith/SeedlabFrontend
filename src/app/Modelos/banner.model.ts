export class Banner {
    id?: number;
    urlImagenSmall: string;
    urlImagenMedium: string;
    urlImagenLarge: string;
    estadobanner: boolean;
    id_aliado?: number;

    constructor(
        urlImagenSmall: string,
        urlImagenMedium: string,
        urlImagenLarge: string,
        estadobanner: boolean,
        id?: number,  // Hacemos que el id sea opcional
        id_aliado?: number  // Hacemos que id_aliado también sea opcional
    ) {
        this.id = id;  // Puede ser undefined
        this.urlImagenSmall = urlImagenSmall;
        this.urlImagenMedium = urlImagenMedium;
        this.urlImagenLarge = urlImagenLarge;
        this.estadobanner = estadobanner;
        this.id_aliado = id_aliado;  // Puede ser undefined
    }
}

