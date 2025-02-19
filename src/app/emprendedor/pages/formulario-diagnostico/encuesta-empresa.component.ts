import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fa1, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { PREGUNTAS } from './preguntas.component';
import { AlertService } from '../../../servicios/alert.service';
import { RespuestasService } from '../../../servicios/respuestas.service';
import { Preguntas } from '../../../Modelos/preguntas.model';
import { Respuesta } from '../../../Modelos/respuesta.model';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';
import { PuntajesService } from '../../../servicios/puntajes.service';
import { Location } from '@angular/common';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-encuesta-empresa',
  templateUrl: './encuesta-empresa.component.html',
  styleUrls: ['./encuesta-empresa.component.css'],
  providers: [RespuestasService]
})

export class EncuestaEmpresaComponent {
  fa1 = fa1;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  preguntas: Preguntas[] = PREGUNTAS;
  firstForm: Object = {};
  section: number = 1;
  user: User;
  token = '';
  id: number | null = null;
  currentRolId: number;
  currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  subSectionPerSection: number[] = [3, 3, 2, 6, 1];
  progressPercentage: number = 0;
  documento: string;
  id_pregunta: number;
  id_subpregunta: number | null = null;
  listaRespuestas1: Respuesta[] = [];
  listaRespuestas2: Respuesta[] = [];
  listaRespuestas3: Respuesta[] = [];
  listaRespuestas4: Respuesta[] = [];
  listaRespuestas5: Respuesta[] = [];
  respuestasCache: any = {};
  falupa = faCircleQuestion;
  buttonMessage: string = "Guardar";
  isSubmitting: boolean = false;

  isSectionSaved: { [key: number]: boolean } = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  };

  acumXSeccion1: number = 0;
  acumXSeccion2: number = 0;
  acumXSeccion3: number = 0;
  acumXTrl: number = 0;
  acumXTecnica: number = 0;
  id_empresa: number | null = null;
  maxTrl: number = 0;

  respuesta1: Respuesta = new Respuesta({});
  respuesta2: Respuesta = new Respuesta({});
  respuesta3: Respuesta = new Respuesta({});
  respuesta4: Respuesta = new Respuesta({});
  respuesta5: Respuesta = new Respuesta({});
  respuesta6: Respuesta = new Respuesta({});
  respuesta7: Respuesta = new Respuesta({});
  respuesta8: Respuesta = new Respuesta({});
  respuesta9: Respuesta = new Respuesta({});
  respuesta10: Respuesta = new Respuesta({});
  respuesta11: Respuesta = new Respuesta({});
  respuesta12: Respuesta = new Respuesta({});
  respuesta13: Respuesta = new Respuesta({});
  respuesta14: Respuesta = new Respuesta({});
  respuesta15: Respuesta = new Respuesta({});
  respuesta16: Respuesta = new Respuesta({});
  respuesta17: Respuesta = new Respuesta({});
  respuesta18: Respuesta = new Respuesta({});
  respuesta19: Respuesta = new Respuesta({});
  respuesta20: Respuesta = new Respuesta({});
  respuesta21: Respuesta = new Respuesta({});
  respuesta22: Respuesta = new Respuesta({});
  respuesta23: Respuesta = new Respuesta({});
  //Seccion 2
  respuesta24: Respuesta = new Respuesta({});//pregunta 16
  respuesta25: Respuesta = new Respuesta({});//Subpregunta 17-11
  respuesta26: Respuesta = new Respuesta({});//Subpregunta 17-12
  respuesta27: Respuesta = new Respuesta({});//Subpregunta 17-13
  respuesta28: Respuesta = new Respuesta({});//Subpregunta 17-14
  respuesta29: Respuesta = new Respuesta({});//Subpregunta 17-15
  respuesta30: Respuesta = new Respuesta({});//Subpregunta 17-16
  respuesta31: Respuesta = new Respuesta({});//Subpregunta 17-17
  respuesta32: Respuesta = new Respuesta({});//Subpregunta 17-18 -bien
  respuesta33: Respuesta = new Respuesta({});//pregunta 18
  respuesta34: Respuesta = new Respuesta({});//Subpregunta 19-19
  respuesta35: Respuesta = new Respuesta({});//Subpregunta 19-20156
  respuesta36: Respuesta = new Respuesta({});//Subpregunta 19-21
  respuesta37: Respuesta = new Respuesta({});//Subpregunta 19-22
  respuesta38: Respuesta = new Respuesta({});//Subpregunta 19-23
  respuesta39: Respuesta = new Respuesta({});//pregunta 20
  respuesta40: Respuesta = new Respuesta({});//Subpregunta 21-24
  respuesta41: Respuesta = new Respuesta({});//Subpregunta 21-25
  respuesta42: Respuesta = new Respuesta({});//Subpregunta 21-26
  respuesta43: Respuesta = new Respuesta({});//Subpregunta 21-27
  respuesta44: Respuesta = new Respuesta({});//Pregunta 22
  respuesta45: Respuesta = new Respuesta({});//Subpregunta 23-28
  respuesta46: Respuesta = new Respuesta({});//Subpregunta 23-29
  respuesta47: Respuesta = new Respuesta({});//Subpregunta 23-30
  respuesta48: Respuesta = new Respuesta({});//Subpregunta 23-31
  respuesta49: Respuesta = new Respuesta({});//Subpregunta 24-32
  respuesta50: Respuesta = new Respuesta({});//Subpregunta 24-33
  respuesta51: Respuesta = new Respuesta({});//Subpregunta 24-34
  respuesta52: Respuesta = new Respuesta({});//Subpregunta 24-35
  respuesta53: Respuesta = new Respuesta({});//Subpregunta 24-36
  respuesta54: Respuesta = new Respuesta({});//pregunta 25
  respuesta55: Respuesta = new Respuesta({});//pregunta 26 -bien
  respuesta56: Respuesta = new Respuesta({});//Subpregunta 27-41
  respuesta57: Respuesta = new Respuesta({});//Subpregunta 27-42
  respuesta58: Respuesta = new Respuesta({});//Subpregunta 27-43
  respuesta59: Respuesta = new Respuesta({});//Subpregunta 27-44
  respuesta60: Respuesta = new Respuesta({});//Subpregunta 27-45
  respuesta61: Respuesta = new Respuesta({});//pregunta 28
  respuesta62: Respuesta = new Respuesta({});//Subpregunta 29-46
  respuesta63: Respuesta = new Respuesta({});//Subpregunta 29-47
  respuesta64: Respuesta = new Respuesta({});//Subpregunta 29-48
  respuesta65: Respuesta = new Respuesta({});//Subpregunta 29-49
  //Seccion 3
  respuesta66: Respuesta = new Respuesta({});//pregunta 30
  respuesta67: Respuesta = new Respuesta({});//pregunta 31
  respuesta68: Respuesta = new Respuesta({});//pregunta 32
  respuesta69: Respuesta = new Respuesta({});//pregunta 33
  respuesta70: Respuesta = new Respuesta({});//pregunta 34
  respuesta71: Respuesta = new Respuesta({});//pregunta 35
  respuesta72: Respuesta = new Respuesta({});//pregunta 36
  respuesta73: Respuesta = new Respuesta({});//pregunta 37
  respuesta74: Respuesta = new Respuesta({});//pregunta 38
  respuesta75: Respuesta = new Respuesta({});//pregunta 39
  respuesta76: Respuesta = new Respuesta({});//pregunta 40
  respuesta77: Respuesta = new Respuesta({});//pregunta 41
  //Seccion TRL
  respuesta78: Respuesta = new Respuesta({});//subpregunta 42-50
  respuesta79: Respuesta = new Respuesta({});//subpregunta 42-51
  respuesta80: Respuesta = new Respuesta({});//subpregunta 42-52
  respuesta81: Respuesta = new Respuesta({});//subpregunta 42-53
  respuesta82: Respuesta = new Respuesta({});//subpregunta 42-54
  respuesta83: Respuesta = new Respuesta({});//subpregunta 42-55
  respuesta84: Respuesta = new Respuesta({});//subpregunta 42-56
  respuesta85: Respuesta = new Respuesta({});//subpregunta 42-57
  respuesta86: Respuesta = new Respuesta({});//subpregunta 42-58
  respuesta87: Respuesta = new Respuesta({});//subpregunta 42-59
  respuesta88: Respuesta = new Respuesta({});//subpregunta 42-60
  respuesta89: Respuesta = new Respuesta({});//subpregunta 42-61
  respuesta90: Respuesta = new Respuesta({});//subpregunta 42-62
  respuesta91: Respuesta = new Respuesta({});//subpregunta 42-63
  respuesta92: Respuesta = new Respuesta({});//subpregunta 42-64
  respuesta93: Respuesta = new Respuesta({});//subpregunta 42-65
  respuesta94: Respuesta = new Respuesta({});//subpregunta 42-66
  respuesta95: Respuesta = new Respuesta({});//subpregunta 42-67
  respuesta96: Respuesta = new Respuesta({});//subpregunta 42-68
  respuesta97: Respuesta = new Respuesta({});//subpregunta 42-69
  respuesta98: Respuesta = new Respuesta({});//subpregunta 42-70
  respuesta99: Respuesta = new Respuesta({});//subpregunta 42-71
  respuesta100: Respuesta = new Respuesta({});//subpregunta 42-72
  respuesta101: Respuesta = new Respuesta({});//subpregunta 42-73
  respuesta102: Respuesta = new Respuesta({});//subpregunta 42-74
  respuesta103: Respuesta = new Respuesta({});//subpregunta 42-75
  respuesta104: Respuesta = new Respuesta({});//subpregunta 42-76
  respuesta105: Respuesta = new Respuesta({});//subpregunta 42-77
  respuesta106: Respuesta = new Respuesta({});//subpregunta 42-78
  respuesta107: Respuesta = new Respuesta({});//subpregunta 42-79
  respuesta108: Respuesta = new Respuesta({});//subpregunta 42-80
  respuesta109: Respuesta = new Respuesta({});//pregunta 43
  respuesta110: Respuesta = new Respuesta({});//pregunta 44
  respuesta111: Respuesta = new Respuesta({});//subpregunta 45-81
  respuesta112: Respuesta = new Respuesta({});//subpregunta 45-82
  respuesta113: Respuesta = new Respuesta({});//subpregunta 45-83
  respuesta114: Respuesta = new Respuesta({});//subpregunta 45-84
  respuesta115: Respuesta = new Respuesta({});//subpregunta 45-85
  respuesta116: Respuesta = new Respuesta({});//subpregunta 45-86
  respuesta117: Respuesta = new Respuesta({});//subpregunta 45-87
  respuesta118: Respuesta = new Respuesta({});//pregunta 46
  respuesta119: Respuesta = new Respuesta({});//subpregunta 47-88
  respuesta120: Respuesta = new Respuesta({});//subpregunta 47-89
  respuesta121: Respuesta = new Respuesta({});//subpregunta 47-90
  respuesta122: Respuesta = new Respuesta({});//subpregunta 47-91
  respuesta123: Respuesta = new Respuesta({});//subpregunta 47-92
  respuesta124: Respuesta = new Respuesta({});//subpregunta 47-93
  respuesta125: Respuesta = new Respuesta({});//subpregunta 47-94
  respuesta126: Respuesta = new Respuesta({});//subpregunta 47-95
  respuesta127: Respuesta = new Respuesta({});//subpregunta 47-96



  constructor(
    private respuestasService: RespuestasService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private puntajeService: PuntajesService,
    private location: Location
  ) { }


  /* Inicializa con esas funciones al cargar la pagina */
  ngOnInit() {
    this.updateProgress();
    this.validateToken();
    this.route.paramMap.subscribe(params => {
      this.id_empresa = +params.get('id');
    });
    this.cargarRespuestasCache();
  }

  /* Valida el token del login */
  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem("token");
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);

        this.user = identity;
        this.id = this.user.id_rol;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 5) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

