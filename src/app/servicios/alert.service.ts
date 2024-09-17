import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  // deleteAlert(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question', confirmButtonText?: string ){
  //   Swal.fire({
  //     title: title,
  //     text: text,
  //     icon: icon,
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: confirmButtonText || 'OK'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       Swal.fire({
  //         title: "Deleted!",
  //         text: "Your file has been deleted.",
  //         icon: "success"
  //       });
  //     }
  //   });
  // }


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

  alertainformativa(text: string, icon?: 'success' | 'error' | 'warning' | 'info' | 'question', confirmButtonText?: string) {
    return Swal.fire({
      text: text,
      icon: icon,
      confirmButtonColor: "#38bdf8",
      confirmButtonText: confirmButtonText || 'Aceptar',
      reverseButtons: true
    });
  }

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
        popup: 'bg-blue-100', // Establecer el color de fondo verde claro
        title: 'text-sky-500' // Establecer el color del texto del título
      }
    });
    Toast.fire({
      icon: "success",
      iconColor: "#00B3ED",
      title: text
    });
  }

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

  validationAlert(title: string, text: string) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      confirmButtonColor: "#3085d6",
    });
  }

  infoAlert(title: string, text: string) {
    return Swal.fire({
      icon: "info",
      title: title,
      text: text,
      //footer: '<a href="#">Why do I have this issue?</a>'
    });
  }

  // warningAlert(title: string, text: string) {
  //   Swal.fire({
  //     icon: "warning",
  //     title: title,
  //     text: text,
  //     footer: '<a href="#">Why do I have this issue?</a>'
  //   });
  // }

}
