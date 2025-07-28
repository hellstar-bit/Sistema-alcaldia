import api, { ApiResponse } from './api';
import * as XLSX from 'xlsx';

// ===============================================
// INTERFACES
// ===============================================
export interface FlujoControlCarga {
  id: string;
  eps: {
    id: string;
    codigo: string;
    nombre: string;
    activa: boolean;
  };
  periodo: {
    id: string;
    year: number;
    mes: number;
    nombre: string;
    activo: boolean;
  };
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlujoIpsData {
  id: string;
  controlCarga: FlujoControlCarga;
  ips: {
    id: string;
    codigo: string;
    nombre: string;
    activa: boolean;
  };
  incremento: number;
  tipoContrato?: string;
  fechaContrato?: string;
  valorFacturado: number;
  valorGlosa: number;
  reconocido: number;
  valorPagado: number;
  fechaPago?: string;
  saldoAdeudado: number;
  saldoTotal: number;
  orden?: string;
  giro?: string;
  observaciones?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlujoEpsData {
  id: string;
  controlCarga: FlujoControlCarga;
  upc: number;
  porcentaje92: number;
  pagosCumplimiento: number;
  pagos60: number;
  girado: number;
  cumplimientoRed: number;
  observaciones?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ControlCargaGrid {
  eps: {
    id: string;
    codigo: string;
    nombre: string;
    activa: boolean;
  };
  periodos: Array<{
    periodo: {
      id: string;
      year: number;
      mes: number;
      nombre: string;
      activo: boolean;
    };
    tieneData: boolean;
    totalRegistros: number;
  }>;
}

export interface FlujoFilterParams {
  epsId?: string;
  periodoId?: string;
  ipsId?: string;
  search?: string;
  page?: number;
  limit?: number;
  soloConDatos?: boolean;
}

export interface FlujoIpsResponse {
  data: FlujoIpsData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalValorFacturado: number;
    totalReconocido: number;
    totalPagado: number;
    totalSaldoAdeudado: number;
  };
}

export interface FlujoUploadResult {
  processed: number;
  errors: string[];
}

export interface DeleteFlujoPeriodoDataResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
    epsId: string;
    periodoId: string;
  } | null;
}

// NUEVA INTERFACE PARA INFORMACIÓN ADRES
export interface EpsAdresInfo {
  eps: string;
  periodo: string;
  upc: number;
  upc92: number;
  upc60: number;
  valorGirado: number;
}

