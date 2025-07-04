import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { securityGuardGuard } from './core/securityGuard/security-guard.guard';
import { LoginComponent } from './core/login/component/login.component';
import { ToysComponent } from './features/shopping/toys/component/toys.component';
import { MedicalRecordsComponent } from './features/medicalRecords/component/medical-records.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {path: '01', component: ToysComponent},
  {path: '30', component: MedicalRecordsComponent},
  //{path: '', component: HomeComponent, canActivate: [securityGuardGuard]},
  { path: '**', pathMatch: 'full', redirectTo: '01' }
];
//0 Shop
  //01 Toys
  //02 Clothes
//1 Spa
  //11 Bath Appointment
  //12 Haircut Appointment
//2 Medicalservices
  //21 Medical Appointment
  //22 Vaccination Appointment
  //23 Deworming Appointment
//3 medicalRecord

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }