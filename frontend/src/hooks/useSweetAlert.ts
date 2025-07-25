// frontend/src/hooks/useSweetAlert.ts - VERSIÓN CORREGIDA
import Swal from 'sweetalert2';

interface AlertOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  confirmButtonColor?: string;  // ← Añadido
  cancelButtonColor?: string;   // ← Añadido
  allowOutsideClick?: boolean;  // ← Añadido
  allowEscapeKey?: boolean;     // ← Añadido
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

  const showSuccess = (titleOrOptions: string | AlertOptions, options?: AlertOptions) => {
    // Manejar sobrecarga de parámetros
    let finalOptions: AlertOptions;
    
    if (typeof titleOrOptions === 'string') {
      finalOptions = {
        title: titleOrOptions,
        ...options
      };
    } else {
      finalOptions = titleOrOptions;
    }

    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title: finalOptions.title || '¡Éxito!',
      text: finalOptions.text,
      confirmButtonText: finalOptions.confirmButtonText || 'Aceptar',
      showCancelButton: false,
      ...(finalOptions.confirmButtonColor && { 
        confirmButtonColor: finalOptions.confirmButtonColor,
        buttonsStyling: true 
      }),
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
      ...(options.confirmButtonColor && { 
        confirmButtonColor: options.confirmButtonColor,
        buttonsStyling: true 
      }),
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
      ...(options.confirmButtonColor && { 
        confirmButtonColor: options.confirmButtonColor,
        buttonsStyling: true 
      }),
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
      allowOutsideClick: options.allowOutsideClick ?? true,
      allowEscapeKey: options.allowEscapeKey ?? true,
      ...(options.confirmButtonColor && { 
        confirmButtonColor: options.confirmButtonColor,
        buttonsStyling: true 
      }),
      ...(options.cancelButtonColor && { 
        cancelButtonColor: options.cancelButtonColor,
        buttonsStyling: true 
      }),
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
      ...(options.confirmButtonColor && { 
        confirmButtonColor: options.confirmButtonColor,
        buttonsStyling: true 
      }),
    });
  };

  const showLoading = (title: string = 'Procesando...', text?: string) => {
    return Swal.fire({
      ...baseConfig,
      title,
      text,
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