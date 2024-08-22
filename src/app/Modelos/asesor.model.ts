export class Asesor {
    id?: number;
    nombre: string;
    apellido: string;
    imagen_perfil: File;
    genero: string;
    direccion: string;
    celular: string;
    aliado: string;
    email:string;
    password:string;
    estado:boolean;

    constructor(id: number, nombre: string,apellido: string, imagen_perfil:File,genero:string ,direccion:string, celular: string,  aliado: string, email: string, password: string, estado: boolean) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.imagen_perfil = imagen_perfil;
        this.genero = genero;
        this.direccion = direccion;
        this.celular = celular;
        this. aliado =  aliado;
        this.email = email;
        this.password =  password;
        this.estado = estado;
    }
}
