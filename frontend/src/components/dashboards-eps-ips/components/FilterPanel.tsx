import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { dashboardsEpsIpsAPI } from '../services/dashboardsEpsIpsAPI';

interface FilterPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  loading?: boolean;
}

interface DashboardFilters {
  epsIds: string[];
  ipsIds: string[];
  periodoIds: string[];
  fechaInicio: string;
  fechaFin: string;
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos';
}

interface EPSOption {
  id: string;
  nombre: string;
  activo: boolean;
}

interface PeriodoOption {
  id: string;
  nombre: string;
  mes: number;
  year: number;
  activo: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [epsOptions, setEpsOptions] = useState<EPSOption[]>([]);
  const [periodoOptions, setPeriodoOptions] = useState<PeriodoOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Cargar opciones de EPS y períodos
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const [epsData, periodosData] = await Promise.all([
        dashboardsEpsIpsAPI.getEPSList(),
        dashboardsEpsIpsAPI.getPeriodos()
      ]);

      // Procesar EPS (incluir las EPS colombianas principales)
      const epsColombianasBase = [
        'NUEVA EPS', 'COMPENSAR', 'FAMISANAR', 'SANITAS', 'SURA',
        'COOSALUD', 'SALUD TOTAL', 'MUTUALSER'
      ];

      const epsProcessed = epsData && Array.isArray(epsData) ? epsData.map((eps: any) => ({
        id: eps.id || eps.nombre,
        nombre: eps.nombre,
        activo: eps.activo !== false
      })) : epsColombianasBase.map((nombre, index) => ({
        id: `eps-${index + 1}`,
        nombre,
        activo: true
      }));

      setEpsOptions(epsProcessed);

