// frontend/src/components/dashboards-eps-ips/graficas/GraficasCartera.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface GraficasCarteraProps {
  filters: any;
  loading: boolean;
}

interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  format?: 'currency' | 'percentage' | 'number';
}

export const GraficasCartera: React.FC<GraficasCarteraProps> = ({ filters, loading }) => {
  const [carteraData, setCarteraData] = useState<any[]>([]);
  const [tendenciasData, setTendenciasData] = useState<any>(null);
  const [metricasComparativas, setMetricasComparativas] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('evolucion');

  useEffect(() => {
    loadCarteraData();
  }, [filters]);

  const loadCarteraData = async () => {
    setLoadingData(true);
    try {
      const [cartera, tendencias, metricas] = await Promise.all([
        dashboardsEpsIpsAPI.getCarteraTrazabilidad(filters),
        dashboardsEpsIpsAPI.getTendenciasYProyecciones(filters),
        dashboardsEpsIpsAPI.getMetricasComparativas(filters)
      ]);

      setCarteraData(cartera);
      setTendenciasData(tendencias);
      setMetricasComparativas(metricas);
    } catch (error) {
      console.error('Error loading cartera data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Métricas principales calculadas
  const metricas: MetricCard[] = [
    {
      title: 'Cartera Total Actual',
      value: carteraData.reduce((sum, item) => sum + item.valorActual, 0),
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-500',
      format: 'currency'
    },
    {
      title: 'Variación Promedio',
      value: carteraData.length > 0 
        ? carteraData.reduce((sum, item) => sum + (item.variacionPorcentual || 0), 0) / carteraData.length
        : 0,
      trend: carteraData.some(item => (item.variacionPorcentual || 0) > 0) ? 'up' : 'down',
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
      format: 'percentage'
    },
    {
      title: 'EPS Activas',
      value: metricasComparativas?.eps.activas || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
      format: 'number'
    },
    {
      title: 'IPS con Cartera',
      value: new Set(carteraData.map(item => item.ipsId)).size,
      icon: ArrowTrendingUpIcon,
      color: 'bg-orange-500',
      format: 'number'
    }
  ];

  // Datos para gráfico de evolución
  const evolucionData = tendenciasData?.carteraEvolucion?.map((item: any) => ({
    periodo: item.periodo,
    cartera: item.carteraTotal,
    variacion: item.variacionMensual,
    eps: item.cantidadEPS,
    ips: item.cantidadIPS
  })) || [];

  // Datos para distribución por EPS
  const distribucionEPS = React.useMemo(() => {
    const agrupacion = new Map<string, number>();
    carteraData.forEach(item => {
      agrupacion.set(item.epsNombre, (agrupacion.get(item.epsNombre) || 0) + item.valorActual);
    });

    return Array.from(agrupacion.entries())
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [carteraData]);

  // Datos para TreeMap
  const treeMapData = distribucionEPS.map((item, index) => ({
    name: item.nombre,
    size: item.valor,
    color: `hsl(${index * 36}, 70%, 60%)`
  }));

  // Datos para matriz de relaciones críticas
  const relacionesCriticas = carteraData
    .sort((a, b) => b.valorActual - a.valorActual)
    .slice(0, 15)
    .map(item => ({
      eps: item.epsNombre.length > 15 ? item.epsNombre.substring(0, 15) + '...' : item.epsNombre,
      ips: item.ipsNombre.length > 15 ? item.ipsNombre.substring(0, 15) + '...' : item.ipsNombre,
      valor: item.valorActual,
      variacion: item.variacionPorcentual || 0
    }));

  const chartOptions = [
    { id: 'evolucion', label: 'Evolución Temporal', icon: ArrowTrendingUpIcon },
    { id: 'distribucion', label: 'Distribución EPS', icon: CurrencyDollarIcon },
    { id: 'treemap', label: 'Mapa de Cartera', icon: CurrencyDollarIcon },
    { id: 'relaciones', label: 'Relaciones Críticas', icon: ExclamationTriangleIcon }
  ];

  const formatTooltipValue = (value: any, format?: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return value.toLocaleString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TreeMapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.size)}</p>
        </div>
      );
    }
    return null;
  };

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando análisis de cartera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica, index) => (
          <motion.div
            key={metrica.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metrica.color}`}>
                <metrica.icon className="w-6 h-6 text-white" />
              </div>
              {metrica.trend && (
                <div className={`flex items-center text-sm ${
                  metrica.trend === 'up' ? 'text-green-600' : 
                  metrica.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metrica.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  ) : metrica.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                  ) : null}
                  {metrica.change && formatPercentage(metrica.change)}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatTooltipValue(metrica.value, metrica.format)}
            </h3>
            <p className="text-gray-600 text-sm">{metrica.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Alertas de Tendencias */}
      {tendenciasData?.alertas?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
            Alertas y Observaciones
          </h3>
          <div className="space-y-3">
            {tendenciasData.alertas.slice(0, 3).map((alerta: any, index: number) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alerta.severidad === 'alta' ? 'bg-red-50 border-red-400' :
                  alerta.severidad === 'media' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{alerta.mensaje}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alerta.severidad === 'alta' ? 'bg-red-100 text-red-800' :
                    alerta.severidad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alerta.severidad.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Entidad: {alerta.entidad}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Selector de Gráficas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Análisis Visual de Cartera</h3>
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

        {/* Gráficas */}
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
              {selectedChart === 'evolucion' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolucionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cartera"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="url(#colorCartera)"
                      name="Cartera Total"
                    />
                    <defs>
                      <linearGradient id="colorCartera" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'distribucion' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribucionEPS} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
                    <YAxis dataKey="nombre" type="category" width={150} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="valor" fill="#F59E0B" name="Cartera">
                      {distribucionEPS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 25}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'treemap' && (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treeMapData}
                    dataKey="size"
                    stroke="#fff"
                    fill="#8884d8"
                    content={({ root, depth, x, y, width, height, index, payload }: any) => (
                      <g>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          style={{
                            fill: payload.color,
                            stroke: '#fff',
                            strokeWidth: 2,
                            strokeOpacity: 1,
                          }}
                        />
                        {width > 60 && height > 30 && (
                          <>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 - 10}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {payload.name}
                            </text>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 10}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="10"
                            >
                              {formatCurrency(payload.size, true)}
                            </text>
                          </>
                        )}
                      </g>
                    )}
                  >
                    <Tooltip content={<TreeMapTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              )}

              {selectedChart === 'relaciones' && (
                <div className="h-full overflow-auto">
                  <div className="space-y-3">
                    {relacionesCriticas.map((relacion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-900">
                              {relacion.eps}
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="text-sm text-gray-700">
                              {relacion.ips}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(relacion.valor, true)}
                            </div>
                            <div className={`text-xs ${
                              relacion.variacion > 0 ? 'text-green-600' : 
                              relacion.variacion < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {relacion.variacion !== 0 && (
                                <>
                                  {relacion.variacion > 0 ? '+' : ''}{formatPercentage(relacion.variacion)}
                                </>
                              )}
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            relacion.variacion > 5 ? 'bg-red-500' :
                            relacion.variacion > 0 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
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