/*
  Regresa a la ubicación anterior en el historial de navegación.
*/
  goBack(): void {
    this.location.back();
    this.alertService.successAlert('Info', 'Se guardaran las secciones que esten completas por 5 días, despues sera borrado');
  }

/*
  Valida y procesa las respuestas de la sección 1 del formulario. 
  Asigna valores a las respuestas, acumula puntajes y verifica la validez del formulario.
*/
  onSubmitSeccion1(): boolean {

    this.id_empresa;
    let respCounter = 0;
    let isValidForm = true;
    this.listaRespuestas1 = [];
    this.acumXSeccion1 = 0;

    let totalXpregunta: number = 0;
    //Mapeo de valores 
    const valorPorOpcion = {
      '-1': 2.5,
      '1 y 2': 5,
      '2 y 4': 7.5,
      '5+': 10
    };

    const valorPorOpcionQ13 = {
      'Si': 5,
      'No': 0,
      'Medio': 2.5,
    }


    //pregunta 1
    this.listaRespuestas1.push(this.respuesta1);
    //pregunta 2
    this.listaRespuestas1.push(this.respuesta2);
    this.listaRespuestas1.push(this.respuesta3);
    this.listaRespuestas1.push(this.respuesta4);
    this.listaRespuestas1.push(this.respuesta5);
    this.listaRespuestas1.push(this.respuesta6);
    //fin pregunta 2
    //pregunta 3
    this.respuesta7.valor = this.respuesta7.opcion === 'Si' ? 10 : 0;
    this.listaRespuestas1.push(this.respuesta7);
    //pregunta 4
    this.respuesta8.valor = this.respuesta8.opcion === 'Si' ? 5 : 0;
    this.listaRespuestas1.push(this.respuesta8);
    //pregunta 5
    this.respuesta9.valor = this.respuesta9.opcion === 'Si' ? 20 : 0;
    this.listaRespuestas1.push(this.respuesta9);
    //pregunta 6
    this.respuesta10.valor = this.respuesta10.opcion === 'Si' ? 15 : this.respuesta10.opcion === 'Medio' ? 7.5 : 0;
    this.listaRespuestas1.push(this.respuesta10);
    //pregunta 7
    this.respuesta11.valor = this.respuesta11.opcion === 'Si' ? 10 : this.respuesta11.opcion === 'Medio' ? 5.0 : 0;
    this.listaRespuestas1.push(this.respuesta11);
    //pregunta 8
    this.respuesta12.valor = valorPorOpcion[this.respuesta12.opcion] || 0;
    this.listaRespuestas1.push(this.respuesta12);
    //pregunta 9
    this.respuesta13.valor = this.respuesta13.opcion === 'Si' ? 2.0 : 0;
    this.listaRespuestas1.push(this.respuesta13);
    if (this.respuesta13.opcion === 'Si') {
      this.listaRespuestas1.push(this.respuesta14);
      this.listaRespuestas1.push(this.respuesta15);
    } else {
      this.respuesta14.opcion = 'N/A';
      this.respuesta14.texto_res = 'N/A';
      this.respuesta14.valor = 0;
      this.respuesta14.id_pregunta = 10
      this.listaRespuestas1.push(this.respuesta14);
      this.respuesta15.opcion = 'N/A';
      this.respuesta15.valor = 0;
      this.respuesta15.texto_res = 'N/A';
      this.respuesta15.id_pregunta = 11
      this.listaRespuestas1.push(this.respuesta15);
    }
    //pregunta 12
    this.respuesta16.valor = this.respuesta16.opcion === 'Si' ? 2.0 : 0;
    this.listaRespuestas1.push(this.respuesta16);
    if (this.respuesta16.opcion === 'Si') {
      this.listaRespuestas1.push(this.respuesta17);
      this.listaRespuestas1.push(this.respuesta18);
      this.listaRespuestas1.push(this.respuesta19);
      this.listaRespuestas1.push(this.respuesta20);
    } else {
      this.respuesta17.texto_res = 'N/A';
      this.respuesta17.opcion = 'N/A';
      this.respuesta17.valor = 0;
      this.respuesta17.id_pregunta = 12;
      this.respuesta17.id_subpregunta = 7
      this.listaRespuestas1.push(this.respuesta17);
      this.respuesta18.texto_res = 'N/A';
      this.respuesta18.opcion = 'N/A';
      this.respuesta18.valor = 0;
      this.respuesta17.id_pregunta = 12;
      this.respuesta18.id_subpregunta = 8
      this.listaRespuestas1.push(this.respuesta18);
      this.respuesta19.texto_res = 'N/A';
      this.respuesta19.opcion = 'N/A';
      this.respuesta19.valor = 0;
      this.respuesta17.id_pregunta = 12;
      this.respuesta19.id_subpregunta = 9
      this.listaRespuestas1.push(this.respuesta19);
      this.respuesta20.texto_res = 'N/A';
      this.respuesta20.opcion = 'N/A';
      this.respuesta20.valor = 0;
      this.respuesta17.id_pregunta = 12;
      this.respuesta20.id_subpregunta = 10
      this.listaRespuestas1.push(this.respuesta20);
    }
    //pregunta 13
    this.respuesta21.valor = valorPorOpcionQ13[this.respuesta21.opcion] || 0;
    this.listaRespuestas1.push(this.respuesta21);
    //pregunta 14
    this.respuesta22.valor = this.respuesta22.opcion === 'Si' ? 4.0 : this.respuesta22.opcion === 'Medio' ? 2.0 : 0;
    this.listaRespuestas1.push(this.respuesta22);
    //pregunta 15
    this.respuesta23.valor = this.respuesta23.opcion === 'Si' ? 4.0 : this.respuesta23.opcion === 'Medio' ? 2.0 : 0;
    this.listaRespuestas1.push(this.respuesta23);


    for (let i = 0; i < 15; i++) {
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas1[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas1[respCounter].id_empresa = this.id_empresa;
      this.listaRespuestas1[respCounter].id_subpregunta = null;
      totalXpregunta = this.listaRespuestas1[respCounter].valor;
      this.acumXSeccion1 += totalXpregunta;

      //Validación de pregunta 2 con subpreguntas
      if (currentPregunta.id === 2) {
        for (let j = 0; j < currentPregunta.subPreguntas.length; j++) {
          const respuestaActual = this.listaRespuestas1[respCounter + j];
          if (!respuestaActual.opcion || respuestaActual.opcion === '') {
            this.alertService.errorAlert('Error', `La subpregunta ${currentPregunta.subPreguntas[j].id} de la pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            return false;
          }
          if (respuestaActual.opcion !== 'Si') {
            respuestaActual.texto_res = '0';
            respuestaActual.valor = 0;
          } else {
            const numeroPersonas = parseInt(respuestaActual.texto_res, 10);
            switch (numeroPersonas) {
              case 1:
                respuestaActual.valor = 0.5;
                break;
              case 2:
                respuestaActual.valor = 1.5;
                break;
              case 3:
                respuestaActual.valor = 3.5;
                break;
              case 4:
                respuestaActual.valor = 4.5;
                break;
              case 5:
                respuestaActual.valor = 5.0;
                break;
              default:
                respuestaActual.valor = 0;
            }
          }
          respuestaActual.id_pregunta = currentPregunta.id;
          respuestaActual.id_subpregunta = currentPregunta.subPreguntas[j].id;
          totalXpregunta += respuestaActual.valor;
        }
        this.acumXSeccion1 += totalXpregunta;
        respCounter += currentPregunta.subPreguntas.length;
        continue;
      } else if (currentPregunta.id === 9) {
        if (!this.listaRespuestas1[respCounter].opcion || this.listaRespuestas1[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          return false;
        } else if (this.listaRespuestas1[respCounter].opcion === 'No') {
          i += 2;
          respCounter += 2;
        }
        respCounter++;
      } else if (currentPregunta.id === 10 || currentPregunta.id === 11) {
        if (!this.listaRespuestas1[respCounter].texto_res || this.listaRespuestas1[respCounter].texto_res.trim() === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
        respCounter++;
      } else if (currentPregunta.id === 12) {
        if (!this.listaRespuestas1[respCounter].opcion || this.listaRespuestas1[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        } else if (this.listaRespuestas1[respCounter].opcion === 'Si') {
          for (let k = 0; k < currentPregunta.subPreguntas.length; k++) {
            this.listaRespuestas1[respCounter + 1 + k].id_pregunta = currentPregunta.id;
            this.listaRespuestas1[respCounter + 1 + k].id_subpregunta = currentPregunta.subPreguntas[k].id;
          }
          respCounter += currentPregunta.subPreguntas.length;
        } else if (this.listaRespuestas1[respCounter].opcion === 'No') {
          respCounter += 4;
        }
        respCounter++;
      } else {
        if (currentPregunta.isText) {
          if (!this.listaRespuestas1[respCounter].texto_res || this.listaRespuestas1[respCounter].texto_res.trim() === '' || this.listaRespuestas1[respCounter].texto_res !== 'N/A') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            return false;
          }
        } else {
          if (!this.listaRespuestas1[respCounter].opcion || this.listaRespuestas1[respCounter].opcion === '') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            return false;
          }
        }
        respCounter++;
      }
    }
    if (!isValidForm) {
      return false;
    }
    this.next();
    this.saveSection(1, this.listaRespuestas1);
    return isValidForm;
  }


  //Seccion 2
  onSubmitSeccion2(): boolean {

    let respCounter = 0;
    let isValidForm = true;
    this.id_empresa;
    this.listaRespuestas2 = [];
    let totalXpregunta: number = 0;
    this.acumXSeccion2 = 0;

    const valorRespuesta26 = {
      'Ingreso superior al egreso': 15.0,
      'Ingreso igual al egreso': 10.0,
      'Ingreso inferior al egreso': 5.0,
      'No sabe': 1
    }

    //Pregunta 16 y 17
    this.listaRespuestas2.push(this.respuesta24);
    if (this.respuesta24.opcion === 'Si') {
      this.respuesta25.valor = this.respuesta25.opcion === 'Si' ? 1.9 : this.respuesta25.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta25);
      this.respuesta26.valor = this.respuesta26.opcion === 'Si' ? 1.9 : this.respuesta26.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta26);
      this.respuesta27.valor = this.respuesta27.opcion === 'Si' ? 1.9 : this.respuesta27.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta27);
      this.respuesta28.valor = this.respuesta28.opcion === 'Si' ? 1.9 : this.respuesta28.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta28);
      this.respuesta29.valor = this.respuesta29.opcion === 'Si' ? 1.9 : this.respuesta29.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta29);
      this.respuesta30.valor = this.respuesta30.opcion === 'Si' ? 1.9 : this.respuesta30.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta30);
      this.respuesta31.valor = this.respuesta31.opcion === 'Si' ? 1.9 : this.respuesta31.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta31);
      this.respuesta32.valor = this.respuesta32.opcion === 'Si' ? 1.9 : this.respuesta32.opcion === 'Medio' ? 0.9 : 0;
      this.listaRespuestas2.push(this.respuesta32);//9
    } else {
      this.respuesta25.texto_res = 'N/A';
      this.respuesta25.id_pregunta = 17;
      this.respuesta25.id_subpregunta = 11;
      this.listaRespuestas2.push(this.respuesta25);
      this.respuesta26.texto_res = 'N/A';
      this.respuesta26.id_pregunta = 17;
      this.respuesta26.id_subpregunta = 12;
      this.listaRespuestas2.push(this.respuesta26);
      this.respuesta27.texto_res = 'N/A';
      this.respuesta27.id_pregunta = 17;
      this.respuesta27.id_subpregunta = 13;
      this.listaRespuestas2.push(this.respuesta27);
      this.respuesta28.texto_res = 'N/A';
      this.respuesta28.id_pregunta = 17;
      this.respuesta28.id_subpregunta = 14;
      this.listaRespuestas2.push(this.respuesta28);
      this.respuesta29.texto_res = 'N/A';
      this.respuesta29.id_pregunta = 17;
      this.respuesta29.id_subpregunta = 15;
      this.listaRespuestas2.push(this.respuesta29);
      this.respuesta30.texto_res = 'N/A';
      this.respuesta30.id_pregunta = 17;
      this.respuesta30.id_subpregunta = 16;
      this.listaRespuestas2.push(this.respuesta30);
      this.respuesta31.texto_res = 'N/A';
      this.respuesta31.id_pregunta = 17;
      this.respuesta31.id_subpregunta = 17;
      this.listaRespuestas2.push(this.respuesta31);
      this.respuesta32.texto_res = 'N/A';
      this.respuesta32.id_pregunta = 17;
      this.respuesta32.id_subpregunta = 18;
      this.listaRespuestas2.push(this.respuesta32);
    }
    //pregunta 18 y 19
    this.listaRespuestas2.push(this.respuesta33);//10
    if (this.respuesta33.opcion === 'Si') {
      this.respuesta34.opcion === 'Si' ? this.respuesta34.valor = 2.5 : 0;
      this.listaRespuestas2.push(this.respuesta34);
      this.respuesta35.opcion === 'Si' ? this.respuesta34.valor = 2.5 : 0;
      this.listaRespuestas2.push(this.respuesta35);
      this.respuesta36.opcion === 'Si' ? this.respuesta34.valor = 2.5 : 0;
      this.listaRespuestas2.push(this.respuesta36);
      this.respuesta37.opcion === 'Si' ? this.respuesta34.valor = 2.5 : 0;
      this.listaRespuestas2.push(this.respuesta37);
      this.respuesta38.opcion === 'Si' ? this.respuesta34.valor = 2.5 : 0;
      this.listaRespuestas2.push(this.respuesta38);//15
    } else {
      this.respuesta34.texto_res = 'N/A';
      this.respuesta34.id_pregunta = 19;
      this.respuesta34.id_subpregunta = 19;
      this.listaRespuestas2.push(this.respuesta34);
      this.respuesta35.texto_res = 'N/A';
      this.respuesta35.id_pregunta = 19;
      this.respuesta35.id_subpregunta = 20;
      this.listaRespuestas2.push(this.respuesta35);
      this.respuesta36.texto_res = 'N/A';
      this.respuesta36.id_pregunta = 19;
      this.respuesta36.id_subpregunta = 21;
      this.listaRespuestas2.push(this.respuesta36);
      this.respuesta37.texto_res = 'N/A';
      this.respuesta37.id_pregunta = 19;
      this.respuesta37.id_subpregunta = 22;
      this.listaRespuestas2.push(this.respuesta37);
      this.respuesta38.texto_res = 'N/A';
      this.respuesta38.id_pregunta = 19;
      this.respuesta38.id_subpregunta = 23;
      this.listaRespuestas2.push(this.respuesta38);
    }
    //pregunta 20 y 21
    this.listaRespuestas2.push(this.respuesta39);//16
    if (this.respuesta39.opcion === 'Si') {
      this.respuesta40.valor = this.respuesta40.opcion === 'Si' ? 6.7 : this.respuesta40.opcion === 'Medio' ? 3.3 : 0;
      this.listaRespuestas2.push(this.respuesta40);
      this.respuesta41.valor = this.respuesta41.opcion === 'Si' ? 6.7 : this.respuesta41.opcion === 'Medio' ? 3.3 : 0;
      this.listaRespuestas2.push(this.respuesta41);
      this.respuesta42.valor = this.respuesta42.opcion === 'Si' ? 6.7 : this.respuesta42.opcion === 'Medio' ? 3.3 : 0;
      this.listaRespuestas2.push(this.respuesta42);
      this.respuesta43.valor = this.respuesta43.opcion === 'Si' ? 6.7 : this.respuesta43.opcion === 'Medio' ? 3.3 : 0;
      this.listaRespuestas2.push(this.respuesta43);//20
    } else {
      this.respuesta40.texto_res = 'N/A';
      this.respuesta40.id_pregunta = 21;
      this.respuesta40.id_subpregunta = 24;
      this.listaRespuestas2.push(this.respuesta40);
      this.respuesta41.texto_res = 'N/A';
      this.respuesta41.id_pregunta = 21;
      this.respuesta41.id_subpregunta = 25;
      this.listaRespuestas2.push(this.respuesta41);
      this.respuesta42.texto_res = 'N/A';
      this.respuesta42.id_pregunta = 21;
      this.respuesta42.id_subpregunta = 26;
      this.listaRespuestas2.push(this.respuesta42);
      this.respuesta43.texto_res = 'N/A';
      this.respuesta43.id_pregunta = 21;
      this.respuesta43.id_subpregunta = 27;
      this.listaRespuestas2.push(this.respuesta43);
    }
    //pregunta 22 y 23
    this.listaRespuestas2.push(this.respuesta44);
    if (this.respuesta44.opcion === 'Si') {
      this.respuesta45.valor = this.respuesta45.opcion === 'Si' ? 4.7 : this.respuesta45.opcion === 'Medio' ? 2.3 : 0;
      this.listaRespuestas2.push(this.respuesta45);
      this.respuesta46.valor = this.respuesta46.opcion === 'Si' ? 4.7 : this.respuesta46.opcion === 'Medio' ? 2.3 : 0;
      this.listaRespuestas2.push(this.respuesta46);
      this.respuesta47.valor = this.respuesta47.opcion === 'Si' ? 4.7 : this.respuesta47.opcion === 'Medio' ? 2.3 : 0;
      this.listaRespuestas2.push(this.respuesta47);
      this.respuesta48.valor = this.respuesta48.opcion === 'Si' ? 4.7 : this.respuesta48.opcion === 'Medio' ? 2.3 : 0;
      this.listaRespuestas2.push(this.respuesta48);//25
    } else {
      this.respuesta45.texto_res = 'N/A';
      this.respuesta45.id_pregunta = 23;
      this.respuesta45.id_subpregunta = 28;
      this.listaRespuestas2.push(this.respuesta45);
      this.respuesta46.texto_res = 'N/A';
      this.respuesta46.id_pregunta = 23;
      this.respuesta46.id_subpregunta = 29;
      this.listaRespuestas2.push(this.respuesta46);
      this.respuesta47.texto_res = 'N/A';
      this.respuesta47.id_pregunta = 23;
      this.respuesta47.id_subpregunta = 30;
      this.listaRespuestas2.push(this.respuesta47);
      this.respuesta48.texto_res = 'N/A';
      this.respuesta48.id_pregunta = 23;
      this.respuesta48.id_subpregunta = 31;
      this.listaRespuestas2.push(this.respuesta48);
    }
    //pregunta 24 
    this.respuesta49.valor = this.respuesta49.opcion === 'Si' ? 2.5 : 0;
    this.listaRespuestas2.push(this.respuesta49);
    this.respuesta50.valor = this.respuesta50.opcion === 'Si' ? 1.5 : 0;
    this.listaRespuestas2.push(this.respuesta50);
    this.respuesta51.valor = this.respuesta51.opcion === 'Si' ? 3.0 : 0;
    this.listaRespuestas2.push(this.respuesta51);
    this.respuesta52.valor = this.respuesta52.opcion === 'Si' ? 3.0 : 0;
    this.listaRespuestas2.push(this.respuesta52);
    this.listaRespuestas2.push(this.respuesta53);//30

    //pregunta 25 y 26
    this.listaRespuestas2.push(this.respuesta54);
    if (this.respuesta54.opcion === 'Si') {
      this.respuesta55.valor = valorRespuesta26[this.respuesta55.opcion];
      this.listaRespuestas2.push(this.respuesta55);//32
    }
    //pregunta27
    this.respuesta56.opcion === 'Si' ? this.respuesta56.valor = 2.5 : 0;
    this.listaRespuestas2.push(this.respuesta56);
    this.respuesta57.opcion === 'Si' ? this.respuesta57.valor = 2.5 : 0;
    this.listaRespuestas2.push(this.respuesta57);
    this.respuesta58.opcion === 'Si' ? this.respuesta58.valor = 2.5 : 0;
    this.listaRespuestas2.push(this.respuesta58);
    this.respuesta59.opcion === 'Si' ? this.respuesta59.valor = 2.5 : 0;
    this.listaRespuestas2.push(this.respuesta59);
    this.respuesta60.opcion === 'Si' ? this.respuesta60.valor = 2.5 : 0;
    this.listaRespuestas2.push(this.respuesta60);//37
    //pregunta 28 y 29
    this.listaRespuestas2.push(this.respuesta61);
    if (this.respuesta61.opcion === 'Si') {
      this.respuesta62.opcion === 'Si' ? this.respuesta62.valor = 1.5 : 0;
      this.listaRespuestas2.push(this.respuesta62);
      this.respuesta63.opcion === 'Si' ? this.respuesta63.valor = 1.5 : 0;
      this.listaRespuestas2.push(this.respuesta63);
      this.respuesta64.opcion === 'Si' ? this.respuesta64.valor = 1.5 : 0;
      this.listaRespuestas2.push(this.respuesta64);
      this.respuesta65.opcion === 'Si' ? this.respuesta65.valor = 1.5 : 0;
      this.listaRespuestas2.push(this.respuesta65);//42
    } else {
      this.respuesta62.texto_res = 'N/A';
      this.respuesta62.id_pregunta = 29;
      this.respuesta62.id_subpregunta = 46;
      this.listaRespuestas2.push(this.respuesta62);
      this.respuesta63.texto_res = 'N/A';
      this.respuesta63.id_pregunta = 29;
      this.respuesta63.id_subpregunta = 47;
      this.listaRespuestas2.push(this.respuesta63);
      this.respuesta64.texto_res = 'N/A';
      this.respuesta64.id_pregunta = 29;
      this.respuesta64.id_subpregunta = 48;
      this.listaRespuestas2.push(this.respuesta64);
      this.respuesta65.texto_res = 'N/A';
      this.respuesta65.id_pregunta = 29;
      this.respuesta65.id_subpregunta = 49;
      this.listaRespuestas2.push(this.respuesta65);
    }

    for (let i = 15; i < 28; i++) {
      debugger
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas2[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas2[respCounter].id_empresa = this.id_empresa;
      this.listaRespuestas2[respCounter].id_subpregunta = null;
      totalXpregunta = this.listaRespuestas2[respCounter].valor;
      this.acumXSeccion2 += totalXpregunta;

      if (currentPregunta.isAffirmativeQuestion) {
        if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
        const nextPregunta = PREGUNTAS[i + 1];
        if (this.listaRespuestas2[respCounter].opcion === 'Si') {
          let subPreguntaCounter = 0; // Contador para las subpreguntas

          for (let j = 0; j < nextPregunta.subPreguntas.length; j++) {
            const respuestaActual = this.listaRespuestas2[respCounter + 1 + subPreguntaCounter];

            if (!respuestaActual.opcion || respuestaActual.opcion === '') {
              this.alertService.errorAlert('Error', `La subpregunta ${nextPregunta.subPreguntas[j].id} de la pregunta ${nextPregunta.id} está vacía.`);
              isValidForm = false;
              return false;
            }
            // Asignar valores a la respuesta actual
            this.listaRespuestas2[respCounter + 1 + subPreguntaCounter].id_pregunta = nextPregunta.id;
            this.listaRespuestas2[respCounter + 1 + subPreguntaCounter].id_subpregunta = nextPregunta.subPreguntas[j].id;
            this.listaRespuestas2[respCounter + 1 + subPreguntaCounter].id_empresa = this.id_empresa;
            totalXpregunta += this.listaRespuestas2[respCounter + 1 + subPreguntaCounter].valor;
            subPreguntaCounter++;
          }
          this.acumXSeccion2 += totalXpregunta;
          respCounter += subPreguntaCounter + 1;
        }
        else if (this.listaRespuestas2[respCounter].opcion === 'No') {
          respCounter += nextPregunta.subPreguntas.length + 1;
        }
      }

      if (currentPregunta.id === 24) {
        if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        } else {
          for (let j = 0; j < currentPregunta.subPreguntas.length; j++) {
            this.listaRespuestas2[respCounter + j].id_pregunta = currentPregunta.id;
            this.listaRespuestas2[respCounter + j].id_subpregunta = currentPregunta.subPreguntas[j].id;
            this.listaRespuestas2[respCounter + j].id_empresa = this.id_empresa;
            totalXpregunta += this.listaRespuestas2[respCounter + j].valor;
          }
          this.acumXSeccion2 += totalXpregunta;
          respCounter += currentPregunta.subPreguntas.length - 1;
        }
        respCounter++;
        continue;
      }

      if (currentPregunta.id === 25) {
        if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        } else if (this.listaRespuestas2[respCounter].opcion === 'No') {
          i += 1;
          respCounter += 1;
        } else if (this.listaRespuestas2[respCounter].opcion === 'Si') {
          respCounter++;
          continue;
        }
      }

      if (currentPregunta.id === 26) {
        if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
        this.acumXSeccion2 += this.listaRespuestas2[respCounter].valor;
        respCounter++;
        continue;
      }



      if (currentPregunta.id === 27) {
        if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        } else {
          for (let h = 0; h < currentPregunta.subPreguntas.length; h++) {
            const subPreguntaIndex = respCounter + h;
            const respuestaActual = this.listaRespuestas2[respCounter + h];
            if (!respuestaActual.opcion || respuestaActual.opcion === '') {
              this.alertService.errorAlert('Error', `La subpregunta ${currentPregunta.subPreguntas[h].id} de la pregunta ${currentPregunta.id} está vacía.`);
              isValidForm = false;
              return false;
            }
            this.listaRespuestas2[subPreguntaIndex].id_pregunta = currentPregunta.id;
            this.listaRespuestas2[subPreguntaIndex].id_subpregunta = currentPregunta.subPreguntas[h].id;
            this.listaRespuestas2[subPreguntaIndex].id_empresa = this.id_empresa;
            totalXpregunta += this.listaRespuestas2[subPreguntaIndex].valor;
          }
          this.acumXSeccion2 += totalXpregunta;
          respCounter += currentPregunta.subPreguntas.length - 1;
        }
        respCounter++;
        continue;
      }


      if (currentPregunta.isText) {
        if (currentPregunta.isText) {
          if (!this.listaRespuestas2[respCounter].texto_res || this.listaRespuestas2[respCounter].texto_res.trim() === '' || this.listaRespuestas2[respCounter].texto_res !== 'N/A') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            return false;
          }
        } else {
          if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            return false;
          }
        }
      }
      if (!isValidForm) {
        return false;
      }
    }
    this.next();
    console.log('acumXSeccion2:', this.acumXSeccion2);
    this.saveSection(2, this.listaRespuestas2);
    return isValidForm;

  }

  onSubmitSeccion3(): boolean {
    let respCounter = 0;
    let isValidForm = true;
    this.id_empresa;
    this.listaRespuestas3 = [];
    let totalXpregunta: number = 0;
    this.acumXSeccion3 = 0;


    this.respuesta66.valor = this.respuesta66.opcion === 'Si' ? 25 : this.respuesta66.opcion === 'Medio' ? 12.5 : 0;
    this.listaRespuestas3.push(this.respuesta66);
    if (this.respuesta66.opcion === 'Si') {
      this.listaRespuestas3.push(this.respuesta67);
    } else {
      this.respuesta67.texto_res = 'null';
      this.respuesta67.id_pregunta = 31;
      this.listaRespuestas3.push(this.respuesta67);
    }
    this.respuesta68.opcion === 'Si' ? this.respuesta68.valor = 20 : this.respuesta68.opcion === 'Medio' ? 10 : 0;
    this.listaRespuestas3.push(this.respuesta68);
    if (this.respuesta68.opcion === 'Si') {
      this.listaRespuestas3.push(this.respuesta69);
    } else {
      this.respuesta69.texto_res = 'null';
      this.respuesta69.id_pregunta = 33;
      this.listaRespuestas3.push(this.respuesta69);
    }
    this.respuesta70.valor = this.respuesta70.opcion === 'Si' ? 15 : this.respuesta70.opcion === 'Medio' ? 7.5 : 0;
    this.listaRespuestas3.push(this.respuesta70);
    this.listaRespuestas3.push(this.respuesta71);
    this.listaRespuestas3.push(this.respuesta72);
    this.respuesta73.valor = this.respuesta73.opcion === 'Si' ? 20 : this.respuesta73.opcion === 'Medio' ? 10 : 0;
    this.listaRespuestas3.push(this.respuesta73);
    this.respuesta74.opcion === 'Si' ? this.respuesta74.valor = 5 : 0;
    this.listaRespuestas3.push(this.respuesta74);
    this.respuesta75.opcion === 'Si' ? this.respuesta75.valor = 5 : 0;
    this.listaRespuestas3.push(this.respuesta75);
    this.respuesta76.opcion === 'Si' ? this.respuesta76.valor = 5 : 0;
    this.listaRespuestas3.push(this.respuesta76);
    this.respuesta77.opcion === 'Si' ? this.respuesta77.valor = 5 : 0;
    this.listaRespuestas3.push(this.respuesta77);

    for (let i = 29; i < 41; i++) {
      //debugger;
      const currentRespuesta = PREGUNTAS[i];
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas3[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas3[respCounter].id_empresa = this.id_empresa;
      this.listaRespuestas3[respCounter].id_subpregunta = null;
      totalXpregunta = this.listaRespuestas3[respCounter].valor;
      this.acumXSeccion3 += totalXpregunta;

      if (currentPregunta.isText) {
        if (!this.listaRespuestas3[respCounter].texto_res || this.listaRespuestas3[respCounter].texto_res === '' && this.listaRespuestas3[respCounter].texto_res !== 'N/A') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
      } else {
        if (!this.listaRespuestas3[respCounter].opcion || this.listaRespuestas3[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
      }
      if (currentPregunta.isAffirmativeQuestion) {
        if (this.listaRespuestas3[respCounter].opcion === 'No') {
          i += currentPregunta.subPreguntas.length;
          respCounter++;
          continue;
        }
      }
      respCounter++;
    }
    this.next();
    this.saveSection(3, this.listaRespuestas3);
    return isValidForm;
  }

  onSubmitSeccion4(): boolean {
    let respCounter = 0;
    let isValidForm = true;
    this.id_empresa;
    this.listaRespuestas4 = [];
    let totalXpregunta: number = 0;
    let trl;
    let acumTrl1: number = 0;
    let acumTrl2: number = 0;
    let acumTrl3: number = 0;
    let acumTrl4: number = 0;
    let acumTrl5: number = 0;
    let acumTrl6: number = 0;
    let acumTrl7: number = 0;
    let acumTrl8: number = 0;
    let acumTrl9: number = 0;
    this.maxTrl = 0;
    this.acumXTrl = 0;



    //TRL 1
    this.respuesta78.valor = (this.respuesta78.opcion === 'Si') ? 0.7 : 0;
    this.listaRespuestas4.push(this.respuesta78);
    this.respuesta79.valor = (this.respuesta79.opcion === 'Si') ? 0.7 : 0;
    this.listaRespuestas4.push(this.respuesta79);
    this.respuesta80.valor = (this.respuesta80.opcion === 'Si') ? 0.7 : 0;
    this.listaRespuestas4.push(this.respuesta80);
    //TRL 2
    this.respuesta81.valor = (this.respuesta81.opcion === 'Si') ? 0.8 : 0;
    this.listaRespuestas4.push(this.respuesta81);
    this.respuesta82.valor = (this.respuesta82.opcion === 'Si') ? 0.8 : 0;
    this.listaRespuestas4.push(this.respuesta82);
    this.respuesta83.valor = (this.respuesta83.opcion === 'Si') ? 0.8 : 0;
    this.listaRespuestas4.push(this.respuesta83);
    this.respuesta84.valor = (this.respuesta84.opcion === 'Si') ? 0.8 : 0;
    this.listaRespuestas4.push(this.respuesta84);
    this.respuesta85.valor = (this.respuesta85.opcion === 'Si') ? 0.8 : 0;
    this.listaRespuestas4.push(this.respuesta85);
    // TRL 3
    this.respuesta86.valor = (this.respuesta86.opcion === 'Si') ? 2 : 0;
    this.listaRespuestas4.push(this.respuesta86);
    this.respuesta87.valor = (this.respuesta87.opcion === 'Si') ? 2 : 0;
    this.listaRespuestas4.push(this.respuesta87);
    this.respuesta88.valor = (this.respuesta88.opcion === 'Si') ? 2 : 0;
    this.listaRespuestas4.push(this.respuesta88);
    // TRL 4
    this.respuesta89.valor = (this.respuesta89.opcion === 'Si') ? 8 : 0;
    this.listaRespuestas4.push(this.respuesta89);
    // TRL 5
    this.respuesta90.valor = (this.respuesta90.opcion === 'Si') ? 3.3 : 0;
    this.listaRespuestas4.push(this.respuesta90);
    this.respuesta91.valor = (this.respuesta91.opcion === 'Si') ? 3.3 : 0;
    this.listaRespuestas4.push(this.respuesta91);
    this.respuesta92.valor = (this.respuesta92.opcion === 'Si') ? 3.4 : 0;
    this.listaRespuestas4.push(this.respuesta92);
    // TRL 6
    this.respuesta93.valor = (this.respuesta93.opcion === 'Si') ? 4 : 0;
    this.listaRespuestas4.push(this.respuesta93);
    this.respuesta94.valor = (this.respuesta94.opcion === 'Si') ? 4 : 0;
    this.listaRespuestas4.push(this.respuesta94);
    this.respuesta95.valor = (this.respuesta95.opcion === 'Si') ? 4 : 0;
    this.listaRespuestas4.push(this.respuesta95);
    // TRL 7
    this.respuesta96.valor = (this.respuesta96.opcion === 'Si') ? 5 : 0;
    this.listaRespuestas4.push(this.respuesta96);
    this.respuesta97.valor = (this.respuesta97.opcion === 'Si') ? 5 : 0;
    this.listaRespuestas4.push(this.respuesta97);
    this.respuesta98.valor = (this.respuesta98.opcion === 'Si') ? 5 : 0;
    this.listaRespuestas4.push(this.respuesta98);
    // TRL 8:
    this.respuesta99.valor = (this.respuesta99.opcion === 'Si') ? 6 : 0;
    this.listaRespuestas4.push(this.respuesta99);
    this.respuesta100.valor = (this.respuesta100.opcion === 'Si') ? 6 : 0;
    this.listaRespuestas4.push(this.respuesta100);
    this.respuesta101.valor = (this.respuesta101.opcion === 'Si') ? 6 : 0;
    this.listaRespuestas4.push(this.respuesta101);
    //TRL 9
    this.respuesta102.valor = (this.respuesta102.opcion === 'Si') ? 3.6 : 0;
    this.listaRespuestas4.push(this.respuesta102);
    this.respuesta103.opcion === 'Si' ? this.respuesta103.valor = 3.6 : 0;
    this.listaRespuestas4.push(this.respuesta103);
    this.respuesta104.opcion === 'Si' ? this.respuesta104.valor = 3.6 : 0;
    this.listaRespuestas4.push(this.respuesta104);
    this.respuesta105.opcion === 'Si' ? this.respuesta105.valor = 3.6 : 0;
    this.listaRespuestas4.push(this.respuesta105);
    this.respuesta106.opcion === 'Si' ? this.respuesta106.valor = 3.6 : 0;
    this.listaRespuestas4.push(this.respuesta106);
    this.respuesta107.opcion === 'Si' ? this.respuesta107.valor = 3.5 : 0;
    this.listaRespuestas4.push(this.respuesta107);
    this.respuesta108.opcion === 'Si' ? this.respuesta108.valor = 3.5 : 0;
    this.listaRespuestas4.push(this.respuesta108);

    for (let i = 41; i < 42; i++) {
      //debugger;
      const currentPregunta = PREGUNTAS[i];
      const currentRespuesta = this.listaRespuestas4[respCounter];
      this.listaRespuestas4[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas4[respCounter].id_empresa = this.id_empresa;
      this.listaRespuestas4[respCounter].id_subpregunta = null;
      totalXpregunta = this.listaRespuestas4[respCounter].valor;
      this.acumXTrl += totalXpregunta;

      if (currentPregunta.isAffirmativeQuestion) {
        if (currentRespuesta.opcion === 'No') {
          // Si la respuesta es 'No', saltar la pregunta actual y todas las subpreguntas
          if (i + 1 < 47) {
            const nextPregunta = PREGUNTAS[i + 1];
            if (nextPregunta.subPreguntas && nextPregunta.subPreguntas.length > 0) {
              // Saltar también las subpreguntas de la siguiente pregunta si las hay
              respCounter += nextPregunta.subPreguntas.length;
            }
          }
          // Avanzar al siguiente índice del ciclo
          i++;
          continue;
        }
      }

      // Si la pregunta tiene subpreguntas, validar subpreguntas
      if (currentPregunta.subPreguntas && currentPregunta.subPreguntas.length > 0) {
        let firstEmptySubPreguntaId: number | null = null; // Variable para almacenar el ID de la primera subpregunta vacía
        for (let j = 0; j < currentPregunta.subPreguntas.length; j++) {
          const subPregunta = currentPregunta.subPreguntas[j];
          const respuestaSubPregunta = this.listaRespuestas4[respCounter + j];
          // Verifica que la respuesta para la subpregunta exista en la lista de respuestas
          if (!respuestaSubPregunta) {
            this.alertService.errorAlert('Error', `No se encontró respuesta para la pregunta ${currentPregunta.id}.`);
            isValidForm = false;
            break;
          }
          respuestaSubPregunta.id_pregunta = currentPregunta.id;
          respuestaSubPregunta.id_subpregunta = subPregunta.id;
          respuestaSubPregunta.id_empresa = this.id_empresa;
          totalXpregunta = respuestaSubPregunta.valor;
          this.acumXTrl += totalXpregunta;

          if (subPregunta.id >= 50 && subPregunta.id <= 52) {
            acumTrl1 += totalXpregunta;
            if (acumTrl1 <= 2) {
              trl = 1;
            }
          } else if (subPregunta.id >= 53 && subPregunta.id <= 57) {
            acumTrl2 += totalXpregunta;
            if (acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 2;
            } else if (acumTrl2 < 4) {
              trl = 1;
            }
          } else if (subPregunta.id >= 58 && subPregunta.id <= 60) {
            acumTrl3 += totalXpregunta;
            if (acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 3;
            } else if (acumTrl3 < 6) {
              trl = 1;
            }
          } else if (subPregunta.id === 61) {
            acumTrl4 += totalXpregunta;
            if (acumTrl4 === 8 && acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 4;
            } else if (acumTrl4 < 8) {
              trl = 1;
            }
          } else if (subPregunta.id >= 62 && subPregunta.id <= 64) {
            acumTrl5 += totalXpregunta;
            if (acumTrl5 === 10 && acumTrl4 === 8 && acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 5;
            } else if (acumTrl5 < 10) {
              trl = 1;
            }
          } else if (subPregunta.id >= 65 && subPregunta.id <= 67) {
            acumTrl6 += totalXpregunta;
            if (acumTrl6 === 12 && acumTrl5 === 10 && acumTrl4 === 8 && acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 6;
            } else if (acumTrl6 < 12) {
              trl = 1;
            }
          } else if (subPregunta.id >= 68 && subPregunta.id <= 70) {
            acumTrl7 += totalXpregunta;
            if (acumTrl7 === 15 && acumTrl6 === 12 && acumTrl5 === 10 && acumTrl4 === 8 && acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 7;
            } else if (acumTrl7 < 15) {
              trl = 1;
            }
          } else if (subPregunta.id >= 71 && subPregunta.id <= 73) {
            acumTrl8 += totalXpregunta;
            if (acumTrl8 === 18 && acumTrl7 === 15 && acumTrl6 === 12 && acumTrl5 === 10 && acumTrl4 === 8 && acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 8;
            } else if (acumTrl8 < 18) {
              trl = 1;
            }
          } else if (subPregunta.id >= 74 && subPregunta.id <= 80) {
            acumTrl9 += totalXpregunta;
            if (acumTrl9 === 25 && acumTrl8 === 18 && acumTrl7 === 15 && acumTrl6 === 12 && acumTrl5 === 10 && acumTrl4 === 8 && acumTrl3 === 6 && acumTrl2 === 4 && acumTrl1 >= 2) {
              trl = 9;
            } else if (acumTrl9 < 25) {
              trl = 1;
            }
          }

          if (trl >= this.maxTrl) {
            this.maxTrl = trl;
          }

          // Validar respuesta de subpregunta
          if (!respuestaSubPregunta.opcion || respuestaSubPregunta.opcion === '') {
            firstEmptySubPreguntaId = subPregunta.sub_id;
            isValidForm = false;
          }

          if (!isValidForm) {
            break;
          }
        }

        if (!isValidForm && firstEmptySubPreguntaId !== null) {
          this.alertService.errorAlert('Error', `La subpregunta ${firstEmptySubPreguntaId}, de la pregunta ${currentPregunta.id} está vacía.`);
          break;
        }

        respCounter += currentPregunta.subPreguntas.length;
      } else {
        if (currentPregunta.isText) {
          if (!currentRespuesta.texto_res || currentRespuesta.texto_res === '') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            break;
          }
        } else {
          if (!currentRespuesta.opcion || currentRespuesta.opcion === '') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            break;
          }
        }
        respCounter++;
      }
    }
    this.next();
    this.saveSection(4, this.listaRespuestas4);
    return isValidForm;
  }




  onSubmitSeccion5(): boolean {
    let respCounter = 0;
    let isValidForm = true;
    this.id_empresa;
    this.listaRespuestas5 = [];
    let totalXpregunta: number = 0;
    this.acumXTecnica = 0;

    //pregunta 43 
    this.respuesta109.opcion === 'Si' ? this.respuesta109.valor = 10 : 0;
    this.listaRespuestas5.push(this.respuesta109);
    //pregunta 44 - 45
    this.listaRespuestas5.push(this.respuesta110);
    if (this.respuesta110.opcion === 'Si') {
      this.respuesta111.opcion === 'Si' ? this.respuesta111.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta111);
      this.respuesta112.opcion === 'Si' ? this.respuesta112.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta112);
      this.respuesta113.opcion === 'Si' ? this.respuesta113.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta113);
      this.respuesta114.opcion === 'Si' ? this.respuesta114.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta114);
      this.respuesta115.opcion === 'Si' ? this.respuesta115.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta115);
      this.respuesta116.opcion === 'Si' ? this.respuesta116.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta116);
      this.respuesta117.opcion === 'Si' ? this.respuesta117.valor = 5.8 : 0;
      this.listaRespuestas5.push(this.respuesta117);
    } else {
      this.respuesta111.texto_res = 'N/A';
      this.respuesta111.id_pregunta = 45;
      this.respuesta111.id_subpregunta = 81;
      this.listaRespuestas5.push(this.respuesta111);
      this.respuesta112.texto_res = 'N/A';
      this.respuesta112.id_pregunta = 45;
      this.respuesta112.id_subpregunta = 82;
      this.listaRespuestas5.push(this.respuesta112);
      this.respuesta113.texto_res = 'N/A';
      this.respuesta113.id_pregunta = 45;
      this.respuesta113.id_subpregunta = 83;
      this.listaRespuestas5.push(this.respuesta113);
      this.respuesta114.texto_res = 'N/A';
      this.respuesta114.id_pregunta = 45;
      this.respuesta114.id_subpregunta = 84;
      this.listaRespuestas5.push(this.respuesta114);
      this.respuesta115.texto_res = 'N/A';
      this.respuesta115.id_pregunta = 45;
      this.respuesta115.id_subpregunta = 85;
      this.listaRespuestas5.push(this.respuesta115);
      this.respuesta116.texto_res = 'N/A';
      this.respuesta116.id_pregunta = 45;
      this.respuesta116.id_subpregunta = 86;
      this.listaRespuestas5.push(this.respuesta116);
      this.respuesta117.texto_res = 'N/A';
      this.respuesta117.id_pregunta = 45;
      this.respuesta117.id_subpregunta = 87;
      this.listaRespuestas5.push(this.respuesta117);
    }
    //pregunta 46 - 47
    this.listaRespuestas5.push(this.respuesta118);
    if (this.respuesta118.opcion === 'Si') {
      this.respuesta119.opcion === 'Si' ? this.respuesta119.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta119);
      this.respuesta120.opcion === 'Si' ? this.respuesta120.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta120);
      this.respuesta121.opcion === 'Si' ? this.respuesta121.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta121);
      this.respuesta122.opcion === 'Si' ? this.respuesta122.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta122);
      this.respuesta123.opcion === 'Si' ? this.respuesta123.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta123);
      this.respuesta124.opcion === 'Si' ? this.respuesta124.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta124);
      this.respuesta125.opcion === 'Si' ? this.respuesta125.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta125);
      this.respuesta126.opcion === 'Si' ? this.respuesta126.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta126);
      this.respuesta127.opcion === 'Si' ? this.respuesta127.valor = 6.9 : 0;
      this.listaRespuestas5.push(this.respuesta127);
    } else {
      this.respuesta119.texto_res = 'N/A';
      this.respuesta119.id_pregunta = 46;
      this.respuesta119.id_subpregunta = 88;
      this.listaRespuestas5.push(this.respuesta119);
      this.respuesta120.texto_res = 'N/A';
      this.respuesta120.id_pregunta = 46;
      this.respuesta120.id_subpregunta = 89;
      this.listaRespuestas5.push(this.respuesta120);
      this.respuesta121.texto_res = 'N/A';
      this.respuesta121.id_pregunta = 46;
      this.respuesta121.id_subpregunta = 90;
      this.listaRespuestas5.push(this.respuesta121);
      this.respuesta122.texto_res = 'N/A';
      this.respuesta122.id_pregunta = 46;
      this.respuesta122.id_subpregunta = 91;
      this.listaRespuestas5.push(this.respuesta122);
      this.respuesta123.texto_res = 'N/A';
      this.respuesta123.id_pregunta = 46;
      this.respuesta123.id_subpregunta = 92;
      this.listaRespuestas5.push(this.respuesta123);
      this.respuesta124.texto_res = 'N/A';
      this.respuesta124.id_pregunta = 46;
      this.respuesta124.id_subpregunta = 93;
      this.listaRespuestas5.push(this.respuesta124);
      this.respuesta125.texto_res = 'N/A';
      this.respuesta125.id_pregunta = 46;
      this.respuesta125.id_subpregunta = 94;
      this.listaRespuestas5.push
      this.respuesta126.texto_res = 'N/A';
      this.respuesta126.id_pregunta = 46;
      this.respuesta126.id_subpregunta = 95;
      this.listaRespuestas5.push(this.respuesta126);
      this.respuesta127.texto_res = 'N/A';
      this.respuesta127.id_pregunta = 46;
      this.respuesta127.id_subpregunta = 96;
      this.listaRespuestas5.push(this.respuesta127);
    }

    for (let i = 42; i < 46; i++) {
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas5[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas5[respCounter].id_empresa = this.id_empresa;
      this.listaRespuestas5[respCounter].id_subpregunta = null;
      totalXpregunta = this.listaRespuestas5[respCounter].valor;
      this.acumXTecnica += totalXpregunta;

      if (currentPregunta.id === 43) {
        if (!this.listaRespuestas5[respCounter].opcion || this.listaRespuestas5[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
        respCounter++;
        continue;
      }

      if (currentPregunta.isAffirmativeQuestion) {
        if (!this.listaRespuestas5[respCounter].opcion || this.listaRespuestas5[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
        const nextPregunta = PREGUNTAS[i + 1];
        if (this.listaRespuestas5[respCounter].opcion === 'Si') {
          let subPreguntaCounter = 0; // Contador para las subpreguntas

          for (let j = 0; j < nextPregunta.subPreguntas.length; j++) {
            const respuestaActual = this.listaRespuestas5[respCounter + 1 + subPreguntaCounter];

            if (!respuestaActual.opcion || respuestaActual.opcion === '') {
              this.alertService.errorAlert('Error', `La subpregunta ${nextPregunta.subPreguntas[j].id} de la pregunta ${nextPregunta.id} está vacía.`);
              isValidForm = false;
              return false;
            }
            // Asignar valores a la respuesta actual
            this.listaRespuestas5[respCounter + 1 + subPreguntaCounter].id_pregunta = nextPregunta.id;
            this.listaRespuestas5[respCounter + 1 + subPreguntaCounter].id_subpregunta = nextPregunta.subPreguntas[j].id;
            this.listaRespuestas5[respCounter + 1 + subPreguntaCounter].id_empresa = this.id_empresa;
            totalXpregunta += this.listaRespuestas5[respCounter + 1 + subPreguntaCounter].valor;

            subPreguntaCounter++;
          }
          this.acumXTecnica += totalXpregunta;
          respCounter += subPreguntaCounter + 1;

        } else if (this.listaRespuestas5[respCounter].opcion === 'No') {
          respCounter += nextPregunta.subPreguntas.length + 1;
          i += 1;
        }
      } else if (currentPregunta.isText) {
        if (currentPregunta.isText) {
          if (!this.listaRespuestas5[respCounter].texto_res || this.listaRespuestas5[respCounter].texto_res.trim() === '' || this.listaRespuestas2[respCounter].texto_res !== 'N/A') {
            this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
            isValidForm = false;
            return false;
          }
        }
      } else {
        if (!this.listaRespuestas5[respCounter].opcion || this.listaRespuestas5[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentPregunta.id} está vacía.`);
          isValidForm = false;
          return false;
        }
      }

      if (!isValidForm) {
        return false;
      }
    }
    if (isValidForm) {
      if (!this.isSectionSaved[5]) {
        this.saveSection(5, this.listaRespuestas5);
      }
    
      if (!this.isSubmitting) {
        // Mostrar alerta de confirmación
        this.alertService.alertaActivarDesactivar(`¿Está seguro de enviar el formulario?`, "warning",  this.buttonMessage,).then((result) => {
          if (result.isConfirmed) {
      
            // Cambiar el mensaje del botón
            this.buttonMessage = "Enviando...";
            this.isSubmitting = true;
      
            // Llamamos a enviarRespuestasJson
            this.enviarRespuestasJson();
      
          }
        });
      }
      }
    
    
    return isValidForm;
  }

/*
  Valida y envía las respuestas del formulario. 
  Si hay errores, muestra una alerta; de lo contrario, recupera las respuestas almacenadas, 
  envía los datos al servidor y guarda los puntajes correspondientes.
*/
enviarRespuestasJson() {
  let isFormValid = true;
  
  // Validación de secciones
  let seccionesInvalidas: string[] = [];

  // Validación de secciones
  if (!this.onSubmitSeccion1()) {
    seccionesInvalidas.push('Sección 1');
  }
  if (!this.onSubmitSeccion2()) {
    seccionesInvalidas.push('Sección 2');
  }
  if (!this.onSubmitSeccion3()) {
    seccionesInvalidas.push('Sección 3');
  }
  if (!this.onSubmitSeccion4()) {
    seccionesInvalidas.push('Sección 4');
  }
  if (!this.onSubmitSeccion5()) {
    seccionesInvalidas.push('Sección 5');
  }

  // Si hay alguna sección inválida
  if (seccionesInvalidas.length > 0) {
    // Crear el mensaje de alerta con las secciones inválidas
    const mensajeError = `El formulario contiene errores en las siguientes secciones: ${seccionesInvalidas.join(', ')}. Revise nuevamente sus respuestas.`;
    this.alertService.errorAlert('Error', mensajeError);
    return;
  }

  // Recuperar las respuestas de Redis
  this.respuestasService.getAnwerRedis(this.token, this.id_empresa).subscribe(
    (redisData: any) => {
      let totalRespuestas = [];

      // Unir todas las respuestas de las secciones
      if (redisData.seccion1) totalRespuestas = totalRespuestas.concat(redisData.seccion1);
      if (redisData.seccion2) totalRespuestas = totalRespuestas.concat(redisData.seccion2);
      if (redisData.seccion3) totalRespuestas = totalRespuestas.concat(redisData.seccion3);
      if (redisData.seccion4) totalRespuestas = totalRespuestas.concat(redisData.seccion4);
      if (redisData.seccion5) totalRespuestas = totalRespuestas.concat(redisData.seccion5);
      
      const payload = {
        respuestas: totalRespuestas,
        id_empresa: this.id_empresa
      };
      debugger
      const puntajes = {
        info_general: this.acumXSeccion1,
        info_financiera: this.acumXSeccion2,
        info_mercado: this.acumXSeccion3,
        info_trl: this.maxTrl,
        info_tecnica: this.acumXTecnica,
        documento_empresa: this.id_empresa,
        ver_form: 1
      };
      console.log(puntajes);

      // Primero guardar puntajes y si es exitoso, proceder a guardar las respuestas
    this.puntajeService.savePuntajeSeccion(puntajes, this.id_empresa).pipe(
      switchMap(() => {
        // Si guardar puntajes es exitoso, proceder a guardar las respuestas
        return this.respuestasService.saveAnswers(this.token, payload);
      })
    ).subscribe({
      next: () => {
        // Ambos guardados han sido exitosos
        this.alertService.successAlert('Éxito', 'Respuestas y puntajes guardados correctamente.');

        // Cambiar el mensaje del botón a "Redirigiendo..." y esperar 3 segundos antes de redirigir
        this.buttonMessage = "Redirigiendo...";
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/list-empresa']);
        }, 3000);
      },
      error: (err) => {
        // Ocurrió un error en alguna de las solicitudes
        console.error(err);
        this.alertService.errorAlert('Error', 'No se pudieron guardar los datos. Inténtalo nuevamente.');
        this.isSubmitting = false; // Restaurar el estado del botón
        this.buttonMessage = "Enviar";
      }
    });
  },
    error => {
      console.error('Error al recuperar los datos de Redis:', error);
      this.alertService.errorAlert('Error', 'No se pudieron recuperar los datos guardados.');
      this.isSubmitting = false; // Restaurar el estado del botón
      this.buttonMessage = "Enviar";
    }
  );
}

