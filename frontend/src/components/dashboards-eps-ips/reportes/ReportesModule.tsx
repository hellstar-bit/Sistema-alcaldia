// frontend/src/components/dashboards-eps-ips/reportes/ReportesModule.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { ReporteEjecutivo } from './ReporteEjecutivo';
import { ReporteComparativo } from './ReporteComparativo';
import { ReporteCartera } from './ReporteCartera';
import { ReporteFlujo } from './ReporteFlujo';

interface ReportesModuleProps {
  filters: any;
  loading: boolean;
}

export const ReportesModule: React.FC<ReportesModuleProps> = ({ filters, loading }) => {
  const [selectedReport, setSelectedReport] = useState<string>('ejecutivo-eps');

  const reportes = [
    {
      id: 'ejecutivo-eps',
      titulo: 'Reporte Ejecutivo EPS',
      descripcion: 'Análisis completo de EPS con métricas clave y tendencias',
      icon: BuildingLibraryIcon,
      color: 'from-blue-500 to-blue-600',
      component: ReporteEjecutivo,
      tipo: 'eps'
    },
    {
      id: 'ejecutivo-ips',
      titulo: 'Reporte Ejecutivo IPS',
      descripcion: 'Dashboard de IPS con indicadores de desempeño',
      icon: UsersIcon,
      color: 'from-green-500 to-green-600',
      component: ReporteEjecutivo,
      tipo: 'ips'
    },
    {
      id: 'comparativo',
      titulo: 'Reporte Comparativo',
      descripcion: 'Análisis EPS vs IPS con métricas cruzadas',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
      component: ReporteComparativo
    },
    {
      id: 'cartera',
      titulo: 'Reporte de Cartera',
      descripcion: 'Trazabilidad de deuda y evolución histórica',
      icon: CurrencyDollarIcon,
      color: 'from-orange-500 to-orange-600',
      component: ReporteCartera
    },
    {
      id: 'flujo',
      titulo: 'Reporte de Flujo',
      descripcion: 'Análisis de flujo de caja y cumplimiento de pagos',
      icon: ArrowTrendingUpIcon,
      color: 'from-indigo-500 to-indigo-600',
      component: ReporteFlujo
    }
  ];

  const selectedReportData = reportes.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6">
      {/* Selector de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportes.map((reporte) => (
          <motion.button
            key={reporte.id}
            onClick={() => setSelectedReport(reporte.id)}
            className={`p-4 rounded-xl text-left transition-all duration-200 ${
              selectedReport === reporte.id
                ? 'bg-white shadow-lg ring-2 ring-primary-500'
                : 'bg-white hover:shadow-md border border-gray-200'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${reporte.color} mb-3`}>
              <reporte.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{reporte.titulo}</h3>
            <p className="text-sm text-gray-600">{reporte.descripcion}</p>
          </motion.button>
        ))}
      </div>

      {/* Contenido del Reporte Seleccionado */}
      <motion.div
        key={selectedReport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm"
      >
        {selectedReportData?.component && selectedReportData.tipo && (
            <selectedReportData.component 
                filters={filters}
                loading={loading}
                tipo={selectedReportData.tipo as 'eps' | 'ips'}
            />
            )}

      </motion.div>
    </div>
  );
};