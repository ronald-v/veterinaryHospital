import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../../login/services/login.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.sass'
})
export class NavbarComponent {
  constructor(private auth: LoginService, private router: Router) {}

  public Logout() { 
    this.auth.logout(); 
  }

  //Redirecciona a la ruta correspondiente, dependiendo del boton seleccionado
  public addressing(Module: number, index: number){
    this.router.navigate(['/' + Module + '' + index]);
  }
}
