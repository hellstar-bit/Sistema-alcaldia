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
  // ✅ Obtener todas las EPS
  async getAllEPS(): Promise<ApiResponse<EPS[]>> {
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
  async getAllPeriodos(): Promise<ApiResponse<Periodo[]>> {
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
      console.log('✅ AdresAPI: Estado EPS-Período obtenido:', response.data.data?.length || 0);
      
      // ✅ DEBUG: Log de estructura de datos recibida
      if (response.data.data && response.data.data.length > 0) {
        console.log('🔍 AdresAPI: Sample status data:', {
          firstItem: response.data.data[0],
          structure: Object.keys(response.data.data[0])
        });
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener estado EPS-Período:', error);
      // ✅ En caso de error, retornar estructura válida pero vacía para evitar crashes
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
  async uploadExcel(file: File, epsId: string, periodoId: string): Promise<ApiResponse<UploadResult>> {
    try {
      console.log('📤 AdresAPI: Subiendo archivo Excel...', {
        fileName: file.name,
        fileSize: file.size,
        epsId,
        periodoId
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('epsId', epsId);
      formData.append('periodoId', periodoId);

      const response = await api.post('/adres/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ AdresAPI: Archivo Excel subido exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al subir archivo Excel:', error);
      throw error;
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
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ✅ Validar archivo Excel
  validateExcelFile: (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'El archivo debe ser un Excel (.xlsx o .xls)'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo no debe superar los 10MB'
      };
    }

    return { isValid: true };
  },

  // ✅ Formatear nombre de período para display
  formatPeriodoName: (periodo: Periodo): string => {
    return `${periodo.nombre} ${periodo.year}`;
  },

  // ✅ Obtener color para cumplimiento
  getCumplimientoColor: (cumplimiento: number): string => {
    if (cumplimiento >= 90) return 'text-green-600';
    if (cumplimiento >= 70) return 'text-yellow-600';
    return 'text-red-600';
  },

  // ✅ Obtener clases CSS para badges de cumplimiento
  getCumplimientoBadgeClasses: (cumplimiento: number): string => {
    if (cumplimiento >= 90) return 'bg-green-100 text-green-800';
    if (cumplimiento >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }
};

// ✅ Exportar todo como default también para compatibilidad
export default {
  adresAPI,
  adresUtils
};