// frontend/src/services/gestionApi.ts
import api, { ApiResponse } from './api';

// ===============================================
// INTERFACES ACTUALIZADAS
// ===============================================
export interface EPSDetailed {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
  ipsAsignadas?: IPSDetailed[];
}

export interface IPSDetailed {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipoServicio?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
  eps?: EPSDetailed[];
}

export interface CreateEPSRequest {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activa?: boolean;
}

export interface UpdateEPSRequest {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activa?: boolean;
}

export interface CreateIPSRequest {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipoServicio?: string;
  activa?: boolean;
}

export interface UpdateIPSRequest {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipoServicio?: string;
  activa?: boolean;
}

export interface EPSFilterParams {
  search?: string;
  soloActivas?: boolean;
  orderBy?: 'nombre' | 'codigo' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface IPSFilterParams {
  search?: string;
  soloActivas?: boolean;
  tipoServicio?: string;
  epsId?: string;
  sinAsignar?: boolean;
  orderBy?: 'nombre' | 'codigo' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EPSStats {
  total: number;
  activas: number;
  inactivas: number;
  conIPS: number;
  sinIPS: number;
}

export interface IPSStats {
  total: number;
  activas: number;
  inactivas: number;
  asignadas: number;
  sinAsignar: number;
  porTipoServicio: { [key: string]: number };
}

// ===============================================
// SERVICIOS API PARA EPS
// ===============================================
export const epsAPI = {
  async getAll(filters: EPSFilterParams = {}): Promise<ApiResponse<PaginatedResponse<EPSDetailed>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/eps?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<EPSDetailed>> {
    const response = await api.get(`/eps/${id}`);
    return response.data;
  },

  async create(data: CreateEPSRequest): Promise<ApiResponse<EPSDetailed>> {
    const response = await api.post('/eps', data);
    return response.data;
  },

  async update(id: string, data: UpdateEPSRequest): Promise<ApiResponse<EPSDetailed>> {
    const response = await api.put(`/eps/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/eps/${id}`);
    return response.data;
  },

  async toggleStatus(id: string): Promise<ApiResponse<EPSDetailed>> {
    const response = await api.patch(`/eps/${id}/toggle-status`);
    return response.data;
  },

  async getStats(): Promise<ApiResponse<EPSStats>> {
    const response = await api.get('/eps/stats');
    return response.data;
  },

  async assignIPS(epsId: string, ipsIds: string[]): Promise<ApiResponse<EPSDetailed>> {
    const response = await api.post(`/eps/${epsId}/assign-ips`, { ipsIds });
    return response.data;
  },

  async getAssignedIPS(epsId: string): Promise<ApiResponse<IPSDetailed[]>> {
    const response = await api.get(`/eps/${epsId}/ips`);
    return response.data;
  },

  async removeIPS(epsId: string, ipsId: string): Promise<ApiResponse<EPSDetailed>> {
    const response = await api.delete(`/eps/${epsId}/ips/${ipsId}`);
    return response.data;
  }
};

// ===============================================
// SERVICIOS API PARA IPS
// ===============================================
export const ipsAPI = {
  async getAll(filters: IPSFilterParams = {}): Promise<ApiResponse<PaginatedResponse<IPSDetailed>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/ips?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<IPSDetailed>> {
    const response = await api.get(`/ips/${id}`);
    return response.data;
  },

  async create(data: CreateIPSRequest): Promise<ApiResponse<IPSDetailed>> {
    const response = await api.post('/ips', data);
    return response.data;
  },

  async update(id: string, data: UpdateIPSRequest): Promise<ApiResponse<IPSDetailed>> {
    const response = await api.put(`/ips/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/ips/${id}`);
    return response.data;
  },

  async toggleStatus(id: string): Promise<ApiResponse<IPSDetailed>> {
    const response = await api.patch(`/ips/${id}/toggle-status`);
    return response.data;
  },

  async getStats(): Promise<ApiResponse<IPSStats>> {
    const response = await api.get('/ips/stats');
    return response.data;
  },

  async getUnassigned(): Promise<ApiResponse<IPSDetailed[]>> {
    const response = await api.get('/ips/unassigned');
    return response.data;
  }
};

// ===============================================
// UTILIDADES
// ===============================================
export const gestionUtils = {
  generateEPSCode: (nombre: string): string => {
    const cleanName = nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    
    const timestamp = Date.now().toString().slice(-3);
    return `EPS_${cleanName}_${timestamp}`;
  },

  generateIPSCode: (nombre: string): string => {
    const cleanName = nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    
    const timestamp = Date.now().toString().slice(-3);
    return `IPS_${cleanName}_${timestamp}`;
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,15}$/;
    return phoneRegex.test(phone);
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  getStatusColor: (activa: boolean): string => {
    return activa ? 'text-success-600' : 'text-danger-600';
  },

  getStatusBadgeClasses: (activa: boolean): string => {
    return activa 
      ? 'bg-success-100 text-success-800 border-success-200'
      : 'bg-danger-100 text-danger-800 border-danger-200';
  },

  truncateText: (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }
};