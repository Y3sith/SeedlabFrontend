export class Superadmin {
    id?: number;
    nombre: string | null;
    apellido: string | null;
    documento: string | null;
    //imagen_perfil: string | null;
    celular: string | null;
    genero: string | null;
    fecha_nac: string | null;
    direccion: string | null;
    email: string | null;
    password?: string | null;
    estado?: boolean | null;
    id_tipo_documento: string | null;
    id_departamento: string | null;
    id_municipio: string | null;
    

    constructor(id: number, nombre: string, apellido: string, documento:string, imagen_perfil:string, celular:string, genero:string, 
        fecha_nac:string, direccion:string, id_departamento:string, id_municipio:string, email: string, estado: boolean, id_tipo_documento:string, password?: string,  ) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        //this.imagen_perfil = imagen_perfil;
        this.celular = celular;
        this.genero = genero;
        this.fecha_nac = fecha_nac;
        this.direccion = direccion;
        this.email = email;
        this.password = password;
        this.estado = estado;
        this.id_tipo_documento = id_tipo_documento;
        this.id_departamento = id_departamento;
        this.id_municipio = id_municipio;
    }
}