// ===============================================
// SERVICIOS API
// ===============================================
export const flujoAPI = {
  // ===============================================
  // CONTROL DE CARGA
  // ===============================================
  async getControlCargaGrid(): Promise<ApiResponse<ControlCargaGrid[]>> {
    try {
      console.log('📊 FlujoAPI: Obteniendo control de carga...');
      const response = await api.get('/flujo/control-carga');
      console.log('✅ FlujoAPI: Control de carga obtenido exitosamente:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al obtener control de carga:', error);
      throw error;
    }
  },

  // ===============================================
  // DATOS DE IPS
  // ===============================================
  async getFlujoIpsData(filters: FlujoFilterParams = {}): Promise<ApiResponse<FlujoIpsResponse>> {
    try {
      console.log('💰 FlujoAPI: Obteniendo datos de flujo IPS...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/flujo/ips-data?${params.toString()}`);
      console.log('✅ FlujoAPI: Datos de flujo IPS obtenidos:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al obtener datos de flujo IPS:', error);
      throw error;
    }
  },

  async createFlujoIpsData(data: {
    controlCargaId: string;
    ipsId: string;
    incremento: number;
    tipoContrato?: string;
    fechaContrato?: string;
    valorFacturado: number;
    valorGlosa: number;
    reconocido: number;
    valorPagado: number;
    fechaPago?: string;
    saldoAdeudado: number;
    saldoTotal: number;
    orden?: string;
    giro?: string;
    observaciones?: string;
  }): Promise<ApiResponse<FlujoIpsData>> {
    try {
      console.log('➕ FlujoAPI: Creando datos de flujo IPS...', data);
      const response = await api.post('/flujo/ips-data', data);
      console.log('✅ FlujoAPI: Datos de flujo IPS creados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al crear datos de flujo IPS:', error);
      throw error;
    }
  },

  // ===============================================
  // DATOS DE EPS
  // ===============================================
  async getFlujoEpsData(epsId: string, periodoId: string): Promise<ApiResponse<FlujoEpsData | null>> {
    try {
      console.log('📈 FlujoAPI: Obteniendo datos de flujo EPS...', { epsId, periodoId });
      const response = await api.get(`/flujo/eps-data/${epsId}/${periodoId}`);
      console.log('✅ FlujoAPI: Datos de flujo EPS obtenidos exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al obtener datos de flujo EPS:', error);
      throw error;
    }
  },

  async createOrUpdateFlujoEpsData(data: {
    controlCargaId: string;
    upc: number;
    porcentaje92: number;
    pagosCumplimiento: number;
    pagos60: number;
    girado: number;
    cumplimientoRed: number;
    observaciones?: string;
  }): Promise<ApiResponse<FlujoEpsData>> {
    try {
      console.log('📝 FlujoAPI: Guardando datos de flujo EPS...', data);
      const response = await api.post('/flujo/eps-data', data);
      console.log('✅ FlujoAPI: Datos de flujo EPS guardados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al guardar datos de flujo EPS:', error);
      throw error;
    }
  },

  // ===============================================
  // NUEVA: INFORMACIÓN ADRES-FLUJO
  // ===============================================
  async getEpsAdresInfo(epsId: string): Promise<ApiResponse<EpsAdresInfo[]>> {
    try {
      console.log('🔍 FlujoAPI: Obteniendo información de ADRES para EPS...', { epsId });
      const response = await api.get(`/flujo/eps-adres-info/${epsId}`);
      console.log('✅ FlujoAPI: Información de ADRES obtenida exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al obtener información de ADRES:', error);
      throw error;
    }
  },

  // ===============================================
  // ELIMINAR DATOS DE PERÍODO
  // ===============================================
  async deleteFlujoPeriodoData(epsId: string, periodoId: string): Promise<DeleteFlujoPeriodoDataResponse> {
    try {
      console.log('🗑️ FlujoAPI: Eliminando datos del período:', { epsId, periodoId });
      
      const response = await api.delete(`/flujo/data/periodo/${epsId}/${periodoId}`);
      
      console.log('✅ FlujoAPI: Datos eliminados exitosamente:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al eliminar datos del período:', error);
      
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
      console.log('📥 FlujoAPI: Descargando plantilla Excel...');
      const response = await api.get('/flujo/plantilla', {
        responseType: 'blob'
      });
      console.log('✅ FlujoAPI: Plantilla descargada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al descargar plantilla:', error);
      throw error;
    }
  },

  async uploadExcel(
    file: File, 
    epsId: string, 
    periodoId: string, 
    observaciones?: string
  ): Promise<ApiResponse<FlujoUploadResult>> {
    try {
      console.log('📤 FlujoAPI: Subiendo archivo Excel...', {
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

      const response = await api.post('/flujo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ FlujoAPI: Archivo subido exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al subir archivo:', error);
      throw error;
    }
  },

  async exportToExcel(filters: FlujoFilterParams = {}): Promise<Blob> {
    try {
      console.log('📊 FlujoAPI: Exportando datos a Excel...', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/flujo/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      console.log('✅ FlujoAPI: Datos exportados exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ FlujoAPI: Error al exportar datos:', error);
      throw error;
    }
  },
};

// ===============================================
// UTILIDADES PARA FLUJO
// ===============================================
export const flujoUtils = {
  // Funciones básicas de formato
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  },

  formatPercentage: (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0.00%';
    }
    const numValue = Number(value);
    return `${numValue.toFixed(2)}%`;
  },

  formatDate: (date: Date | string): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  formatPeriodoName: (periodo: { mes: number; year: number; nombre: string }): string => {
    return `${periodo.nombre} ${periodo.year}`;
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
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls).'
      };
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: 50MB`
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
          const requiredHeaders = [
            'Prestador', 'Incremento Porcentual', 'Tipo de Contrato', 'Fecha contrato',
            'Valor facturado', 'Valor Glosa', 'Vr reconocido', 'Valor Pagado'
          ];
          
          const missingHeaders = requiredHeaders.filter(h => 
            !headers.some(header => header?.toLowerCase().includes(h.toLowerCase()))
          );
          
          if (missingHeaders.length > 0) {
            resolve({ 
              valid: false, 
              error: `Columnas faltantes o mal nombradas: ${missingHeaders.join(', ')}` 
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

  // Funciones específicas de flujo
  calculateTotalFacturado: (flujoData: FlujoIpsData[]): number => {
    return flujoData.reduce((total, item) => total + (item.valorFacturado || 0), 0);
  },

  calculateTotalReconocido: (flujoData: FlujoIpsData[]): number => {
    return flujoData.reduce((total, item) => total + (item.reconocido || 0), 0);
  },

  calculateTotalPagado: (flujoData: FlujoIpsData[]): number => {
    return flujoData.reduce((total, item) => total + (item.valorPagado || 0), 0);
  },

  calculateTotalSaldoAdeudado: (flujoData: FlujoIpsData[]): number => {
    return flujoData.reduce((total, item) => total + (item.saldoAdeudado || 0), 0);
  },

  getPaymentStatus: (item: FlujoIpsData): 'paid' | 'partial' | 'pending' => {
    if (item.valorPagado >= item.reconocido) return 'paid';
    if (item.valorPagado > 0) return 'partial';
    return 'pending';
  },

  getPaymentStatusColor: (status: 'paid' | 'partial' | 'pending'): string => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  getPaymentStatusText: (status: 'paid' | 'partial' | 'pending'): string => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Parcial';
      case 'pending': return 'Pendiente';
      default: return 'N/A';
    }
  }
};

export default flujoAPI;
