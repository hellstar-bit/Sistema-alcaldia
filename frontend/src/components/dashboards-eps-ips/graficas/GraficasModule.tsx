// frontend/src/components/dashboards-eps-ips/graficas/GraficasModule.tsx - CORREGIDO
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  PresentationChartLineIcon,
  ChartPieIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { GraficasCartera } from './GraficasCartera';
import { GraficasFlujo } from './GraficasFlujo';
import { GraficasTendencias } from './GraficasTendencias';
import { MetricasComparativas } from './MetricasComparativas'; // ✅ Import corregido

interface GraficasModuleProps {
  filters: any;
  loading: boolean;
}

export const GraficasModule: React.FC<GraficasModuleProps> = ({ filters, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('cartera');

  const categorias = [
    {
      id: 'cartera',
      titulo: 'Análisis de Cartera',
      descripcion: 'Visualización de cartera con trazabilidad corregida',
      icon: CurrencyDollarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      component: GraficasCartera
    },
    {
      id: 'flujo',
      titulo: 'Análisis de Flujo',
      descripcion: 'Métricas de flujo de caja y cumplimiento',
      icon: PresentationChartLineIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      component: GraficasFlujo
    },
    {
      id: 'tendencias',
      titulo: 'Tendencias y Proyecciones',
      descripcion: 'Análisis predictivo y tendencias históricas',
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      component: GraficasTendencias
    },
    {
      id: 'comparativas',
      titulo: 'Métricas Comparativas',
      descripcion: 'Comparaciones EPS vs IPS y benchmarking',
      icon: ChartPieIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      component: MetricasComparativas // ✅ Componente corregido
    }
  ];

  const selectedCategoryData = categorias.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Selector de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categorias.map((categoria) => (
          <motion.button
            key={categoria.id}
            onClick={() => setSelectedCategory(categoria.id)}
            className={`p-6 rounded-xl text-left transition-all duration-200 ${
              selectedCategory === categoria.id
                ? `${categoria.bgColor} ring-2 ring-offset-2 ring-current ${categoria.color}`
                : 'bg-white hover:shadow-md border border-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`inline-flex p-3 rounded-lg ${categoria.bgColor} mb-4`}>
              <categoria.icon className={`w-6 h-6 ${categoria.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{categoria.titulo}</h3>
            <p className="text-sm text-gray-600">{categoria.descripcion}</p>
          </motion.button>
        ))}
      </div>

      {/* Contenido de las Gráficas */}
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedCategoryData?.component && (
          <selectedCategoryData.component 
            filters={filters}
            loading={loading}
          />
        )}
      </motion.div>
    </div>
  );
};

// ✅ Export corregido - debe ser GraficasModule, no DashboardsEpsIps
export default GraficasModule;