import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faEye, faIdCard, faLandmarkFlag, faMountainCity, faPhone, faVenusMars } from '@fortawesome/free-solid-svg-icons';
import { Emprendedor } from '../../../Modelos/emprendedor.model';
import { AlertService } from '../../../servicios/alert.service';
import { AuthService } from '../../../servicios/auth.service';
import { EmprendedorService } from '../../../servicios/emprendedor.service';
import { DepartamentoService } from '../../../servicios/departamento.service';
import { MunicipioService } from '../../../servicios/municipio.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule],
  providers: [DepartamentoService, MunicipioService, AuthService, AlertService],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  faVenusMars = faVenusMars;
  faMountainCity = faMountainCity;
  faLandmarkFlag = faLandmarkFlag;
  showPassword = faEye;
  faIdCard = faIdCard;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  hide = true;
  listDepartamentos: any[] = [];
  listMunicipios: any[] = [];
  listTipoDocumento: []= [];
  departamentoPredeterminado = '';
  registerForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;
  email: string;
  listTipoDocumento: any[] = [];

  currentIndex = 0;
  progressWidth = 0;
  totalFields = 12;

  sections = [
    { title: 'Información Personal', fieldNames: ['nombre', 'apellido', 'nombretipodoc', 'documento'] },
    { title: 'Información Adicional', fieldNames: ['fecha_nacimiento', 'genero', 'password', 'email'] },
    { title: 'Ubicación', fieldNames: ['celular', 'departamento', 'municipio', 'direccion'] }
  ];

  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private municipioService: MunicipioService,
    private registroService: AuthService,
    
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.cargarDepartamentos();
    this.tipoDocumento();
    this.registerForm = this.fb.group({
      documento: ['', [Validators.required, this.documentoValidator]],
      nombretipodoc: ['', Validators.required],
      nombre: ['', [Validators.required, this.noNumbersValidator]],
      apellido: ['', [Validators.required, this.noNumbersValidator]],
      celular: ['', [Validators.required, Validators.maxLength(10)]],
      genero: ['', Validators.required],
      fecha_nacimiento: ['', [Validators.required, this.dateRangeValidator]],
      municipio: ['', Validators.required],
      direccion: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      estado: '1',
      departamento: ['', Validators.required] // Añadir el campo departamento al formulario
    });
  }

  documentoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? control.value.toString() : '';
    if (value.length < 5 || value.length > 13) {
      return { lengthError: 'El número de documento debe tener entre 5 y 13 dígitos *' };
    }
    return null;
  }

  updateProgress() {
    let filledFields = 0;
    for (const controlName in this.registerForm.controls) {
      if (this.registerForm.controls.hasOwnProperty(controlName)) {
        const control = this.registerForm.get(controlName);
        if (control && control.value) {
          filledFields++;
        }
      }
    }
    this.progressWidth = (filledFields / this.totalFields) * 100;
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateProgress();
    }
  }

  next() {
    if (this.currentIndex < this.sections.length - 1) {
      const currentSectionFields = this.sections[this.currentIndex].fieldNames;
      const allFilled = currentSectionFields.every(field => {
        const control = this.registerForm.get(field);
        return control && control.value && !control.errors;
      });

      if (!allFilled) {
        this.alertService.errorAlert('Campos Vacíos', 'Por favor, complete todos los campos antes de avanzar.');
        return;
      }

      this.currentIndex++;
      this.updateProgress();
    }
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    if (hasUpperCase && hasSpecialChar) {
      return null;
    } else {
      return { passwordStrength: 'La contraseña debe contener al menos una letra mayúscula y un carácter especial *' };
    }
  }

  noNumbersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasNumbers = /\d/.test(value);

    if (hasNumbers) {
      return { hasNumbers: 'El campo no debe contener números *' };
    } else {
      return null;
    }
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasAtSymbol = /@/.test(value);

    if (!hasAtSymbol) {
      return { emailInvalid: 'El correo debe ser válido *' };
    } else {
      return null;
    }
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null; // Si no hay valor, no se valida
    }
  
    const selectedDate = new Date(value);
    const today = new Date();
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
  
    if (selectedDate > today) {
      return { futureDate: 'La fecha no es válida *' };
    } else if (selectedDate < hundredYearsAgo) {
      return { tooOld: 'La fecha no es válida *' };
    } else if (selectedDate > eighteenYearsAgo) {
      return { tooRecent: 'Debe tener al menos 18 años *' };
    } else {
      return null;
    }
  }

  get f() { return this.registerForm.controls; }

  cargarDepartamentos(): void {
    this.departamentoService.getDepartamento().subscribe(
      (data: any[]) => {
        this.listDepartamentos = data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onDepartamentoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast a HTMLSelectElement
    const selectedDepartamento = target.value;

    // Guarda el departamento seleccionado en el localStorage
    localStorage.setItem('departamento', selectedDepartamento);

    // Llama a cargarMunicipios si es necesario
    this.cargarMunicipios(selectedDepartamento);
  }

  cargarMunicipios(idDepartamento: string): void {
    this.municipioService.getMunicipios(idDepartamento).subscribe(
      data => {
        this.listMunicipios = data;
        console.log('Municipios cargados:', JSON.stringify(data));
      },
      err => {
        console.log('Error al cargar los municipios:', err);
      }
    );
  }

  tipoDocumento():void{
      this.registroService.tipoDato().subscribe(
        data => {
          this.listTipoDocumento = data;

          console.log(this.listTipoDocumento);
          //console.log('datos tipo de documento: ',data)
        },
        error => {
          console.log(error);
        }
      )
  }

  registro(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      this.alertService.errorAlert('Error en el Formulario', 'Por favor, complete todos los campos requeridos.');
      return;
    }

    const emprendedor = new Emprendedor(
      this.f.documento.value,
      this.f.nombretipodoc.value,
      this.f.nombre.value,
      this.f.apellido.value,
      //this.f.imagen_perfil.value,
      this.f.celular.value,
      this.f.email.value,
      this.f.password.value,
      this.f.genero.value,
      this.f.fecha_nacimiento.value,
      this.f.direccion.value,
      this.f.estado.value,
      this.f.municipio.value
    );

    this.registroService.registrar(emprendedor).subscribe(
      (response: any) => {
        this.alertService.successAlert('Registro exitoso', response.message);
        this.email = response.email;
        this.router.navigate(['/verification'], { queryParams: { email: this.email } });
      },
      (error) => {
        if (error.status === 400) {
          const errorMessage = error.error.message;

          if (errorMessage.includes('documento')) {
            this.currentIndex = 0; // Redirige a la sección del documento
            this.f.documento.setErrors({ exists: true });
            this.alertService.errorAlert('Error', 'El número de documento ya existe. Por favor, corrígelo.');
          } else if (errorMessage.includes('correo')) {
            this.currentIndex = 1; // Redirige a la sección del correo
            this.f.email.setErrors({ exists: true });
            this.alertService.errorAlert('Error', 'El correo electrónico ya existe. Por favor, corrígelo.');
          } else {
            this.alertService.errorAlert('Error', errorMessage);
          }
        } else {
          this.alertService.errorAlert('Error', error.message);
        }
      }
    );
  }
}
