// frontend/src/components/dashboards-eps-ips/graficas/GraficasTendencias.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface GraficasTendenciasProps {
  filters: any;
  loading: boolean;
}

export const GraficasTendencias: React.FC<GraficasTendenciasProps> = ({ filters, loading }) => {
  const [tendenciasData, setTendenciasData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('evolucion');

  useEffect(() => {
    loadTendenciasData();
  }, [filters]);

  const loadTendenciasData = async () => {
    setLoadingData(true);
    try {
      const tendencias = await dashboardsEpsIpsAPI.getTendenciasYProyecciones(filters);
      setTendenciasData(tendencias);
    } catch (error) {
      console.error('Error loading tendencias data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Combinar datos históricos y proyecciones
  const datosCompletos = React.useMemo(() => {
    if (!tendenciasData) return [];

    const historicos = tendenciasData.carteraEvolucion?.map((item: any) => ({
      ...item,
      tipo: 'historico',
      confianza: 100
    })) || [];

    const proyecciones = tendenciasData.proyecciones?.map((item: any) => ({
      ...item,
      periodo: item.periodo,
      carteraTotal: item.carteraProyectada,
      variacionMensual: 0,
      tipo: 'proyeccion'
    })) || [];

    return [...historicos, ...proyecciones];
  }, [tendenciasData]);

  // Análisis de tendencias
  const analisisTendencias = React.useMemo(() => {
    if (!tendenciasData?.carteraEvolucion?.length) return null;

    const datos = tendenciasData.carteraEvolucion;
    const variaciones = datos.map((d: any) => d.variacionMensual).filter((v: number) => !isNaN(v));
    
    const promedioVariacion = variaciones.length > 0 
      ? variaciones.reduce((sum: number, v: number) => sum + v, 0) / variaciones.length 
      : 0;

    const tendenciaGeneral = promedioVariacion > 2 ? 'creciente' : 
                            promedioVariacion < -2 ? 'decreciente' : 'estable';

    const volatilidad = variaciones.length > 0
      ? Math.sqrt(variaciones.reduce((sum: number, v: number) => sum + Math.pow(v - promedioVariacion, 2), 0) / variaciones.length)
      : 0;

    return {
      promedioVariacion,
      tendenciaGeneral,
      volatilidad,
      mayorCrecimiento: Math.max(...variaciones),
      mayorDecrecimiento: Math.min(...variaciones),
      mesesPositivos: variaciones.filter((v: number) => v > 0).length,
      mesesNegativos: variaciones.filter((v: number) => v < 0).length
    };
  }, [tendenciasData]);

  const chartOptions = [
    { id: 'evolucion', label: 'Evolución Histórica', icon: ArrowTrendingUpIcon },
    { id: 'proyecciones', label: 'Histórico + Proyecciones', icon: CursorArrowRaysIcon },
    { id: 'variaciones', label: 'Análisis de Variaciones', icon: ChartBarIcon },
    { id: 'volatilidad', label: 'Volatilidad', icon: ArrowTrendingDownIcon }
  ];

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowTrendingUpIcon className="w-8 h-8 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Analizando tendencias y proyecciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Tendencias */}
      {analisisTendencias && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                analisisTendencias.tendenciaGeneral === 'creciente' ? 'bg-red-500' :
                analisisTendencias.tendenciaGeneral === 'decreciente' ? 'bg-green-500' :
                'bg-blue-500'
              }`}>
                {analisisTendencias.tendenciaGeneral === 'creciente' ? (
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                ) : analisisTendencias.tendenciaGeneral === 'decreciente' ? (
                  <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
                ) : (
                  <ChartBarIcon className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 capitalize">
              {analisisTendencias.tendenciaGeneral}
            </h3>
            <p className="text-gray-600 text-sm">Tendencia General</p>
            <p className="text-xs text-gray-500 mt-1">
              Promedio: {formatPercentage(analisisTendencias.promedioVariacion)} mensual
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {formatPercentage(analisisTendencias.volatilidad)}
            </h3>
            <p className="text-gray-600 text-sm">Volatilidad</p>
            <p className="text-xs text-gray-500 mt-1">
              {analisisTendencias.volatilidad > 10 ? 'Alta' : 
               analisisTendencias.volatilidad > 5 ? 'Media' : 'Baja'} variabilidad
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500">
                <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {analisisTendencias.mesesNegativos}
            </h3>
            <p className="text-gray-600 text-sm">Meses con Reducción</p>
            <p className="text-xs text-gray-500 mt-1">
              Mayor: {formatPercentage(Math.abs(analisisTendencias.mayorDecrecimiento))}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {analisisTendencias.mesesPositivos}
            </h3>
            <p className="text-gray-600 text-sm">Meses con Incremento</p>
            <p className="text-xs text-gray-500 mt-1">
              Mayor: +{formatPercentage(analisisTendencias.mayorCrecimiento)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Alertas de Tendencias */}
      {tendenciasData?.alertas?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
            Alertas de Tendencias
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tendenciasData.alertas.slice(0, 4).map((alerta: any, index: number) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alerta.severidad === 'alta' ? 'bg-red-50 border-red-400' :
                  alerta.severidad === 'media' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{alerta.mensaje}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alerta.severidad === 'alta' ? 'bg-red-100 text-red-800' :
                    alerta.severidad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alerta.severidad.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {alerta.entidad} • Valor: {formatPercentage(alerta.valor)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gráficas de Tendencias */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Análisis de Tendencias y Proyecciones</h3>
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
              {selectedChart === 'evolucion' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendenciasData?.carteraEvolucion || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'carteraTotal' ? formatCurrency(value as number) : `${value}%`,
                        name === 'carteraTotal' ? 'Cartera Total' : 'Variación %'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="carteraTotal" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Cartera Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'proyecciones' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={datosCompletos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(value as number),
                        name === 'carteraTotal' ? 'Histórico' : 'Proyección'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="carteraTotal" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Histórico"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="carteraTotal" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Proyección"
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'variaciones' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={tendenciasData?.carteraEvolucion || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Variación Mensual']}
                    />
                    <Legend />
                    <Bar dataKey="variacionMensual" fill="#F59E0B" name="Variación %" />
                    <ReferenceLine y={0} stroke="#000" strokeDasharray="2 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {selectedChart === 'volatilidad' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tendenciasData?.carteraEvolucion || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip 
                        formatter={(value) => [`${Math.abs(Number(value))}%`, 'Volatilidad']}
                        />
                    <Area
                      type="monotone"
                      dataKey="variacionMensual"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      name="Variación"
                    />
                    <ReferenceLine y={0} stroke="#000" strokeDasharray="2 2" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};