// frontend/src/components/dashboards-eps-ips/reportes/ReporteFlujo.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  BanknotesIcon
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
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

interface ReporteFlujoProps {
  filters: any;
  loading: boolean;
}

interface MetricaFlujo {
  titulo: string;
  valor: number;
  formato: 'currency' | 'percentage' | 'number';
  icono: React.ComponentType<any>;
  color: string;
  descripcion: string;
  tendencia?: 'up' | 'down' | 'neutral';
}

interface AlertaFlujo {
  tipo: 'critical' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  valor: number;
  recomendacion: string;
}

export const ReporteFlujo: React.FC<ReporteFlujoProps> = ({ filters, loading }) => {
  const [flujoData, setFlujoData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadFlujoData();
  }, [filters]);

  const loadFlujoData = async () => {
    setLoadingData(true);
    try {
      const analisisFlujo = await dashboardsEpsIpsAPI.getAnalisisFlujo(filters);
      setFlujoData(analisisFlujo);
    } catch (error) {
      console.error('Error loading flujo data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExportPDF = async () => {
    const reportData = {
      titulo: 'Reporte de Flujo de Caja',
      fecha: new Date().toLocaleDateString('es-CO'),
      metricas: flujoData,
      tipo: 'flujo'
    };
    
    await exportToPDF(reportData, `reporte-flujo-${Date.now()}.pdf`);
  };

  const handleExportExcel = async () => {
    const excelData = [
      {
        sheet: 'Métricas de Flujo',
        data: [
          ['Métrica', 'Valor'],
          ['Total Facturado', flujoData?.totalFacturado || 0],
          ['Total Reconocido', flujoData?.totalReconocido || 0],
          ['Total Pagado', flujoData?.totalPagado || 0],
          ['Cumplimiento Promedio', flujoData?.cumplimientoPromedio || 0]
        ]
      },
      {
        sheet: 'Distribución EPS',
        data: [
          ['EPS', 'Valor Pagado', 'Porcentaje'],
          ...(flujoData?.distribuccionPorEPS || []).map((eps: any) => [
            eps.nombre,
            eps.valor,
            eps.porcentaje
          ])
        ]
      }
    ];

    await exportToExcel(excelData, `reporte-flujo-${Date.now()}.xlsx`);
  };

  // Métricas principales de flujo
  const metricasFlujo: MetricaFlujo[] = [
    {
      titulo: 'Total Facturado',
      valor: flujoData?.totalFacturado || 0,
      formato: 'currency',
      icono: BanknotesIcon,
      color: 'bg-blue-500',
      descripcion: 'Valor total facturado por las IPS en el período',
      tendencia: 'neutral'
    },
    {
      titulo: 'Total Reconocido',
      valor: flujoData?.totalReconocido || 0,
      formato: 'currency',
      icono: CheckCircleIcon,
      color: 'bg-green-500',
      descripcion: 'Valor total reconocido por las EPS',
      tendencia: 'up'
    },
    {
      titulo: 'Total Pagado',
      valor: flujoData?.totalPagado || 0,
      formato: 'currency',
      icono: CurrencyDollarIcon,
      color: 'bg-orange-500',
      descripcion: 'Valor total efectivamente pagado a las IPS',
      tendencia: 'up'
    },
    {
      titulo: 'Cumplimiento Promedio',
      valor: flujoData?.cumplimientoPromedio || 0,
      formato: 'percentage',
      icono: ClockIcon,
      color: 'bg-purple-500',
      descripcion: 'Porcentaje promedio de cumplimiento de pagos',
      tendencia: (flujoData?.cumplimientoPromedio || 0) >= 90 ? 'up' : (flujoData?.cumplimientoPromedio || 0) >= 70 ? 'neutral' : 'down'
    }
  ];

  // Alertas basadas en métricas de flujo
  const alertasFlujo = React.useMemo((): AlertaFlujo[] => {
    if (!flujoData) return [];

    const alertas: AlertaFlujo[] = [];
    const cumplimiento = flujoData.cumplimientoPromedio || 0;
    const reconocimiento = flujoData.totalReconocido > 0 ? (flujoData.totalReconocido / flujoData.totalFacturado) * 100 : 0;

    if (cumplimiento < 70) {
      alertas.push({
        tipo: 'critical',
        titulo: 'Cumplimiento Crítico',
        mensaje: `El cumplimiento de pagos está en ${cumplimiento.toFixed(1)}%, por debajo del mínimo esperado`,
        valor: cumplimiento,
        recomendacion: 'Revisar inmediatamente los procesos de pago y gestionar con las EPS morosas'
      });
    } else if (cumplimiento < 85) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Cumplimiento Bajo',
        mensaje: `El cumplimiento de pagos del ${cumplimiento.toFixed(1)}% requiere atención`,
        valor: cumplimiento,
        recomendacion: 'Implementar estrategias de mejora en los procesos de pago'
      });
    }

    if (reconocimiento < 80) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Bajo Reconocimiento',
        mensaje: `Solo se reconoce el ${reconocimiento.toFixed(1)}% de lo facturado`,
        valor: reconocimiento,
        recomendacion: 'Revisar calidad de facturación y procesos de glosa'
      });
    }

    // Concentración en EPS
    if (flujoData.distribuccionPorEPS && flujoData.distribuccionPorEPS.length > 0) {
      const topEPS = flujoData.distribuccionPorEPS[0];
      if (topEPS.porcentaje > 40) {
        alertas.push({
          tipo: 'warning',
          titulo: 'Concentración de Riesgo',
          mensaje: `${topEPS.nombre} concentra ${topEPS.porcentaje.toFixed(1)}% de los pagos`,
          valor: topEPS.porcentaje,
          recomendacion: 'Diversificar la cartera de EPS para reducir dependencia'
        });
      }
    }

    return alertas;
  }, [flujoData]);

  // Datos para gráfico de embudo (facturado -> reconocido -> pagado)
  const embudoData = [
    {
      etapa: 'Facturado',
      valor: flujoData?.totalFacturado || 0,
      porcentaje: 100,
      color: '#3B82F6'
    },
    {
      etapa: 'Reconocido',
      valor: flujoData?.totalReconocido || 0,
      porcentaje: flujoData?.totalFacturado > 0 ? (flujoData.totalReconocido / flujoData.totalFacturado) * 100 : 0,
      color: '#10B981'
    },
    {
      etapa: 'Pagado',
      valor: flujoData?.totalPagado || 0,
      porcentaje: flujoData?.totalFacturado > 0 ? (flujoData.totalPagado / flujoData.totalFacturado) * 100 : 0,
      color: '#F59E0B'
    }
  ];

  // Datos para distribución por EPS
  const pieDataEPS = (flujoData?.distribuccionPorEPS || []).slice(0, 6).map((eps: any, index: number) => ({
    name: eps.nombre.length > 15 ? eps.nombre.substring(0, 15) + '...' : eps.nombre,
    value: eps.valor,
    porcentaje: eps.porcentaje,
    color: `hsl(${index * 60}, 70%, 60%)`
  }));

  const formatTooltipValue = (value: any, formato?: string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    switch (formato) {
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
          <ClockIcon className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Generando reporte de flujo...</p>
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
            <CurrencyDollarIcon className="w-8 h-8 text-green-600 mr-3" />
            Reporte de Flujo de Caja
          </h2>
          <p className="text-gray-600 mt-1">
            Análisis completo del flujo de caja y cumplimiento de pagos EPS-IPS
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
              {metrica.tendencia && (
                <div className={`text-sm ${
                  metrica.tendencia === 'up' ? 'text-green-600' : 
                  metrica.tendencia === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metrica.tendencia === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  ) : metrica.tendencia === 'down' ? (
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  ) : null}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatTooltipValue(metrica.valor, metrica.formato)}
            </h3>
            <p className="text-gray-900 font-medium mb-1">{metrica.titulo}</p>
            <p className="text-gray-600 text-xs">{metrica.descripcion}</p>
          </motion.div>
        ))}
      </div>

      {/* Alertas de Flujo */}
      {alertasFlujo.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
            Alertas de Flujo de Caja
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertasFlujo.map((alerta, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alerta.tipo === 'critical' ? 'bg-red-50 border-red-400' :
                  alerta.tipo === 'warning' ? 'bg-amber-50 border-amber-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alerta.tipo === 'critical' ? 'bg-red-100 text-red-800' :
                    alerta.tipo === 'warning' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alerta.tipo === 'critical' ? 'CRÍTICO' : 
                     alerta.tipo === 'warning' ? 'ALERTA' : 'INFO'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alerta.mensaje}</p>
                <p className="text-xs text-gray-600 italic">💡 {alerta.recomendacion}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gráficas de Flujo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embudo de Flujo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Embudo de Flujo de Caja
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={embudoData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
                <YAxis dataKey="etapa" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" fill="#3B82F6">
                  {embudoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {embudoData.map((etapa, index) => (
              <div key={etapa.etapa} className="text-sm">
                <div className="font-medium text-gray-900">{etapa.porcentaje.toFixed(1)}%</div>
                <div className="text-gray-600">{etapa.etapa}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Distribución por EPS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Pagos por EPS
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDataEPS}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, porcentaje }) => `${name} (${porcentaje.toFixed(1)}%)`}
                >
                  {pieDataEPS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Pagos']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tabla de EPS por Cumplimiento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ranking EPS por Volumen de Pagos
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
                  EPS
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pagado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % del Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(flujoData?.distribuccionPorEPS || []).slice(0, 8).map((eps: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
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
                    <div className="text-sm font-medium text-gray-900">{eps.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(eps.valor)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatPercentage(eps.porcentaje)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(eps.porcentaje, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      eps.porcentaje > 20 ? 'bg-red-100 text-red-800' :
                      eps.porcentaje > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {eps.porcentaje > 20 ? 'Alta Concentración' :
                       eps.porcentaje > 10 ? 'Media' : 'Normal'}
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