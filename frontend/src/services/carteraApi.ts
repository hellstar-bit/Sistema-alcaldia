// frontend/src/services/carteraApi.ts
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

// ===============================================
// SERVICIOS API
// ===============================================
export const carteraAPI = {
  // ===============================================
  // EPS
  // ===============================================
  async getAllEPS(): Promise<ApiResponse<EPS[]>> {
    const response = await api.get('/cartera/eps');
    return response.data;
  },

  // ===============================================
  // PERÍODOS
  // ===============================================
  async getAllPeriodos(): Promise<ApiResponse<Periodo[]>> {
    const response = await api.get('/cartera/periodos');
    return response.data;
  },

  async initializePeriodos(): Promise<ApiResponse<null>> {
    const response = await api.post('/cartera/periodos/initialize');
    return response.data;
  },

  // ===============================================
  // IPS
  // ===============================================
  async getAllIPS(): Promise<ApiResponse<IPS[]>> {
    const response = await api.get('/cartera/ips');
    return response.data;
  },

  // ===============================================
  // DATOS DE CARTERA
  // ===============================================
  async getCarteraData(filters: CarteraFilterParams = {}): Promise<ApiResponse<CarteraResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/cartera/data?${params.toString()}`);
    return response.data;
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
    const response = await api.post('/cartera/data', data);
    return response.data;
  },

  async getEPSPeriodoStatus(): Promise<ApiResponse<EPSPeriodoStatus[]>> {
    const response = await api.get('/cartera/status');
    return response.data;
  },

  // ===============================================
  // EXCEL
  // ===============================================
  async downloadPlantilla(): Promise<Blob> {
    const response = await api.get('/cartera/plantilla', {
      responseType: 'blob'
    });
    return response.data;
  },

  async uploadExcel(
    file: File, 
    epsId: string, 
    periodoId: string, 
    observaciones?: string
  ): Promise<ApiResponse<UploadResult>> {
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
    return response.data;
  },

  async exportToExcel(filters: CarteraFilterParams = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/cartera/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// ===============================================
// UTILIDADES
// ===============================================
export const carteraUtils = {
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  },

  validateExcelStructure: (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length === 0) {
            resolve({ valid: false, error: 'El archivo está vacío' });
            return;
          }

          const headers = jsonData[0] as string[];
          const requiredHeaders = ['IPS', 'A30', 'A60', 'A90', 'A120', 'A180', 'A360', 'SUP360', 'TOTAL'];
          
          const missingHeaders = requiredHeaders.filter(header => 
            !headers.some(h => h?.toString().toUpperCase().trim() === header)
          );

          if (missingHeaders.length > 0) {
            resolve({ 
              valid: false, 
              error: `Faltan las siguientes columnas: ${missingHeaders.join(', ')}` 
            });
            return;
          }

          resolve({ valid: true });
        } catch (error) {
          resolve({ valid: false, error: 'Error al leer el archivo Excel' });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  validateExcelFile: (file: File): { valid: boolean; error?: string } => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return {
        valid: false,
        error: 'El archivo debe ser de formato Excel (.xlsx o .xls)'
      };
    }

    if (file.size > 50 * 1024 * 1024) {
      return {
        valid: false,
        error: 'El archivo no puede ser mayor a 50MB'
      };
    }

    return { valid: true };
  },

  hasDataForPeriod: (
    status: EPSPeriodoStatus[], 
    epsId: string, 
    periodoId: string
  ): boolean => {
    return status.some(item => 
      item.epsId === epsId && 
      item.periodoId === periodoId && 
      item.tieneData
    );
  },

  getAvailablePeriodsForEPS: (
    periodos: Periodo[], 
    status: EPSPeriodoStatus[], 
    epsId: string
  ): Periodo[] => {
    return periodos.filter(periodo => 
      carteraUtils.hasDataForPeriod(status, epsId, periodo.id)
    );
  },

  calculateTotalCartera: (data: CarteraData[]): number => {
    return data.reduce((sum, item) => sum + item.total, 0);
  },

  getCarteraColor: (value: number, type: 'a30' | 'a60' | 'a90' | 'a120' | 'a180' | 'a360' | 'sup360'): string => {
    if (value <= 0) return 'text-gray-400';
    
    switch (type) {
      case 'a30':
      case 'a60':
        return 'text-gray-900';
      case 'a90':
        return 'text-warning-700';
      case 'a120':
        return 'text-warning-800';
      case 'a180':
        return 'text-danger-600';
      case 'a360':
        return 'text-danger-700';
      case 'sup360':
        return 'text-danger-900';
      default:
        return 'text-gray-900';
    }
  }
};