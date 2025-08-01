// frontend/src/components/dashboards-eps-ips/graficas/GraficasFlujo.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon, // Identifier expected.
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface GraficasFlujoProps {
  filters: any;
  loading: boolean;
}

export const GraficasFlujo: React.FC<GraficasFlujoProps> = ({ filters, loading }) => {
  const [flujoData, setFlujoData] = useState<any>(null);
  const [cumplimientoData, setCumplimientoData] = useState<any[]>([]);
  const [distribuccionData, setDistribuccionData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('cumplimiento');

  useEffect(() => {
    loadFlujoData();
  }, [filters]);

  const loadFlujoData = async () => {
    setLoadingData(true);
    try {
      const [analisisFlujo] = await Promise.all([
        dashboardsEpsIpsAPI.getAnalisisFlujo(filters)
      ]);

      setFlujoData(analisisFlujo);
      
      // Procesar datos para gráficas
      procesarDatosCumplimiento(analisisFlujo);
      procesarDatosDistribucion(analisisFlujo);
      
    } catch (error) {
      console.error('Error loading flujo data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const procesarDatosCumplimiento = (data: any) => {
    // Simular datos históricos de cumplimiento (en implementación real vendría del backend)
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const cumplimiento = meses.map((mes, index) => ({
      mes,
      cumplimiento: Math.random() * 30 + 70, // 70-100%
      meta: 92, // Meta del 92%
      facturado: Math.random() * 50000000 + 100000000,
      pagado: Math.random() * 40000000 + 80000000,
      pendiente: Math.random() * 20000000 + 10000000
    }));
    
    setCumplimientoData(cumplimiento);
  };

  const procesarDatosDistribucion = (data: any) => {
    if (data?.distribuccionPorEPS) {
      const distribucion = data.distribuccionPorEPS.slice(0, 8).map((item: any, index: number) => ({
        ...item,
        color: `hsl(${index * 45}, 70%, 60%)`
      }));
      setDistribuccionData(distribucion);
    }
  };

  // Métricas de flujo
  const metricasFlujo = [
    {
      titulo: 'Total Facturado',
      valor: flujoData?.totalFacturado || 0,
      formato: 'currency',
      icono: CurrencyDollarIcon,
      color: 'bg-blue-500',
      descripcion: 'Valor total facturado en el período'
    },
    {
      titulo: 'Total Reconocido', 
      valor: flujoData?.totalReconocido || 0,
      formato: 'currency',
      icono: CheckCircleIcon,
      color: 'bg-green-500',
      descripcion: 'Valor total reconocido por las EPS'
    },
    {
      titulo: 'Total Pagado',
      valor: flujoData?.totalPagado || 0,
      formato: 'currency',
      icono: ArrowTrendingUpIcon,
      color: 'bg-orange-500',
      descripcion: 'Valor total pagado a las IPS'
    },
    {
      titulo: 'Cumplimiento Promedio',
      valor: flujoData?.cumplimientoPromedio || 0,
      formato: 'percentage',
      icono: ClockIcon,
      color: 'bg-purple-500',
      descripcion: 'Porcentaje promedio de cumplimiento de pagos'
    }
  ];

  // Datos para gráfico de composición (facturado vs pagado)
  const composicionData = cumplimientoData.map(item => ({
    mes: item.mes,
    facturado: item.facturado,
    pagado: item.pagado,
    pendiente: item.facturado - item.pagado,
    cumplimiento: item.cumplimiento
  }));

  const chartOptions = [
    { id: 'cumplimiento', label: 'Cumplimiento vs Meta', icon: ArrowTrendingUpIcon },
    { id: 'composicion', label: 'Facturado vs Pagado', icon: CurrencyDollarIcon },
    { id: 'distribucion', label: 'Distribución por EPS', icon: CheckCircleIcon },
    { id: 'tendencias', label: 'Tendencias de Flujo', icon: ClockIcon }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('Cumplimiento') || entry.name.includes('%') ? 
                  `${entry.value.toFixed(1)}%` : 
                  formatCurrency(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ClockIcon className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando análisis de flujo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Flujo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricasFlujo.map((metrica, index) => (
          <motion.div
            key={metrica.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metrica.color}`}>
                <metrica.icono className="w-6 h-6 text-white" />
              </div>
              {metrica.titulo === 'Cumplimiento Promedio' && (
                <div className={`text-sm font-medium ${
                  (metrica.valor || 0) >= 90 ? 'text-green-600' :
                  (metrica.valor || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(metrica.valor || 0) >= 90 ? 'Excelente' :
                   (metrica.valor || 0) >= 70 ? 'Bueno' : 'Crítico'}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {metrica.formato === 'currency' ? 
                formatCurrency(metrica.valor, true) : 
                metrica.formato === 'percentage' ?
                  formatPercentage(metrica.valor) :
                  metrica.valor.toLocaleString()}
            </h3>
            <p className="text-gray-900 font-medium mb-1">{metrica.titulo}</p>
            <p className="text-gray-600 text-xs">{metrica.descripcion}</p>
          </motion.div>
        ))}
      </div>

      {/* Indicadores de Alerta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
          Indicadores de Flujo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Cumplimiento Excelente</p>
                <p className="text-xs text-green-600">EPS con `{'>'}` 90% cumplimiento</p>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {distribuccionData.filter(d => d.porcentaje `{'>'}`,90).length}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Cumplimiento Regular</p>
                <p className="text-xs text-yellow-600">EPS con 70-90% cumplimiento</p>
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                {distribuccionData.filter(d => d.porcentaje >= 70 && d.porcentaje <= 90).length}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Cumplimiento Crítico</p>
                <p className="text-xs text-red-600">EPS con `{'>'}` 70% cumplimiento</p>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {distribuccionData.filter(d => d.porcentaje < 70).length}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gráficas Interactivas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Análisis Visual de Flujo</h3>
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
              {selectedChart === 'cumplimiento' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cumplimientoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cumplimiento" fill="#3B82F6" name="Cumplimiento %" />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta 92%"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'composicion' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={composicionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="facturado"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Facturado"
                    />
                    <Area
                      type="monotone"
                      dataKey="pagado"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Pagado"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'distribucion' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuccionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="valor"
                      label={({ nombre, porcentaje }) => `${nombre} (${porcentaje.toFixed(1)}%)`}
                    >
                      {distribuccionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Pagos']} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'tendencias' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumplimientoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cumplimiento" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Cumplimiento %"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta 92%"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
