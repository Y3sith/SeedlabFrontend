import { Empresa } from "./empresa.model";

export class ApoyoEmpresa {

    documento? : number;
    nombre: string | null;
    apellido? : string | null;
    cargo : string | null| undefined;
    telefono? : string;
    celular? : string;
    email? : string | null;
    id_tipo_documento : string;
    id_empresa: string;

    constructor(
        documento: number, 
        nombre: string, 
        apellido: string, 
        cargo: string| undefined, 
        telefono: string, 
        celular: string, 
        email: string, 
        id_tipo_documento: string, 
        id_empresa: string
    
    ) {
            this.documento = documento;
            this.nombre = nombre;
            this.apellido = apellido;
            this.cargo = cargo;
            this.telefono = telefono;
            this.celular = celular;
            this.email = email;
            this.id_tipo_documento = id_tipo_documento;
            this.id_empresa = id_empresa;
        }
}
