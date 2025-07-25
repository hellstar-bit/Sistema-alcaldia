// frontend/src/components/gestion/GestionEPS.tsx
import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  epsAPI, 
  gestionUtils,
  type EPSDetailed, 
  type EPSFilterParams, 
  type EPSStats 
} from '../../services/gestionApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';
import { EPSFormModal } from './EPSFormModal';
import { EPSDetailModal } from './EPSDetailModal';
import { AssignIPSModal } from './AssignIPSModal';

const GestionEPS: React.FC = () => {
  // Estados principales
  const [epsList, setEpsList] = useState<EPSDetailed[]>([]);
  const [stats, setStats] = useState<EPSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EPSFilterParams>({
    soloActivas: undefined,
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEPS, setSelectedEPS] = useState<EPSDetailed | null>(null);
  const [editingEPS, setEditingEPS] = useState<EPSDetailed | null>(null);

  const { showSuccess, showError, showConfirm, showLoading, close } = useSweetAlert();

  // Cargar datos iniciales
  useEffect(() => {
    loadEPSData();
    loadStats();
  }, [filters]);

  const loadEPSData = async () => {
    try {
      setLoading(true);
      
      const searchFilters = {
        ...filters,
        search: searchTerm || undefined
      };

      const response = await epsAPI.getAll(searchFilters);
      
      if (response.success && response.data) {
        // Manejar caso donde response.data puede ser undefined
        const responseData = response.data;
        
        setEpsList(responseData.data || []);
        setTotalPages(responseData.pagination?.totalPages || 1);
        setTotalItems(responseData.pagination?.total || 0);
      } else {
        console.error('Response structure:', response);
        showError({
          title: 'Error al cargar EPS',
          text: response.message || 'Error desconocido'
        });
        // Establecer valores por defecto en caso de error
        setEpsList([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error loading EPS:', error);
      showError({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor'
      });
      // Establecer valores por defecto en caso de error
      setEpsList([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await epsAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        console.error('Stats response error:', response);
        // Establecer stats por defecto en caso de error
        setStats({
          total: 0,
          activas: 0,
          inactivas: 0,
          conIPS: 0,
          sinIPS: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Establecer stats por defecto en caso de error
      setStats({
        total: 0,
        activas: 0,
        inactivas: 0,
        conIPS: 0,
        sinIPS: 0
      });
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadEPSData();
  };

  const handleFilterChange = (newFilters: Partial<EPSFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateEPS = () => {
    setEditingEPS(null);
    setShowFormModal(true);
  };

  const handleEditEPS = (eps: EPSDetailed) => {
    setEditingEPS(eps);
    setShowFormModal(true);
  };

  const handleViewEPS = (eps: EPSDetailed) => {
    setSelectedEPS(eps);
    setShowDetailModal(true);
  };

  const handleAssignIPS = (eps: EPSDetailed) => {
    setSelectedEPS(eps);
    setShowAssignModal(true);
  };

  const handleDeleteEPS = async (eps: EPSDetailed) => {
    const result = await showConfirm({
      title: '¿Eliminar EPS?',
      text: `¿Estás seguro de eliminar "${eps.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        showLoading('Eliminando EPS...', 'Verificando datos asociados');
        
        const response = await epsAPI.delete(eps.id);
        
        close();
        
        if (response.success) {
          showSuccess('EPS eliminada', {
            title: '¡EPS eliminada!',
            text: 'La EPS ha sido eliminada exitosamente'
          });
          await loadEPSData();
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

  const handleToggleStatus = async (eps: EPSDetailed) => {
    const action = eps.activa ? 'desactivar' : 'activar';
    const result = await showConfirm({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} EPS?`,
      text: `¿Estás seguro de ${action} "${eps.nombre}"?`,
      icon: 'question',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await epsAPI.toggleStatus(eps.id);
        
        if (response.success) {
          showSuccess(`EPS ${action}da`, {
            title: `¡EPS ${action}da!`,
            text: `La EPS ha sido ${action}da exitosamente`
          });
          await loadEPSData();
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
    setEditingEPS(null);
    await loadEPSData();
    await loadStats();
  };

  const handleAssignSuccess = async () => {
    setShowAssignModal(false);
    setSelectedEPS(null);
    await loadEPSData();
  };

  const handleRefresh = async () => {
    showLoading('Actualizando datos...', 'Recargando información');
    try {
      await Promise.all([loadEPSData(), loadStats()]);
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando gestión de EPS...</p>
          <p className="text-gray-500 text-sm mt-2">Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Elegante */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <BuildingOfficeIcon className="w-8 h-8 text-yellow-300" />
              <h1 className="text-2xl lg:text-3xl font-bold">Gestión de EPS</h1>
            </div>
            <p className="text-primary-100 text-base">
              Administración de Entidades Promotoras de Salud
            </p>
            {stats && (
              <div className="flex items-center space-x-4 mt-4 text-sm text-primary-200">
                <span className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{stats.total} EPS registradas</span>
                </span>
                <span className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{stats.activas} activas</span>
                </span>
                <span className="flex items-center space-x-2">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{stats.conIPS} con IPS asignadas</span>
                </span>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button 
              onClick={handleCreateEPS}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nueva EPS</span>
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

      {/* Estadísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total EPS</p>
                <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-success-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">EPS Activas</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">EPS Inactivas</p>
                <p className="text-2xl font-bold text-warning-600">{stats.inactivas}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <XCircleIcon className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Con IPS Asignadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.conIPS}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar EPS por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-sm"
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
              onClick={handleCreateEPS}
              className="lg:hidden btn-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva EPS
            </button>
          </div>
        </div>

        {/* Panel de Filtros Expandible */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.soloActivas === undefined ? '' : filters.soloActivas.toString()}
                  onChange={(e) => handleFilterChange({ 
                    soloActivas: e.target.value === '' ? undefined : e.target.value === 'true' 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="true">Solo Activas</option>
                  <option value="false">Solo Inactivas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select
                  value={filters.orderBy}
                  onChange={(e) => handleFilterChange({ orderBy: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="nombre">Nombre</option>
                  <option value="codigo">Código</option>
                  <option value="createdAt">Fecha de Creación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <select
                  value={filters.orderDirection}
                  onChange={(e) => handleFilterChange({ orderDirection: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ASC">Ascendente</option>
                  <option value="DESC">Descendente</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de EPS */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900">Lista de EPS</h2>
              <p className="text-gray-600 text-sm">
                Mostrando {epsList.length} de {totalItems} registros
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando EPS...</p>
          </div>
        ) : epsList.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron EPS</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No hay EPS que coincidan con tu búsqueda' : 'No hay EPS registradas en el sistema'}
            </p>
            <button 
              onClick={handleCreateEPS}
              className="btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Crear Primera EPS
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
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>EPS</span>
                      </div>
                    </th>
                    <th className="table-header text-left py-4 px-4">Código</th>
                    <th className="table-header text-center py-4 px-4">Estado</th>
                    <th className="table-header text-center py-4 px-4">IPS Asignadas</th>
                    <th className="table-header text-center py-4 px-4">Fecha Creación</th>
                    <th className="table-header text-center py-4 px-4 rounded-r-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {epsList.map((eps) => (
                    <tr key={eps.id} className="table-row">
                      <td className="table-cell px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${eps.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-primary-900 truncate">{eps.nombre}</p>
                            {eps.descripcion && (
                              <p className="text-xs text-gray-500 truncate">{gestionUtils.truncateText(eps.descripcion, 40)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell px-4 py-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{eps.codigo}</span>
                      </td>
                      <td className="table-cell px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${gestionUtils.getStatusBadgeClasses(eps.activa)}`}>
                          {eps.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="table-cell px-4 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {eps.ipsAsignadas?.length || 0}
                        </span>
                      </td>
                      <td className="table-cell px-4 py-4 text-center text-sm text-gray-500">
                        {gestionUtils.formatDate(eps.createdAt)}
                      </td>
                      <td className="table-cell px-4 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewEPS(eps)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAssignIPS(eps)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Asignar IPS"
                          >
                            <UserGroupIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEPS(eps)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(eps)}
                            className={`p-2 rounded-lg transition-colors ${
                              eps.activa 
                                ? 'text-warning-600 hover:bg-warning-50' 
                                : 'text-success-600 hover:bg-success-50'
                            }`}
                            title={eps.activa ? 'Desactivar' : 'Activar'}
                          >
                            {eps.activa ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteEPS(eps)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                              ? 'bg-primary-600 text-white'
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

      {/* Modales */}
      <EPSFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingEPS(null);
        }}
        editingEPS={editingEPS}
        onSuccess={handleFormSuccess}
      />

      <EPSDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEPS(null);
        }}
        eps={selectedEPS}
        onEdit={(eps) => {
          setShowDetailModal(false);
          handleEditEPS(eps);
        }}
        onAssignIPS={(eps) => {
          setShowDetailModal(false);
          handleAssignIPS(eps);
        }}
      />

      <AssignIPSModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedEPS(null);
        }}
        eps={selectedEPS}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default GestionEPS;