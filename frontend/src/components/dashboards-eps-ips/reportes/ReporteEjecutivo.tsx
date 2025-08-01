// frontend/src/components/dashboards-eps-ips/reportes/ReporteEjecutivo.tsx - ARCHIVO COMPLETO CORREGIDO
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingLibraryIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

interface ReporteEjecutivoProps {
  filters: any;
  loading: boolean;
  tipo: 'eps' | 'ips';
}

interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  format?: 'currency' | 'percentage' | 'number';
  descripcion?: string; // ← Agregar esta línea
}

interface Insight {
  tipo: 'warning' | 'info' | 'success';
  titulo: string;
  mensaje: string;
  recomendacion: string;
}

export const ReporteEjecutivo: React.FC<ReporteEjecutivoProps> = ({ 
  filters, 
  loading, 
  tipo = 'eps' 
}) => {
  const [data, setData] = useState<any>(null);
  const [topEntidades, setTopEntidades] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadReporteData();
  }, [filters, tipo]);

  const loadReporteData = async () => {
    setLoadingData(true);
    try {
      const [carteraData, topData, metricasData] = await Promise.all([
        dashboardsEpsIpsAPI.getCarteraTrazabilidad(filters),
        dashboardsEpsIpsAPI.getTopEntidades(tipo, 10),
        dashboardsEpsIpsAPI.getMetricasComparativas(filters)
      ]);

      setData(carteraData);
      setTopEntidades(topData);
      setMetricas(metricasData);
    } catch (error) {
      console.error('Error loading reporte data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExportPDF = async () => {
    const reportData = {
      titulo: `Reporte Ejecutivo ${tipo.toUpperCase()}`,
      fecha: new Date().toLocaleDateString('es-CO'),
      metricas: metricas?.[tipo],
      topEntidades,
      graficas: true
    };
    
    await exportToPDF(reportData, `reporte-ejecutivo-${tipo}-${Date.now()}.pdf`);
  };

  const handleExportExcel = async () => {
    const excelData = [
      {
        sheet: 'Resumen Ejecutivo',
        data: [
          ['Métrica', 'Valor'],
          ['Total Entidades', metricas?.[tipo]?.total || 0],
          ['Entidades Activas', metricas?.[tipo]?.activas || 0],
          ['Cartera Total', metricas?.[tipo]?.carteraTotal || 0],
          ['Cartera Promedio', metricas?.[tipo]?.carteraPromedio || 0]
        ]
      },
      {
        sheet: `Top ${tipo.toUpperCase()}`,
        data: [
          ['Ranking', 'Nombre', 'Cartera Total', 'Relaciones', 'Porcentaje'],
          ...topEntidades.map((entidad, index) => [
            index + 1,
            entidad.nombre,
            entidad.carteraTotal,
            entidad.cantidadRelaciones,
            entidad.porcentajeTotal
          ])
        ]
      }
    ];

    await exportToExcel(excelData, `reporte-ejecutivo-${tipo}-${Date.now()}.xlsx`);
  };

  // Datos para gráficas
  const pieChartData = topEntidades.slice(0, 5).map((entidad, index) => ({
    name: entidad.nombre && entidad.nombre.length > 20 ? entidad.nombre.substring(0, 20) + '...' : entidad.nombre || `${tipo.toUpperCase()} ${index + 1}`,
    value: entidad.carteraTotal || 0,
    porcentaje: entidad.porcentajeTotal || 0,
    color: `hsl(${index * 72}, 70%, 60%)`
  }));

  const barChartData = topEntidades.slice(0, 8).map(entidad => ({
    nombre: entidad.nombre && entidad.nombre.length > 15 ? entidad.nombre.substring(0, 15) + '...' : entidad.nombre || 'Sin nombre',
    cartera: entidad.carteraTotal || 0,
    relaciones: entidad.cantidadRelaciones || 0
  }));

  // Métricas principales
  const metricasPrincipales: MetricCard[] = [
    {
      title: `Total ${tipo.toUpperCase()}`,
      value: metricas?.[tipo]?.total || 0,
      icon: tipo === 'eps' ? BuildingLibraryIcon : UsersIcon,
      color: 'bg-blue-500',
      descripcion: `Cantidad total de ${tipo === 'eps' ? 'EPS' : 'IPS'} registradas`
    },
    {
      title: `${tipo.toUpperCase()} Activas`,
      value: metricas?.[tipo]?.activas || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      descripcion: `${tipo === 'eps' ? 'EPS' : 'IPS'} actualmente activas`
    },
    {
      title: 'Cartera Total',
      value: metricas?.[tipo]?.carteraTotal || 0,
      format: 'currency' as const,
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500',
      descripcion: `Valor total de cartera de ${tipo === 'eps' ? 'EPS' : 'IPS'}`
    },
    {
      title: 'Cartera Promedio',
      value: metricas?.[tipo]?.carteraPromedio || 0,
      format: 'currency' as const,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
      descripcion: `Promedio de cartera por ${tipo === 'eps' ? 'EPS' : 'IPS'}`
    }
  ];

  // ✅ CORRECCIÓN: Insights con tipo explícito
  const insights = React.useMemo((): Insight[] => {
    if (!topEntidades.length || !metricas) return [];

    const insightsArray: Insight[] = [];
    const topEntidad = topEntidades[0];
    
    if (topEntidad && topEntidad.porcentajeTotal > 40) {
      insightsArray.push({
        tipo: 'warning',
        titulo: 'Concentración de Riesgo',
        mensaje: `${topEntidad.nombre || 'Entidad principal'} concentra ${topEntidad.porcentajeTotal.toFixed(1)}% de la cartera total`,
        recomendacion: 'Considere diversificar la distribución de cartera'
      });
    }

    if (topEntidades.length > 0) {
      const entidadesActivas = topEntidades.filter(e => e.carteraTotal > 0).length;
      const totalEntidades = metricas[tipo]?.total || 1;
      const porcentajeActivas = (entidadesActivas / totalEntidades) * 100;
      
      if (porcentajeActivas < 70) {
        insightsArray.push({
          tipo: 'info',
          titulo: 'Oportunidad de Activación',
          mensaje: `Solo ${porcentajeActivas.toFixed(1)}% de ${tipo === 'eps' ? 'EPS' : 'IPS'} tienen cartera activa`,
          recomendacion: `Evaluar la activación de más ${tipo === 'eps' ? 'EPS' : 'IPS'} inactivas`
        });
      }
    }

    if (topEntidades.length >= 3) {
      const top3Porcentaje = topEntidades.slice(0, 3).reduce((sum, e) => sum + (e.porcentajeTotal || 0), 0);
      if (top3Porcentaje > 70) {
        insightsArray.push({
          tipo: 'warning',
          titulo: 'Alta Concentración',
          mensaje: `Las 3 principales ${tipo === 'eps' ? 'EPS' : 'IPS'} concentran ${top3Porcentaje.toFixed(1)}% de la cartera`,
          recomendacion: 'Evaluar estrategias de distribución más equilibrada'
        });
      }
    }

    return insightsArray;
  }, [topEntidades, metricas, tipo]);

  const formatTooltipValue = (value: any, format?: string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    switch (format) {
      case 'currency':
        return formatCurrency(numValue);
      case 'percentage':
        return formatPercentage(numValue);
      default:
        return numValue.toLocaleString();
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

  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generando reporte ejecutivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header del Reporte */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            {tipo === 'eps' ? (
              <BuildingLibraryIcon className="w-8 h-8 text-blue-600 mr-3" />
            ) : (
              <UsersIcon className="w-8 h-8 text-green-600 mr-3" />
            )}
            Reporte Ejecutivo {tipo.toUpperCase()}
          </h2>
          <p className="text-gray-600 mt-1">
            Análisis completo de {tipo === 'eps' ? 'Entidades Promotoras de Salud' : 'Instituciones Prestadoras de Servicios de Salud'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Generado el {new Date().toLocaleDateString('es-CO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricasPrincipales.map((metrica, index) => (
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatTooltipValue(metrica.value, metrica.format)}
            </h3>
            <p className="text-gray-900 font-medium mb-1">{metrica.title}</p>
            <p className="text-gray-600 text-xs">{(metrica as any).descripcion}</p>
          </motion.div>
        ))}
      </div>

      {/* Insights y Alertas */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
            Insights y Recomendaciones
          </h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.tipo === 'warning' ? 'bg-amber-50 border-amber-400' :
                  insight.tipo === 'info' ? 'bg-blue-50 border-blue-400' :
                  'bg-green-50 border-green-400'
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-1">{insight.titulo}</h4>
                <p className="text-sm text-gray-700 mb-2">{insight.mensaje}</p>
                <p className="text-xs text-gray-600 italic">💡 {insight.recomendacion}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución en Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Cartera - Top 5
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, porcentaje }) => `${name} (${porcentaje.toFixed(1)}%)`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Cartera']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ranking en Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ranking por Cartera - Top 8
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
                <YAxis dataKey="nombre" type="category" width={120} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Cartera']}
                />
                <Bar dataKey="cartera" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tabla Detallada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ranking Completo - Top 10 {tipo.toUpperCase()}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cartera Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relaciones
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topEntidades.map((entidad, index) => (
                <tr key={entidad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{entidad.nombre || 'Sin nombre'}</div>
                    <div className="text-sm text-gray-500">ID: {entidad.id.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(entidad.carteraTotal || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {entidad.cantidadRelaciones || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatPercentage(entidad.porcentajeTotal || 0)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(entidad.porcentajeTotal || 0, 100)}%` }}
                      ></div>
                    </div>
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