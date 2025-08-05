// frontend/src/components/dashboards-eps-ips/graficas/GraficasCartera.tsx
// ✅ CORRECCIÓN: Validaciones para evitar errores con carteraData
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

      // ✅ VALIDACIÓN: Asegurar que cartera sea un array
      console.log('📊 GraficasCartera: Datos recibidos:', { cartera, tendencias, metricas });
      
      // Si la respuesta tiene una estructura diferente, extraer el array correcto
      let carteraArray: any[] = [];
      if (Array.isArray(cartera)) {
        carteraArray = cartera;
      } else if (cartera && Array.isArray(cartera.data)) {
        carteraArray = cartera.data;
      } else if (cartera && Array.isArray(cartera.trazabilidad)) {
        carteraArray = cartera.trazabilidad;
      } else {
        console.warn('⚠️ GraficasCartera: carteraData no es un array válido:', cartera);
        carteraArray = [];
      }

      setCarteraData(carteraArray);
      setTendenciasData(tendencias);
      setMetricasComparativas(metricas);
    } catch (error) {
      console.error('❌ Error loading cartera data:', error);
      // En caso de error, asegurar que carteraData sea un array vacío
      setCarteraData([]);
    } finally {
      setLoadingData(false);
    }
  };

  // ✅ VALIDACIÓN: Asegurar que carteraData sea un array antes de usar métodos de array
  const safeCarteraData = Array.isArray(carteraData) ? carteraData : [];

  // Métricas principales calculadas con validaciones
  const metricas: MetricCard[] = [
    {
      title: 'Cartera Total Actual',
      value: safeCarteraData.length > 0 
        ? safeCarteraData.reduce((sum, item) => sum + (item.valorActual || 0), 0)
        : 0,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-500',
      format: 'currency'
    },
    {
      title: 'Variación Promedio',
      value: safeCarteraData.length > 0 
        ? safeCarteraData.reduce((sum, item) => sum + (item.variacionPorcentual || 0), 0) / safeCarteraData.length
        : 0,
      trend: safeCarteraData.some(item => (item.variacionPorcentual || 0) > 0) ? 'up' : 'down',
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
      format: 'percentage'
    },
    {
      title: 'EPS Activas',
      value: metricasComparativas?.eps?.activas || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
      format: 'number'
    },
    {
      title: 'IPS con Cartera',
      value: safeCarteraData.length > 0 
        ? new Set(safeCarteraData.map(item => item.ipsId).filter(id => id)).size
        : 0,
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

  // Datos para distribución por EPS con validaciones
  const distribucionEPS = React.useMemo(() => {
    if (!safeCarteraData.length) return [];

    const agrupacion = new Map<string, number>();
    safeCarteraData.forEach(item => {
      if (item.epsNombre && typeof item.valorActual === 'number') {
        agrupacion.set(item.epsNombre, (agrupacion.get(item.epsNombre) || 0) + item.valorActual);
      }
    });

    return Array.from(agrupacion.entries())
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [safeCarteraData]);

  // Datos para TreeMap
  const treeMapData = distribucionEPS.map((item, index) => ({
    name: item.nombre,
    size: item.valor,
    color: `hsl(${index * 36}, 70%, 60%)`
  }));

  // Datos para matriz de relaciones críticas con validaciones
  const relacionesCriticas = React.useMemo(() => {
    if (!safeCarteraData.length) return [];

    return safeCarteraData
      .filter(item => item.valorActual && item.epsNombre && item.ipsNombre)
      .sort((a, b) => (b.valorActual || 0) - (a.valorActual || 0))
      .slice(0, 15)
      .map(item => ({
        eps: item.epsNombre.length > 15 ? item.epsNombre.substring(0, 15) + '...' : item.epsNombre,
        ips: item.ipsNombre.length > 15 ? item.ipsNombre.substring(0, 15) + '...' : item.ipsNombre,
        valor: item.valorActual || 0,
        variacion: item.variacionPorcentual || 0
      }));
  }, [safeCarteraData]);

  const chartOptions = [
    { id: 'evolucion', label: 'Evolución Temporal', icon: ArrowTrendingUpIcon },
    { id: 'distribucion', label: 'Distribución EPS', icon: CurrencyDollarIcon },
    { id: 'treemap', label: 'Mapa de Cartera', icon: CurrencyDollarIcon },
    { id: 'relaciones', label: 'Relaciones Críticas', icon: ExclamationTriangleIcon }
  ];

  const formatTooltipValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return typeof value === 'number' ? value.toLocaleString() : value;
    }
  };

  const formatMetricValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  // ✅ VALIDACIÓN: Mostrar loading si está cargando datos
  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando gráficas de cartera...</p>
        </div>
      </div>
    );
  }

  // ✅ VALIDACIÓN: Mostrar mensaje si no hay datos
  if (!safeCarteraData.length && !loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron datos de cartera para los filtros seleccionados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica, index) => (
          <motion.div
            key={metrica.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metrica.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatMetricValue(metrica.value, metrica.format)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metrica.color}`}>
                <metrica.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selector de gráficas */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-wrap gap-2 mb-6">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedChart(option.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${selectedChart === option.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido de las gráficas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChart}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-96"
          >
            {selectedChart === 'evolucion' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: any) => formatTooltipValue(value, 'currency')}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cartera"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Cartera Total"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'distribucion' && distribucionEPS.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribucionEPS} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis type="category" dataKey="nombre" width={150} />
                  <Tooltip 
                    formatter={(value: any) => formatTooltipValue(value, 'currency')}
                  />
                  <Bar dataKey="valor" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'treemap' && treeMapData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treeMapData}
                  dataKey="size"
                  stroke="#fff"
                  fill="#8884d8"
                  content={(props: any) => (
                    <div
                      style={{
                        backgroundColor: props.color,
                        width: props.width,
                        height: props.height,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '4px'
                      }}
                    >
                      <div>
                        <div>{props.name}</div>
                        <div>{formatCurrency(props.size)}</div>
                      </div>
                    </div>
                  )}
                />
              </ResponsiveContainer>
            )}

            {selectedChart === 'relaciones' && relacionesCriticas.length > 0 && (
              <div className="overflow-auto h-full">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {relacionesCriticas.map((relacion, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{relacion.eps}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{relacion.ips}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(relacion.valor)}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${relacion.variacion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(relacion.variacion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};