import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './Inicio/menu/menu.component';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule ,MenuComponent, HttpClientModule, ReactiveFormsModule, FormsModule],
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SeedLabFrontend';
}
