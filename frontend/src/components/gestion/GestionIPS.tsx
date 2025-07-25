// frontend/src/components/gestion/GestionIPS.tsx - VERSIÓN CON COLORES CORREGIDOS
import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TagIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  BeakerIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { 
  ipsAPI, 
  gestionUtils,
  type IPSDetailed, 
  type IPSFilterParams, 
  type IPSStats 
} from '../../services/gestionApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';
import { IPSFormModal } from './IPSFormModal';
import { IPSDetailModal } from './IPSDetailModal';

const TIPOS_SERVICIO = [
  { value: 'Ambulatorio', label: 'Ambulatorio', color: 'blue', icon: ClipboardDocumentListIcon },
  { value: 'Hospitalario', label: 'Hospitalario', color: 'green', icon: BuildingOfficeIcon },
  { value: 'Mixto', label: 'Mixto', color: 'purple', icon: ChartBarIcon },
  { value: 'Especializado', label: 'Especializado', color: 'orange', icon: HeartIcon },
  { value: 'Urgencias', label: 'Urgencias', color: 'red', icon: ExclamationTriangleIcon },
  { value: 'Rehabilitación', label: 'Rehabilitación', color: 'indigo', icon: ArrowPathIcon },
  { value: 'Laboratorio', label: 'Laboratorio', color: 'yellow', icon: BeakerIcon },
  { value: 'Imágenes Diagnósticas', label: 'Imágenes Diagnósticas', color: 'pink', icon: CameraIcon }
];

