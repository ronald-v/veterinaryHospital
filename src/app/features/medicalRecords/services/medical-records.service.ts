import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { LoginService } from '../../../core/login/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordsService {
  private config =environment.endPoint;
  private opts: any;

  constructor(private http: HttpClient, private router: Router, private auth: LoginService) { 
    this.opts = this.auth.tokenHeader();
  }
  
  public create(frm: any, arrVaccinations: any) {
    const formData = new FormData();

    formData.append('request', JSON.stringify(frm));
    formData.append('Content-Type', 'multipart/form-data');
    formData.append('Accept', 'application/json');

    return this.http.post(this.config + '/medicalRecord/crudRecord', formData, this.opts);
  }
}
