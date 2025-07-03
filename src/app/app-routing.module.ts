import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { securityGuardGuard } from './core/securityGuard/security-guard.guard';
import { LoginComponent } from './core/login/component/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }