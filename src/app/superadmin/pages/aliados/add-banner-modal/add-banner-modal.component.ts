import { Component, Inject, Input, OnInit } from '@angular/core';
import { User } from '../../../../Modelos/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AliadoService } from '../../../../servicios/aliado.service';

@Component({
  selector: 'app-add-banner-modal',
  templateUrl: './add-banner-modal.component.html',
  styleUrl: './add-banner-modal.component.css'
})


export class AddBannerModalComponent {
  currentRolId: number;
  user: User | null = null;
  token: string;
  id: number | null = null;
  bannerForm: FormGroup;
  selectedBanner: File | null = null;
  idAliado: string; 

  constructor (  
    public dialogRef: MatDialogRef<AddBannerModalComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private aliadoService: AliadoService, 
  ){ 
    this.id = data.id;
    this.idAliado = data.idAliado;
    console.log("ALIADO",this.idAliado);
    console.log("IDDD",this.id);

    this.bannerForm = this.formBuilder.group({
      urlImagen: [Validators.required],
      estadobanner: ['Activo'],
    });

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
        if (this.currentRolId != 1) {
          this.router.navigate(['home']);
        }
      }
    }
    if (!this.token) {
      this.router.navigate(['home']);
    }
  }

  addBanner(): void{

    const formData = new FormData();
    if (this.selectedBanner) {
      formData.append('banner_urlImagen', this.selectedBanner, this.selectedBanner.name);
    }
    formData.append('banner_estadobanner', this.bannerForm.get('estadobanner')?.value);

    if ( this.id != null ) {

      // this.aliadoService.
    }

  }

    /* Cerrar el modal */
    cancelarModal() {
      this.dialogRef.close();
    }



}
