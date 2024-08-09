import { Component } from '@angular/core';

import { fa1 } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { PREGUNTAS } from './preguntas.component';

import { AlertService } from '../../../servicios/alert.service';
import { RespuestasService } from '../../../servicios/respuestas.service';

import { Preguntas } from '../../../Modelos/preguntas.model';
import { Respuesta } from '../../../Modelos/respuesta.model';
import { User } from '../../../Modelos/user.model';
import { Router } from '@angular/router';


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

  id_pregunta: number;
  id_subpregunta: number | null = null;
  listaRespuestas1: Respuesta[] = [];
  listaRespuestas2: Respuesta[] = [];
  listaRespuestas3: Respuesta[] = [];
  listaRespuestas4: Respuesta[] = [];

  id_empresa = 1;
  //private originalAttributes: Map<Element, { colspan: string | null, rowspan: string | null }> = new Map();

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
    private router: Router
  ) { }



  ngOnInit() {
    this.updateProgress();
    this.validateToken();
  }

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


  onSubmitSeccion1() {

    let id_empresa = 1;
    let respCounter = 0;
    let isValidForm = true;

    this.listaRespuestas1 = [];

    this.listaRespuestas1.push(this.respuesta1);
    //pregunta 2
    this.listaRespuestas1.push(this.respuesta2);
    this.listaRespuestas1.push(this.respuesta3);
    this.listaRespuestas1.push(this.respuesta4);
    this.listaRespuestas1.push(this.respuesta5);
    this.listaRespuestas1.push(this.respuesta6);
    //fin pregunta 2
    this.listaRespuestas1.push(this.respuesta7);
    this.listaRespuestas1.push(this.respuesta8);
    this.listaRespuestas1.push(this.respuesta9);
    this.listaRespuestas1.push(this.respuesta10);
    this.listaRespuestas1.push(this.respuesta11);
    this.listaRespuestas1.push(this.respuesta12);
    this.listaRespuestas1.push(this.respuesta13);
    if (this.respuesta13.opcion === 'Si') {
      this.listaRespuestas1.push(this.respuesta14);
      this.listaRespuestas1.push(this.respuesta15);
    }else{
      this.respuesta14.texto_res = 'N/A';
      this.respuesta14.id_pregunta = 10
      this.listaRespuestas1.push(this.respuesta14);
      this.respuesta15.texto_res = 'N/A';
      this.respuesta15.id_pregunta = 11
      this.listaRespuestas1.push(this.respuesta15);
    }
    this.listaRespuestas1.push(this.respuesta16);
    if (this.respuesta16.opcion === 'Si') {
      this.listaRespuestas1.push(this.respuesta17);
      this.listaRespuestas1.push(this.respuesta18);
      this.listaRespuestas1.push(this.respuesta19);
      this.listaRespuestas1.push(this.respuesta20);
    }else{
      this.respuesta17.texto_res = 'N/A';
      this.respuesta17.id_pregunta = 13
      this.listaRespuestas1.push(this.respuesta17);
      this.respuesta18.texto_res = 'N/A';
      this.respuesta18.id_pregunta = 14
      this.listaRespuestas1.push(this.respuesta18);
      this.respuesta19.texto_res = 'N/A';
      this.respuesta19.id_pregunta = 15
      this.listaRespuestas1.push(this.respuesta19);
      this.respuesta20.texto_res = 'N/A';
      this.respuesta20.id_pregunta = 16
      this.listaRespuestas1.push(this.respuesta20);
    }
    this.listaRespuestas1.push(this.respuesta21);
    this.listaRespuestas1.push(this.respuesta22);
    this.listaRespuestas1.push(this.respuesta23);

    const payload = { respuestas: this.listaRespuestas1, id_empresa: id_empresa };


    for (let i = 0; i < 15; i++) {
      //debugger; 
      const currentRespuesta = PREGUNTAS[i];
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas1[respCounter].id_pregunta = i + 1;
      this.listaRespuestas1[respCounter].id_empresa = id_empresa;
      this.listaRespuestas1[respCounter].id_subpregunta = null;

      if (currentPregunta.id === 2) {
        for (let j = 0; j < currentPregunta.subPreguntas.length; j++) {
          //debugger;
          if (this.listaRespuestas1[respCounter + j].opcion !== 'Si') {
            this.listaRespuestas1[respCounter + j].texto_res = '0';
          }
          this.listaRespuestas1[respCounter + j].id_pregunta = currentPregunta.id;
          this.listaRespuestas1[respCounter + j].id_subpregunta = currentPregunta.subPreguntas[j].id;
          this.listaRespuestas1[respCounter + j].id_empresa = id_empresa;

        }
        respCounter += currentPregunta.subPreguntas.length - 1;
      } else if (currentPregunta.id === 12) {
        //debugger
        if (this.listaRespuestas1[respCounter].opcion === 'Si') {
          for (let k = 0; k < currentPregunta.subPreguntas.length; k++) {
            this.listaRespuestas1[respCounter + 1 + k].id_pregunta = currentPregunta.id;
            this.listaRespuestas1[respCounter + 1 + k].id_subpregunta = currentPregunta.subPreguntas[k].id;
            //this.listaRespuestas1[respCounter + 1 + k].id_empresa = id_empresa;

          }
          respCounter += currentPregunta.subPreguntas.length - 1;
        }
        respCounter++;
      } else {
        if (currentPregunta.isText) {
          if (!this.listaRespuestas1[respCounter].texto_res || this.listaRespuestas1[respCounter].texto_res === '') {
            this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
            isValidForm = false;
            return;
          }
        } else {
          if (!this.listaRespuestas1[respCounter].opcion || this.listaRespuestas1[respCounter].opcion === '') {
            this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
            isValidForm = false;
            return;
          }
        }
        if (currentPregunta.isAffirmativeQuestion) {
          if (this.listaRespuestas1[respCounter].opcion === 'No') {
            i += currentPregunta.subPreguntas.length;
            respCounter += currentPregunta.subPreguntas.length;
            continue;
          }
        }
        respCounter++;
      }
      //this.listaRespuestas1[i].valor = 3;
      //console.log(i);
      console.log('fuera del ciclo', this.listaRespuestas1);
    }
    if (!isValidForm) {
      return
    }
  }


  //onSubmit seccion 2
  onSubmitSeccion2() {
    //console.log(this.respuesta1);
    let respCounter = 0;
    let isValidForm = true;
    let id_empresa = 1;
    this.listaRespuestas2 = [];

    //Pregunta 16 y 17
    this.listaRespuestas2.push(this.respuesta24);
    if (this.respuesta24.opcion === 'Si') {
      this.listaRespuestas2.push(this.respuesta25);
      this.listaRespuestas2.push(this.respuesta26);
      this.listaRespuestas2.push(this.respuesta27);
      this.listaRespuestas2.push(this.respuesta28);
      this.listaRespuestas2.push(this.respuesta29);
      this.listaRespuestas2.push(this.respuesta30);
      this.listaRespuestas2.push(this.respuesta31);
      this.listaRespuestas2.push(this.respuesta32);
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
    this.listaRespuestas2.push(this.respuesta33);
    if (this.respuesta33.opcion === 'Si') {
      this.listaRespuestas2.push(this.respuesta34);
      this.listaRespuestas2.push(this.respuesta35);
      this.listaRespuestas2.push(this.respuesta36);
      this.listaRespuestas2.push(this.respuesta37);
      this.listaRespuestas2.push(this.respuesta38);
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
    this.listaRespuestas2.push(this.respuesta39);
    if (this.respuesta39.opcion === 'Si') {
      this.listaRespuestas2.push(this.respuesta40);
      this.listaRespuestas2.push(this.respuesta41);
      this.listaRespuestas2.push(this.respuesta42);
      this.listaRespuestas2.push(this.respuesta43);
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
      this.listaRespuestas2.push(this.respuesta45);
      this.listaRespuestas2.push(this.respuesta46);
      this.listaRespuestas2.push(this.respuesta47);
      this.listaRespuestas2.push(this.respuesta48);
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
    this.listaRespuestas2.push(this.respuesta49);
    this.listaRespuestas2.push(this.respuesta50);
    this.listaRespuestas2.push(this.respuesta51);
    this.listaRespuestas2.push(this.respuesta52);
    this.listaRespuestas2.push(this.respuesta53);

    //pregunta 25 y 26
    this.listaRespuestas2.push(this.respuesta54);
    if (this.respuesta54.opcion === 'Si') {
      this.listaRespuestas2.push(this.respuesta55);
    } else {
      this.respuesta55.texto_res = 'N/A';
      this.respuesta55.id_pregunta = 26;
      this.respuesta55.id_subpregunta = 37;
      this.listaRespuestas2.push(this.respuesta55);
    }
    //pregunta27
    this.listaRespuestas2.push(this.respuesta56);
    this.listaRespuestas2.push(this.respuesta57);
    this.listaRespuestas2.push(this.respuesta58);
    this.listaRespuestas2.push(this.respuesta59);
    this.listaRespuestas2.push(this.respuesta60);
    //pregunta 28 y 29
    this.listaRespuestas2.push(this.respuesta61);
    if (this.respuesta61.opcion === 'Si') {
      this.listaRespuestas2.push(this.respuesta62);
      this.listaRespuestas2.push(this.respuesta63);
      this.listaRespuestas2.push(this.respuesta64);
      this.listaRespuestas2.push(this.respuesta65);
    } else {
      this.respuesta62.texto_res = 'N/A';
      this.respuesta62.id_pregunta = 28;
      this.respuesta62.id_subpregunta = 46;
      this.listaRespuestas2.push(this.respuesta62);
      this.respuesta63.texto_res = 'N/A';
      this.respuesta63.id_pregunta = 28;
      this.respuesta63.id_subpregunta = 47;
      this.listaRespuestas2.push(this.respuesta63);
      this.respuesta64.texto_res = 'N/A';
      this.respuesta64.id_pregunta = 28;
      this.respuesta64.id_subpregunta = 48;
      this.listaRespuestas2.push(this.respuesta64);
      this.respuesta65.texto_res = 'N/A';
      this.respuesta65.id_pregunta = 28;
      this.respuesta65.id_subpregunta = 49;
      this.listaRespuestas2.push(this.respuesta65);
    }

    const payload = { respuestas: this.listaRespuestas2, id_empresa: id_empresa };


    for (let i = 15; i < 30; i++) {
      //debugger
      const currentRespuesta = PREGUNTAS[i];
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas2[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas2[respCounter].id_empresa = id_empresa;
      this.listaRespuestas2[respCounter].id_subpregunta = null;

      if ([16, 18, 20, 22, 28].includes(currentPregunta.id)) {
        if (this.listaRespuestas2[respCounter].opcion === 'Si') {
          const nextPregunta = PREGUNTAS[i + 1];
          for (let j = 0; j < nextPregunta.subPreguntas.length; j++) {
            //debugger;
            this.listaRespuestas2[respCounter + 1 + j].id_pregunta = nextPregunta.id;
            this.listaRespuestas2[respCounter + 1 + j].id_subpregunta = nextPregunta.subPreguntas[j].id;
            this.listaRespuestas2[respCounter + j].id_empresa = id_empresa;
          }

          respCounter += nextPregunta.subPreguntas.length;
        } else {
          continue;
        }
      }

      if (currentPregunta.id === 24 || currentPregunta.id === 27) {
        for (let i = 0; i < currentPregunta.subPreguntas.length; i++) {
          //debugger
          this.listaRespuestas2[respCounter + i].id_pregunta = currentPregunta.id;
          this.listaRespuestas2[respCounter + i].id_subpregunta = currentPregunta.subPreguntas[i].id;
          this.listaRespuestas2[respCounter + i].id_empresa = id_empresa;
        }
        respCounter += currentPregunta.subPreguntas.length;
      }

      if (currentPregunta.isText) {
        if (!this.listaRespuestas2[respCounter].texto_res || this.listaRespuestas2[respCounter].texto_res === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return;
        }
      } else {
        if (!this.listaRespuestas2[respCounter].opcion || this.listaRespuestas2[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return;
        }
      }
      if (currentPregunta.isAffirmativeQuestion) {
        if (this.listaRespuestas2[respCounter].opcion === 'No') {
          i += currentPregunta.subPreguntas.length;
          respCounter++;
          continue;
        }
        respCounter++;
      }
      if (!isValidForm) {
        return
      }
      //this.listaRespuestas2[i].valor = 3;
      console.log(i);
    }
    console.log('fuera del ciclo', this.listaRespuestas2);
    if (!isValidForm) {
      return
    }
  }

  onSubmitSeccion3() {
    let respCounter = 0;
    let isValidForm = true;
    let id_empresa = 1;
    this.listaRespuestas3 = [];

    this.listaRespuestas3.push(this.respuesta66);
    if (this.respuesta66.opcion === 'Si') {
      this.listaRespuestas3.push(this.respuesta67);
    } else {
      this.respuesta67.texto_res = 'null';
      this.respuesta67.id_pregunta = 31;
      this.listaRespuestas3.push(this.respuesta67);
    }
    this.listaRespuestas3.push(this.respuesta68);
    if (this.respuesta68.opcion === 'Si') {
      this.listaRespuestas3.push(this.respuesta69);
    } else {
      this.respuesta69.texto_res = 'null';
      this.respuesta69.id_pregunta = 33;
      this.listaRespuestas3.push(this.respuesta69);
    }
    this.listaRespuestas3.push(this.respuesta70);
    this.listaRespuestas3.push(this.respuesta71);
    this.listaRespuestas3.push(this.respuesta72);
    this.listaRespuestas3.push(this.respuesta73);
    this.listaRespuestas3.push(this.respuesta74);
    this.listaRespuestas3.push(this.respuesta75);
    this.listaRespuestas3.push(this.respuesta76);
    this.listaRespuestas3.push(this.respuesta77);

    for (let i = 29; i < 41; i++) {
      //debugger;
      const currentRespuesta = PREGUNTAS[i];
      const currentPregunta = PREGUNTAS[i];
      this.listaRespuestas3[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas3[respCounter].id_empresa = id_empresa;
      this.listaRespuestas3[respCounter].id_subpregunta = null;
      if (currentPregunta.isText) {
        if (!this.listaRespuestas3[respCounter].texto_res || this.listaRespuestas3[respCounter].texto_res === '' && this.listaRespuestas3[respCounter].texto_res !== 'N/A') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);

          isValidForm = false;
          return;
        }
      } else {
        if (!this.listaRespuestas3[respCounter].opcion || this.listaRespuestas3[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return;
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
    console.log('fuera del ciclo', this.listaRespuestas3);
  }

  onSubmitSeccion4() {
    let respCounter = 0;
    let isValidForm = true;
    let id_empresa = 1;
    this.listaRespuestas4 = [];

    this.listaRespuestas4.push(this.respuesta78);
    this.listaRespuestas4.push(this.respuesta79);
    this.listaRespuestas4.push(this.respuesta80);
    this.listaRespuestas4.push(this.respuesta81);
    this.listaRespuestas4.push(this.respuesta82);
    this.listaRespuestas4.push(this.respuesta83);
    this.listaRespuestas4.push(this.respuesta84);
    this.listaRespuestas4.push(this.respuesta85);
    this.listaRespuestas4.push(this.respuesta86);
    this.listaRespuestas4.push(this.respuesta87);
    this.listaRespuestas4.push(this.respuesta88);
    this.listaRespuestas4.push(this.respuesta89);
    this.listaRespuestas4.push(this.respuesta90);
    this.listaRespuestas4.push(this.respuesta91);
    this.listaRespuestas4.push(this.respuesta92);
    this.listaRespuestas4.push(this.respuesta93);
    this.listaRespuestas4.push(this.respuesta94);
    this.listaRespuestas4.push(this.respuesta95);
    this.listaRespuestas4.push(this.respuesta96);
    this.listaRespuestas4.push(this.respuesta97);
    this.listaRespuestas4.push(this.respuesta98);
    this.listaRespuestas4.push(this.respuesta99);
    this.listaRespuestas4.push(this.respuesta100);
    this.listaRespuestas4.push(this.respuesta101);
    this.listaRespuestas4.push(this.respuesta102);
    this.listaRespuestas4.push(this.respuesta103);
    this.listaRespuestas4.push(this.respuesta104);
    this.listaRespuestas4.push(this.respuesta105);
    this.listaRespuestas4.push(this.respuesta106);
    this.listaRespuestas4.push(this.respuesta107);
    this.listaRespuestas4.push(this.respuesta108);
    //pregunta 44
    this.listaRespuestas4.push(this.respuesta109);
    //pregunta 45
    this.listaRespuestas4.push(this.respuesta110);
    if (this.respuesta110.opcion === 'Si') {
      this.listaRespuestas4.push(this.respuesta111);
      this.listaRespuestas4.push(this.respuesta112);
      this.listaRespuestas4.push(this.respuesta113);
      this.listaRespuestas4.push(this.respuesta114);
      this.listaRespuestas4.push(this.respuesta115);
      this.listaRespuestas4.push(this.respuesta116);
      this.listaRespuestas4.push(this.respuesta117);
    } else {
      this.respuesta111.texto_res = 'N/A';
      this.respuesta111.id_pregunta = 45;
      this.respuesta111.id_subpregunta = 81;
      this.listaRespuestas4.push(this.respuesta111);
      this.respuesta112.texto_res = 'N/A';
      this.respuesta112.id_pregunta = 45;
      this.respuesta112.id_subpregunta = 82;
      this.listaRespuestas4.push(this.respuesta112);
      this.respuesta113.texto_res = 'N/A';
      this.respuesta113.id_pregunta = 45;
      this.respuesta113.id_subpregunta = 83;
      this.listaRespuestas4.push(this.respuesta113);
      this.respuesta114.texto_res = 'N/A';
      this.respuesta114.id_pregunta = 45;
      this.respuesta114.id_subpregunta = 84;
      this.listaRespuestas4.push(this.respuesta114);
      this.respuesta115.texto_res = 'N/A';
      this.respuesta115.id_pregunta = 45;
      this.respuesta115.id_subpregunta = 85;
      this.listaRespuestas4.push(this.respuesta115);
      this.respuesta116.texto_res = 'N/A';
      this.respuesta116.id_pregunta = 45;
      this.respuesta116.id_subpregunta = 86;
      this.listaRespuestas4.push(this.respuesta116);
      this.respuesta117.texto_res = 'N/A';
      this.respuesta117.id_pregunta = 45;
      this.respuesta117.id_subpregunta = 87;
      this.listaRespuestas4.push(this.respuesta117);
    }
    //pregunta 46
    this.listaRespuestas4.push(this.respuesta118);
    if (this.respuesta118.opcion === 'Si') {
      this.listaRespuestas4.push(this.respuesta119);
      this.listaRespuestas4.push(this.respuesta120);
      this.listaRespuestas4.push(this.respuesta121);
      this.listaRespuestas4.push(this.respuesta122);
      this.listaRespuestas4.push(this.respuesta123);
      this.listaRespuestas4.push(this.respuesta124);
      this.listaRespuestas4.push(this.respuesta125);
      this.listaRespuestas4.push(this.respuesta126);
      this.listaRespuestas4.push(this.respuesta127);
    } else {
      this.respuesta119.texto_res = 'N/A';
      this.respuesta119.id_pregunta = 46;
      this.respuesta119.id_subpregunta = 88;
      this.listaRespuestas4.push(this.respuesta119);
      this.respuesta120.texto_res = 'N/A';
      this.respuesta120.id_pregunta = 46;
      this.respuesta120.id_subpregunta = 89;
      this.listaRespuestas4.push(this.respuesta120);
      this.respuesta121.texto_res = 'N/A';
      this.respuesta121.id_pregunta = 46;
      this.respuesta121.id_subpregunta = 90;
      this.listaRespuestas4.push(this.respuesta121);
      this.respuesta122.texto_res = 'N/A';
      this.respuesta122.id_pregunta = 46;
      this.respuesta122.id_subpregunta = 91;
      this.listaRespuestas4.push(this.respuesta122);
      this.respuesta123.texto_res = 'N/A';
      this.respuesta123.id_pregunta = 46;
      this.respuesta123.id_subpregunta = 92;
      this.listaRespuestas4.push(this.respuesta123);
      this.respuesta124.texto_res = 'N/A';
      this.respuesta124.id_pregunta = 46;
      this.respuesta124.id_subpregunta = 93;
      this.listaRespuestas4.push(this.respuesta124);
      this.respuesta125.texto_res = 'N/A';
      this.respuesta125.id_pregunta = 46;
      this.respuesta125.id_subpregunta = 94;
      this.listaRespuestas4.push
      this.respuesta126.texto_res = 'N/A';
      this.respuesta126.id_pregunta = 46;
      this.respuesta126.id_subpregunta = 95;
      this.listaRespuestas4.push(this.respuesta126);
      this.respuesta127.texto_res = 'N/A';
      this.respuesta127.id_pregunta = 46;
      this.respuesta127.id_subpregunta = 96;
      this.listaRespuestas4.push(this.respuesta127);
    }


    for (let i = 41; i < 48; i++) {
      //debugger;
      const currentRespuesta = PREGUNTAS[i];
      const currentPregunta = PREGUNTAS[i - 1];
      this.listaRespuestas4[respCounter].id_pregunta = currentPregunta.id;
      this.listaRespuestas4[respCounter].id_empresa = id_empresa;
      this.listaRespuestas4[respCounter].id_subpregunta = null;

      if (currentPregunta.id === 42 || currentPregunta.id === 45 || currentPregunta.id === 47) {
        for (let j = 0; j < currentPregunta.subPreguntas.length; j++) {
          if (respCounter + j >= this.listaRespuestas4.length) {
            console.log(`Saliendo del loop de subpreguntas en j=${j} porque respCounter (${respCounter}) + j >= listaRespuestas4.length (${this.listaRespuestas4.length})`);
            break;
          }
          this.listaRespuestas4[respCounter + j].id_pregunta = currentPregunta.id;
          this.listaRespuestas4[respCounter + j].id_subpregunta = currentPregunta.subPreguntas[j].id;
          this.listaRespuestas4[respCounter + j].id_empresa = id_empresa;
        }
        respCounter += currentPregunta.subPreguntas.length;
        continue;
      }
      if (currentPregunta.isText) {
        if (!this.listaRespuestas4[respCounter].texto_res || this.listaRespuestas4[respCounter].texto_res === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return;
        }
      } else {
        if (!this.listaRespuestas4[respCounter].opcion || this.listaRespuestas4[respCounter].opcion === '') {
          this.alertService.errorAlert('Error', `La pregunta ${currentRespuesta.id} está vacía.`);
          isValidForm = false;
          return;
        }
      }
      if (currentPregunta.isAffirmativeQuestion) {
        if (this.listaRespuestas4[respCounter].opcion === 'No') {
          i += currentPregunta.subPreguntas.length;
          respCounter++;
          continue;
        }
      }
      respCounter++;
    }
    console.log('fuera del ciclo', this.listaRespuestas4);
  }

  enviarRespuestasJson() {
    this.onSubmitSeccion1();
    this.onSubmitSeccion2();
    this.onSubmitSeccion3();
    this.onSubmitSeccion4();

    let totalRespuestas = [];

    if (this.listaRespuestas1 && this.listaRespuestas1.length > 0) {
      totalRespuestas = totalRespuestas.concat(this.listaRespuestas1);
    }
    if (this.listaRespuestas2 && this.listaRespuestas2.length > 0) {
      totalRespuestas = totalRespuestas.concat(this.listaRespuestas2);
    }
    if (this.listaRespuestas3 && this.listaRespuestas3.length > 0) {
      totalRespuestas = totalRespuestas.concat(this.listaRespuestas3);
    }
    if (this.listaRespuestas4 && this.listaRespuestas4.length > 0) {
      totalRespuestas = totalRespuestas.concat(this.listaRespuestas4);
    }

    const payload = {
      respuestas: totalRespuestas,
      id_empresa: this.id_empresa
    };
    console.log('Payload a enviar:', payload);

    this.respuestasService.saveAnswers(this.token, payload).subscribe(
      (data: any) => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  currentSubSectionIndex: number = 0;
  currentIndex: number = 0;
  subSectionPerSection: number[] = [3, 3, 2, 7];
  progressPercentage: number = 0;

  updateProgress() {
    let answeredQuestions = 0;
    const totalQuestions = 126; // Ajuste este número al total real de preguntas

    // Verifique cada respuesta
    for (let i = 1; i <= 126; i++) {
      const respuesta = this['respuesta' + i] as Respuesta;
      if (respuesta && (respuesta.opcion || respuesta.texto_res)) {
        answeredQuestions++;
      }
    }

    this.progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  }
  loadNextSection(): void {
    this.section++;
  }



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
}
