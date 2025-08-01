// frontend/src/components/dashboards-eps-ips/index.tsx
import React, { useState, useEffect } from 'react';
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
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos'; // Corrected: Identifier expected.
}

export const DashboardsEpsIps: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState<DashboardFilters>({
    tipoAnalisis: 'ambos'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await dashboardsEpsIpsAPI.refreshCache();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
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
                <span>Actualizar</span>
              </button>
            </motion.div>
          </div>

          {/* Información de última actualización */}
          <motion.div 
            className="mt-4 text-sm text-primary-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Última actualización: {lastUpdate.toLocaleString('es-CO')}
          </motion.div>
        </div>
      </div>

      {/* Panel de Filtros Desplegable */}
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
              onFiltersChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación por Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-8">
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  className={({ selected }) =>
                    `py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                      selected
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
  const SelectedComponent = tabs[selectedTab].component;
  return (
    <SelectedComponent 
      filters={filters}
      loading={loading}
    />
  );
})()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
