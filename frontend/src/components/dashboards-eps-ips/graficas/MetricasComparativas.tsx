// frontend/src/components/dashboards-eps-ips/graficas/MetricasComparativas.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowsRightLeftIcon,
  BuildingLibraryIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface MetricasComparativasProps {
  filters: any;
  loading: boolean;
}

export const MetricasComparativas: React.FC<MetricasComparativasProps> = ({ filters, loading }) => {
  const [metricasData, setMetricasData] = useState<any>(null);
  const [topEPS, setTopEPS] = useState<any[]>([]);
  const [topIPS, setTopIPS] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('comparativo');

  useEffect(() => {
    loadMetricasData();
  }, [filters]);

  const loadMetricasData = async () => {
    setLoadingData(true);
    try {
      const [metricas, epsData, ipsData] = await Promise.all([
        dashboardsEpsIpsAPI.getMetricasComparativas(filters),
        dashboardsEpsIpsAPI.getTopEntidades('eps', 10),
        dashboardsEpsIpsAPI.getTopEntidades('ips', 10)
      ]);

      setMetricasData(metricas);
      setTopEPS(epsData);
      setTopIPS(ipsData);
    } catch (error) {
      console.error('Error loading metricas data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Datos para gráfico comparativo
  const datosComparativos = React.useMemo(() => {
    if (!metricasData) return [];

    return [
      {
        categoria: 'Total Entidades',
        EPS: metricasData.eps?.total || 0,
        IPS: metricasData.ips?.total || 0
      },
      {
        categoria: 'Entidades Activas',
        EPS: metricasData.eps?.activas || 0,
        IPS: metricasData.ips?.activas || 0
      },
      {
        categoria: 'Cartera Promedio (M)',
        EPS: (metricasData.eps?.carteraPromedio || 0) / 1000000,
        IPS: (metricasData.ips?.carteraPromedio || 0) / 1000000
      }
    ];
  }, [metricasData]);

  // Datos para scatter plot (EPS vs IPS por cartera)
  const scatterData = React.useMemo(() => {
    const epsPoints = topEPS.slice(0, 8).map((eps, index) => ({
      x: eps.cantidadRelaciones,
      y: eps.carteraTotal / 1000000,
      nombre: eps.nombre,
      tipo: 'EPS',
      color: '#3B82F6'
    }));

    const ipsPoints = topIPS.slice(0, 8).map((ips, index) => ({
      x: ips.cantidadRelaciones,
      y: ips.carteraTotal / 1000000,
      nombre: ips.nombre,
      tipo: 'IPS',
      color: '#10B981'
    }));

    return [...epsPoints, ...ipsPoints];
  }, [topEPS, topIPS]);

  // Datos para radar chart
  const radarData = React.useMemo(() => {
    if (!metricasData) return [];

    const maxTotal = Math.max(metricasData.eps?.total || 0, metricasData.ips?.total || 0);
    const maxCartera = Math.max(metricasData.eps?.carteraTotal || 0, metricasData.ips?.carteraTotal || 0);
    const maxPromedio = Math.max(metricasData.eps?.carteraPromedio || 0, metricasData.ips?.carteraPromedio || 0);

    return [
      {
        indicador: 'Cantidad',
        EPS: maxTotal > 0 ? (metricasData.eps?.total || 0) / maxTotal * 100 : 0,
        IPS: maxTotal > 0 ? (metricasData.ips?.total || 0) / maxTotal * 100 : 0
      },
      {
        indicador: 'Cartera Total',
        EPS: maxCartera > 0 ? (metricasData.eps?.carteraTotal || 0) / maxCartera * 100 : 0,
        IPS: maxCartera > 0 ? (metricasData.ips?.carteraTotal || 0) / maxCartera * 100 : 0
      },
      {
        indicador: 'Cartera Promedio',
        EPS: maxPromedio > 0 ? (metricasData.eps?.carteraPromedio || 0) / maxPromedio * 100 : 0,
        IPS: maxPromedio > 0 ? (metricasData.ips?.carteraPromedio || 0) / maxPromedio * 100 : 0
      },
      {
        indicador: 'Eficiencia',
        EPS: metricasData.eps?.total > 0 ? ((metricasData.eps?.carteraTotal || 0) / metricasData.eps.total) / 100000000 * 100 : 0,
        IPS: metricasData.ips?.total > 0 ? ((metricasData.ips?.carteraTotal || 0) / metricasData.ips.total) / 100000000 * 100 : 0
      }
    ];
  }, [metricasData]);

  const chartOptions = [
    { id: 'comparativo', label: 'Comparativo General', icon: ChartBarIcon },
    { id: 'radar', label: 'Análisis Multidimensional', icon: ArrowsRightLeftIcon },
    { id: 'scatter', label: 'Relaciones vs Cartera', icon: ArrowTrendingUpIcon },
    { id: 'benchmarking', label: 'Benchmarking', icon: ExclamationTriangleIcon }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('Cartera') || entry.name.includes('Promedio') ? 
                  formatCurrency(entry.value * 1000000) : 
                  entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.nombre}</p>
          <p className="text-sm text-gray-600">{data.tipo}</p>
          <p className="text-sm">Relaciones: {data.x}</p>
          <p className="text-sm">Cartera: {formatCurrency(data.y * 1000000, true)}</p>
        </div>
      );
    }
    return null;
  };

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowsRightLeftIcon className="w-8 h-8 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas comparativas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <BuildingLibraryIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {metricasData?.eps?.total || 0}
          </h3>
          <p className="text-gray-600 text-sm">Total EPS</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(metricasData?.eps?.carteraTotal || 0, true)} cartera
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {metricasData?.ips?.total || 0}
          </h3>
          <p className="text-gray-600 text-sm">Total IPS</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(metricasData?.ips?.carteraTotal || 0, true)} cartera
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500">
              <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {metricasData?.relaciones?.relacionesUnicas || 0}
          </h3>
          <p className="text-gray-600 text-sm">Relaciones Únicas</p>
          <p className="text-xs text-gray-500 mt-1">EPS-IPS activas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500">
              <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatPercentage(metricasData?.relaciones?.concentracionRiesgo?.top3Concentracion || 0)}
          </h3>
          <p className="text-gray-600 text-sm">Concentración Top 3</p>
          <p className="text-xs text-gray-500 mt-1">
            {metricasData?.relaciones?.concentracionRiesgo?.top3Concentracion > 70 ? 'Alta' : 
             metricasData?.relaciones?.concentracionRiesgo?.top3Concentracion > 50 ? 'Media' : 'Baja'} concentración
          </p>
        </motion.div>
      </div>

      {/* Gráficas Comparativas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Análisis Comparativo EPS vs IPS</h3>
          <div className="flex space-x-2">
            {chartOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedChart(option.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === option.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedChart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {selectedChart === 'comparativo' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosComparativos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="EPS" fill="#3B82F6" name="EPS" />
                    <Bar dataKey="IPS" fill="#10B981" name="IPS" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'radar' && (
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
                      strokeWidth={2}
                    />
                    <Radar
                      name="IPS"
                      dataKey="IPS"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'scatter' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Relaciones"
                      label={{ value: 'Cantidad de Relaciones', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Cartera"
                      label={{ value: 'Cartera (Millones)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<ScatterTooltip />} />
                    <Scatter 
                      name="EPS" 
                      data={scatterData.filter(d => d.tipo === 'EPS')} 
                      fill="#3B82F6" 
                    />
                    <Scatter 
                      name="IPS" 
                      data={scatterData.filter(d => d.tipo === 'IPS')} 
                      fill="#10B981" 
                    />
                    <Legend />
                  </ScatterChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'benchmarking' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Benchmarks EPS</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-800">Cartera Promedio</span>
                        <span className="font-bold text-blue-900">
                          {formatCurrency(metricasData?.eps?.carteraPromedio || 0, true)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-800">Mejor Performing</span>
                        <span className="font-bold text-blue-900">
                          {topEPS[0]?.nombre || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-800">Relaciones Promedio</span>
                        <span className="font-bold text-blue-900">
                          {topEPS.length > 0 ? Math.round(topEPS.reduce((sum, eps) => sum + eps.cantidadRelaciones, 0) / topEPS.length) : 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Benchmarks IPS</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-800">Cartera Promedio</span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(metricasData?.ips?.carteraPromedio || 0, true)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-800">Mejor Performing</span>
                        <span className="font-bold text-green-900">
                          {topIPS[0]?.nombre || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-800">Relaciones Promedio</span>
                        <span className="font-bold text-green-900">
                          {topIPS.length > 0 ? Math.round(topIPS.reduce((sum, ips) => sum + ips.cantidadRelaciones, 0) / topIPS.length) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};