import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  /* Muestra una alerta de confirmación para activar o desactivar algo */
  alertaActivarDesactivar(text: string, icon?: 'success' | 'error' | 'warning' | 'info' | 'question', confirmButtonText?: string, cancelButtonText?: string) {
    return Swal.fire({
      text: text,
      icon: icon,
      showCancelButton: true,
      cancelButtonColor: "#6b7280",
      confirmButtonColor: "#38bdf8",
      confirmButtonText: confirmButtonText || 'Confirmar',
      cancelButtonText: cancelButtonText || 'Cancelar',
      reverseButtons: true
    });
  }

  /* Muestra una alerta informativa con un solo botón de confirmación */
  alertainformativa(text: string, icon?: 'success' | 'error' | 'warning' | 'info' | 'question', confirmButtonText?: string) {
    return Swal.fire({
      text: text,
      icon: icon,
      confirmButtonColor: "#38bdf8",
      confirmButtonText: confirmButtonText || 'Aceptar',
      reverseButtons: true
    });
  }

  /* Muestra una alerta de confirmación para desactivar un emprendedor */
  DesactivarEmprendedor(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question', confirmButtonText?: string, cancelButtonText?: string) {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      cancelButtonColor: "#6b7280",
      confirmButtonColor: "#38bdf8",
      confirmButtonText: confirmButtonText || 'Confirmar',
      cancelButtonText: cancelButtonText || 'Cancelar',
      reverseButtons: true
    });
  }

  /* Muestra una alerta de éxito en forma de toast */
  successAlert(title: string, text: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
      customClass: {
        popup: 'bg-blue-100', 
        title: 'text-sky-500'
      }
    });
    Toast.fire({
      icon: "success",
      iconColor: "#00B3ED",
      title: text
    });
  }
/* Muestra una alerta de éxito en forma de toast */
  successAlert2(title: string, text: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
      customClass: {
        popup: 'bg-blue-100', 
        title: 'text-sky-500'
      }
    });
    Toast.fire({
      icon: "success",
      iconColor: "#00B3ED",
      title: text
    });
  }

  /* Muestra una alerta de error en forma de toast */
  errorAlert(title: string, text: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
      customClass: {
        popup: 'bg-orange-50',
        title: 'text-orange-700'
      }
    });
    Toast.fire({
      icon: "error",
      text: text,
      iconColor: "#FA7D00"
    });
  }

  /* Muestra una alerta de validación */
  validationAlert(title: string, text: string) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: "#3085d6",
    });
  }

  /* Muestra una alerta informativa */
  infoAlert(title: string, text: string) {
    return Swal.fire({
      icon: "info",
      title: title,
      text: text,
    });
  }
}