import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';

import { LoginComponent } from './core/login/component/login.component';
import { NavbarComponent } from './core/navbar/component/navbar.component';
import { ToysComponent } from './features/shopping/toys/component/toys.component';
import { MedicalRecordsComponent } from './features/medicalRecords/component/medical-records.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    ToysComponent,
    MedicalRecordsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }