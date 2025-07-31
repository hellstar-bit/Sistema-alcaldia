// frontend/src/components/adres/InformacionAdres.tsx - ARCHIVO COMPLETO CON INDICADORES VISUALES CORREGIDOS

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ExcelUploadModal } from './ExcelUploadModal';
import { adresAPI, adresUtils, EPS, Periodo, AdresData, EPSPeriodoStatus } from '../../services/adresApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';

const MESES_ANIO = [
  { numero: 1, abrev: 'ENE', nombre: 'Enero' },
  { numero: 2, abrev: 'FEB', nombre: 'Febrero' },
  { numero: 3, abrev: 'MAR', nombre: 'Marzo' },
  { numero: 4, abrev: 'ABR', nombre: 'Abril' },
  { numero: 5, abrev: 'MAY', nombre: 'Mayo' },
  { numero: 6, abrev: 'JUN', nombre: 'Junio' },
  { numero: 7, abrev: 'JUL', nombre: 'Julio' },
  { numero: 8, abrev: 'AGO', nombre: 'Agosto' },
  { numero: 9, abrev: 'SEP', nombre: 'Septiembre' },
  { numero: 10, abrev: 'OCT', nombre: 'Octubre' },
  { numero: 11, abrev: 'NOV', nombre: 'Noviembre' },
  { numero: 12, abrev: 'DIC', nombre: 'Diciembre' }
];

