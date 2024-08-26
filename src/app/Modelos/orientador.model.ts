export class Orientador {
    id?: number;
    nombre: string | null;
    apellido: string | null;
    documento: string;
    id_tipo_documento: string;
    imagen_perfil: File;
    genero: string;
    fecha_nac: Date;
    direccion: string;
    id_municipio: number;
    celular: string | null;
    email: string | null;
    password?: string | null;
    estado?: boolean | null;
    

    constructor(id: number, nombre: string, apellido: string, celular: string, id_auth: number, email: string, estado: boolean, password?: string) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.celular = celular;
        this.email = email;
        this.password = password;
        this.estado = estado;
    }
}