/*
  Guarda las respuestas de una sección si no se han guardado previamente. 
  Actualiza el estado de la sección como guardada tras una respuesta exitosa.
*/
  saveSection(sectionId: number, respuestas: any[]): void {
    if (this.isSectionSaved[sectionId]) {
      return;
    }

    this.respuestasService.saveAnswersRedis(this.token, sectionId, this.id_empresa, respuestas).subscribe(
      data => {
        this.isSectionSaved[sectionId] = true;
      },
      error => {
        console.error(error);
      }
    );
  }

/*
  Carga las respuestas desde la caché y las asigna al formulario. 
  Maneja errores en la consulta de datos.
*/
  cargarRespuestasCache() {
    this.respuestasService.getAnwerRedis(this.token, this.id_empresa).subscribe(
      data => {
        this.respuestasCache = data;
        console.log(this.respuestasCache);
        this.cargarRespuestasEnFormulario();
      },
      error => {
        console.error(error);
      }
    )
  }

  cargarRespuestasEnFormulario() {
    if (this.respuestasCache.seccion1) {
      this.respuesta1.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[0].opcion : '';
      this.respuesta2.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[1].opcion : '';
      this.respuesta2.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[1].texto_res : '';
      this.respuesta3.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[2].opcion : '';
      this.respuesta3.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[2].texto_res : '';
      this.respuesta4.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[3].opcion : '';
      this.respuesta4.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[3].texto_res : '';
      this.respuesta5.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[4].opcion : '';
      this.respuesta5.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[4].texto_res : '';
      this.respuesta6.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[5].opcion : '';
      this.respuesta6.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[5].texto_res : '';
      //pregunta 3
      this.respuesta7.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[6].opcion : '';
      this.respuesta8.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[7].opcion : '';
      this.respuesta9.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[8].opcion : '';
      this.respuesta10.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[9].opcion : '';
      this.respuesta11.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[10].opcion : '';
      this.respuesta12.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[11].opcion : '';
      this.respuesta13.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[12].opcion : '';
      this.respuesta14.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[13].texto_res : '';
      this.respuesta15.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[14].texto_res : '';
      this.respuesta16.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[15].opcion : '';
      this.respuesta17.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[16].texto_res : '';
      this.respuesta18.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[17].texto_res : '';
      this.respuesta19.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[18].texto_res : '';
      this.respuesta20.texto_res = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[19].texto_res : '';
      this.respuesta21.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[20].opcion : '';
      this.respuesta22.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[21].opcion : '';
      this.respuesta23.opcion = this.respuestasCache.seccion1.length > 0 ? this.respuestasCache.seccion1[22].opcion : '';

      //Seccion 2
      this.respuesta24.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[0].opcion : '';
      //pregunta 18
      this.respuesta25.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[1].opcion : '';
      this.respuesta26.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[2].opcion : '';
      this.respuesta27.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[3].opcion : '';
      this.respuesta28.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[4].opcion : '';
      this.respuesta29.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[5].opcion : '';
      this.respuesta30.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[6].opcion : '';
      this.respuesta31.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[7].opcion : '';
      this.respuesta32.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[8].opcion : '';
      //pregunta 19
      this.respuesta33.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[9].opcion : '';
      this.respuesta34.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[10].opcion : '';
      this.respuesta35.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[11].opcion : '';
      this.respuesta36.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[12].opcion : '';
      this.respuesta37.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[13].opcion : '';
      this.respuesta38.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[14].opcion : '';
      //pregunta 20
      this.respuesta39.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[15].opcion : '';
      //pregunta 21
      this.respuesta40.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[16].opcion : '';
      this.respuesta41.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[17].opcion : '';
      this.respuesta42.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[18].opcion : '';
      this.respuesta43.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[19].opcion : '';
      //pregunta 22
      this.respuesta44.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[20].opcion : '';
      //pregunta 23
      this.respuesta45.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[21].opcion : '';
      this.respuesta46.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[22].opcion : '';
      this.respuesta47.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[23].opcion : '';
      this.respuesta48.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[24].opcion : '';
      //pregunta 24
      this.respuesta49.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[25].opcion : '';
      this.respuesta50.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[26].opcion : '';
      this.respuesta51.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[27].opcion : '';
      this.respuesta52.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[28].opcion : '';
      this.respuesta53.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[29].opcion : '';
      //pregunta 25
      this.respuesta54.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[30].opcion : '';
      this.respuesta55.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[31].opcion : '';
      this.respuesta56.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[32].opcion : '';
      this.respuesta57.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[33].opcion : '';
      this.respuesta58.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[34].opcion : '';
      this.respuesta59.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[35].opcion : '';
      this.respuesta60.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[36].opcion : '';
      this.respuesta61.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[37].opcion : '';
      this.respuesta62.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[38].opcion : '';
      this.respuesta63.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[39].opcion : '';
      this.respuesta64.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[40].opcion : '';
      this.respuesta65.opcion = this.respuestasCache.seccion2.length > 0 ? this.respuestasCache.seccion2[41].opcion : '';

      //Seccion 3
      this.respuesta66.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[0].opcion : '';
      this.respuesta67.texto_res = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[1].texto_res : '';
      this.respuesta68.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[2].opcion : '';
      this.respuesta69.texto_res = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[3].texto_res : '';
      this.respuesta70.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[4].opcion : '';
      this.respuesta71.texto_res = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[5].texto_res : '';
      this.respuesta72.texto_res = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[6].texto_res : '';
      this.respuesta73.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[7].opcion : '';
      this.respuesta74.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[8].opcion : '';
      this.respuesta75.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[9].opcion : '';
      this.respuesta76.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[10].opcion : '';
      this.respuesta77.opcion = this.respuestasCache.seccion3.length > 0 ? this.respuestasCache.seccion3[11].opcion : '';

      //Seccion 4
      this.respuesta78.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[0].opcion : '';
      this.respuesta79.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[1].opcion : '';
      this.respuesta80.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[2].opcion : '';
      this.respuesta81.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[3].opcion : '';
      this.respuesta82.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[4].opcion : '';
      this.respuesta83.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[5].opcion : '';
      this.respuesta84.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[6].opcion : '';
      this.respuesta85.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[7].opcion : '';
      this.respuesta86.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[8].opcion : '';
      this.respuesta87.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[9].opcion : '';
      this.respuesta88.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[10].opcion : '';
      this.respuesta89.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[11].opcion : '';
      this.respuesta90.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[12].opcion : '';
      this.respuesta91.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[13].opcion : '';
      this.respuesta92.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[14].opcion : '';
      this.respuesta93.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[15].opcion : '';
      this.respuesta94.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[16].opcion : '';
      this.respuesta95.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[17].opcion : '';
      this.respuesta96.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[18].opcion : '';
      this.respuesta97.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[19].opcion : '';
      this.respuesta98.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[20].opcion : '';
      this.respuesta99.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[21].opcion : '';
      this.respuesta100.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[22].opcion : '';
      this.respuesta101.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[23].opcion : '';
      this.respuesta102.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[24].opcion : '';
      this.respuesta103.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[25].opcion : '';
      this.respuesta104.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[26].opcion : '';
      this.respuesta105.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[27].opcion : '';
      this.respuesta106.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[28].opcion : '';
      this.respuesta107.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[29].opcion : '';
      this.respuesta108.opcion = this.respuestasCache.seccion4.length > 0 ? this.respuestasCache.seccion4[30].opcion : '';

      //Seccion 5
      this.respuesta109.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[0].opcion : '';
      this.respuesta110.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[1].opcion : '';
      this.respuesta111.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[2].opcion : '';
      this.respuesta112.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[3].opcion : '';
      this.respuesta113.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[4].opcion : '';
      this.respuesta114.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[5].opcion : '';
      this.respuesta115.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[6].opcion : '';
      this.respuesta116.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[7].opcion : '';
      this.respuesta117.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[8].opcion : '';
      this.respuesta118.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[9].opcion : '';
      this.respuesta119.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[10].opcion : '';
      this.respuesta120.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[11].opcion : '';
      this.respuesta121.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[12].opcion : '';
      this.respuesta122.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[13].opcion : '';
      this.respuesta123.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[14].opcion : '';
      this.respuesta124.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[15].opcion : '';
      this.respuesta125.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[16].opcion : '';
      this.respuesta126.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[17].opcion : '';
      this.respuesta127.opcion = this.respuestasCache.seccion5.length > 0 ? this.respuestasCache.seccion5[18].opcion : '';
    }
  }



