// frontend/src/components/dashboards-eps-ips/index.tsx
// ✅ CORRECCIÓN DE ERRORES DE TIPOS

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  CursorArrowRaysIcon,
  FunnelIcon,
  ArrowPathIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

// Importaciones existentes
import { FilterPanel } from './components/FilterPanel';
import { GraficasCartera } from './graficas/GraficasCartera';
import { GraficasFlujo } from './graficas/GraficasFlujo';
import { GraficasTendencias } from './graficas/GraficasTendencias';
import { ReporteCartera } from './reportes/ReporteCartera';
import { ReporteFlujo } from './reportes/ReporteFlujo';
import { ReporteEjecutivo } from './reportes/ReporteEjecutivo';

// ✅ NUEVA IMPORTACIÓN
import { ReporteEjecutivoEPS } from './reportes/ReporteEjecutivoEPS';

interface DashboardFilters {
  epsIds: string[];
  ipsIds: string[];
  periodoIds: string[];
  fechaInicio: string;
  fechaFin: string;
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos';
}

export const DashboardsEpsIps: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    epsIds: [],
    ipsIds: [],
    periodoIds: [],
    fechaInicio: '',
    fechaFin: '',
    tipoAnalisis: 'ambos'
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ CORRECCIÓN 1: Usar el nombre correcto de la prop
  const handleFiltersChange = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleTabChange = useCallback((index: number) => {
    setSelectedTab(index);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CORRECCIÓN 2: Definir tabs con props correctas para cada componente
  const tabs = [
    {
      id: 'graficas-cartera',
      label: 'Gráficas Cartera',
      icon: ChartBarIcon,
      component: (props: any) => <GraficasCartera {...props} />
    },
    {
      id: 'graficas-flujo', 
      label: 'Gráficas Flujo',
      icon: DocumentChartBarIcon,
      component: (props: any) => <GraficasFlujo {...props} />
    },
    {
      id: 'tendencias',
      label: 'Tendencias',
      icon: CursorArrowRaysIcon,
      component: (props: any) => <GraficasTendencias {...props} />
    },
    {
      id: 'reporte-cartera',
      label: 'Reporte Cartera',
      icon: ClipboardDocumentListIcon,
      component: (props: any) => <ReporteCartera {...props} />
    },
    {
      id: 'reporte-flujo',
      label: 'Reporte Flujo', 
      icon: DocumentChartBarIcon,
      component: (props: any) => <ReporteFlujo {...props} />
    },
    {
      id: 'reporte-ejecutivo',
      label: 'Reporte Ejecutivo',
      icon: ChartBarIcon,
      // ✅ CORRECCIÓN 3: Agregar la prop 'tipo' requerida
      component: (props: any) => <ReporteEjecutivo {...props} tipo="eps" />
    },
    {
      id: 'reporte-eps',
      label: 'Reporte EPS Avanzado',
      icon: BuildingLibraryIcon,
      component: (props: any) => <ReporteEjecutivoEPS {...props} />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="relative px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <ChartBarIcon className="w-8 h-8 mr-3" />
                Dashboards EPS/IPS
              </h1>
              <p className="text-primary-100 text-lg">
                Sistema integral de análisis y reportes para entidades de salud
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <button
                onClick={handleToggleFilters}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${showFilters ? 'bg-white text-primary-600' : 'bg-primary-500 hover:bg-primary-400 text-white'}
                `}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filtros</span>
              </button>

              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CORRECCIÓN 4: Panel de Filtros con props corregidas */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange} // ✅ Nombre correcto de la prop
            onClose={handleToggleFilters}
          />
        )}
      </AnimatePresence>

      {/* Navegación por pestañas */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6">
          <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(index)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${selectedTab === index
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {/* Badge "NUEVO" para la nueva pestaña */}
                {tab.id === 'reporte-eps' && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    NUEVO
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* ✅ CORRECCIÓN 5: Renderizar componente con todas las props necesarias */}
            {tabs[selectedTab].component({
              filters,
              loading
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};