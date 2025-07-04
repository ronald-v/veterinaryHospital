import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  public success(message: string)
  {
    Swal.close();
    Swal.fire({
      text: message,
      icon: 'success',
      confirmButtonText: 'Cerrar'
    });
  }

  public error(message: string)
  {
    Swal.close();
    Swal.fire({
      text: message,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }

  public warning(message: string)
  {
    Swal.close();
    Swal.fire({
      text: message,
      icon: 'warning',
      confirmButtonText: 'Cerrar'
    });
  }

  public info(message: string)
  {
    Swal.close();
    Swal.fire({
      text: message,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }
}