/*
  Actualiza el porcentaje de progreso contando las preguntas respondidas 
  y calculando el porcentaje respecto al total de preguntas.
*/
  updateProgress() {
    let answeredQuestions = 0;
    const totalQuestions = 100;
    for (let i = 1; i <= totalQuestions; i++) {
      const respuesta = this['respuesta' + i] as Respuesta;
      if (respuesta && (respuesta.opcion || respuesta.texto_res)) {
        answeredQuestions++;
      }
    }

    this.progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  }

/*
  Carga la siguiente sección del formulario.
*/
  loadNextSection(): void {
    this.section++;
  }

/*
  Avanza a la siguiente subsección o a la siguiente sección si ya está en la última subsección. 
  Actualiza el progreso del formulario.
*/
  next() {
    if (this.currentSubSectionIndex < this.subSectionPerSection[this.currentIndex] - 1) {
      this.currentSubSectionIndex++;
    } else {
      if (this.currentIndex < this.subSectionPerSection.length - 1) {
        this.currentIndex++;
        this.currentSubSectionIndex = 0;
      }
    }
    this.updateProgress();

  }

  /*
  Navega a la subsección anterior o a la sección anterior si ya está en la primera subsección. 
  Actualiza el progreso del formulario.
*/
  previous(): void {
    if (this.currentSubSectionIndex > 0) {
      this.currentSubSectionIndex--;
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.currentSubSectionIndex = this.subSectionPerSection[this.currentIndex] - 1;
      }
    }
    this.updateProgress();

  }

/*
  Navega a una sección específica y reinicia el índice de la subsección a 0. 
  Actualiza el progreso del formulario.
*/
  goToSection(index: number): void {
    this.currentIndex = index;
    this.currentSubSectionIndex = 0; 
    this.updateProgress();
  }
}