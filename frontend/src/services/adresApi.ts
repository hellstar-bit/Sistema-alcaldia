// frontend/src/services/adresApi.ts (versión corregida y completa)
import api, { ApiResponse } from './api';
import * as XLSX from 'xlsx';

// INTERFACES (ajustadas con todas las props de backend)
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
  observaciones?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EPSPeriodoStatus {
  epsId: string;
  periodoId: string;
  tieneData: boolean;
  totalRegistros: number;
  totalValorGirado: number;  // Ajustado a tu backend (totalCartera -> totalValorGirado)
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

// SERVICIOS API (agregada getEPSPeriodoStatus)
export const adresAPI = {
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

  async getEPSPeriodoStatus(): Promise<ApiResponse<EPSPeriodoStatus[]>> {  // ✅ AGREGADO
    try {
      console.log('📊 AdresAPI: Obteniendo estado EPS-Período...');
      const response = await api.get('/adres/status');  // Asume endpoint /adres/status en backend
      console.log('✅ AdresAPI: Estado EPS-Período obtenido:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener estado EPS-Período:', error);
      throw error;
    }
  },

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
      console.log('✅ AdresAPI: Datos de ADRES obtenidos:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al obtener datos de ADRES:', error);
      throw error;
    }
  },

  async createAdresData(data: {
    epsId: string;
    periodoId: string;
    upc: number;
    valorGirado: number;
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

  async getAdresStats(filters: AdresFilterParams = {}): Promise<ApiResponse<AdresStats>> {
    try {
      console.log('📊 AdresAPI: Obteniendo estadísticas de ADRES...', filters);
      
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
  },

  async deleteAdresDataByPeriodo(epsId: string, periodoId: string): Promise<DeletePeriodoDataResponse> {
    try {
      console.log('🗑️ AdresAPI: Eliminando datos del período:', { epsId, periodoId });
      
      const response = await api.delete(`/adres/data/periodo/${epsId}/${periodoId}`);
      
      console.log('✅ AdresAPI: Datos eliminados exitosamente:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al eliminar datos del período:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error de conexión al eliminar datos del período',
        data: null
      };
    }
  },

  async downloadPlantilla(): Promise<Blob> {
    try {
      console.log('📥 AdresAPI: Descargando plantilla...');
      const response = await api.get('/adres/plantilla', {
        responseType: 'blob'
      });
      console.log('✅ AdresAPI: Plantilla descargada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al descargar plantilla:', error);
      throw error;
    }
  },

  async uploadFile(
    file: File, 
    epsId: string, 
    periodoId: string, 
    observaciones?: string
  ): Promise<ApiResponse<UploadResult>> {
    try {
      console.log('📤 AdresAPI: Subiendo archivo...', {
        fileName: file.name,
        fileSize: file.size,
        epsId,
        periodoId
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('epsId', epsId);
      formData.append('periodoId', periodoId);
      if (observaciones) {
        formData.append('observaciones', observaciones);
      }

      const response = await api.post('/adres/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ AdresAPI: Archivo subido exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al subir archivo:', error);
      throw error;
    }
  },

  async exportToExcel(filters: AdresFilterParams = {}): Promise<Blob> {
    try {
      console.log('📊 AdresAPI: Exportando datos a Excel...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/adres/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      console.log('✅ AdresAPI: Datos exportados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ AdresAPI: Error al exportar datos:', error);
      throw error;
    }
  },
};

// UTILIDADES (igual que antes)
export const adresUtils = {
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDate: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatDateTime: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatPeriodoName: (periodo: Periodo): string => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[periodo.mes - 1]} ${periodo.year}`;
  },

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

  validateFile: (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV.'
      };
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${adresUtils.formatFileSize(maxSize)}`
      };
    }
    
    if (file.size === 0) {
      return {
        valid: false,
        error: 'El archivo está vacío'
      };
    }
    
    return { valid: true };
  },

  validateFileStructure: (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            resolve({ valid: false, error: 'El archivo no contiene hojas de cálculo' });
            return;
          }
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (!jsonData.length) {
            resolve({ valid: false, error: 'La hoja está vacía' });
            return;
          }
          
          const headers = jsonData[0] as string[];
          const requiredHeaders = ['EPS', 'UPC', 'Valor Girado'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            resolve({ 
              valid: false, 
              error: `Columnas faltantes: ${missingHeaders.join(', ')}` 
            });
            return;
          }
          
          if (jsonData.length < 2) {
            resolve({ valid: false, error: 'El archivo no contiene datos' });
            return;
          }
          
          resolve({ valid: true });
          
        } catch (error) {
          resolve({ valid: false, error: 'Error al leer el archivo' });
        }
      };
      
      reader.onerror = () => {
        resolve({ valid: false, error: 'Error al cargar el archivo' });
      };
      
      reader.readAsArrayBuffer(file);
    });
  },

  generateFileName: (prefix: string, epsNombre?: string, periodoNombre?: string): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    let fileName = `${prefix}_${timestamp}`;
    
    if (epsNombre) {
      fileName += `_${epsNombre.replace(/\s+/g, '_')}`;
    }
    
    if (periodoNombre) {
      fileName += `_${periodoNombre.replace(/\s+/g, '_')}`;
    }
    
    return `${fileName}.xlsx`;
  },

  calculateTotalValorGirado: (adresData: AdresData[]): number => {
    return adresData.reduce((total, item) => total + (item.valorGirado || 0), 0);
  },
};

export default adresAPI;
