// frontend/src/components/dashboards-eps-ips/reportes/ReporteCartera.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface ReporteCarteraProps {
  filters: any;
  loading: boolean;
}

export const ReporteCartera: React.FC<ReporteCarteraProps> = ({ filters, loading }) => {
  const [carteraData, setCarteraData] = useState<any[]>([]);
  const [tendenciasData, setTendenciasData] = useState<any>(null);
  const [trazabilidadCompleta, setTrazabilidadCompleta] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadCarteraReport();
  }, [filters]);

  const loadCarteraReport = async () => {
    setLoadingData(true);
    try {
      const [cartera, tendencias] = await Promise.all([
        dashboardsEpsIpsAPI.getCarteraTrazabilidad({ ...filters, incluirHistorico: true }),
        dashboardsEpsIpsAPI.getTendenciasYProyecciones(filters)
        ]);

        setCarteraData(cartera);
        setTrazabilidadCompleta(cartera || []);
      setTendenciasData(tendencias);
    } catch (error) {
      console.error('Error loading cartera report:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Análisis de trazabilidad
  const analisisTrazabilidad = React.useMemo(() => {
    if (!trazabilidadCompleta.length) return null;

    const incrementos = trazabilidadCompleta.filter(t => t.variacionPorcentual > 0);
    const decrementos = trazabilidadCompleta.filter(t => t.variacionPorcentual < 0);
    const sinCambios = trazabilidadCompleta.filter(t => t.variacionPorcentual === 0);

    const promedioIncremento = incrementos.length > 0 
      ? incrementos.reduce((sum, t) => sum + t.variacionPorcentual, 0) / incrementos.length 
      : 0;

    const promedioDecremento = decrementos.length > 0
      ? decrementos.reduce((sum, t) => sum + Math.abs(t.variacionPorcentual), 0) / decrementos.length
      : 0;

    return {
      totalRelaciones: trazabilidadCompleta.length,
      incrementos: incrementos.length,
      decrementos: decrementos.length,
      sinCambios: sinCambios.length,
      promedioIncremento,
      promedioDecremento,
      mayorIncremento: incrementos.length > 0 ? Math.max(...incrementos.map(t => t.variacionPorcentual)) : 0,
      mayorDecremento: decrementos.length > 0 ? Math.max(...decrementos.map(t => Math.abs(t.variacionPorcentual))) : 0
    };
  }, [trazabilidadCompleta]);

  // Datos para gráfico de evolución
  const evolucionData = tendenciasData?.carteraEvolucion?.map((item: any) => ({
    periodo: item.periodo,
    cartera: item.carteraTotal,
    variacion: item.variacionMensual
  })) || [];

  // Datos para distribución de variaciones
  const distribucionVariaciones = React.useMemo(() => {
    if (!trazabilidadCompleta.length) return [];

    const rangos = [
      { label: '> +20%', min: 20, max: Infinity, color: '#EF4444' },
      { label: '+10% a +20%', min: 10, max: 20, color: '#F97316' },
      { label: '+0% a +10%', min: 0, max: 10, color: '#EAB308' },
      { label: 'Sin cambio', min: 0, max: 0, color: '#6B7280' },
      { label: '-0% a -10%', min: -10, max: 0, color: '#06B6D4' },
      { label: '-10% a -20%', min: -20, max: -10, color: '#3B82F6' },
      { label: '< -20%', min: -Infinity, max: -20, color: '#8B5CF6' }
    ];

    return rangos.map(rango => {
      const count = trazabilidadCompleta.filter(t => {
        if (rango.label === 'Sin cambio') {
          return t.variacionPorcentual === 0;
        }
        return t.variacionPorcentual > rango.min && t.variacionPorcentual <= rango.max;
      }).length;

      return {
        ...rango,
        cantidad: count,
        porcentaje: (count / trazabilidadCompleta.length) * 100
      };
    });
  }, [trazabilidadCompleta]);

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Generando reporte de cartera con trazabilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header del Reporte */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center mb-2">
          <CurrencyDollarIcon className="w-8 h-8 text-orange-600 mr-3" />
          Reporte de Cartera con Trazabilidad
        </h2>
        <p className="text-gray-600">
          Análisis detallado de la evolución de cartera por relación EPS-IPS con lógica corregida
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ✅ Lógica de Trazabilidad Corregida - Sin Doble Contabilización
        </div>
      </div>

      {/* Métricas de Trazabilidad */}
      {analisisTrazabilidad && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <InformationCircleIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{analisisTrazabilidad.totalRelaciones}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Relaciones Únicas</h3>
            <p className="text-sm text-gray-600">Combinaciones EPS-IPS sin duplicar</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{analisisTrazabilidad.incrementos}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Incrementos</h3>
            <p className="text-sm text-gray-600">Promedio: +{analisisTrazabilidad.promedioIncremento.toFixed(1)}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{analisisTrazabilidad.decrementos}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Decrementos</h3>
            <p className="text-sm text-gray-600">Promedio: -{analisisTrazabilidad.promedioDecremento.toFixed(1)}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="w-8 h-8 text-gray-600" />
              <span className="text-2xl font-bold text-gray-600">{analisisTrazabilidad.sinCambios}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Sin Cambios</h3>
            <p className="text-sm text-gray-600">Cartera estable</p>
          </motion.div>
        </div>
      )}

      {/* Explicación de la Corrección */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Lógica de Trazabilidad Corregida</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Antes (Incorrecto):</strong> Se sumaban todos los registros de cartera como si fueran deudas independientes.</p>
              <p><strong>Ahora (Correcto):</strong> Se toma el último valor registrado por cada relación EPS-IPS, representando la evolución real de la deuda.</p>
              <p><strong>Ejemplo:</strong> Si en Enero la EPS A debía $100M a IPS X, y en Febrero esa deuda cambió a $110M, el total es $110M (no $210M).</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución Temporal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Cartera Total</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Cartera']}
                />
                <Area
                  type="monotone"
                  dataKey="cartera"
                  stroke="#F97316"
                  fill="url(#colorCartera)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorCartera" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribución de Variaciones */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Variaciones</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribucionVariaciones} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => [`${value} relaciones`, 'Cantidad']}
                />
                <Bar dataKey="cantidad" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Relaciones con Mayor Variación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Relaciones con Mayor Variación (Últimos Períodos)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPS</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Anterior</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variación</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trazabilidadCompleta
                .filter(t => Math.abs(t.variacionPorcentual) > 5)
                .sort((a, b) => Math.abs(b.variacionPorcentual) - Math.abs(a.variacionPorcentual))
                .slice(0, 10)
                .map((relacion, index) => (
                <tr key={`${relacion.epsId}-${relacion.ipsId}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {relacion.epsNombre || relacion.epsId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {relacion.ipsNombre || relacion.ipsId}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(relacion.valorActual)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {relacion.valorAnterior ? formatCurrency(relacion.valorAnterior) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-medium ${
                      relacion.variacionPorcentual > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {relacion.variacionPorcentual > 0 ? '+' : ''}{formatPercentage(relacion.variacionPorcentual)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      Math.abs(relacion.variacionPorcentual) > 20 ? 'bg-red-100 text-red-800' :
                      Math.abs(relacion.variacionPorcentual) > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {Math.abs(relacion.variacionPorcentual) > 20 ? 'Crítico' :
                       Math.abs(relacion.variacionPorcentual) > 10 ? 'Alto' : 'Moderado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

