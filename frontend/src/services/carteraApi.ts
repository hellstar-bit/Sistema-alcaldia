// frontend/src/services/carteraApi.ts - VERSIÓN COMPLETA CON TODAS LAS FUNCIONES
import api, { ApiResponse } from './api';
import * as XLSX from 'xlsx';

// ===============================================
// INTERFACES
// ===============================================
export interface EPS {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPS {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
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

export interface CarteraData {
  id: string;
  eps: EPS;
  ips: IPS;
  periodo: Periodo;
  a30: number;
  a60: number;
  a90: number;
  a120: number;
  a180: number;
  a360: number;
  sup360: number;
  total: number;
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
  totalCartera: number;
}

export interface CarteraFilterParams {
  epsId?: string;
  periodoId?: string;
  ipsId?: string;
  search?: string;
  page?: number;
  limit?: number;
  soloConDatos?: boolean;
}

export interface CarteraResponse {
  data: CarteraData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalCartera: number;
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

// ===============================================
// SERVICIOS API
// ===============================================
export const carteraAPI = {
  // ===============================================
  // EPS
  // ===============================================
  async getAllEPS(): Promise<ApiResponse<EPS[]>> {
    try {
      console.log('🏢 CarteraAPI: Obteniendo todas las EPS...');
      const response = await api.get('/cartera/eps');
      console.log('✅ CarteraAPI: EPS obtenidas exitosamente:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al obtener EPS:', error);
      throw error;
    }
  },

  // ===============================================
  // PERÍODOS
  // ===============================================
  async getAllPeriodos(): Promise<ApiResponse<Periodo[]>> {
    try {
      console.log('📅 CarteraAPI: Obteniendo todos los períodos...');
      const response = await api.get('/cartera/periodos');
      console.log('✅ CarteraAPI: Períodos obtenidos exitosamente:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al obtener períodos:', error);
      throw error;
    }
  },

  async initializePeriodos(): Promise<ApiResponse<null>> {
    try {
      console.log('🔧 CarteraAPI: Inicializando períodos...');
      const response = await api.post('/cartera/periodos/initialize');
      console.log('✅ CarteraAPI: Períodos inicializados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al inicializar períodos:', error);
      throw error;
    }
  },

  // ===============================================
  // IPS
  // ===============================================
  async getAllIPS(): Promise<ApiResponse<IPS[]>> {
    try {
      console.log('🏥 CarteraAPI: Obteniendo todas las IPS...');
      const response = await api.get('/cartera/ips');
      console.log('✅ CarteraAPI: IPS obtenidas exitosamente:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al obtener IPS:', error);
      throw error;
    }
  },

  // ===============================================
  // DATOS DE CARTERA
  // ===============================================
  async getCarteraData(filters: CarteraFilterParams = {}): Promise<ApiResponse<CarteraResponse>> {
    try {
      console.log('💰 CarteraAPI: Obteniendo datos de cartera...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/cartera/data?${params.toString()}`);
      console.log('✅ CarteraAPI: Datos de cartera obtenidos:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al obtener datos de cartera:', error);
      throw error;
    }
  },

  async createCarteraData(data: {
    epsId: string;
    ipsId: string;
    periodoId: string;
    a30: number;
    a60: number;
    a90: number;
    a120: number;
    a180: number;
    a360: number;
    sup360: number;
    observaciones?: string;
  }): Promise<ApiResponse<CarteraData>> {
    try {
      console.log('➕ CarteraAPI: Creando datos de cartera...', data);
      const response = await api.post('/cartera/data', data);
      console.log('✅ CarteraAPI: Datos de cartera creados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al crear datos de cartera:', error);
      throw error;
    }
  },

  async getEPSPeriodoStatus(): Promise<ApiResponse<EPSPeriodoStatus[]>> {
    try {
      console.log('📊 CarteraAPI: Obteniendo estado EPS-Período...');
      const response = await api.get('/cartera/status');
      console.log('✅ CarteraAPI: Estado EPS-Período obtenido:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al obtener estado EPS-Período:', error);
      throw error;
    }
  },

  // ===============================================
  // ELIMINAR DATOS DE PERÍODO - NUEVA FUNCIONALIDAD
  // ===============================================
  async deleteCarteraDataByPeriodo(epsId: string, periodoId: string): Promise<DeletePeriodoDataResponse> {
    try {
      console.log('🗑️ CarteraAPI: Eliminando datos del período:', { epsId, periodoId });
      
      const response = await api.delete(`/cartera/data/periodo/${epsId}/${periodoId}`);
      
      console.log('✅ CarteraAPI: Datos eliminados exitosamente:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al eliminar datos del período:', error);
      
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

  // ===============================================
  // EXCEL
  // ===============================================
  async downloadPlantilla(): Promise<Blob> {
    try {
      console.log('📥 CarteraAPI: Descargando plantilla Excel...');
      const response = await api.get('/cartera/plantilla', {
        responseType: 'blob'
      });
      console.log('✅ CarteraAPI: Plantilla descargada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al descargar plantilla:', error);
      throw error;
    }
  },

  async uploadExcel(
    file: File, 
    epsId: string, 
    periodoId: string, 
    observaciones?: string
  ): Promise<ApiResponse<UploadResult>> {
    try {
      console.log('📤 CarteraAPI: Subiendo archivo Excel...', {
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

      const response = await api.post('/cartera/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ CarteraAPI: Archivo subido exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al subir archivo:', error);
      throw error;
    }
  },

  async exportToExcel(filters: CarteraFilterParams = {}): Promise<Blob> {
    try {
      console.log('📊 CarteraAPI: Exportando datos a Excel...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/cartera/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      console.log('✅ CarteraAPI: Datos exportados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ CarteraAPI: Error al exportar datos:', error);
      throw error;
    }
  },
};

// ===============================================
// UTILIDADES COMPLETAS
// ===============================================
export const carteraUtils = {
  // Funciones básicas de formato
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

  // Funciones de archivos
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

  validateExcelFile: (file: File): { valid: boolean; error?: string } => {
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
        error: `El archivo es demasiado grande. Tamaño máximo: ${carteraUtils.formatFileSize(maxSize)}`
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

  validateExcelStructure: (file: File): Promise<{ valid: boolean; error?: string }> => {
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
          const requiredHeaders = ['IPS', 'A30', 'A60', 'A90', 'A120', 'A180', 'A360', 'SUP360'];
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
          resolve({ valid: false, error: 'Error al leer el archivo Excel' });
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

  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  isExcelFile: (file: File): boolean => {
    const excelTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    return excelTypes.includes(file.type) || 
           file.name.toLowerCase().endsWith('.xlsx') || 
           file.name.toLowerCase().endsWith('.xls');
  },

  // Funciones específicas de cartera
  calculateTotal: (data: {
    a30: number;
    a60: number;
    a90: number;
    a120: number;
    a180: number;
    a360: number;
    sup360: number;
  }): number => {
    return data.a30 + data.a60 + data.a90 + data.a120 + data.a180 + data.a360 + data.sup360;
  },

  calculateTotalCartera: (carteraData: CarteraData[]): number => {
    return carteraData.reduce((total, item) => total + (item.total || 0), 0);
  },

  // Funciones para manejo de estado EPS-Período
  hasDataForPeriod: (epsPeriosoStatus: EPSPeriodoStatus[], epsId: string, periodoId: string): boolean => {
    const status = epsPeriosoStatus.find(
      item => item.epsId === epsId && item.periodoId === periodoId
    );
    return status ? status.tieneData : false;
  },

  getAvailablePeriodsForEPS: (periodosList: Periodo[], epsPeriosoStatus: EPSPeriodoStatus[], epsId: string): Periodo[] => {
    return periodosList.filter(periodo => {
      const hasData = carteraUtils.hasDataForPeriod(epsPeriosoStatus, epsId, periodo.id);
      return hasData;
    }).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.mes - a.mes;
    });
  },

  // Funciones para colores de cartera
  getCarteraColor: (value: number, type: string): string => {
    if (value <= 0) return 'text-gray-400';
    
    switch (type) {
      case 'a30':
        return 'text-green-600';
      case 'a60':
        return 'text-yellow-600';
      case 'a90':
      case 'a120':
        return 'text-orange-600';
      case 'a180':
      case 'a360':
        return 'text-red-600';
      case 'sup360':
        return 'text-red-800';
      default:
        return 'text-gray-900';
    }
  },

  getCarteraDistribution: (item: CarteraData) => {
    const total = item.total;
    if (total === 0) return {};
    
    return {
      a30Percent: ((item.a30 / total) * 100).toFixed(1),
      a60Percent: ((item.a60 / total) * 100).toFixed(1),
      a90Percent: ((item.a90 / total) * 100).toFixed(1),
      a120Percent: ((item.a120 / total) * 100).toFixed(1),
      a180Percent: ((item.a180 / total) * 100).toFixed(1),
      a360Percent: ((item.a360 / total) * 100).toFixed(1),
      sup360Percent: ((item.sup360 / total) * 100).toFixed(1)
    };
  },

  getCarteraRisk: (item: CarteraData): 'low' | 'medium' | 'high' => {
    const total = item.total;
    if (total === 0) return 'low';
    
    const oldCartera = item.a180 + item.a360 + item.sup360;
    const oldPercentage = (oldCartera / total) * 100;
    
    if (oldPercentage > 60) return 'high';
    if (oldPercentage > 30) return 'medium';
    return 'low';
  },

  validateCarteraData: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.ips || !data.ips.nombre) {
      errors.push('IPS requerida');
    }
    
    const amounts = ['a30', 'a60', 'a90', 'a120', 'a180', 'a360', 'sup360'];
    amounts.forEach(amount => {
      if (data[amount] < 0) {
        errors.push(`${amount.toUpperCase()} no puede ser negativo`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default carteraAPI;