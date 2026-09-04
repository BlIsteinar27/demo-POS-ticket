import Swal from 'sweetalert2';

// Configuración global de SweetAlert2
Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const sweetAlertHelper = {
  // Alertas de éxito
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#E2725B',
    });
  },

  // Alertas de error
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#E2725B',
    });
  },

  // Alertas de advertencia
  warning: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#E2725B',
    });
  },

  // Alertas de información
  info: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#E2725B',
    });
  },

  // Confirmación de eliminación (CRUD)
  confirmDelete: (itemName: string = 'este registro') => {
    return Swal.fire({
      title: '¿Estás seguro?',
      text: `No podrás recuperar ${itemName} después de eliminarlo`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E2725B',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  },

  // Confirmación de actualización (CRUD)
  confirmUpdate: (itemName: string = 'este registro') => {
    return Swal.fire({
      title: '¿Actualizar registro?',
      text: `Vas a modificar ${itemName}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E2725B',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    });
  },

  // Confirmación de creación (CRUD)
  confirmCreate: (itemName: string = 'nuevo registro') => {
    return Swal.fire({
      title: '¿Crear registro?',
      text: `Vas a crear ${itemName}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E2725B',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
    });
  },

  // Toast de éxito (notificación rápida)
  toastSuccess: (title: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  },

  // Toast de error (notificación rápida)
  toastError: (title: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  },

  // Toast de carga
  toastLoading: (title: string = 'Cargando...') => {
    return Swal.fire({
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Cerrar alerta
  close: () => {
    Swal.close();
  },
};

export default sweetAlertHelper;
