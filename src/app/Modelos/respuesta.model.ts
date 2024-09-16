export class Respuesta {
  opcion?: string;
  texto_res?: string;
  valor: number;
  fecha_reg: Date;
  id_pregunta: number;
  id_empresa: number;
  id_subpregunta?: number;

  constructor({id_pregunta, id_empresa,  opcion, texto_res, valor,  fecha_reg,  id_subpregunta}
    :{id_pregunta?: number, id_empresa?: number,  opcion?: string, texto_res?: string, valor?: number,  fecha_reg?: Date,  id_subpregunta?: number}) {
    this.opcion = opcion;
    this.texto_res = texto_res;
    this.valor = valor ?? 0;
    this.fecha_reg = fecha_reg ?? new Date();
    this.id_pregunta = id_pregunta;
    this.id_empresa = id_empresa;
    this.id_subpregunta = id_subpregunta;
  }
}
