export class Personalizaciones {

    id_superadmin: string | null;
    imagen_logo: File | null;
    //logo_footer: File | null;
    nombre_sistema: string | null;
    color_principal: string | null;
    color_secundario: string | null;
    color_terciario: string | null;
    descripcion_footer: Text;
    paginaWeb: string;
    email: string;
    telefono: string;
    direccion: string;
    ubicacion: string;

    constructor(id_superadmin: string, imagen_logo: File, nombre_sistema: string, color_principal: string, color_secundario: string, color_terciario: string,
        logo_footer: File,descripcion_footer: Text, paginaWeb:string, email: string, telefono: string, direccion: string, ubicacion: string) {
        this.id_superadmin = id_superadmin;
        this.imagen_logo = imagen_logo;
        this.nombre_sistema = nombre_sistema;
        this.color_principal = color_principal;
        this.color_secundario = color_secundario;
        this.color_terciario = color_terciario;
        //this.logo_footer = logo_footer;
        this.descripcion_footer = descripcion_footer;
        this.paginaWeb = paginaWeb;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.ubicacion = ubicacion;
    }
}


