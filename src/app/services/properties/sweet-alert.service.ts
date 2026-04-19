import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {


  toast(message: string, icon: SweetAlertIcon = 'info', timer: number = 2000, afterClose?: () => void) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      icon,
      title: message
    }).then(() => {
      if (afterClose) afterClose();
    });
  }


  success(title: string, message: string, afterClose?: () => void) {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      if (afterClose) afterClose();
    });
  }

  warning(title: string, message: string, afterClose?: () => void) {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      if (afterClose) afterClose();
    });
  }

  error(title: string, message: string, afterClose?: () => void) {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      if (afterClose) afterClose();
    });
  }

  info(title: string, message: string, afterClose?: () => void) {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      if (afterClose) afterClose();
    });
  }

  // -----------------------------
  // Confirmation dialog (blocking)
  // -----------------------------
  confirm(title: string, text: string, confirmText: string = 'Yes', cancelText: string = 'No') {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
  }

  // Input prompt (blocking)
  prompt(title: string, text: string, placeholder: string = '') {
    return Swal.fire({
      title,
      text,
      input: 'text',
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel'
    });
  }
}
