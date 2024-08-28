import { Preguntas, OpcionesRespuesta } from "../../../Modelos/preguntas.model";

export const PREGUNTAS: Preguntas[] = [
    {
        id: 1,
        nombre: '¿Cuántos integrantes conforman su equipo de trabajo?',
        puntaje: 0,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 2,
        nombre: 'Cuenta con personas de apoyo en:',
        puntaje: 10,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 1, sub_id:1, texto: 'Administrativo', puntaje: 0, id_pregunta: 2,  },
            { id: 2, sub_id:2, texto: 'Desarrollo', puntaje: 0, id_pregunta: 2,  },
            { id: 3, sub_id:3, texto: 'Producción', puntaje: 0, id_pregunta: 2,  },
            { id: 4, sub_id:4, texto: 'Innovación y/o desarrollo', puntaje: 0, id_pregunta: 2,  },
            { id: 5, sub_id:5, texto: 'Comercialización', puntaje: 0, id_pregunta: 2,  },
            //{ id: 6, texto: 'Otro, cuál / cuántos?', puntaje: 0, id_pregunta: 2,  },
        ]
    },
    {
        id: 3,//respuesta7
        nombre: '¿Su emprendimiento está legalmente constituido?',
        puntaje: 10,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 4,
        nombre: '¿Cumple con las normas tributarias, contables, laborales, comerciales y/o legales para desempeñar la actividad?',
        puntaje: 5,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 5,
        nombre: '¿Tiene claramente definido su modelo de negocio?',
        puntaje: 20,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 6,
        nombre: '¿Tiene claramente definido su plan de negocios?',
        puntaje: 15,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 7,
        nombre: '¿Tiene experiencia comercial relacionada con el producto y/o servicio?',
        puntaje: 10,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 8,
        nombre: 'Si la respuesta anterior fue afirmativa indicar: ¿Cuánto tiempo de experiencia relacionada tiene?',
        puntaje: 10,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 9,
        nombre: '¿Su emprendimiento tiene definido la misión y la visión?',
        puntaje: 2,
        id_seccion: 1,
        isAffirmativeQuestion: true,
        isText: false, 
        subPreguntas: []
    },
    {
        id: 10,
        nombre: 'Si la respuesta anterior fue afirmativa indicar ¿Cuál es su misión?',
        puntaje: 0,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: true,
        subPreguntas: []
    },
    {
        id: 11,
        nombre: 'Si la respuesta anterior fue afirmativa indicar ¿Cuál es su visión?',
        puntaje: 0,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: true,
        subPreguntas: []
    },
    {
        id: 12,
        nombre: '¿Tiene definidas metas empresariales?',
        puntaje: 5,
        id_seccion: 1,
        isAffirmativeQuestion: true,
        isText: true,
        subPreguntas: [
            { id: 7, sub_id:1, texto: 'Meta 1', puntaje: 0, id_pregunta: 12,  },
            { id: 8, sub_id:2, texto: 'Meta 2', puntaje: 0, id_pregunta: 12,  },
            { id: 9, sub_id:3, texto: 'Meta 3', puntaje: 0, id_pregunta: 12,  },
            { id: 10, sub_id:4, texto: 'Meta 4', puntaje: 0, id_pregunta: 12,  },
        ]
    },
    {
        id: 13,
        nombre: '¿El personal de apoyo está debidamente contratado?',
        puntaje: 5,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 14,
        nombre: '¿Los cargos de apoyo tienen funciones claramente definidas?',
        puntaje: 4,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 15,
        nombre: '¿El perfil de los apoyos está debidamente definido?',
        puntaje: 4,
        id_seccion: 1,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 16,//respuesta24
        nombre: '¿Tiene identificado los gastos y costos de su emprendimiento?',
        puntaje: 0,
        id_seccion: 2,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 17,
        nombre: 'Si la respuesta anterior fue afirmativa indicar: ¿Cuáles?',
        puntaje: 15,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 11, sub_id:1, texto: 'Gastos fijos', puntaje: 0, id_pregunta: 17 },//respuesta25
            { id: 12, sub_id:2, texto: 'Gastos variables', puntaje: 0, id_pregunta: 17 },
            { id: 13, sub_id:3, texto: 'Gastos Operacionales', puntaje: 0, id_pregunta: 17 },
            { id: 14, sub_id:4, texto: 'Gastos No Operacionales', puntaje: 0, id_pregunta: 17 },
            { id: 15, sub_id:5, texto: 'Costos Fijos', puntaje: 0, id_pregunta: 17 },
            { id: 16, sub_id:6, texto: 'Costos Variables', puntaje: 0, id_pregunta: 17 },
            { id: 17, sub_id:7, texto: 'Costos Directos', puntaje: 0, id_pregunta: 17 },
            { id: 18, sub_id:8, texto: 'Costos Indirectos', puntaje: 0, id_pregunta: 17 },
        ]
    },
    {
        id: 18,//respuesta33
        nombre: '¿En su emprendimiento elabora estados financieros?',
        puntaje: 0,
        id_seccion: 2,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 19,
        nombre: 'Si la respuesta anterior fue afirmativa indicar: ¿Cuáles?',
        puntaje: 10,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 19, sub_id:1, texto: 'Balance General', puntaje: 0, id_pregunta: 19 },//respuesta34
            { id: 20, sub_id:2, texto: 'Estado de Flujo', puntaje: 0, id_pregunta: 19 },
            { id: 21, sub_id:3, texto: 'Registro de compras', puntaje: 0, id_pregunta: 19 },
            { id: 22, sub_id:4, texto: 'Registro de ventas', puntaje: 0, id_pregunta: 19 },
            { id: 23, sub_id:5, texto: 'Otro ¿Cual?', puntaje: 0, id_pregunta: 19 },
        ]
    },
    {
        id: 20,//respuesta39
        nombre: '¿Tiene claridad sobre qué presupuestos debe elaborar para su emprendimiento?',
        puntaje: 0,
        id_seccion: 2,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 21,
        nombre: 'Si la respuesta anterior fue afirmativa indicar: ¿Cuáles?',
        puntaje: 20,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 24, sub_id:1, texto: 'Ingresos', puntaje: 0, id_pregunta: 21 },//respuesta40
            { id: 25, sub_id:2, texto: 'Egresos', puntaje: 0, id_pregunta: 21 },
            { id: 26, sub_id:3, texto: 'Deudas', puntaje: 0, id_pregunta: 21 },
            { id: 27, sub_id:4, texto: 'Otro ¿Cual?', puntaje: 0, id_pregunta: 21 },
        ]
    },
    {
        id: 22,//respuesta44
        nombre: '¿Los costos de su producto y/o servicio están claramente definidos?',
        puntaje: 0,
        id_seccion: 2,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 23,
        nombre: 'Si la anterior respuesta fue afirmativa: ¿Qué factores tiene en cuenta para definir el precio de su producto y/o servicio?',
        puntaje: 14,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 28, sub_id:1, texto: 'Costos', puntaje: 0, id_pregunta: 23 },//respuesta45
            { id: 29, sub_id:2, texto: 'Demanda', puntaje: 0, id_pregunta: 23 },
            { id: 30, sub_id:3, texto: 'Competencia', puntaje: 0, id_pregunta: 23 },
            { id: 31, sub_id:4, texto: 'Otro ¿Cual?', puntaje: 0, id_pregunta: 23 },
        ]
    },
    {
        id: 24,
        nombre: '¿Cuáles alternativas de financiamiento usa para apoyar su emprendimiento?',
        puntaje: 10,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 32, sub_id:1, texto: 'Prestamo Formal', puntaje: 0, id_pregunta: 24 },//respuesta49
            { id: 33, sub_id:2, texto: 'Prestamo Informal', puntaje: 0, id_pregunta: 24 },
            { id: 34, sub_id:3, texto: 'Disminuyendo Gastos', puntaje: 0, id_pregunta: 24 },
            { id: 35, sub_id:4, texto: 'Ahorros/Propios?', puntaje: 0, id_pregunta: 24 },
            { id: 36, sub_id:5, texto: 'Otro ¿Cual?', puntaje: 0, id_pregunta: 24 },
        ]
    },
    {
        id: 25,//respuesta54
        nombre: '¿Su producto y/o servicio presenta en la actualidad ventas?',
        puntaje: 0,
        id_seccion: 2,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 26,
        nombre: 'Si la anterior respuesta fue afirmativa: ¿Cuál es el valor promedio / estimado de las ventas al año?',
        puntaje: 15,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 37, sub_id:1, texto: 'Ingreso superior al egreso', puntaje: 0, id_pregunta: 26 },//respuesta55
            { id: 38, sub_id:2, texto: 'Ingreso igual al egreso', puntaje: 0, id_pregunta: 26 },
            { id: 39, sub_id:3, texto: 'Ingreso inferior al egreso', puntaje: 0, id_pregunta: 26 },
            { id: 40, sub_id:4, texto: 'No sabe', puntaje: 0, id_pregunta: 26 }
        ]
    },
    {
        id: 27,
        nombre: '¿Cuáles canales de ventas usa para comercializar su negocio?',
        puntaje: 10,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 41, sub_id:1,texto: 'Punto de venta', puntaje: 0, id_pregunta: 27 },//respuesta56
            { id: 42, sub_id:2,texto: 'Telemarketing', puntaje: 0, id_pregunta: 27 },
            { id: 43, sub_id:3,texto: 'Marketplace', puntaje: 0, id_pregunta: 27 },
            { id: 44, sub_id:4,texto: 'Ecommerce', puntaje: 0, id_pregunta: 27 },
            { id: 45, sub_id:5,texto: 'Otro ¿Cual?', puntaje: 0, id_pregunta: 27 }
        ]
    },
    {
        id: 28,//respuesta61
        nombre: '¿Sabe cuáles obligaciones aplican a su emprendimiento?',
        puntaje: 0,
        id_seccion: 2,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 29,
        nombre: 'Si la anterior respuesta fue afirmativa: ¿Cuáles?',
        puntaje: 6,
        id_seccion: 2,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 46, sub_id:1,texto: 'Iva', puntaje: 0, id_pregunta: 29 },//respuesta62
            { id: 47, sub_id:2,texto: 'Ica', puntaje: 0, id_pregunta: 29 },
            { id: 48, sub_id:3,texto: 'Retefuente', puntaje: 0, id_pregunta: 29 },
            { id: 49, sub_id:4,texto: 'Impuesto a la renta', puntaje: 0, id_pregunta: 29 },
        ]
    },
    {
        id: 30,//respuesta66
        nombre: '¿Tiene claramente definido sus clientes actuales?',
        puntaje: 25,
        id_seccion: 3,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 31,//respuesta67
        nombre: 'Si tiene clientes actuales:¿Quiénes son?',
        puntaje: 0,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: true,
        subPreguntas: []
    },
    {
        id: 32,//respuesta68
        nombre: '¿Tiene definido sus clientes potenciales?',
        puntaje: 20,
        id_seccion: 3,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 33,//respuesta69
        nombre: 'Si tiene definido sus clientes potenciales: ¿Quiénes son?',
        puntaje: 0,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: true,
        subPreguntas: []
    },
    {
        id: 34,//respuesta70
        nombre: '¿Tiene definido los competidores de su producto y/o servicio?',
        puntaje: 15,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 35,//respuesta71
        nombre: '¿Le gustaría ser cómo?',
        puntaje: 0,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: true,
        subPreguntas: []
    },
    {
        id: 36,//respuesta72
        nombre: '¿No te gustaría ser cómo?',
        puntaje: 0,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: true,
        subPreguntas: []
    },
    {
        id: 37,//respuesta73
        nombre: '¿Tiene identificado con claridad el factor diferencial de su empresa, producto y/o servicio?',
        puntaje: 20,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 38,//respuesta74
        nombre: '¿Ha participado en otras estrategias de fortalecimiento, semilla, aceleración y/o similares?',
        puntaje: 5,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 39,//respuesta75
        nombre: '¿Está dispuesto a realizar alianzas para la venta y/o distribución de sus productos, así como para la adquisición de equipos, insumos y/o materiales?',
        puntaje: 5,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 40,//respuesta76
        nombre: '¿Está dispuesto a realizar alianzas y/o convenios para el uso de equipos con otras instituciones y/u organizaciones para el desarrollo de productos?',
        puntaje: 5,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 41,//respuesta77
        nombre: '¿Está dispuesto a realizar alianza y/o convenios para recibir apoyo técnico especializado para el desarrollo de productos y/o servicios?',
        puntaje: 0,
        id_seccion: 3,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 42,//respuesta 78 - 108
        nombre: 'Definición de TRL',
        puntaje: 0,
        id_seccion: 4,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 50, sub_id:1 , texto: '¿La propuesta cuenta con una identificación básica de información científica susceptible de ser aplicada?', puntaje: 0, id_pregunta: 42 },
            { id: 51, sub_id:2,texto: '¿Tiene al menos una imagen general de lo que debe hacer su producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 52, sub_id:3,texto: '¿Tiene claridad en las necesidades para el desarrollo de su producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 53, sub_id:4,texto: '¿Se cuenta con un aparente diseño que dé solución a la oportunidad detectada?', puntaje: 0, id_pregunta: 42 },
            { id: 54, sub_id:5,texto: '¿Los elementos básicos del producto y/o servicio se encuentran identificados?', puntaje: 0, id_pregunta: 42 },
            { id: 55, sub_id:6,texto: '¿Se cuenta con experiencia en el desarrollo de producto y/o servicios similares?', puntaje: 0, id_pregunta: 42 },
            { id: 56, sub_id:7,texto: '¿Tiene algún cliente interesado ya en dicho producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 57, sub_id:8,texto: '¿Se tiene claro los requerimientos legales para la puesta en marcha del producto y o servicio propuesto?', puntaje: 0, id_pregunta: 42 },
            { id: 58, sub_id:9,texto: '¿El producto y/o servicio resuelve la necesidad del mercado de manera sostenible?', puntaje: 0, id_pregunta: 42 },
            { id: 59, sub_id:10,texto: '¿Se cuenta con un modelo/prototipo de simulación del producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 60, sub_id:11,texto: '¿Se tienen estrategias de mitigación de riesgos identificados?', puntaje: 0, id_pregunta: 42 },
            { id: 61, sub_id:12,texto: '¿Los diseños del producto y/o servicio ya se encuentra validados en entorno controlado?', puntaje: 0, id_pregunta: 42 },
            { id: 62, sub_id:13,texto: '¿Se conoce lo que se necesita para implementar producto y o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 63, sub_id:14,texto: '¿El producto y/o servicio fue validado por un laboratorio y está validación es favorable adecuada?', puntaje: 0, id_pregunta: 42 },
            { id: 64, sub_id:15,texto: '¿Los costos de la propuestas ya se encuentran analizados?', puntaje: 0, id_pregunta: 42 },
            { id: 65, sub_id:16,texto: '¿Tiene definidos los proveedores de insumos y materiales para la ejecución del producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 66, sub_id:17,texto: '¿Tiene definido criterios para la selección de proveedores?', puntaje: 0, id_pregunta: 42 },
            { id: 67, sub_id:18,texto: '¿El producto esta validado a nivel de detalle?', puntaje: 0, id_pregunta: 42 },
            { id: 68, sub_id:19,texto: '¿Han sido identificados los efectos adversos del producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 69, sub_id:20,texto: '¿El producto y/o servicio ha sido validad en un entorno real?', puntaje: 0, id_pregunta: 42 },
            { id: 70, sub_id:21,texto: '¿producto y/o servicio ya esta lista para la producción?', puntaje: 0, id_pregunta: 42 },
            { id: 71, sub_id:22,texto: '¿El producto y/o servicio cuenta con documentación de usuario, mantenimiento y de servicio especificadas y controladas?', puntaje: 0, id_pregunta: 42 },
            { id: 72, sub_id:23,texto: '¿El producto y/o servicio esta validado, comprobado y acreditado completamente?', puntaje: 0, id_pregunta: 42 },
            { id: 73, sub_id:24,texto: '¿El producto y/o servicio cuenta con una producción estable?', puntaje: 0, id_pregunta: 42 },
            { id: 74, sub_id:25,texto: '¿Se tiene la capacidad para desarrollar el producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 75, sub_id:26,texto: '¿Implementa planes de producción?', puntaje: 0, id_pregunta: 42 },
            { id: 76, sub_id:27,texto: '¿Implementa planes de compra?', puntaje: 0, id_pregunta: 42 },
            { id: 77, sub_id:28,texto: '¿El producto y/o servicio se encuentra implementado y funcionando?', puntaje: 0, id_pregunta: 42 },
            { id: 78, sub_id:29,texto: '¿Tienen parámetros de calidad definidos para su producto y/o servicio?', puntaje: 0, id_pregunta: 42 },
            { id: 79, sub_id:30,texto: '¿El producto y/o servicio cuenta con patente, propiedad intelectual y/o industrial registrada?', puntaje: 0, id_pregunta: 42 },
            { id: 80, sub_id:31,texto: '¿El producto y/o servicio cuenta con certificados de calidad, ambientales, otros?', puntaje: 0, id_pregunta: 42 },
        ]
    },
    {
        id: 43,//respuesta 109
        nombre: '¿Cuenta con área o departamento de innovación y/o desarrollo tecnológico?',
        puntaje: 0,
        id_seccion: 4,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: []
    },
    {
        id: 44,//respuesta 110
        nombre: '¿Tiene definidas las necesidades de su producto y/o servicio?',
        puntaje: 0,
        id_seccion: 4,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 45,//respuesta 111- 117
        nombre: 'Si la anterior respuesta fue afirmativa: ¿cuáles?',
        puntaje: 0,
        id_seccion: 4,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 81, sub_id:1, texto: 'Apoyo Tecnico', puntaje: 0, id_pregunta: 45 },
            { id: 82, sub_id:2, texto: 'Capacitación', puntaje: 0, id_pregunta: 45 },
            { id: 83, sub_id:3, texto: 'Financiamiento', puntaje: 0, id_pregunta: 45 },
            { id: 84, sub_id:4, texto: 'Redes/alianza', puntaje: 0, id_pregunta: 45 },
            { id: 85, sub_id:5, texto: 'Mejora de la calidad p/s', puntaje: 0, id_pregunta: 45 },
            { id: 86, sub_id:6, texto: 'Infraestructura', puntaje: 0, id_pregunta: 45 },
            { id: 87, sub_id:7, texto: 'Otros, ¿Cual?', puntaje: 0, id_pregunta: 45 },
        ]
    },
    {
        id: 46,//respuesta 118
        nombre: '¿Tiene definidas las necesidades de su emprendimiento (organizacional)?',
        puntaje: 0,
        id_seccion: 4,
        isAffirmativeQuestion: true,
        isText: false,
        subPreguntas: []
    },
    {
        id: 47,//respuesta 119 - 127
        nombre: 'Si la anterior respuesta fue afirmativa: ¿cuáles?',
        puntaje: 0,
        id_seccion: 4,
        isAffirmativeQuestion: false,
        isText: false,
        subPreguntas: [
            { id: 88, sub_id:1,texto: 'Apoyo Tecnico', puntaje: 0, id_pregunta: 47 },
            { id: 89, sub_id:2,texto: 'Capacitación', puntaje: 0, id_pregunta: 47 },
            { id: 90, sub_id:3,texto: 'Financiamiento', puntaje: 0, id_pregunta: 47 },
            { id: 91, sub_id:4,texto: 'Redes/alianza', puntaje: 0, id_pregunta: 47 },
            { id: 92, sub_id:5,texto: 'Infraestructura', puntaje: 0, id_pregunta: 47 },
            { id: 93, sub_id:6,texto: 'Aumento de clientes', puntaje: 0, id_pregunta: 47 },
            { id: 94, sub_id:7,texto: 'Bajar costos y/o gastos', puntaje: 0, id_pregunta: 47 },
            { id: 95, sub_id:8,texto: 'Mejorar ventas', puntaje: 0, id_pregunta: 47 },
            { id: 96, sub_id:9,texto: 'Otros, ¿Cual?', puntaje: 0, id_pregunta: 47 },
        ]
    }
];