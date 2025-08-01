// frontend/src/components/dashboards-eps-ips/index.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tab } from '@headlessui/react';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { ReportesModule } from './reportes/ReportesModule';
import { GraficasModule } from './graficas/GraficasModule';
import { FilterPanel } from './components/FilterPanel';
import { dashboardsEpsIpsAPI } from './services/dashboardsEpsIpsAPI';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardFilters {
  epsIds?: string[];
  ipsIds?: string[];
  periodoIds?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos';
}

export const DashboardsEpsIps: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState<DashboardFilters>({
    tipoAnalisis: 'ambos'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Control de componente montado y prevención de múltiples operaciones
  const mountedRef = useRef(true);
  const refreshingRef = useRef(false);

  // Cleanup al desmontar
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      refreshingRef.current = false;
    };
  }, []);

  const tabs = [
    { 
      id: 'reportes', 
      name: 'Reportes', 
      icon: DocumentChartBarIcon,
      component: ReportesModule 
    },
    { 
      id: 'graficas', 
      name: 'Gráficas', 
      icon: ChartBarIcon,
      component: GraficasModule 
    }
  ];

  // Función memoizada para refrescar datos - CORREGIDA
  const handleRefreshData = useCallback(async () => {
    if (refreshingRef.current || !mountedRef.current) {
      console.log('🔄 Dashboard EPS-IPS: Refresh ya en progreso o componente desmontado');
      return;
    }

    refreshingRef.current = true;
    setLoading(true);
    
    try {
      console.log('🔄 Dashboard EPS-IPS: Iniciando recarga de caché...');
      await dashboardsEpsIpsAPI.refreshCache();
      
      if (mountedRef.current) {
        setLastUpdate(new Date());
        console.log('✅ Dashboard EPS-IPS: Caché actualizado exitosamente');
      }
    } catch (error) {
      console.error('❌ Dashboard EPS-IPS: Error refreshing data:', error);
    } finally {
      refreshingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // Dependencias vacías para evitar recreaciones

  // Función memoizada para cambiar filtros - CORREGIDA
  const handleFilterChange = useCallback((newFilters: Partial<DashboardFilters>) => {
    if (!mountedRef.current) return;
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función memoizada para cambiar tabs - CORREGIDA
  const handleTabChange = useCallback((index: number) => {
    if (!mountedRef.current) return;
    setSelectedTab(index);
  }, []);

  // Función memoizada para toggle de filtros - CORREGIDA
  const handleToggleFilters = useCallback(() => {
    if (!mountedRef.current) return;
    setShowFilters(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none'
          }} />
</div>
        
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    Dashboards EPS e IPS
                  </h1>
                  <p className="text-primary-100 text-lg mt-1">
                    Análisis unificado de cartera y flujo con trazabilidad precisa
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={handleToggleFilters}
                className="btn-secondary flex items-center space-x-2"
                disabled={loading}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span>Filtros</span>
              </button>
              
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="btn-success flex items-center space-x-2"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </motion.div>
          </div>

          {/* Indicador de última actualización */}
          <div className="mt-4 text-primary-200 text-sm">
            Última actualización: {lastUpdate.toLocaleString('es-CO')}
          </div>
        </div>
      </div>

      {/* Panel de Filtros - CORREGIDO: Un solo AnimatePresence */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 shadow-sm overflow-hidden"
          >
            <FilterPanel 
              filters={filters}
              onChange={handleFilterChange}
              onClose={handleToggleFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido Principal con Tabs - SIMPLIFICADO SIN AnimatePresence PROBLEMÁTICO */}
      <div className="px-6 py-8">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none ${
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-800'
                  }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={tab.id}
                className={`${selectedTab === idx ? 'block' : 'hidden'}`}
              >
                {/* Contenido simple sin AnimatePresence anidado */}
                <div>
                  <tab.component filters={filters} loading={loading} />
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};