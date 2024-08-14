import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AliadoService } from '../../../../servicios/aliado.service';
import { AlertService } from '../../../../servicios/alert.service';
import { Router } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';
import { User } from '../../../../Modelos/user.model';
import { ActividadService } from '../../../../servicios/actividad.service';
import { Actividad } from '../../../../Modelos/actividad.model';

@Component({
  selector: 'app-edit-aliados',
  templateUrl: './edit-aliados.component.html',
  styleUrl: './edit-aliados.component.css'
})
export class EditAliadosComponent {

 
}