const GestionIPS: React.FC = () => {
  // Estados principales
  const [ipsList, setIpsList] = useState<IPSDetailed[]>([]);
  const [stats, setStats] = useState<IPSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<IPSFilterParams>({
    soloActivas: undefined,
    tipoServicio: undefined,
    sinAsignar: undefined,
    orderBy: 'nombre',
    orderDirection: 'ASC',
    page: 1,
    limit: 10
  });

  // Estados de paginación
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIPS, setSelectedIPS] = useState<IPSDetailed | null>(null);
  const [editingIPS, setEditingIPS] = useState<IPSDetailed | null>(null);

  const { showSuccess, showError, showConfirm, showLoading, close } = useSweetAlert();

  // Cargar datos iniciales
  useEffect(() => {
    loadIPSData();
    loadStats();
  }, [filters]);

  const loadIPSData = async () => {
    try {
      setLoading(true);
      
      const searchFilters = {
        ...filters,
        search: searchTerm || undefined
      };

      const response = await ipsAPI.getAll(searchFilters);
      
      if (response.success && response.data) {
        const responseData = response.data;
        
        setIpsList(responseData.data || []);
        setTotalPages(responseData.pagination?.totalPages || 1);
        setTotalItems(responseData.pagination?.total || 0);
      } else {
        console.error('Response structure:', response);
        showError({
          title: 'Error al cargar IPS',
          text: response.message || 'Error desconocido'
        });
        setIpsList([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error loading IPS:', error);
      showError({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor'
      });
      setIpsList([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ipsAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        console.error('Stats response error:', response);
        setStats({
          total: 0,
          activas: 0,
          inactivas: 0,
          asignadas: 0,
          sinAsignar: 0,
          porTipoServicio: {}
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 0,
        activas: 0,
        inactivas: 0,
        asignadas: 0,
        sinAsignar: 0,
        porTipoServicio: {}
      });
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadIPSData();
  };

  const handleFilterChange = (newFilters: Partial<IPSFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateIPS = () => {
    setEditingIPS(null);
    setShowFormModal(true);
  };

  const handleEditIPS = (ips: IPSDetailed) => {
    setEditingIPS(ips);
    setShowFormModal(true);
  };

  const handleViewIPS = (ips: IPSDetailed) => {
    setSelectedIPS(ips);
    setShowDetailModal(true);
  };

  const handleDeleteIPS = async (ips: IPSDetailed) => {
    const result = await showConfirm({
      title: '¿Eliminar IPS?',
      text: `¿Estás seguro de eliminar "${ips.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        showLoading('Eliminando IPS...', 'Verificando datos asociados');
        
        const response = await ipsAPI.delete(ips.id);
        
        close();
        
        if (response.success) {
          showSuccess('IPS eliminada', {
            title: '¡IPS eliminada!',
            text: 'La IPS ha sido eliminada exitosamente'
          });
          await loadIPSData();
          await loadStats();
        } else {
          showError({
            title: 'Error al eliminar',
            text: response.message
          });
        }
      } catch (error: any) {
        close();
        showError({
          title: 'Error al eliminar',
          text: error.message
        });
      }
    }
  };

  const handleToggleStatus = async (ips: IPSDetailed) => {
    const action = ips.activa ? 'desactivar' : 'activar';
    const result = await showConfirm({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} IPS?`,
      text: `¿Estás seguro de ${action} "${ips.nombre}"?`,
      icon: 'question',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await ipsAPI.toggleStatus(ips.id);
        
        if (response.success) {
          showSuccess(`IPS ${action}da`, {
            title: `¡IPS ${action}da!`,
            text: `La IPS ha sido ${action}da exitosamente`
          });
          await loadIPSData();
          await loadStats();
        } else {
          showError({
            title: `Error al ${action}`,
            text: response.message
          });
        }
      } catch (error: any) {
        showError({
          title: `Error al ${action}`,
          text: error.message
        });
      }
    }
  };

  const handleFormSuccess = async () => {
    setShowFormModal(false);
    setEditingIPS(null);
    await loadIPSData();
    await loadStats();
  };

  const handleDetailClose = () => {
    setShowDetailModal(false);
    setSelectedIPS(null);
  };

  const handleRefresh = async () => {
    showLoading('Actualizando datos...', 'Recargando información');
    try {
      await Promise.all([loadIPSData(), loadStats()]);
      close();
      showSuccess('Datos actualizados', {
        title: '¡Actualización completada!',
        text: 'Todos los datos han sido recargados'
      });
    } catch (error) {
      close();
      showError({
        title: 'Error al actualizar',
        text: 'No se pudieron actualizar los datos'
      });
    }
  };

  const getTipoServicioConfig = (tipo: string) => {
    return TIPOS_SERVICIO.find(t => t.value === tipo) || { 
      value: tipo, 
      label: tipo, 
      color: 'gray', 
      icon: TagIcon 
    };
  };

  const getTipoServicioBadgeClasses = (tipo: string): string => {
    const config = getTipoServicioConfig(tipo);
    const color = config.color;
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando gestión de IPS...</p>
          <p className="text-gray-500 text-sm mt-2">Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Elegante - MISMO AZUL QUE EPS */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <AcademicCapIcon className="w-8 h-8 text-yellow-300" />
              <h1 className="text-2xl lg:text-3xl font-bold">Gestión de IPS</h1>
            </div>
            <p className="text-primary-100 text-base">
              Administración de Instituciones Prestadoras de Servicios de Salud
            </p>
            {stats && (
              <div className="flex items-center space-x-4 mt-4 text-sm text-blue-200">
                <span className="flex items-center space-x-2">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>{stats.total} IPS registradas</span>
                </span>
                <span className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{stats.activas} activas</span>
                </span>
                <span className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{stats.asignadas} asignadas a EPS</span>
                </span>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button 
              onClick={handleCreateIPS}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nueva IPS</span>
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas - COLORES CORREGIDOS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="card p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total IPS</p>
                <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-success-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">IPS Activas</p>
                <p className="text-2xl font-bold text-success-600">{stats.activas}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-warning-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">IPS Inactivas</p>
                <p className="text-2xl font-bold text-warning-600">{stats.inactivas}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <XCircleIcon className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Asignadas</p>
                <p className="text-2xl font-bold text-primary-600">{stats.asignadas}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Sin Asignar</p>
                <p className="text-2xl font-bold text-gray-600">{stats.sinAsignar}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda - COLORES CORREGIDOS */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar IPS por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white py-1 px-3 text-sm rounded-lg transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <button
              onClick={handleCreateIPS}
              className="lg:hidden btn-secondary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva IPS
            </button>
          </div>
        </div>

        {/* Panel de Filtros Expandible - COLORES CORREGIDOS */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.soloActivas === undefined ? '' : filters.soloActivas.toString()}
                  onChange={(e) => handleFilterChange({ 
                    soloActivas: e.target.value === '' ? undefined : e.target.value === 'true' 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Todas</option>
                  <option value="true">Solo Activas</option>
                  <option value="false">Solo Inactivas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
                <select
                  value={filters.tipoServicio || ''}
                  onChange={(e) => handleFilterChange({ 
                    tipoServicio: e.target.value || undefined 
                  })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todos los tipos</option>
                  {TIPOS_SERVICIO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asignación a EPS</label>
                <select
                  value={filters.sinAsignar === undefined ? '' : filters.sinAsignar.toString()}
                  onChange={(e) => handleFilterChange({ 
                    sinAsignar: e.target.value === '' ? undefined : e.target.value === 'true' 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Todas</option>
                  <option value="true">Solo Sin Asignar</option>
                  <option value="false">Solo Asignadas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select
                  value={filters.orderBy}
                  onChange={(e) => handleFilterChange({ orderBy: e.target.value as any })}
                  className="bg-gradient-to-r from-primary-900 to-primary-800">
                
                  <option value="nombre">Nombre</option>
                  <option value="codigo">Código</option>
                  <option value="createdAt">Fecha de Creación</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de IPS - COLORES CORREGIDOS */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900">Lista de IPS</h2>
              <p className="text-gray-600 text-sm">
                Mostrando {ipsList.length} de {totalItems} registros
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando IPS...</p>
          </div>
        ) : ipsList.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron IPS</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No hay IPS que coincidan con tu búsqueda' : 'No hay IPS registradas en el sistema'}
            </p>
            <button 
              onClick={handleCreateIPS}
              className="btn-secondary"
            >
              <PlusIcon className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto" />
              Crear Primera IPS
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-900 to-primary-800">
                    <th className="table-header text-left py-4 px-4 rounded-l-lg">
                        <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>IPS</span>
                      </div>
                    </th>
                    <th className="table-header text-left py-4 px-4">Código</th>
                    <th className="table-header text-center py-4 px-4">Estado</th>
                    <th className="table-header text-center py-4 px-4">Tipo de Servicio</th>
                    <th className="table-header text-center py-4 px-4">EPS Asignadas</th>
                    <th className="table-header text-center py-4 px-4">Fecha Creación</th>
                    <th className="table-header text-center py-4 px-4 rounded-r-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ipsList.map((ips) => {
                    const tipoConfig = getTipoServicioConfig(ips.tipoServicio || '');
                    const IconComponent = tipoConfig.icon;
                    
                    return (
                      <tr key={ips.id} className="table-row">
                        <td className="table-cell px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${ips.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-primary-900 truncate">{ips.nombre}</p>
                              {ips.descripcion && (
                                <p className="text-xs text-gray-500 truncate">{gestionUtils.truncateText(ips.descripcion, 40)}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell px-4 py-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{ips.codigo}</span>
                        </td>
                        <td className="table-cell px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${gestionUtils.getStatusBadgeClasses(ips.activa)}`}>
                            {ips.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="table-cell px-4 py-4 text-center">
                          {ips.tipoServicio ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTipoServicioBadgeClasses(ips.tipoServicio)}`}>
                              <IconComponent className="w-3 h-3 mr-1" />
                              {ips.tipoServicio}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin especificar</span>
                          )}
                        </td>
                        <td className="table-cell px-4 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {ips.eps?.length || 0}
                          </span>
                        </td>
                        <td className="table-cell px-4 py-4 text-center text-sm text-gray-500">
                          {gestionUtils.formatDate(ips.createdAt)}
                        </td>
                        <td className="table-cell px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewIPS(ips)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditIPS(ips)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(ips)}
                              className={`p-2 rounded-lg transition-colors ${
                                ips.activa 
                                  ? 'text-warning-600 hover:bg-warning-50' 
                                  : 'text-success-600 hover:bg-success-50'
                              }`}
                              title={ips.activa ? 'Desactivar' : 'Activar'}
                            >
                              {ips.activa ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteIPS(ips)}
                              className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página {filters.page} de {totalPages} ({totalItems} registros total)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                    disabled={filters.page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            filters.page === page
                              ? 'bg-accent-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, filters.page! + 1))}
                    disabled={filters.page === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Estadísticas por Tipo de Servicio - ICONOS MEJORADOS */}
      {stats && Object.keys(stats.porTipoServicio).length > 0 && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900">Distribución por Tipo de Servicio</h2>
              <p className="text-gray-600 text-sm">Cantidad de IPS por cada tipo de servicio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(stats.porTipoServicio).map(([tipo, cantidad]) => {
              const tipoConfig = getTipoServicioConfig(tipo);
              const badgeClasses = getTipoServicioBadgeClasses(tipo);
              const IconComponent = tipoConfig.icon;
              
              return (
                <div key={tipo} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badgeClasses.replace('border', 'border-2')}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">{tipo}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{cantidad}</p>
                      <p className="text-xs text-gray-600">
                        {((cantidad / stats.total) * 100).toFixed(1)}% del total
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Acciones Rápidas Flotantes - COLORES CORREGIDOS */}
      <div className="lg:hidden fixed bottom-4 right-4 space-y-3">
        <button 
          onClick={handleCreateIPS}
          className="w-14 h-14 bg-accent-600 hover:bg-accent-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={handleRefresh}
          className="w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        >
          <ArrowPathIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Modales */}
      <IPSFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingIPS(null);
        }}
        editingIPS={editingIPS}
        onSuccess={handleFormSuccess}
      />

      <IPSDetailModal
        isOpen={showDetailModal}
        onClose={handleDetailClose}
        ips={selectedIPS}
        onEdit={(ips) => {
          setShowDetailModal(false);
          handleEditIPS(ips);
        }}
      />
    </div>
  );
};

export default GestionIPS;