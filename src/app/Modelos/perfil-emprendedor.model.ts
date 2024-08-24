
export class PerfilEmprendedor {
    documento: string | null;
    nombre: string | null;
    apellido: string | null;
    celular: string | null;
    email: string | null;
    password: string | null;
    genero: string | null;
    fecha_nac: string | null;
    direccion: string | null;
    id_tipo_documento: string | null;
    estado?: boolean;
    id_departamento: string | null;
    id_municipio: string | null;

    constructor(
        documento: string | null,
        id_tipo_documento: string | null,
        nombre: string | null,
        apellido: string | null,
        celular: string | null,
        email: string | null,
        password: string | null,
        genero: string | null,
        fecha_nac: string | null,
        direccion: string | null,
        estado: boolean,
        id_departamento: string | null,
        id_municipio: string | null,
    ) {
        this.documento = documento;
        this.id_tipo_documento = id_tipo_documento;
        this.nombre = nombre;
        this.apellido = apellido;
        this.celular = celular;
        this.email = email;
        this.password = password;
        this.genero = genero;
        this.fecha_nac = fecha_nac;
        this.direccion = direccion;
        this.estado = estado;
        this.id_departamento = id_departamento;
        this.id_municipio = id_municipio;
    }
}
