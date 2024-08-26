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
    id_departamento: number;
    id_municipio: number;
    celular: string | null;
    email: string | null;
    password?: string | null; // Asegúrate de que 'password' sea opcional si no siempre estará presente.
    estado: boolean | null;

    constructor(id: number, nombre: string, apellido: string, documento: string,id_tipo_documento: string, imagen_perfil:File,
        genero:string, fecha_nac: Date ,direccion:string,id_departamento: number,id_municipio:number, celular: string, id_auth: number, email: string, estado: boolean, password?: string) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.id_tipo_documento = id_tipo_documento;
        this.imagen_perfil = imagen_perfil;
        this.genero = genero;
        this.fecha_nac = fecha_nac;
        this.direccion = direccion;
        this.id_departamento = id_departamento;
        this.id_municipio = id_municipio;
        this.celular = celular;
        this.email = email;
        this.password = password || null;
        this.estado = estado;
    }
}
