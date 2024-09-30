export class Emprendedor {
    documento: number | null;
    nombre: string | null;
    apellido: string | null;
    //imagen_perfil:File | null;
    celular: string | null;
    email: string | null;
    password: string | null;
    genero: string | null;
    fecha_nacimiento: Date | null;
    direccion: string | null;
    id_tipo_documento: number | null;
    estado:boolean;
    id_municipio: number | null;
    id_departamento: number | null;

    constructor(
        documento: number | null,
        id_tipo_documento: number | null,
        nombre: string | null,
        apellido: string | null,
        //imagen_perfil: File | null,
        celular: string | null,
        email: string | null,
        password: string | null,
        genero: string | null,
        fecha_nacimiento: Date | null,
        direccion: string | null,
        estado:boolean,
        id_municipio: number | null,
        id_departamento: number | null

    ) {
        this.documento = documento;
        this.id_tipo_documento = id_tipo_documento;
        this.nombre = nombre;
        this.apellido = apellido;
        //this.imagen_perfil= imagen_perfil;
        this.celular = celular;
        this.email = email;
        this.password = password;
        this.genero = genero;
        this.fecha_nacimiento = fecha_nacimiento;
        this.direccion = direccion;
        this.estado = estado;
        this.id_municipio = id_municipio;
        this.id_departamento = id_departamento;
    }
}