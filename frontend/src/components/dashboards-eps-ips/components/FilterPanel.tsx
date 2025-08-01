// frontend/src/components/dashboards-eps-ips/components/FilterPanel.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  UsersIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import carteraAPI from '../../../services/carteraApi';

interface FilterPanelProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const [epsList, setEpsList] = useState<any[]>([]);
  const [ipsList, setIpsList] = useState<any[]>([]);
  const [periodosList, setPeriodosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setLoading(true);
    try {
      const [epsResponse, ipsResponse, periodosResponse] = await Promise.all([
        carteraAPI.getAllEPS(),
        carteraAPI.getAllIPS(),
        carteraAPI.getAllPeriodos()
      ]);

      setEpsList(epsResponse.data.filter((eps: any) => eps.activa));
      setIpsList(ipsResponse.data.filter((ips: any) => ips.activa));
      setPeriodosList(periodosResponse.data.filter((periodo: any) => periodo.activo)
        .sort((a: any, b: any) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.mes - a.mes;
        }));
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      tipoAnalisis: 'ambos'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const filterSections = [
    {
      id: 'tipo',
      title: 'Tipo de Análisis',
      icon: FunnelIcon,
      content: (
        <div className="space-y-3">
          {[
            { value: 'cartera', label: 'Solo Cartera', color: 'bg-orange-100 text-orange-800' },
            { value: 'flujo', label: 'Solo Flujo', color: 'bg-blue-100 text-blue-800' },
            { value: 'ambos', label: 'Cartera y Flujo', color: 'bg-purple-100 text-purple-800' }
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="tipoAnalisis"
                value={option.value}
                checked={localFilters.tipoAnalisis === option.value}
                onChange={(e) => handleLocalFilterChange('tipoAnalisis', e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${option.color}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )
    },
    {
      id: 'eps',
      title: 'Entidades Promotoras de Salud',
      icon: BuildingLibraryIcon,
      content: (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => handleLocalFilterChange('epsIds', epsList.map(eps => eps.id))}
              className="text-xs text-primary-600 hover:text-primary-800"
            >
              Seleccionar Todas
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleLocalFilterChange('epsIds', [])}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
          </div>
          {epsList.map((eps) => (
            <label key={eps.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={localFilters.epsIds?.includes(eps.id) || false}
                onChange={(e) => {
                  const currentIds = localFilters.epsIds || [];
                  const newIds = e.target.checked
                    ? [...currentIds, eps.id]
                    : currentIds.filter((id: string) => id !== eps.id);
                  handleLocalFilterChange('epsIds', newIds);
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{eps.nombre}</div>
                <div className="text-xs text-gray-500">{eps.codigo}</div>
              </div>
            </label>
          ))}
        </div>
      )
    },
    {
      id: 'ips',
      title: 'Instituciones Prestadoras de Servicios',
      icon: UsersIcon,
      content: (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => handleLocalFilterChange('ipsIds', ipsList.map(ips => ips.id))}
              className="text-xs text-primary-600 hover:text-primary-800"
            >
              Seleccionar Todas
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleLocalFilterChange('ipsIds', [])}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
          </div>
          {ipsList.map((ips) => (
            <label key={ips.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={localFilters.ipsIds?.includes(ips.id) || false}
                onChange={(e) => {
                  const currentIds = localFilters.ipsIds || [];
                  const newIds = e.target.checked
                    ? [...currentIds, ips.id]
                    : currentIds.filter((id: string) => id !== ips.id);
                  handleLocalFilterChange('ipsIds', newIds);
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{ips.nombre}</div>
                <div className="text-xs text-gray-500">{ips.codigo}</div>
              </div>
            </label>
          ))}
        </div>
      )
    },
    {
      id: 'periodos',
      title: 'Períodos',
      icon: CalendarDaysIcon,
      content: (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => handleLocalFilterChange('periodoIds', periodosList.slice(0, 6).map(p => p.id))}
              className="text-xs text-primary-600 hover:text-primary-800"
            >
              Últimos 6 meses
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleLocalFilterChange('periodoIds', [])}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
          </div>
          {periodosList.map((periodo) => (
            <label key={periodo.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={localFilters.periodoIds?.includes(periodo.id) || false}
                onChange={(e) => {
                  const currentIds = localFilters.periodoIds || [];
                  const newIds = e.target.checked
                    ? [...currentIds, periodo.id]
                    : currentIds.filter((id: string) => id !== periodo.id);
                  handleLocalFilterChange('periodoIds', newIds);
                }}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {periodo.nombre} {periodo.year}
                </div>
                <div className="text-xs text-gray-500">
                  {periodo.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </label>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <ArrowPathIcon className="w-6 h-6 text-primary-600 animate-spin mr-3" />
            <span className="text-gray-600">Cargando opciones de filtro...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filterSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <section.icon className="w-5 h-5 text-primary-600" />
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                </div>
                {section.content}
              </motion.div>
            ))}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetFilters}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Resetear</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyFilters}
              className="btn-primary"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};