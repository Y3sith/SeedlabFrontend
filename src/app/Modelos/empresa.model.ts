import { Emprendedor } from "./emprendedor.model";
import { ApoyoEmpresa } from "./apoyo-empresa.modelo";

export class Empresa {
    id?:number;
    nombre?: string ;
    documento?: string;
    cargo: string | null | undefined;
    razonSocial: string | null | undefined;
    url_pagina: string | null | undefined
    telefono: string;
    celular?: string | null ;
    direccion: string | null | undefined;
    correo: string | null | undefined;
    profesion: string | null | undefined;
    experiencia: string | null | undefined;
    funciones: string | null | undefined;
    id_tipo_documento:number;
    id_departamento:number;
    id_municipio:number;
    id_emprendedor: number;
    constructor(
        id:number,
        nombre: string ,
        documento: string,
        cargo: string | null | undefined,
        razonSocial: string | null | undefined,
        url_pagina: string | null | undefined,
        telefono: string,
        celular: string | null | undefined,
        direccion: string | null,
        correo: string | null | undefined,
        profesion: string | null | undefined,
        experiencia: string | null | undefined,
        funciones: string | null | undefined,
        id_tipo_documento:number,
        id_departamento:number,
        id_municipio:number,
        id_emprendedor: number,     
    ){      this.id = id;
            this.nombre = nombre;
            this.documento = documento;
            this.cargo = cargo;
            this.razonSocial = razonSocial;
            this.url_pagina = url_pagina;
            this.telefono = telefono;
            this.celular = celular;
            this.direccion = direccion;
            this.correo = correo;
            this.profesion = profesion;
            this.experiencia =experiencia;
            this.funciones = funciones;
            this.id_tipo_documento = id_tipo_documento;
            this.id_departamento = id_departamento;
            this.id_municipio = id_municipio;
            this.id_emprendedor = id_emprendedor;
        }

}
