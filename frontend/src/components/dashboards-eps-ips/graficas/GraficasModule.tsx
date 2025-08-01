// frontend/src/components/dashboards-eps-ips/graficas/GraficasModule.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { GraficasCartera } from './GraficasCartera';
import { GraficasFlujo } from './GraficasFlujo';
import { MetricasComparativas } from './MetricasComparativas';
import { GraficasTendencias } from './GraficasTendencias';

interface GraficasModuleProps {
  filters: any;
  loading?: boolean;
}

export const GraficasModule: React.FC<GraficasModuleProps> = ({ 
  filters, 
  loading = false 
}) => {
  const [selectedChart, setSelectedChart] = useState<string>('cartera');
  const [chartData, setChartData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  const chartOptions = [
    {
      id: 'cartera',
      name: 'Análisis de Cartera',
      icon: CurrencyDollarIcon,
      component: GraficasCartera,
      description: 'Evolución y distribución de la cartera por EPS e IPS'
    },
    {
      id: 'flujo',
      name: 'Análisis de Flujo',
      icon: ClockIcon,
      component: GraficasFlujo,
      description: 'Métricas de cumplimiento y procesamiento de flujo'
    },
    {
      id: 'comparativas',
      name: 'Métricas Comparativas',
      icon: ChartBarIcon,
      component: MetricasComparativas,
      description: 'Comparación de indicadores entre entidades'
    },
    {
      id: 'tendencias',
      name: 'Análisis de Tendencias',
      icon: ArrowTrendingUpIcon,
      component: GraficasTendencias,
      description: 'Proyecciones y análisis predictivo'
    }
  ];

  // Función memoizada para cambiar gráfico
  const handleChartChange = useCallback((chartId: string) => {
    setSelectedChart(chartId);
  }, []);

  // Obtener el componente seleccionado
  const selectedChartOption = chartOptions.find(option => option.id === selectedChart);
  const SelectedComponent = selectedChartOption?.component;

  return (
    <div className="space-y-6">
      {/* Header con Selector de Gráficos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Análisis Gráfico EPS e IPS
          </h2>
          <p className="text-gray-600">
            Visualización interactiva de datos de cartera y flujo con métricas avanzadas
          </p>
        </div>

        {/* Selector de Tipo de Gráfico - SIN AnimatePresence */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleChartChange(option.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedChart === option.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <option.icon className={`w-6 h-6 ${
                  selectedChart === option.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <h3 className="font-semibold">{option.name}</h3>
              </div>
              <p className="text-sm opacity-75">{option.description}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Contenido del Gráfico Seleccionado - SIN AnimatePresence PROBLEMÁTICO */}
      <div className="transition-opacity duration-300">
        {SelectedComponent && (
          <SelectedComponent 
            filters={filters} 
            loading={loading || loadingData}
          />
        )}
      </div>

      {/* Información Adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Información del Análisis Actual
            </h3>
            <p className="text-blue-700 mb-3">
              {selectedChartOption?.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="font-medium text-blue-800">Filtros Activos</div>
                <div className="text-blue-600">
                  {filters.tipoAnalisis === 'ambos' ? 'Cartera y Flujo' : 
                   filters.tipoAnalisis === 'cartera' ? 'Solo Cartera' : 'Solo Flujo'}
                </div>
              </div>
              
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="font-medium text-blue-800">EPS Seleccionadas</div>
                <div className="text-blue-600">
                  {filters.epsIds?.length || 'Todas'} EPS
                </div>
              </div>
              
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="font-medium text-blue-800">IPS Seleccionadas</div>
                <div className="text-blue-600">
                  {filters.ipsIds?.length || 'Todas'} IPS
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};