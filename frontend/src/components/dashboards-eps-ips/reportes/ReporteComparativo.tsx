// frontend/src/components/dashboards-eps-ips/reportes/ReporteComparativo.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingLibraryIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface ReporteComparativoProps {
  filters: any;
  loading: boolean;
}

export const ReporteComparativo: React.FC<ReporteComparativoProps> = ({ filters, loading }) => {
  const [metricasComparativas, setMetricasComparativas] = useState<any>(null);
  const [topEPS, setTopEPS] = useState<any[]>([]);
  const [topIPS, setTopIPS] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadComparativeData();
  }, [filters]);

  const loadComparativeData = async () => {
    setLoadingData(true);
    try {
      const [metricas, topEPSData, topIPSData] = await Promise.all([
        dashboardsEpsIpsAPI.getMetricasComparativas(filters),
        dashboardsEpsIpsAPI.getTopEntidades('eps', 5),
        dashboardsEpsIpsAPI.getTopEntidades('ips', 5)
      ]);

      setMetricasComparativas(metricas);
      setTopEPS(topEPSData);
      setTopIPS(topIPSData);
    } catch (error) {
      console.error('Error loading comparative data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Datos para gráfico comparativo
  const datosComparativos = [
    {
      categoria: 'Total Entidades',
      EPS: metricasComparativas?.eps?.total || 0,
      IPS: metricasComparativas?.ips?.total || 0
    },
    {
      categoria: 'Entidades Activas',
      EPS: metricasComparativas?.eps?.activas || 0,
      IPS: metricasComparativas?.ips?.activas || 0
    },
    {
      categoria: 'Cartera Promedio (M)',
      EPS: (metricasComparativas?.eps?.carteraPromedio || 0) / 1000000,
      IPS: (metricasComparativas?.ips?.carteraPromedio || 0) / 1000000
    }
  ];

  // Datos para radar chart
  const radarData = [
    {
      indicador: 'Cantidad',
      EPS: (metricasComparativas?.eps?.total || 0) / Math.max(metricasComparativas?.eps?.total || 1, metricasComparativas?.ips?.total || 1) * 100,
      IPS: (metricasComparativas?.ips?.total || 0) / Math.max(metricasComparativas?.eps?.total || 1, metricasComparativas?.ips?.total || 1) * 100
    },
    {
      indicador: 'Cartera Total',
      EPS: (metricasComparativas?.eps?.carteraTotal || 0) / Math.max(metricasComparativas?.eps?.carteraTotal || 1, metricasComparativas?.ips?.carteraTotal || 1) * 100,
      IPS: (metricasComparativas?.ips?.carteraTotal || 0) / Math.max(metricasComparativas?.eps?.carteraTotal || 1, metricasComparativas?.ips?.carteraTotal || 1) * 100
    },
    {
      indicador: 'Promedio',
      EPS: (metricasComparativas?.eps?.carteraPromedio || 0) / Math.max(metricasComparativas?.eps?.carteraPromedio || 1, metricasComparativas?.ips?.carteraPromedio || 1) * 100,
      IPS: (metricasComparativas?.ips?.carteraPromedio || 0) / Math.max(metricasComparativas?.eps?.carteraPromedio || 1, metricasComparativas?.ips?.carteraPromedio || 1) * 100
    }
  ];

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowsRightLeftIcon className="w-8 h-8 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Generando análisis comparativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center mb-2">
          <ArrowsRightLeftIcon className="w-8 h-8 text-purple-600 mr-3" />
          Análisis Comparativo EPS vs IPS
        </h2>
        <p className="text-gray-600">
          Comparación detallada entre Entidades Promotoras de Salud e Instituciones Prestadoras de Servicios
        </p>
      </div>

      {/* Métricas Comparativas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card EPS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <BuildingLibraryIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Entidades Promotoras de Salud</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">Total Registradas</p>
              <p className="text-2xl font-bold text-blue-900">{metricasComparativas?.eps?.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Activas</p>
              <p className="text-2xl font-bold text-blue-900">{metricasComparativas?.eps?.activas || 0}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Cartera Total</p>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(metricasComparativas?.eps?.carteraTotal || 0, true)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Promedio</p>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(metricasComparativas?.eps?.carteraPromedio || 0, true)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card IPS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Instituciones Prestadoras de Servicios</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 mb-1">Total Registradas</p>
              <p className="text-2xl font-bold text-green-900">{metricasComparativas?.ips?.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 mb-1">Activas</p>
              <p className="text-2xl font-bold text-green-900">{metricasComparativas?.ips?.activas || 0}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 mb-1">Cartera Total</p>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(metricasComparativas?.ips?.carteraTotal || 0, true)}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-600 mb-1">Promedio</p>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(metricasComparativas?.ips?.carteraPromedio || 0, true)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráficas Comparativas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Comparativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación por Categorías</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosComparativos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="EPS" fill="#3B82F6" name="EPS" />
                <Bar dataKey="IPS" fill="#10B981" name="IPS" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Multidimensional</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicador" />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar
                  name="EPS"
                  dataKey="EPS"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="IPS"
                  dataKey="IPS"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Rankings Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 EPS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <BuildingLibraryIcon className="w-5 h-5 mr-2" />
              Top 5 EPS por Cartera
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topEPS.map((eps, index) => (
                <div key={eps.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{eps.nombre}</p>
                      <p className="text-sm text-gray-600">{eps.cantidadRelaciones} relaciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(eps.carteraTotal, true)}</p>
                    <p className="text-sm text-gray-600">{formatPercentage(eps.porcentajeTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top 5 IPS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              Top 5 IPS por Cartera
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topIPS.map((ips, index) => (
                <div key={ips.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ips.nombre}</p>
                      <p className="text-sm text-gray-600">{ips.cantidadRelaciones} relaciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(ips.carteraTotal, true)}</p>
                    <p className="text-sm text-gray-600">{formatPercentage(ips.porcentajeTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insights Comparativos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 text-purple-600 mr-2" />
          Insights Comparativos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900 mb-2">
              {((metricasComparativas?.eps?.total || 0) / Math.max(metricasComparativas?.ips?.total || 1, 1)).toFixed(1)}:1
            </div>
            <p className="text-sm text-purple-600">Relación EPS:IPS</p>
            <p className="text-xs text-purple-500 mt-1">
              Por cada EPS hay {Math.round((metricasComparativas?.ips?.total || 0) / Math.max(metricasComparativas?.eps?.total || 1, 1))} IPS
            </p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-900 mb-2">
              {formatPercentage(
                (metricasComparativas?.eps?.carteraTotal || 0) / 
                Math.max((metricasComparativas?.eps?.carteraTotal || 0) + (metricasComparativas?.ips?.carteraTotal || 0), 1) * 100
              )}
            </div>
            <p className="text-sm text-orange-600">Concentración EPS</p>
            <p className="text-xs text-orange-500 mt-1">
              Porcentaje de cartera concentrada en EPS
            </p>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-900 mb-2">
              {formatCurrency(
                ((metricasComparativas?.eps?.carteraPromedio || 0) + (metricasComparativas?.ips?.carteraPromedio || 0)) / 2,
                true
              )}
            </div>
            <p className="text-sm text-indigo-600">Promedio General</p>
            <p className="text-xs text-indigo-500 mt-1">
              Cartera promedio entre EPS e IPS
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


