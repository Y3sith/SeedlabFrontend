import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { provideClientHydration } from '@angular/platform-browser'; // Importa provideClientHydration

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  providers: [
    provideClientHydration(), // Asegúrate de incluir esto
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
