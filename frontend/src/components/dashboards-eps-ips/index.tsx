// ✅ COMPONENTE PRINCIPAL ACTUALIZADO CON FILTROS FUNCIONANDO
// frontend/src/components/dashboards-eps-ips/index.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  CursorArrowRaysIcon,
  FunnelIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Importaciones de componentes
import { FilterPanel } from './components/FilterPanel';
import { GraficasCartera } from './graficas/GraficasCartera';
import { GraficasFlujo } from './graficas/GraficasFlujo';
import { GraficasTendencias } from './graficas/GraficasTendencias';
import { ReporteCartera } from './reportes/ReporteCartera';
import { ReporteFlujo } from './reportes/ReporteFlujo';
import { ReporteEjecutivo } from './reportes/ReporteEjecutivo';
import { ReporteEjecutivoEPS } from './reportes/ReporteEjecutivoEPS';

// Hook personalizado para filtros
import { useFiltrosDashboard, filtrosUtils } from './services/dashboardsEpsIpsAPI';

interface DashboardFilters {
  epsIds: string[];
  ipsIds: string[];
  periodoIds: string[];
  fechaInicio: string;
  fechaFin: string;
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos';
}

export const DashboardsEpsIps: React.FC = () => {
  // Estado principal usando el hook personalizado
  const {
    filters,
    loading,
    setLoading,
    updateFilters,
    clearFilters,
    applyQuickFilter,
    toggleEPS,
    togglePeriodo,
    hayFiltros,
    resumenFiltros
  } = useFiltrosDashboard({
    tipoAnalisis: 'ambos'
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tabs de navegación
  const tabs = [
    {
      id: 'graficas-cartera',
      label: 'Gráficas Cartera',
      icon: ChartBarIcon,
      component: GraficasCartera,
      description: 'Análisis visual de cartera por EPS'
    },
    {
      id: 'graficas-flujo',
      label: 'Gráficas Flujo',
      icon: DocumentChartBarIcon,
      component: GraficasFlujo,
      description: 'Análisis de flujo de caja'
    },
    {
      id: 'tendencias',
      label: 'Tendencias',
      icon: CursorArrowRaysIcon,
      component: GraficasTendencias,
      description: 'Proyecciones y tendencias'
    },
    {
      id: 'reporte-cartera',
      label: 'Reporte Cartera',
      icon: ClipboardDocumentListIcon,
      component: ReporteCartera,
      description: 'Reporte detallado de cartera'
    },
    {
      id: 'reporte-flujo',
      label: 'Reporte Flujo',
      icon: DocumentChartBarIcon,
      component: ReporteFlujo,
      description: 'Reporte detallado de flujo'
    },
    {
      id: 'reporte-ejecutivo',
      label: 'Reporte Ejecutivo',
      icon: BuildingLibraryIcon,
      component: ReporteEjecutivo,
      description: 'Resumen ejecutivo completo'
    },
    {
      id: 'reporte-eps',
      label: 'Reporte EPS',
      icon: BuildingLibraryIcon,
      component: ReporteEjecutivoEPS,
      description: 'Análisis detallado por EPS'
    }
  ];

  // Efecto para recargar datos cuando cambien los filtros
  useEffect(() => {
    console.log('🔄 Filtros cambiaron, disparando recarga...', filters);
    setRefreshTrigger(prev => prev + 1);
  }, [filters]);

  // Manejador para cambio de filtros
  const handleFiltersChange = useCallback((newFilters: DashboardFilters) => {
    console.log('📝 Actualizando filtros:', newFilters);
    updateFilters(newFilters);
  }, [updateFilters]);

  // Componente de información de filtros aplicados
  const FiltrosInfo: React.FC = () => {
    if (!hayFiltros) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FunnelIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Filtros Aplicados
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>{resumenFiltros}</p>
            </div>
            <div className="mt-3 flex space-x-2">
              {/* Botones de filtros rápidos */}
              <button
                onClick={() => applyQuickFilter('top-eps')}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                Top 5 EPS
              </button>
              <button
                onClick={() => applyQuickFilter('ultimo-trimestre')}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
              >
                Último Trimestre
              </button>
              <button
                onClick={() => applyQuickFilter('año-actual')}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
              >
                Año 2025
              </button>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Limpiar Todo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Componente de estado sin datos
  const SinDatos: React.FC = () => (
    <div className="text-center py-12">
      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No hay datos disponibles
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {hayFiltros 
          ? 'Los filtros aplicados no devolvieron resultados. Intenta ajustar los criterios de búsqueda.'
          : 'No se encontraron datos para mostrar. Verifica la configuración o contacta al administrador.'
        }
      </p>
      {hayFiltros && (
        <div className="mt-6">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard EPS/IPS
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Análisis integral de cartera y flujo de entidades de salud - Año 2025
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters || hayFiltros
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filtros</span>
                {hayFiltros && (
                  <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                    {(filters.epsIds?.length || 0) + (filters.periodoIds?.length || 0)}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <FilterPanel 
                filters={filters} 
                onFiltersChange={handleFiltersChange}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Información de filtros aplicados */}
        <FiltrosInfo />

        {/* Navegación por tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(index)}
                    className={`${
                      selectedTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Descripción del tab actual */}
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-sm text-gray-600">
              {tabs[selectedTab].description}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedTab}-${refreshTrigger}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {(() => {
                const CurrentComponent = tabs[selectedTab].component;
                
                // Props comunes para todos los componentes
                const commonProps = {
                  filters,
                  loading,
                  key: `${tabs[selectedTab].id}-${refreshTrigger}`
                };

                return (
                  <React.Suspense 
                    fallback={
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">Cargando {tabs[selectedTab].label}...</p>
                        </div>
                      </div>
                    }
                  >
                    <CurrentComponent {...commonProps} />
                  </React.Suspense>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer con información de estado */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>
            Última actualización: {new Date().toLocaleString('es-CO')}
          </div>
          <div className="flex items-center space-x-4">
            <span>
              Tab activo: {tabs[selectedTab].label}
            </span>
            {hayFiltros && (
              <span className="flex items-center space-x-1">
                <FunnelIcon className="w-4 h-4" />
                <span>Filtros activos</span>
              </span>
            )}
            {loading && (
              <span className="flex items-center space-x-1">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Cargando...</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};