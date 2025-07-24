// frontend/src/hooks/useSweetAlert.ts
import Swal from 'sweetalert2';

interface AlertOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

export const useSweetAlert = () => {
  // Configuración base para mantener la estética del sistema
  const baseConfig = {
    customClass: {
      popup: 'rounded-xl shadow-xl',
      title: 'text-xl font-bold text-primary-900',
      content: 'text-gray-600',
      confirmButton: 'bg-primary-900 hover:bg-primary-800 text-white font-medium py-2 px-4 rounded-lg mr-2 transition-colors duration-200',
      cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
    },
    buttonsStyling: false,
    reverseButtons: true,
  };

  const showSuccess = (options: AlertOptions) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title: options.title || '¡Éxito!',
      text: options.text,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      showCancelButton: false,
    });
  };

  const showError = (options: AlertOptions) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title: options.title || 'Error',
      text: options.text,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      showCancelButton: false,
    });
  };

  const showWarning = (options: AlertOptions) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title: options.title || 'Advertencia',
      text: options.text,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      showCancelButton: false,
    });
  };

  const showConfirm = (options: AlertOptions) => {
    return Swal.fire({
      ...baseConfig,
      icon: options.icon || 'question',
      title: options.title || '¿Estás seguro?',
      text: options.text,
      confirmButtonText: options.confirmButtonText || 'Sí, confirmar',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      showCancelButton: true,
    });
  };

  const showInfo = (options: AlertOptions) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title: options.title || 'Información',
      text: options.text,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      showCancelButton: false,
    });
  };

  const showLoading = (title: string = 'Procesando...') => {
    return Swal.fire({
      ...baseConfig,
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const close = () => {
    Swal.close();
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    showInfo,
    showLoading,
    close,
  };
};