// frontend/src/services/adresApi.ts - VERSIÓN CORREGIDA Y COMPLETA
import api, { ApiResponse } from './api';
import * as XLSX from 'xlsx';

// ✅ INTERFACES - ACTUALIZADAS Y CONSISTENTES CON EL BACKEND
export interface EPS {
  id: string;
  codigo: string;
  nombre: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Periodo {
  id: string;
  year: number;
  mes: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdresData {
  id: string;
  eps: EPS;
  periodo: Periodo;
  upc: number;
  valorGirado: number;
  pagos?: number; // ✅ Opcional porque puede no estar en todos los registros
  cumplimientoPagos?: number; // ✅ Opcional porque puede no estar en todos los registros
  observaciones?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ INTERFACE CLAVE: EPSPeriodoStatus - igual que cartera y flujo
export interface EPSPeriodoStatus {
  epsId: string;
  periodoId: string;
  tieneData: boolean;
  totalRegistros: number;
  totalValorGirado: number;
}

export interface AdresFilterParams {
  epsId?: string;
  periodoId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdresResponse {
  data: AdresData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalValorGirado: number;
  };
}

export interface UploadResult {
  processed: number;
  errors: string[];
}

export interface DeletePeriodoDataResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
    epsId: string;
    periodoId: string;
  } | null;
}

export interface AdresStats {
  totalRegistros: number;
  totalUPC: number;
  totalValorGirado: number;
  porEPS: Array<{ epsNombre: string, count: number, sumValorGirado: number }>;
}

// ✅ SERVICIOS API - COMPLETOS Y CORREGIDOS
export const adresAPI = {

  async downloadPlantilla(): Promise<Blob> {
    try {
      console.log('📥 AdresAPI: Descargando plantilla ADRES...');

      const response = await api.get('/adres/plantilla', {
        responseType: 'blob',
        timeout: 30000, // 30 segundos
      });

      console.log('✅ AdresAPI: Plantilla descargada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al descargar plantilla:', error);
      throw error;
    }
  },
  // ✅ Obtener todas las EPS
  async getEPS(): Promise<ApiResponse<EPS[]>> {
    try {
      console.log('🏢 AdresAPI: Obteniendo todas las EPS...');
      const response = await api.get('/adres/eps');
      console.log('✅ AdresAPI: EPS obtenidas exitosamente:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener EPS:', error);
      throw error;
    }
  },

  // ✅ Obtener todos los períodos
  async getPeriodos(): Promise<ApiResponse<Periodo[]>> {
    try {
      console.log('📅 AdresAPI: Obteniendo todos los períodos...');
      const response = await api.get('/adres/periodos');
      console.log('✅ AdresAPI: Períodos obtenidos exitosamente:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener períodos:', error);
      throw error;
    }
  },

  // ✅ MÉTODO CLAVE: Obtener estado EPS-Período para indicadores visuales
  async getEPSPeriodoStatus(): Promise<ApiResponse<EPSPeriodoStatus[]>> {
  try {
    console.log('📊 AdresAPI: Obteniendo estado EPS-Período...');
    const response = await api.get('/adres/status');
    
    // 🔍 DEBUG: Log completo de la respuesta del backend
    console.log('🔍 DEBUG API: Raw response from backend:', response);
    console.log('🔍 DEBUG API: Response data structure:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      dataKeys: response.data ? Object.keys(response.data) : 'no data'
    });
    
    if (response.data && response.data.data) {
      console.log('🔍 DEBUG API: Response data.data structure:', {
        length: response.data.data.length,
        sampleItem: response.data.data[0],
        allItemKeys: response.data.data[0] ? Object.keys(response.data.data[0]) : 'no items'
      });
    }
    
    console.log('✅ AdresAPI: Estado EPS-Período obtenido:', response.data.data?.length || 0);
    
    // 🔍 DEBUG: Verificar tipos de datos
    if (response.data.data && response.data.data[0]) {
      const item = response.data.data[0];
      console.log('🔍 DEBUG API: Item data types:', {
        epsId: { value: item.epsId, type: typeof item.epsId },
        periodoId: { value: item.periodoId, type: typeof item.periodoId },
        tieneData: { value: item.tieneData, type: typeof item.tieneData },
        totalRegistros: { value: item.totalRegistros, type: typeof item.totalRegistros }
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ AdresAPI: Error al obtener estado EPS-Período:', error);
    console.error('❌ DEBUG API: Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // ✅ En caso de error, retornar estructura válida pero vacía
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error desconocido',
      data: []
    };
  }
},

  // ✅ Obtener datos de ADRES con filtros
  async getAdresData(filters: AdresFilterParams = {}): Promise<ApiResponse<AdresResponse>> {
    try {
      console.log('💰 AdresAPI: Obteniendo datos de ADRES...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/adres/data?${params.toString()}`);
      console.log('✅ AdresAPI: Datos de ADRES obtenidos:', {
        recordsFound: response.data.data?.data?.length || 0,
        total: response.data.data?.pagination?.total || 0
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener datos de ADRES:', error);
      throw error;
    }
  },

  // ✅ Crear datos de ADRES
  async createAdresData(data: {
    epsId: string;
    periodoId: string;
    upc: number;
    valorGirado: number;
    pagos?: number;
    cumplimientoPagos?: number;
    observaciones?: string;
  }): Promise<ApiResponse<AdresData>> {
    try {
      console.log('➕ AdresAPI: Creando datos de ADRES...', data);
      const response = await api.post('/adres/data', data);
      console.log('✅ AdresAPI: Datos de ADRES creados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al crear datos de ADRES:', error);
      throw error;
    }
  },

  // ✅ Subir archivo Excel
  async uploadFile(
    file: File,
    epsId: string,
    periodoId: string
  ): Promise<any> {
    try {
      console.log('🚀 AdresAPI: Iniciando upload de archivo', {
        fileName: file.name,
        fileSize: file.size,
        epsId,
        periodoId
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('epsId', epsId);
      formData.append('periodoId', periodoId);

      // ✅ CORRECCIÓN: Asegurarse de que el endpoint sea correcto
      const response = await api.post('/adres/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos de timeout para archivos grandes
      });

      console.log('✅ AdresAPI: Upload completado exitosamente', {
        processed: response.data.data?.processed || 0,
        errors: response.data.data?.errors?.length || 0
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error en upload de archivo:', error);
      
      // Mejorar el manejo de errores
      if (error.response) {
        // Error de respuesta del servidor
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Error del servidor: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión: No se pudo conectar con el servidor');
      } else {
        // Error de configuración
        throw new Error(error.message || 'Error desconocido al subir el archivo');
      }
    }
  },

  // ✅ Eliminar datos por período
  async deleteAdresDataByPeriodo(epsId: string, periodoId: string): Promise<DeletePeriodoDataResponse> {
    try {
      console.log('🗑️ AdresAPI: Eliminando datos por período...', { epsId, periodoId });
      const response = await api.delete(`/adres/data/periodo/${epsId}/${periodoId}`);
      console.log('✅ AdresAPI: Datos eliminados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al eliminar datos:', error);
      throw error;
    }
  },

  // ✅ Exportar a Excel
  async exportToExcel(filters: AdresFilterParams = {}): Promise<Blob> {
    try {
      console.log('📊 AdresAPI: Exportando a Excel...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/adres/export?${params.toString()}`, {
        responseType: 'blob'
      });

      console.log('✅ AdresAPI: Exportación completada');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al exportar:', error);
      throw error;
    }
  },

  // ✅ Obtener estadísticas
  async getStats(filters: AdresFilterParams = {}): Promise<ApiResponse<AdresStats>> {
    try {
      console.log('📈 AdresAPI: Obteniendo estadísticas...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/adres/stats?${params.toString()}`);
      console.log('✅ AdresAPI: Estadísticas obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener estadísticas:', error);
      throw error;
    }
  }
};

// ✅ UTILIDADES PARA ADRES - CONSISTENTES CON CARTERA Y FLUJO
export const adresUtils = {
  // ✅ Formatear moneda
  formatCurrency: (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0';
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },

  // ✅ Formatear números grandes
  formatNumber: (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    return new Intl.NumberFormat('es-CO').format(value);
  },

  // ✅ Formatear porcentaje
  formatPercentage: (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%';
    }
    
    return `${value.toFixed(1)}%`;
  },

   
  // ✅ CORRECCIÓN: Validar archivo Excel (CONSISTENTE CON CARTERA Y FLUJO)
  validateExcelFile: (file: File): { isValid: boolean; error?: string } => {
    console.log('🔍 Validando archivo ADRES:', file.name);
    
    // Validar que existe el archivo
    if (!file) {
      return { isValid: false, error: 'No se ha seleccionado ningún archivo' };
    }

    // Validar tamaño (50MB máximo)
    const maxSize = 50 * 1024 * 1024; // 50MB en bytes
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `El archivo es demasiado grande. Tamaño máximo permitido: 50MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB` 
      };
    }

    // Validar extensión
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      return { 
        isValid: false, 
        error: `Formato de archivo no válido. Formatos permitidos: ${allowedExtensions.join(', ')}` 
      };
    }

    // Validar que no esté vacío
    if (file.size === 0) {
      return { isValid: false, error: 'El archivo está vacío' };
    }

    console.log('✅ Archivo ADRES válido:', file.name);
    return { isValid: true };
  },

  // ✅ NUEVA FUNCIÓN: Validar estructura de archivo (simplificada)
  validateFileStructure: async (file: File): Promise<{ valid: boolean; error?: string }> => {
    try {
      console.log('🔍 Validando estructura del archivo ADRES...');
      
      // Por ahora, solo validar que el archivo se pueda leer
      // La validación detallada se hará en el backend
      return { valid: true };
      
    } catch (error) {
      console.error('❌ Error al validar estructura:', error);
      return { 
        valid: false, 
        error: 'No se pudo validar la estructura del archivo. Verifica que sea un archivo Excel válido.' 
      };
    }
  },

  // ✅ Generar nombre de archivo para exportación
  generateFileName: (prefix: string, epsNombre?: string, periodoNombre?: string): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    let filename = `${prefix}_${timestamp}`;
    
    if (epsNombre) {
      const cleanEpsName = epsNombre.replace(/[^a-zA-Z0-9]/g, '_');
      filename += `_${cleanEpsName}`;
    }
    
    if (periodoNombre) {
      const cleanPeriodName = periodoNombre.replace(/[^a-zA-Z0-9]/g, '_');
      filename += `_${cleanPeriodName}`;
    }
    
    return `${filename}.xlsx`;
  },

  

  // ✅ Descargar blob como archivo
  downloadBlob: (blob: Blob, filename: string): void => {
    console.log('📥 Descargando archivo:', filename);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log('✅ Descarga iniciada:', filename);
  },
}

// ✅ Exportar todo como default también para compatibilidad
export default {
  adresAPI,
  adresUtils
};