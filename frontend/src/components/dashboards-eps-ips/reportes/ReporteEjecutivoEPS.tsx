// frontend/src/components/dashboards-eps-ips/reportes/ReporteEjecutivoEPS.tsx
// ✅ NUEVA VISTA: Reporte Ejecutivo EPS con Comparación y Filtros Avanzados
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

interface EPSData {
  id: string;
  nombre: string;
  valorTotalUPC: number;
  incrementoPromedio: number;
  tiposContrato: string[];
  valorFacturado: number;
  reconocido: number;
  pagado: number;
  saldoAdeudado: number;
  cumplimientoPagos: number;
  participacionMercado: number;
}

interface FiltrosEPS {
  epsSeleccionadas: string[];
  periodoIds: string[];
  valorUPCMin: number;
  valorUPCMax: number;
  incrementoMin: number;
  incrementoMax: number;
  tiposContrato: string[];
  cumplimientoMin: number;
  cumplimientoMax: number;
}

interface ReporteEjecutivoEPSProps {
  filters: any;
  loading: boolean;
}

export const ReporteEjecutivoEPS: React.FC<ReporteEjecutivoEPSProps> = ({ 
  filters, 
  loading 
}) => {
  // Estados principales
  const [datosEPS, setDatosEPS] = useState<EPSData[]>([]);
  const [epsDisponibles, setEpsDisponibles] = useState<any[]>([]);
  const [periodosDisponibles, setPeriodosDisponibles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [modoComparacion, setModoComparacion] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoVisualizacion, setTipoVisualizacion] = useState<'individual' | 'comparativa'>('individual');

  // Estados de filtros
  const [filtrosEPS, setFiltrosEPS] = useState<FiltrosEPS>({
    epsSeleccionadas: [],
    periodoIds: [],
    valorUPCMin: 0,
    valorUPCMax: 100000000,
    incrementoMin: 0,
    incrementoMax: 100,
    tiposContrato: [],
    cumplimientoMin: 0,
    cumplimientoMax: 100
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (filtrosEPS.epsSeleccionadas.length > 0) {
      loadEPSData();
    }
  }, [filtrosEPS]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [epsResponse, periodosResponse] = await Promise.all([
        dashboardsEpsIpsAPI.getEPSList(),
        dashboardsEpsIpsAPI.getPeriodos()
      ]);

      setEpsDisponibles(epsResponse || []);
      setPeriodosDisponibles(periodosResponse || []);

      // Seleccionar automáticamente las top 3 EPS
      if (epsResponse && epsResponse.length > 0) {
        const topEPS = epsResponse.slice(0, 3).map((eps: any) => eps.id);
        setFiltrosEPS(prev => ({ ...prev, epsSeleccionadas: topEPS }));
      }
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadEPSData = async () => {
    if (filtrosEPS.epsSeleccionadas.length === 0) return;

    setLoadingData(true);
    try {
      // Cargar datos para cada EPS seleccionada
      const promesasEPS = filtrosEPS.epsSeleccionadas.map(async (epsId) => {
        const [carteraData, flujoData, adresData] = await Promise.all([
          dashboardsEpsIpsAPI.getCarteraTrazabilidad({ epsIds: [epsId], ...filtrosEPS, tipoAnalisis: 'cartera' }),
          dashboardsEpsIpsAPI.getAnalisisFlujo({ epsIds: [epsId], ...filtrosEPS, tipoAnalisis: 'flujo' }),
          dashboardsEpsIpsAPI.getEPSAdresInfo(epsId)
        ]);

        const eps = epsDisponibles.find(e => e.id === epsId);
        
        return {
          id: epsId,
          nombre: eps?.nombre || 'EPS Sin Nombre',
          valorTotalUPC: adresData?.reduce((sum: number, item: any) => sum + (item.upc || 0), 0) || 0,
          incrementoPromedio: flujoData?.incrementoPromedio || 0,
          tiposContrato: [...new Set(flujoData?.tiposContrato || [])],
          valorFacturado: flujoData?.totalFacturado || 0,
          reconocido: flujoData?.totalReconocido || 0,
          pagado: flujoData?.totalPagado || 0,
          saldoAdeudado: (flujoData?.totalFacturado || 0) - (flujoData?.totalPagado || 0),
          cumplimientoPagos: flujoData?.cumplimientoPromedio || 0,
          participacionMercado: 0 // Se calculará después
        } as EPSData;
      });

      const resultados = await Promise.all(promesasEPS);
      
      // Calcular participación de mercado
      const totalFacturado = resultados.reduce((sum, eps) => sum + eps.valorFacturado, 0);
      resultados.forEach(eps => {
        eps.participacionMercado = totalFacturado > 0 ? (eps.valorFacturado / totalFacturado) * 100 : 0;
      });

      setDatosEPS(resultados);
    } catch (error) {
      console.error('❌ Error loading EPS data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Datos filtrados
  const datosEPSFiltrados = useMemo(() => {
    return datosEPS.filter(eps => {
      return (
        eps.valorTotalUPC >= filtrosEPS.valorUPCMin &&
        eps.valorTotalUPC <= filtrosEPS.valorUPCMax &&
        eps.incrementoPromedio >= filtrosEPS.incrementoMin &&
        eps.incrementoPromedio <= filtrosEPS.incrementoMax &&
        eps.cumplimientoPagos >= filtrosEPS.cumplimientoMin &&
        eps.cumplimientoPagos <= filtrosEPS.cumplimientoMax &&
        (filtrosEPS.tiposContrato.length === 0 || 
         eps.tiposContrato.some(tipo => filtrosEPS.tiposContrato.includes(tipo)))
      );
    });
  }, [datosEPS, filtrosEPS]);

  // Métricas comparativas
  const metricasComparativas = useMemo(() => {
    if (datosEPSFiltrados.length === 0) return null;

    const totales = datosEPSFiltrados.reduce((acc, eps) => ({
      valorTotalUPC: acc.valorTotalUPC + eps.valorTotalUPC,
      valorFacturado: acc.valorFacturado + eps.valorFacturado,
      reconocido: acc.reconocido + eps.reconocido,
      pagado: acc.pagado + eps.pagado,
      saldoAdeudado: acc.saldoAdeudado + eps.saldoAdeudado
    }), {
      valorTotalUPC: 0,
      valorFacturado: 0,
      reconocido: 0,
      pagado: 0,
      saldoAdeudado: 0
    });

    const promedios = {
      incrementoPromedio: datosEPSFiltrados.reduce((sum, eps) => sum + eps.incrementoPromedio, 0) / datosEPSFiltrados.length,
      cumplimientoPromedio: datosEPSFiltrados.reduce((sum, eps) => sum + eps.cumplimientoPagos, 0) / datosEPSFiltrados.length
    };

    return { totales, promedios };
  }, [datosEPSFiltrados]);

  // Datos para gráficos comparativos
  const datosComparacionBarras = datosEPSFiltrados.map(eps => ({
    nombre: eps.nombre.length > 10 ? eps.nombre.substring(0, 10) + '...' : eps.nombre,
    nombreCompleto: eps.nombre,
    facturado: eps.valorFacturado,
    reconocido: eps.reconocido,
    pagado: eps.pagado,
    cumplimiento: eps.cumplimientoPagos,
    participacion: eps.participacionMercado
  }));

  // Datos para radar comparativo
  const datosRadar = datosEPSFiltrados.map(eps => ({
    nombre: eps.nombre,
    upc: (eps.valorTotalUPC / 1000000), // En millones
    facturado: (eps.valorFacturado / 1000000),
    cumplimiento: eps.cumplimientoPagos,
    participacion: eps.participacionMercado,
    incremento: eps.incrementoPromedio
  }));

  // Colores para gráficos
  const coloresEPS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // Manejadores de eventos
  const handleToggleEPS = (epsId: string) => {
    setFiltrosEPS(prev => ({
      ...prev,
      epsSeleccionadas: prev.epsSeleccionadas.includes(epsId)
        ? prev.epsSeleccionadas.filter(id => id !== epsId)
        : [...prev.epsSeleccionadas, epsId]
    }));
  };

  const handleResetFiltros = () => {
    setFiltrosEPS({
      epsSeleccionadas: [],
      periodoIds: [],
      valorUPCMin: 0,
      valorUPCMax: 100000000,
      incrementoMin: 0,
      incrementoMax: 100,
      tiposContrato: [],
      cumplimientoMin: 0,
      cumplimientoMax: 100
    });
  };

  // Estados de carga
  if (loadingData || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando reporte ejecutivo EPS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <BuildingLibraryIcon className="w-8 h-8 mr-3" />
              Reporte Ejecutivo EPS
            </h1>
            <p className="text-blue-100">
              Análisis comparativo y detallado de entidades promotoras de salud
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${mostrarFiltros ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400 text-white'}
              `}
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            <button
              onClick={() => setTipoVisualizacion(tipoVisualizacion === 'individual' ? 'comparativa' : 'individual')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>{tipoVisualizacion === 'individual' ? 'Vista Comparativa' : 'Vista Individual'}</span>
            </button>

            <button
              onClick={loadEPSData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtros Colapsible */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros y Selección</h3>
                <button
                  onClick={handleResetFiltros}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Selección de EPS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seleccionar EPS ({filtrosEPS.epsSeleccionadas.length} seleccionadas)
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {epsDisponibles.map((eps) => (
                      <label key={eps.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={filtrosEPS.epsSeleccionadas.includes(eps.id)}
                          onChange={() => handleToggleEPS(eps.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{eps.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtros de Valores */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango UPC (millones)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={filtrosEPS.valorUPCMin / 1000000}
                        onChange={(e) => setFiltrosEPS(prev => ({
                          ...prev,
                          valorUPCMin: parseFloat(e.target.value) * 1000000 || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={filtrosEPS.valorUPCMax / 1000000}
                        onChange={(e) => setFiltrosEPS(prev => ({
                          ...prev,
                          valorUPCMax: parseFloat(e.target.value) * 1000000 || 100000000
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incremento % (rango)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Mín %"
                        value={filtrosEPS.incrementoMin}
                        onChange={(e) => setFiltrosEPS(prev => ({
                          ...prev,
                          incrementoMin: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Máx %"
                        value={filtrosEPS.incrementoMax}
                        onChange={(e) => setFiltrosEPS(prev => ({
                          ...prev,
                          incrementoMax: parseFloat(e.target.value) || 100
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros adicionales */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cumplimiento de Pagos %
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Mín %"
                        value={filtrosEPS.cumplimientoMin}
                        onChange={(e) => setFiltrosEPS(prev => ({
                          ...prev,
                          cumplimientoMin: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Máx %"
                        value={filtrosEPS.cumplimientoMax}
                        onChange={(e) => setFiltrosEPS(prev => ({
                          ...prev,
                          cumplimientoMax: parseFloat(e.target.value) || 100
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Períodos
                    </label>
                    <select
                      multiple
                      value={filtrosEPS.periodoIds}
                      onChange={(e) => {
                        const valores = Array.from(e.target.selectedOptions, option => option.value);
                        setFiltrosEPS(prev => ({ ...prev, periodoIds: valores }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20"
                    >
                      {periodosDisponibles.map((periodo) => (
                        <option key={periodo.id} value={periodo.id}>
                          {periodo.nombre} {periodo.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Métricas Resumen */}
      {metricasComparativas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total UPC</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metricasComparativas.totales.valorTotalUPC)}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metricasComparativas.totales.valorFacturado)}
                </p>
              </div>
              <DocumentChartBarIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pagado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metricasComparativas.totales.pagado)}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cumplimiento Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(metricasComparativas.promedios.cumplimientoPromedio)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal basado en tipo de visualización */}
      {tipoVisualizacion === 'individual' ? (
        // Vista Individual - Tabla detallada
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Datos Detallados por EPS
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EPS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor UPC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incremento %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Facturado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reconocido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Adeudado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cumplimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {datosEPSFiltrados.map((eps, index) => (
                    <tr key={eps.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: coloresEPS[index % coloresEPS.length] }}
                          />
                          <div className="text-sm font-medium text-gray-900">
                            {eps.nombre}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(eps.valorTotalUPC)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          eps.incrementoPromedio > 5 ? 'bg-red-100 text-red-800' : 
                          eps.incrementoPromedio > 2 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {formatPercentage(eps.incrementoPromedio)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(eps.valorFacturado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(eps.reconocido)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(eps.pagado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-medium ${eps.saldoAdeudado > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(eps.saldoAdeudado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  eps.cumplimientoPagos >= 90 ? 'bg-green-500' :
                                  eps.cumplimientoPagos >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(eps.cumplimientoPagos, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-2 text-xs font-medium">
                            {formatPercentage(eps.cumplimientoPagos)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // Vista Comparativa - Gráficos
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras Comparativo */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comparación Facturado vs Pagado
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosComparacionBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      formatCurrency(value), 
                      name === 'facturado' ? 'Facturado' : 
                      name === 'reconocido' ? 'Reconocido' : 'Pagado'
                    ]}
                    labelFormatter={(label) => {
                      const eps = datosComparacionBarras.find(d => d.nombre === label);
                      return eps?.nombreCompleto || label;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="facturado" fill="#3B82F6" name="Facturado" />
                  <Bar dataKey="reconocido" fill="#10B981" name="Reconocido" />
                  <Bar dataKey="pagado" fill="#F59E0B" name="Pagado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Cumplimiento */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cumplimiento de Pagos por EPS
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosComparacionBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Cumplimiento']}
                    labelFormatter={(label) => {
                      const eps = datosComparacionBarras.find(d => d.nombre === label);
                      return eps?.nombreCompleto || label;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumplimiento" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    name="Cumplimiento %"
                  />
                  {/* Línea de referencia del 90% */}
                  <Line 
                    type="monotone" 
                    dataKey={() => 90} 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    dot={false}
                    name="Meta 90%"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Radar Comparativo */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Análisis Multidimensional
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { subject: 'UPC (M)', ...datosRadar.reduce((acc, eps, i) => ({...acc, [eps.nombre]: eps.upc}), {}) },
                  { subject: 'Facturado (M)', ...datosRadar.reduce((acc, eps, i) => ({...acc, [eps.nombre]: eps.facturado}), {}) },
                  { subject: 'Cumplimiento', ...datosRadar.reduce((acc, eps, i) => ({...acc, [eps.nombre]: eps.cumplimiento}), {}) },
                  { subject: 'Participación', ...datosRadar.reduce((acc, eps, i) => ({...acc, [eps.nombre]: eps.participacion}), {}) },
                  { subject: 'Incremento', ...datosRadar.reduce((acc, eps, i) => ({...acc, [eps.nombre]: eps.incremento}), {}) }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {datosRadar.slice(0, 5).map((eps, index) => (
                    <Radar
                      key={eps.nombre}
                      name={eps.nombre}
                      dataKey={eps.nombre}
                      stroke={coloresEPS[index]}
                      fill={coloresEPS[index]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Participación de Mercado */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Participación de Mercado
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosComparacionBarras}
                    dataKey="participacion"
                    nameKey="nombreCompleto"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                  >
                    {datosComparacionBarras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coloresEPS[index % coloresEPS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Participación']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Alertas y Recomendaciones */}
      {datosEPSFiltrados.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas y Recomendaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datosEPSFiltrados.map((eps) => {
              const alertas: { tipo: 'error' | 'warning' | 'success'; mensaje: string }[] = [];
              
              if (eps.cumplimientoPagos < 70) {
                alertas.push({
                  tipo: 'error',
                  mensaje: `Cumplimiento crítico: ${eps.cumplimientoPagos.toFixed(1)}%`
                });
              }
              
              if (eps.saldoAdeudado > eps.valorFacturado * 0.3) {
                alertas.push({
                  tipo: 'warning',
                  mensaje: `Alto saldo adeudado: ${formatCurrency(eps.saldoAdeudado)}`
                });
              }
              
              if (eps.incrementoPromedio > 5) {
                alertas.push({
                  tipo: 'warning',
                  mensaje: `Incremento elevado: ${eps.incrementoPromedio.toFixed(1)}%`
                });
              }

              if (alertas.length === 0) {
                alertas.push({
                  tipo: 'success',
                  mensaje: 'Todos los indicadores en rangos normales'
                });
              }

              return (
                <div key={eps.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{eps.nombre}</h4>
                  <div className="space-y-2">
                    {alertas.map((alerta, index) => (
                      <div 
                        key={index}
                        className={`flex items-start space-x-2 text-sm ${
                          alerta.tipo === 'error' ? 'text-red-600' :
                          alerta.tipo === 'warning' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}
                      >
                        {alerta.tipo === 'error' ? (
                          <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : alerta.tipo === 'warning' ? (
                          <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{alerta.mensaje}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado sin datos */}
      {datosEPSFiltrados.length === 0 && !loadingData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay datos para mostrar
          </h3>
          <p className="text-gray-600 mb-4">
            Selecciona al menos una EPS y ajusta los filtros para ver los datos.
          </p>
          <button
            onClick={() => setMostrarFiltros(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Abrir Filtros</span>
          </button>
        </div>
      )}
    </div>
  );
};