import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators'
import Swal from 'sweetalert2';

import { environment } from '../../../../environments/environment';
import { UserModule } from '../../../shared/models/user/user.module';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  logStatus$ = new EventEmitter();
  private config =environment.endPoint;

  constructor(private http: HttpClient, private router: Router) { }

  public Login(credencial: UserModule) {
    //API request
    return this.http.post(this.config + '/auth/login', credencial, { responseType: 'text' }).pipe(
      map(response => {
        localStorage.setItem('token', response);
        localStorage.setItem('user', credencial.email);
      })
    );
  }

  public logout() {
    this.router.navigate(['/login']);
    localStorage.clear();
    Swal.close();
  }
}