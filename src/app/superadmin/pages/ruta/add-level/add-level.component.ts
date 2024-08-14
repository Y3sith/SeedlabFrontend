import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActividadService } from '../../../../servicios/actividad.service';
import { AliadoService } from '../../../../servicios/aliado.service';
import { User } from '../../../../Modelos/user.model';
import { Router } from '@angular/router';
import { Nivel } from '../../../../Modelos/nivel.model';

@Component({
  selector: 'app-add-level',
  templateUrl: './add-level.component.html',
  styleUrl: './add-level.component.css'
})
export class AddLevelComponent {
  form: FormGroup;
  submitted = false;
  token: string | null = null;
  user: User | null = null;
  id: number | null = null;
  currentRolId: number;

  addLevelForm = this.fb.group({
    nombre:['', Validators.required],
    descripcion:['', Validators.required],
    id_actividad:['', Validators.required]
  })

  constructor(public dialogRef: MatDialogRef<AddLevelComponent>,
    private fb: FormBuilder,
    private router: Router,
    private actividadService:ActividadService,
    private aliadoService:AliadoService
  ) { }


  ngOnInit() {
    this.validateToken();
    this.addNivel();
  }

  validateToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      let identityJSON = localStorage.getItem('identity');

      if (identityJSON) {
        let identity = JSON.parse(identityJSON);
        this.user = identity;
        this.id = this.user.id;
        this.currentRolId = this.user.id_rol;
        if (this.currentRolId != 3) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  addNivel():void{
    this.submitted = true;
    const nivel: Nivel={
      nombre: this.addLevelForm.value.nombre,
      //id_actividad: this.addLevelForm.value.id_actividad
    }
  }



  // onSubmit() {
  //   this.submitted = true;
  //   if (this.form.valid) {
  //     console.log(this.form.value);
  //     // Aquí podrías enviar el formulario o realizar otra acción
  //   }
  // }

  // get levels(): FormArray {
  //   return this.form.get('levels') as FormArray;
  // }

  // // createLevel(): FormGroup {
  // //   return this.fb.group({
  // //     name: ['', Validators.required],
  // //     description: ['', Validators.required],
  // //     lessons: this.fb.array([this.createLesson()])
  // //   });
  // // }

  // createLesson(): FormGroup {
  //   return this.fb.group({
  //     lessonName: ['', Validators.required],
  //     url: [''],
  //     description: ['', Validators.required],
  //     file: [null, Validators.required]
  //   });
  // }

  // addLevel() {
  //   this.levels.push(this.createLevel());
  // }

  // addLesson(level: FormGroup) {
  //   const lessons = level.get('lessons') as FormArray;
  //   lessons.push(this.createLesson());
  // }

  // cancelLesson(level: FormGroup, index: number) {
  //   const lessons = level.get('lessons') as FormArray;
  //   if (lessons.length > 1) {
  //     lessons.removeAt(index);
  //   }
  // }

  // cancelModalAddNivel() {
  //   this.dialogRef.close();
  // }
}
