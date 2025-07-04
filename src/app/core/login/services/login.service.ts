import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators'
import Swal from 'sweetalert2';

import { environment } from '../../../../environments/environment';
import { UserModule } from '../../../shared/models/user/user.module';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
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

  public IsAuth(): any {
    let token = localStorage.getItem('token');

    if (token && token !== undefined && token != ''){
      this.GetAuthState();
      return true;
    }else{
      return false;
    }
  }

  private GetAuthState(): any {
    let token = localStorage.getItem('token');

    this.http.get(environment.endPoint + 'api/Auth/isAuth', { headers: new HttpHeaders({ 'Authorization': "Bearer " + token }) }).subscribe(res => {
    }, (err:any) => {
      this.logout();
    });
  }

  public readToken() {
    let token = localStorage.getItem('token')!;

    if (token && token !== undefined && token != ''){
      this.IsAuth();
      return token;
    } else {
      this.logout();
      return null;
    }
  }

  public tokenHeader() {
    return { headers: new HttpHeaders({ 'Authorization': "Bearer " + this.readToken() }) } 
  }
}