      // Procesar períodos (generar períodos para 2023, 2024, 2025)
      if (periodosData && Array.isArray(periodosData)) {
        setPeriodoOptions(periodosData);
      } else {
        // Generar períodos por defecto para los últimos 3 años
        const periodosGenerados: PeriodoOption[] = [];
        const currentYear = 2025;
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        for (let year = currentYear - 2; year <= currentYear; year++) {
          const maxMes = year === currentYear ? 8 : 12; // Solo hasta agosto 2025
          for (let mes = 1; mes <= maxMes; mes++) {
            periodosGenerados.push({
              id: `${year}-${mes.toString().padStart(2, '0')}`,
              nombre: `${meses[mes - 1]} ${year}`,
              mes,
              year,
              activo: true
            });
          }
        }

        setPeriodoOptions(periodosGenerados.reverse()); // Más recientes primero
      }

    } catch (error) {
      console.error('❌ Error loading filter options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Toggle EPS seleccionada
  const toggleEPS = (epsId: string) => {
    const newEpsIds = filters.epsIds.includes(epsId)
      ? filters.epsIds.filter(id => id !== epsId)
      : [...filters.epsIds, epsId];
    
    handleFilterChange('epsIds', newEpsIds);
  };

  // Toggle período seleccionado
  const togglePeriodo = (periodoId: string) => {
    const newPeriodoIds = filters.periodoIds.includes(periodoId)
      ? filters.periodoIds.filter(id => id !== periodoId)
      : [...filters.periodoIds, periodoId];
    
    handleFilterChange('periodoIds', newPeriodoIds);
  };

  // Seleccionar/deseleccionar todas las EPS
  const toggleAllEPS = () => {
    if (filters.epsIds.length === epsOptions.length) {
      handleFilterChange('epsIds', []);
    } else {
      handleFilterChange('epsIds', epsOptions.map(eps => eps.id));
    }
  };

  // Seleccionar últimos 6 meses
  const selectLast6Months = () => {
    const last6 = periodoOptions.slice(0, 6).map(p => p.id);
    handleFilterChange('periodoIds', last6);
  };

  // Limpiar filtros
  const clearFilters = () => {
    onFiltersChange({
      epsIds: [],
      ipsIds: [],
      periodoIds: [],
      fechaInicio: '',
      fechaFin: '',
      tipoAnalisis: 'ambos'
    });
  };

  // Filtros rápidos
  const aplicarFiltroRapido = (tipo: string) => {
    switch (tipo) {
      case 'top-eps':
        const topEPS = epsOptions.slice(0, 5).map(eps => eps.id);
        handleFilterChange('epsIds', topEPS);
        break;
      case 'ultimo-trimestre':
        const ultimoTrimestre = periodoOptions.slice(0, 3).map(p => p.id);
        handleFilterChange('periodoIds', ultimoTrimestre);
        break;
      case 'ultimo-semestre':
        selectLast6Months();
        break;
      case 'año-actual':
        const yearActual = periodoOptions.filter(p => p.year === 2025).map(p => p.id);
        handleFilterChange('periodoIds', yearActual);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header del panel */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Filtros de Análisis</h3>
          {(filters.epsIds.length > 0 || filters.periodoIds.length > 0) && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {filters.epsIds.length + filters.periodoIds.length} aplicados
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {(filters.epsIds.length > 0 || filters.periodoIds.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span>{isExpanded ? 'Ocultar' : 'Mostrar'} Filtros</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FunnelIcon className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Panel expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              
              {/* Filtros rápidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filtros Rápidos
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => aplicarFiltroRapido('top-eps')}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors"
                  >
                    Top 5 EPS
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido('ultimo-trimestre')}
                    className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors"
                  >
                    Último Trimestre
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido('ultimo-semestre')}
                    className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors"
                  >
                    Último Semestre
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido('año-actual')}
                    className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-md transition-colors"
                  >
                    Año 2025
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Selección de EPS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      <BuildingLibraryIcon className="w-4 h-4 inline mr-1" />
                      EPS Seleccionadas ({filters.epsIds.length}/{epsOptions.length})
                    </label>
                    <button
                      onClick={toggleAllEPS}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {filters.epsIds.length === epsOptions.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                    </button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingOptions ? (
                      <div className="p-4 text-center text-gray-500">
                        <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Cargando EPS...
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {epsOptions.map((eps) => (
                          <label
                            key={eps.id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={filters.epsIds.includes(eps.id)}
                                onChange={() => toggleEPS(eps.id)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                filters.epsIds.includes(eps.id)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}>
                                {filters.epsIds.includes(eps.id) && (
                                  <CheckIcon className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-900">{eps.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selección de Períodos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                      Períodos Seleccionados ({filters.periodoIds.length}/{periodoOptions.length})
                    </label>
                    <button
                      onClick={selectLast6Months}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Últimos 6 meses
                    </button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingOptions ? (
                      <div className="p-4 text-center text-gray-500">
                        <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Cargando períodos...
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {periodoOptions.map((periodo) => (
                          <label
                            key={periodo.id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={filters.periodoIds.includes(periodo.id)}
                                onChange={() => togglePeriodo(periodo.id)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                filters.periodoIds.includes(periodo.id)
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}>
                                {filters.periodoIds.includes(periodo.id) && (
                                  <CheckIcon className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-900">{periodo.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tipo de Análisis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Análisis
                </label>
                <div className="flex space-x-4">
                  {[
                    { value: 'cartera', label: 'Solo Cartera' },
                    { value: 'flujo', label: 'Solo Flujo' },
                    { value: 'ambos', label: 'Cartera y Flujo' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoAnalisis"
                        value={option.value}
                        checked={filters.tipoAnalisis === option.value}
                        onChange={(e) => handleFilterChange('tipoAnalisis', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Resumen de filtros aplicados */}
              {(filters.epsIds.length > 0 || filters.periodoIds.length > 0) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Filtros Aplicados:</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    {filters.epsIds.length > 0 && (
                      <p>• {filters.epsIds.length} EPS seleccionadas</p>
                    )}
                    {filters.periodoIds.length > 0 && (
                      <p>• {filters.periodoIds.length} períodos seleccionados</p>
                    )}
                    <p>• Análisis: {filters.tipoAnalisis === 'ambos' ? 'Cartera y Flujo' : 
                        filters.tipoAnalisis === 'cartera' ? 'Solo Cartera' : 'Solo Flujo'}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};