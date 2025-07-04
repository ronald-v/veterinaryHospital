import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import { AlertService } from '../../alerts/alert.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})

export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: LoginService, private router: Router, private alert: AlertService) { 
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern("^[0-9A-Za-z]*$")]]
    });
  }

  public Login() {
    if (!this.loginForm.valid) {
      this.alert.error("Completa toda la información antes de acceder");
      return;
    }

    localStorage.setItem('token', "olikujy5th15rth5eref1e5ef");
    this.router.navigate(['30']);
    /*
    Swal.showLoading();
    this.auth.Login(this.loginForm.value).subscribe((res:any) => {
      Swal.close();
      this.router.navigate(['home']);
    },(err:any) => {
      Swal.close();
      this.alert.error("Credenciales invalidas, por favor verifique los datos ingresado y vuelva a intentar");
    });
    */
  }

  get validEmail() { return this.loginForm.get('email')!.invalid && this.loginForm.get('email')!.touched }
  get validPassword() { return this.loginForm.get('password')!.invalid && this.loginForm.get('password')!.touched }
}