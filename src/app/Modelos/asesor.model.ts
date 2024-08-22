export class Asesor {
    id?: number;
    nombre: string;
    apellido: string;
    documento: string;
    id_tipo_documento: string;
    imagen_perfil: File;
    genero: string;
    fecha_nac: Date;
    direccion: string;
    municipio: number;
    celular: string;
    aliado: string;
    email:string;
    
    password:string;
    estado:boolean;

    constructor(id: number, nombre: string,apellido: string, documento: string,id_tipo_documento: string, imagen_perfil:File,
        genero:string, fecha_nac: Date ,direccion:string,municipio:number,celular: string,  aliado: string, email: string, password: string, estado: boolean) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.id_tipo_documento = id_tipo_documento;
        this.imagen_perfil = imagen_perfil;
        this.genero = genero;
        this.fecha_nac = fecha_nac;
        this.direccion = direccion;
        this.municipio = municipio;
        this.celular = celular;
        this. aliado =  aliado;
        this.email = email;
        this.password =  password;
        this.estado = estado;
    }
}