export const InformacionAdres: React.FC = () => {
  // Estados principales
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [periodosList, setPeriodosList] = useState<Periodo[]>([]);
  const [selectedEPS, setSelectedEPS] = useState<EPS | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [adresData, setAdresData] = useState<AdresData[]>([]);
  const [epsPeriodoStatus, setEpsPeriodoStatus] = useState<EPSPeriodoStatus[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { showSuccess, showError, showConfirmation, showLoading, close } = useSweetAlert();

  // ✅ FUNCIÓN CLAVE: getGridCellStatus - igual que en cartera y flujo
  const getGridCellStatus = (eps: EPS, periodo: Periodo) => {
  // 🔍 DEBUG TEMPORAL - AGREGA ESTAS LÍNEAS
  console.log('🔍 DEBUG COMPLETO getGridCellStatus:', {
    eps: {
      id: eps.id,
      nombre: eps.nombre
    },
    periodo: {
      id: periodo.id,
      nombre: periodo.nombre,
      year: periodo.year,
      mes: periodo.mes
    },
    epsPeriodoStatusTotal: epsPeriodoStatus.length,
    epsPeriodoStatusSample: epsPeriodoStatus.slice(0, 3),
    searchingFor: {
      epsId: eps.id,
      periodoId: periodo.id
    }
  });

  // 🔍 VERIFICAR CADA ITEM DEL ESTADO
  epsPeriodoStatus.forEach((item, index) => {
    console.log(`🔍 Status item ${index}:`, {
      epsId: item.epsId,
      periodoId: item.periodoId,
      tieneData: item.tieneData,
      totalRegistros: item.totalRegistros,
      epsMatch: item.epsId === eps.id,
      periodoMatch: item.periodoId === periodo.id,
      bothMatch: item.epsId === eps.id && item.periodoId === periodo.id
    });
  });

  const statusData = epsPeriodoStatus.find(
    item => item.epsId === eps.id && item.periodoId === periodo.id
  );
  
  console.log(`🔍 DEBUG ADRES: getGridCellStatus for ${eps.nombre} - ${periodo.nombre}:`, {
    epsId: eps.id,
    periodoId: periodo.id,
    statusData,
    tieneData: statusData?.tieneData || false,
    totalEpsPeriodoStatus: epsPeriodoStatus.length
  });
  
  return {
    tieneData: statusData?.tieneData || false,
    totalRegistros: statusData?.totalRegistros || 0
  };
};

  // ✅ FUNCIONES AUXILIARES - igual que cartera
  const getAvailablePeriodsForEPS = (epsId: string) => {
    return periodosList.filter(periodo => {
      const status = getGridCellStatus({ id: epsId } as EPS, periodo);
      return status.tieneData;
    });
  };

  const handlePeriodoSelect = (periodo: Periodo) => {
    setSelectedPeriodo(periodo);
    if (selectedEPS) {
      handleCellClick(selectedEPS, periodo);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      
      // Cargar EPS, Períodos y Estado en paralelo - igual que cartera
      const [epsResponse, periodosResponse, statusResponse] = await Promise.all([
        adresAPI.getAllEPS(),
        adresAPI.getAllPeriodos(),
        adresAPI.getEPSPeriodoStatus()
      ]);

      // Verificar respuestas y inicializar arrays vacíos si fallan
      if (epsResponse.success && Array.isArray(epsResponse.data)) {
        setEpsList(epsResponse.data);
        console.log('✅ ADRES: EPS cargadas:', epsResponse.data.length);
      } else {
        console.warn('❌ ADRES: EPS response failed or invalid:', epsResponse);
        setEpsList([]);
        showError({ title: 'Error', text: 'No se pudieron cargar las EPS' });
      }

      if (periodosResponse.success && Array.isArray(periodosResponse.data)) {
        setPeriodosList(periodosResponse.data);
        console.log('✅ ADRES: Períodos cargados:', periodosResponse.data.length);
      } else {
        console.warn('❌ ADRES: Períodos response failed or invalid:', periodosResponse);
        setPeriodosList([]);
        showError({ title: 'Error', text: 'No se pudieron cargar los períodos' });
      }

      if (statusResponse.success && Array.isArray(statusResponse.data)) {
        setEpsPeriodoStatus(statusResponse.data);
        console.log('✅ ADRES: EPS Período Status cargado:', statusResponse.data.length, 'registros');
        
        // Debug: mostrar estructura de los primeros registros
        if (statusResponse.data.length > 0) {
          console.log('🔍 ADRES: Sample status data:', statusResponse.data.slice(0, 3));
        }
      } else {
        console.warn('❌ ADRES: Status response failed or invalid:', statusResponse);
        setEpsPeriodoStatus([]);
      }

    } catch (error) {
      console.error('❌ ADRES: Error in loadInitialData:', error);
      showError({ title: 'Error', text: 'No se pudieron cargar los datos iniciales' });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCellClick = async (eps: EPS, periodo: Periodo) => {
    console.log('🔍 ADRES: handleCellClick called:', { epsId: eps.id, periodoId: periodo.id });
    
    setSelectedEPS(eps);
    setSelectedPeriodo(periodo);
    
    try {
      setLoading(true);
      const res = await adresAPI.getAdresData({ epsId: eps.id, periodoId: periodo.id });
      
      console.log('🔍 ADRES: API Response:', {
        success: res.success,
        dataStructure: res.data ? Object.keys(res.data) : 'No data object',
        dataArray: res.data?.data ? res.data.data.length : 'No data array'
      });
      
      const data = res.data?.data || [];
      
      if (data.length > 0) {
        console.log('🔍 ADRES: First record sample:', {
          id: data[0].id,
          upc: data[0].upc,
          valorGirado: data[0].valorGirado,
          eps: data[0].eps?.nombre,
          periodo: data[0].periodo?.nombre
        });
      }
      
      setAdresData(data);
    } catch (error) {
      console.error('❌ ADRES: Error loading data:', error);
      showError({ title: 'Error', text: 'No se pudieron cargar los datos de ADRES' });
      setAdresData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByPeriodo = async (epsId: string, periodoId: string) => {
    const confirmed = await showConfirmation({
      title: '¿Eliminar datos?',
      text: 'Se eliminarán todos los registros para esta EPS y período. ¿Continuar?'
    });
    if (!confirmed.value) return;

    try {
      const res = await adresAPI.deleteAdresDataByPeriodo(epsId, periodoId);
      if (res.success) {
        const deletedCount = res.data?.deletedCount ?? 0;
        showSuccess({ title: 'Datos eliminados', text: `Se eliminaron ${deletedCount} registros` });
        loadInitialData(); // Recargar datos
        
        // Si estamos viendo estos datos, limpiar la selección
        if (selectedEPS?.id === epsId && selectedPeriodo?.id === periodoId) {
          setSelectedEPS(null);
          setSelectedPeriodo(null);
          setAdresData([]);
        }
      } else {
        showError({ title: 'Error', text: res.message || 'Error al eliminar datos' });
      }
    } catch (error) {
      console.error('❌ ADRES: Error deleting data:', error);
      showError({ title: 'Error', text: 'No se pudieron eliminar los datos' });
    }
  };

  const handleExport = async () => {
    try {
      showLoading('Generando exportación...', 'Preparando archivo Excel');
      const blob = await adresAPI.exportToExcel({
        epsId: selectedEPS?.id,
        periodoId: selectedPeriodo?.id
      });
      const filename = adresUtils.generateFileName(
        'ADRES_Export', 
        selectedEPS?.nombre, 
        selectedPeriodo ? `${selectedPeriodo.nombre} ${selectedPeriodo.year}` : undefined
      );
      adresUtils.downloadBlob(blob, filename);
      close();
      showSuccess({ 
        title: '¡Exportación completada!', 
        text: 'El archivo se ha descargado correctamente' 
      });
    } catch (error: any) {
      close();
      console.error('❌ ADRES: Export error:', error);
      showError({ 
        title: 'Error al exportar', 
        text: 'No se pudo generar el archivo de exportación' 
      });
    }
  };

  // ✅ DATOS CALCULADOS PARA PAGINACIÓN
  const filteredAdresData = (adresData || []).filter(item =>
    item?.eps?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.eps?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredAdresData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAdresData.length / itemsPerPage);

  // Cargar datos cuando se selecciona EPS y período
  useEffect(() => {
    if (selectedEPS && selectedPeriodo) {
      // Solo recargar si no tenemos datos o si cambió la selección
      if (adresData.length === 0) {
        handleCellClick(selectedEPS, selectedPeriodo);
      }
    } else {
      setAdresData([]);
    }
  }, [selectedEPS, selectedPeriodo]);

  // ✅ LOADING INICIAL - igual que cartera
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando sistema de ADRES...</p>
          <p className="text-gray-500 text-sm mt-2">Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  // Debug log del estado actual
  console.log('🔍 DEBUG ADRES: Render state:', {
    epsListLength: epsList.length,
    periodosListLength: periodosList.length,
    epsPeriodoStatusLength: epsPeriodoStatus.length,
    selectedYear,
    selectedEPS: selectedEPS?.nombre,
    selectedPeriodo: selectedPeriodo?.nombre,
    adresDataLength: adresData.length
  });

  return (
    <div className="space-y-6">
      {/* ✅ HEADER ELEGANTE - mismos colores que cartera y flujo pero con color púrpura para ADRES */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden" style={{
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <ChartBarIcon className="w-8 h-8 text-primary-300" />

              <h1 className="text-2xl lg:text-3xl font-bold">Información ADRES</h1>
            </div>
            <p className="text-primary-100 text-lg">
              Sistema de gestión y análisis de datos ADRES por EPS
            </p>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => loadInitialData()}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            
            <button
              onClick={handleExport}
              disabled={!selectedEPS || !selectedPeriodo}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* ✅ TABLA PRINCIPAL DE CONTROL DE CARGA - EXACTAMENTE IGUAL QUE CARTERA Y FLUJO */}
      <div className="bg-white rounded-xl overflow-hidden" style={{
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <TableCellsIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-900">Control de Carga {selectedYear}</h2>
                <p className="text-gray-600 text-sm">Estado de información por EPS y período</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Selector de año */}
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* ✅ LEYENDA VISUAL - igual que cartera y flujo */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Con datos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Sin datos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ TABLA DE CONTROL - CON INDICADORES VISUALES CORREGIDOS */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  EPS
                </th>
                {MESES_ANIO.map((mes) => (
                  <th key={mes.numero} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{mes.abrev}</span>
                      <span className="text-xs">{mes.numero}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {epsList.map((eps) => (
                <tr key={eps.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${eps.activa ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <div>
                        <div className="font-medium">{eps.nombre}</div>
                        <div className="text-xs text-gray-500">{eps.codigo}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* ✅ CELDAS CON INDICADORES VISUALES - EXACTAMENTE IGUAL QUE CARTERA */}
                  {MESES_ANIO.map((mes) => {
                    const periodo = periodosList.find(p => p.mes === mes.numero && p.year === selectedYear);
                    const status = periodo ? getGridCellStatus(eps, periodo) : { tieneData: false, totalRegistros: 0 };
                    const isSelected = selectedEPS?.id === eps.id && selectedPeriodo?.id === periodo?.id;
                    
                    return (
                      <td key={mes.numero} className="px-3 py-4 text-center">
                        <button
                          onClick={() => {
                            if (periodo) {
                              handleCellClick(eps, periodo);
                            }
                          }}
                          disabled={!periodo}
                          className={`w-full h-12 rounded-lg border-2 transition-all duration-200 relative group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-100'
                              : status.tieneData
                              ? 'border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                          } ${!periodo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {status.tieneData ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mb-1" />
                              <span className="text-xs font-medium text-green-800">
                                {status.totalRegistros}
                              </span>
                            </div>
                          ) : periodo ? (
                            <div className="flex items-center justify-center h-full">
                              <XCircleIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-300 text-xs">N/A</span>
                            </div>
                          )}
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {status.tieneData 
                              ? `${status.totalRegistros} registros - ${mes.nombre} ${selectedYear}`
                              : `Sin datos - ${mes.nombre} ${selectedYear}`
                            }
                          </div>
                        </button>
                      </td>
                    );
                  })}

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                      
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                        <div className="py-2">
                          {MESES_ANIO.map((mes) => {
                            const periodo = periodosList.find(p => p.mes === mes.numero && p.year === selectedYear);
                            const status = periodo ? getGridCellStatus(eps, periodo) : undefined;
                            const hasData = status?.tieneData || false;
                            
                            if (!hasData || !periodo) return null;
                            
                            return (
                              <button
                                key={mes.numero}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteByPeriodo(eps.id, periodo.id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center justify-between"
                              >
                                <span>{mes.nombre} {selectedYear}</span>
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ SECCIÓN INFERIOR: PERÍODOS Y DATOS DE ADRES */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Panel de Períodos Disponibles */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl p-6 h-full" style={{
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-900">Períodos</h3>
                <p className="text-gray-600 text-sm">
                  {selectedEPS ? `Datos para ${selectedEPS.nombre}` : 'Selecciona una EPS'}
                </p>
              </div>
            </div>

            {selectedEPS ? (
              <div className="space-y-2">
                {getAvailablePeriodsForEPS(selectedEPS.id).map((periodo, index) => (
                  <button
                    key={periodo.id}
                    onClick={() => handlePeriodoSelect(periodo)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      selectedPeriodo?.id === periodo.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{index + 1}</span>
                        <span className="ml-3 font-medium">{periodo.nombre} {periodo.year}</span>
                      </div>
                      <CalendarDaysIcon className={`w-4 h-4 ${
                        selectedPeriodo?.id === periodo.id ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>
                ))}
                
                {getAvailablePeriodsForEPS(selectedEPS.id).length === 0 && (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No hay períodos con datos para esta EPS</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Selecciona una EPS para ver los períodos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Datos de ADRES */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl overflow-hidden" style={{
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">Datos ADRES</h3>
                    <p className="text-gray-600 text-sm">
                      {selectedEPS && selectedPeriodo 
                        ? `${selectedEPS.nombre} - ${selectedPeriodo.nombre} ${selectedPeriodo.year}`
                        : 'Selecciona EPS y período para ver datos'}
                    </p>
                  </div>
                </div>

                {selectedEPS && selectedPeriodo && (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Filtros</span>
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <DocumentArrowUpIcon className="w-4 h-4" />
                      <span>Importar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido Principal de la Tabla */}
            {selectedEPS && selectedPeriodo ? (
              <>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos de ADRES...</p>
                  </div>
                ) : (
                  <>
                    {/* Tabla de ADRES */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-primary-900 to-primary-800">
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider rounded-l-lg min-w-60">
                              <div className="flex items-center space-x-2">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>EPS</span>
                              </div>
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-medium text-white uppercase tracking-wider min-w-32">
                              <div className="flex items-center justify-end space-x-2">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                <span>UPC</span>
                              </div>
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-medium text-white uppercase tracking-wider min-w-32">
                              <span>Valor Girado</span>
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-medium text-white uppercase tracking-wider min-w-32">
                              <span>Pagos</span>
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-medium text-white uppercase tracking-wider min-w-32">
                              <span>Cumplimiento</span>
                            </th>
                            <th className="px-3 py-4 text-left text-xs font-medium text-white uppercase tracking-wider rounded-r-lg min-w-40">
                              <span>Observaciones</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                              <tr key={item.id || index} className="hover:bg-blue-50 transition-colors duration-150">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.eps?.nombre || 'N/A'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {item.eps?.codigo || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                  {adresUtils.formatCurrency(item.upc)}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                  {adresUtils.formatCurrency(item.valorGirado)}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                  {adresUtils.formatCurrency(item.pagos || 0)}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    (item.cumplimientoPagos || 0) >= 90 
                                      ? 'bg-green-100 text-green-800' 
                                      : (item.cumplimientoPagos || 0) >= 70 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.cumplimientoPagos ? `${item.cumplimientoPagos}%` : '0%'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-900 max-w-xs">
                                  <div className="truncate" title={item.observaciones || ''}>
                                    {item.observaciones || '-'}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center">
                                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No hay datos de ADRES para este período</p>
                                <button
                                  onClick={() => setShowUploadModal(true)}
                                 className="mt-3 inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"> text-sm font-medium"
                                  <CloudArrowUpIcon className="w-4 h-4" />
                                  <span>Cargar datos</span>
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 flex justify-between sm:hidden">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Anterior
                            </button>
                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Siguiente
                            </button>
                          </div>
                          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                                <span className="font-medium">
                                  {Math.min(currentPage * itemsPerPage, filteredAdresData.length)}
                                </span> de{' '}
                                <span className="font-medium">{filteredAdresData.length}</span> resultados
                              </p>
                            </div>
                            <div>
                              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                  disabled={currentPage === 1}
                                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Anterior
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  const page = i + 1;
                                  return (
                                    <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        currentPage === page
                                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                  disabled={currentPage === totalPages}
                                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Siguiente
                                </button>
                              </nav>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resumen de datos */}
                    {filteredAdresData.length > 0 && (
                      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-t border-primary-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-900">
                              {filteredAdresData.length}
                            </div>
                            <div className="text-xs text-gray-600">Total Registros</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-900">
                              {adresUtils.formatCurrency(
                                filteredAdresData.reduce((sum, item) => sum + (item.upc || 0), 0)
                              )}
                            </div>
                            <div className="text-xs text-gray-600">Total UPC</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-900">
                              {adresUtils.formatCurrency(
                                filteredAdresData.reduce((sum, item) => sum + (item.valorGirado || 0), 0)
                              )}
                            </div>
                            <div className="text-xs text-gray-600">Total Valor Girado</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-900">
                              {adresUtils.formatCurrency(
                                filteredAdresData.reduce((sum, item) => sum + (item.pagos || 0), 0)
                              )}
                            </div>
                            <div className="text-xs text-gray-600">Total Pagos</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Selecciona una EPS y período para ver los datos de ADRES</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      {showUploadModal && (
        <ExcelUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadInitialData();
            if (selectedEPS && selectedPeriodo) {
              handleCellClick(selectedEPS, selectedPeriodo);
            }
          }}
        />
      )}
    </div>
  );
};