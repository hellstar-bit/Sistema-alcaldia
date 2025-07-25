// frontend/src/components/cartera/InformacionCartera.tsx - VERSIÓN COMPLETAMENTE CORREGIDA
import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/24/solid';
import { 
  carteraAPI, 
  carteraUtils,
  type EPS, 
  type Periodo, 
  type CarteraData, 
  type EPSPeriodoStatus 
} from '../../services/carteraApi';
import { ExcelUploadModal } from './ExcelUploadModal';
import { useSweetAlert } from '../../hooks/useSweetAlert';

const MESES_ANIO = [
  { numero: 1, nombre: 'ENERO', abrev: 'ENE' },
  { numero: 2, nombre: 'FEBRERO', abrev: 'FEB' },
  { numero: 3, nombre: 'MARZO', abrev: 'MAR' },
  { numero: 4, nombre: 'ABRIL', abrev: 'ABR' },
  { numero: 5, nombre: 'MAYO', abrev: 'MAY' },
  { numero: 6, nombre: 'JUNIO', abrev: 'JUN' },
  { numero: 7, nombre: 'JULIO', abrev: 'JUL' },
  { numero: 8, nombre: 'AGOSTO', abrev: 'AGO' },
  { numero: 9, nombre: 'SEPTIEMBRE', abrev: 'SEP' },
  { numero: 10, nombre: 'OCTUBRE', abrev: 'OCT' },
  { numero: 11, nombre: 'NOVIEMBRE', abrev: 'NOV' },
  { numero: 12, nombre: 'DICIEMBRE', abrev: 'DIC' },
];

const InformacionCartera: React.FC = () => {
  // Estados principales
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [periodosList, setPeriodosList] = useState<Periodo[]>([]);
  const [selectedEPS, setSelectedEPS] = useState<EPS | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [carteraData, setCarteraData] = useState<CarteraData[]>([]);
  const [epsPeriosoStatus, setEpsPeriodoStatus] = useState<EPSPeriodoStatus[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Hook de Sweet Alert
  const { showSuccess, showError, showLoading, close } = useSweetAlert();

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // *** FUNCIONES PRINCIPALES ***

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      
      // Cargar EPS, Períodos y Estado en paralelo
      const [epsResponse, periodosResponse, statusResponse] = await Promise.all([
        carteraAPI.getAllEPS(),
        carteraAPI.getAllPeriodos(),
        carteraAPI.getEPSPeriodoStatus()
      ]);

      // Verificar respuestas y inicializar arrays vacíos si fallan
      if (epsResponse.success && Array.isArray(epsResponse.data)) {
        setEpsList(epsResponse.data);
      } else {
        console.warn('EPS response failed or invalid:', epsResponse);
        setEpsList([]);
        showError({ title: 'Error', text: 'No se pudieron cargar las EPS' });
      }

      if (periodosResponse.success && Array.isArray(periodosResponse.data)) {
        setPeriodosList(periodosResponse.data);
      } else {
        console.warn('Periodos response failed or invalid:', periodosResponse);
        setPeriodosList([]);
        showError({ title: 'Error', text: 'No se pudieron cargar los períodos' });
      }

      if (statusResponse.success && Array.isArray(statusResponse.data)) {
        setEpsPeriodoStatus(statusResponse.data);
      } else {
        console.warn('Status response failed or invalid:', statusResponse);
        setEpsPeriodoStatus([]);
        showError({ title: 'Error', text: 'No se pudo cargar el estado de los datos' });
      }

    } catch (error: any) {
      console.error('Error loading initial data:', error);
      // Asegurar que todos los estados se inicialicen como arrays
      setEpsList([]);
      setPeriodosList([]);
      setEpsPeriodoStatus([]);
      setCarteraData([]);
      
      showError({ 
        title: 'Error de conexión', 
        text: 'No se pudo conectar con el servidor' 
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const loadCarteraData = async (epsId?: string, periodoId?: string) => {
    // Usar parámetros si se proporcionan, sino usar el estado
    const finalEpsId = epsId || selectedEPS?.id;
    const finalPeriodoId = periodoId || selectedPeriodo?.id;
    
    if (!finalEpsId || !finalPeriodoId) {
      setCarteraData([]);
      return;
    }

    try {
      setLoading(true);
      
      const response = await carteraAPI.getCarteraData({
        epsId: finalEpsId,
        periodoId: finalPeriodoId,
        limit: 1000 // Cargar todos los datos para esta combinación
      });

      if (response.success && response.data) {
        // Verificar si response.data es un array o tiene una propiedad data
        const dataArray = Array.isArray(response.data) ? response.data : response.data.data;
        setCarteraData(Array.isArray(dataArray) ? dataArray : []);
      } else {
        console.warn('Cartera data response failed or invalid:', response);
        setCarteraData([]);
        showError({ 
          title: 'Error', 
          text: response.message || 'No se pudieron cargar los datos de cartera' 
        });
      }
    } catch (error: any) {
      console.error('Error loading cartera data:', error);
      setCarteraData([]);
      showError({ 
        title: 'Error', 
        text: 'Error al cargar los datos de cartera' 
      });
    } finally {
      setLoading(false);
    }
  };

  // *** FUNCIONES DE UTILIDAD ***

  const findPeriodoByYearAndMonth = (year: number, mes: number): Periodo | null => {
    return periodosList.find(p => p.year === year && p.mes === mes) || null;
  };

  const hasDataForEPSYearMonth = (epsId: string, year: number, mes: number): boolean => {
    const periodo = findPeriodoByYearAndMonth(year, mes);
    if (!periodo) return false;
    return carteraUtils.hasDataForPeriod(epsPeriosoStatus, epsId, periodo.id);
  };

  const getAvailableYears = (): number[] => {
    const years = Array.from(new Set(periodosList.map(p => p.year))).sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear()];
  };

  const hasDataForPeriod = (epsId: string, periodoId: string): boolean => {
    return carteraUtils.hasDataForPeriod(epsPeriosoStatus, epsId, periodoId);
  };

  const getAvailablePeriodsForEPS = (epsId: string): Periodo[] => {
    return carteraUtils.getAvailablePeriodsForEPS(periodosList, epsPeriosoStatus, epsId);
  };

  // *** MANEJADORES DE EVENTOS ***

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedPeriodo(null);
    setCarteraData([]);
  };

  const handleEPSSelect = (eps: EPS) => {
    setSelectedEPS(eps);
    setSelectedPeriodo(null);
    setCarteraData([]);
    setCurrentPage(1);
  };

  const handlePeriodoSelect = async (periodo: Periodo) => {
    if (!selectedEPS) return;
    
    setSelectedPeriodo(periodo);
    await loadCarteraData(selectedEPS.id, periodo.id);
  };

  const handleMonthSelect = async (mes: number) => {
    if (!selectedEPS) return;
    
    const periodo = findPeriodoByYearAndMonth(selectedYear, mes);
    if (!periodo) {
      showError({
        title: 'Período no disponible',
        text: `No existe el período ${MESES_ANIO[mes - 1].nombre} ${selectedYear} en el sistema`
      });
      return;
    }
    
    setSelectedPeriodo(periodo);
    await loadCarteraData(selectedEPS.id, periodo.id);
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    
    // Recargar datos solo si tenemos las selecciones necesarias
    if (selectedEPS && selectedPeriodo) {
      await Promise.all([
        loadCarteraData(selectedEPS.id, selectedPeriodo.id),
        carteraAPI.getEPSPeriodoStatus().then(response => {
          if (response.success && Array.isArray(response.data)) {
            setEpsPeriodoStatus(response.data);
          }
        })
      ]);
    }
  };

  const handleRefreshData = async () => {
    showLoading('Actualizando datos...', 'Recargando información');
    try {
      await loadInitialData();
      if (selectedEPS && selectedPeriodo) {
        await loadCarteraData(selectedEPS.id, selectedPeriodo.id);
      }
      close();
      showSuccess('Datos actualizados', {
        title: '¡Actualización completada!',
        text: 'Todos los datos han sido recargados'
      });
    } catch (error) {
      close();
      showError({
        title: 'Error al actualizar',
        text: 'No se pudieron actualizar los datos'
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      showLoading('Generando plantilla...', 'Preparando archivo de ejemplo');
      
      const blob = await carteraAPI.downloadPlantilla();
      carteraUtils.downloadBlob(blob, 'Plantilla_Cartera.xlsx');
      
      close();
      showSuccess('¡Plantilla descargada!', {
        title: 'Descarga completada',
        text: 'La plantilla se ha guardado en tu carpeta de descargas'
      });
    } catch (error: any) {
      close();
      showError({
        title: 'Error al descargar',
        text: 'No se pudo generar la plantilla'
      });
    }
  };

  const handleExportExcel = async () => {
    if (!selectedEPS || !selectedPeriodo) {
      showError({
        title: 'Selección requerida',
        text: 'Debes seleccionar una EPS y un período para exportar'
      });
      return;
    }

    try {
      showLoading('Generando export...', 'Preparando archivo Excel');
      
      const blob = await carteraAPI.exportToExcel({
        epsId: selectedEPS.id,
        periodoId: selectedPeriodo.id
      });
      
      const filename = `Cartera_${selectedEPS.codigo}_${selectedPeriodo.nombre}_${selectedPeriodo.year}.xlsx`;
      carteraUtils.downloadBlob(blob, filename);
      
      close();
      showSuccess('¡Export completado!', {
        title: 'Descarga completada',
        text: 'El archivo se ha guardado en tu carpeta de descargas'
      });
    } catch (error: any) {
      close();
      showError({
        title: 'Error al exportar',
        text: 'No se pudo generar el archivo de exportación'
      });
    }
  };

  // *** DATOS CALCULADOS ***

  const filteredCarteraData = (carteraData || []).filter(item =>
    item?.ips?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.ips?.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredCarteraData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCarteraData.length / itemsPerPage);

  // *** USEEFFECT PARA CARGAR DATOS DE CARTERA ***
  useEffect(() => {
    // Solo cargar datos de cartera si tenemos EPS y período seleccionados
    if (selectedEPS && selectedPeriodo) {
      loadCarteraData(selectedEPS.id, selectedPeriodo.id);
    } else {
      setCarteraData([]); // Limpiar datos si no hay selección
    }
  }, [selectedEPS, selectedPeriodo]);

  // *** RENDERIZADO ***

  // Loading inicial
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando sistema de cartera...</p>
          <p className="text-gray-500 text-sm mt-2">Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Elegante */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-300" />
              <h1 className="text-2xl lg:text-3xl font-bold">Información Cartera</h1>
            </div>
            <p className="text-primary-100 text-lg">
              Sistema de gestión y análisis de cartera por EPS e IPS
            </p>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={handleRefreshData}
              className="btn-secondary"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              disabled={!selectedEPS || !selectedPeriodo}
              className="btn-primary"
            >
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Cargar Excel
            </button>
            <button 
              onClick={handleDownloadTemplate}
              className="btn-accent"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Plantilla
            </button>
            <button 
              onClick={handleExportExcel}
              disabled={!selectedEPS || !selectedPeriodo || carteraData.length === 0}
              className="btn-success"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Principal: EPS vs 12 Meses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <TableCellsIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-900">Control de Carga {selectedYear}</h2>
                <p className="text-gray-600 text-sm">Estado de información por EPS y mes del año</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <CheckCircleSolid className="w-4 h-4 text-success-600" />
                <span>Con datos</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <XCircleSolid className="w-4 h-4 text-danger-600" />
                <span>Sin datos</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <colgroup>
                <col className="w-80" />
                {MESES_ANIO.map((mes) => (
                  <col key={mes.numero} className="w-24" />
                ))}
                <col className="w-36" />
              </colgroup>
              <thead>
                <tr className="bg-gradient-to-r from-primary-900 to-primary-800">
                  <th className="table-header text-left py-4 px-6 rounded-l-lg">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>EPS</span>
                    </div>
                  </th>
                  {MESES_ANIO.map((mes) => (
                    <th key={mes.numero} className="table-header text-center py-4 px-4">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-xs font-bold">{mes.abrev}</span>
                        <span className="text-xs opacity-80">{mes.numero}</span>
                      </div>
                    </th>
                  ))}
                  <th className="table-header text-center py-4 px-6 rounded-r-lg">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {epsList.map((eps) => (
                  <tr 
                    key={eps.id} 
                    className={`table-row cursor-pointer ${selectedEPS?.id === eps.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                    onClick={() => handleEPSSelect(eps)}
                  >
                    <td className="table-cell px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${eps.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                        <div className="min-w-0 flex-1">
                          <span className="text-primary-900 font-semibold text-base block truncate">{eps.nombre}</span>
                          <p className="text-xs text-gray-500 mt-1">{eps.codigo}</p>
                        </div>
                      </div>
                    </td>
                    {MESES_ANIO.map((mes) => {
                      const tieneData = hasDataForEPSYearMonth(eps.id, selectedYear, mes.numero);
                      const periodo = findPeriodoByYearAndMonth(selectedYear, mes.numero);
                      const isSelected = selectedEPS?.id === eps.id && selectedPeriodo?.id === periodo?.id;
                      
                      return (
                        <td key={mes.numero} className="table-cell text-center px-4 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedEPS?.id !== eps.id) {
                                  handleEPSSelect(eps);
                                }
                                handleMonthSelect(mes.numero);
                              }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-primary-600 ring-2 ring-primary-300 shadow-md' 
                                  : 'hover:bg-gray-100 hover:shadow-sm'
                              }`}
                              title={`${eps.nombre} - ${mes.nombre} ${selectedYear}`}
                            >
                              {tieneData ? (
                                <CheckCircleSolid className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-success-600'}`} />
                              ) : (
                                <XCircleSolid className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-danger-600'}`} />
                              )}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                    <td className="table-cell text-center px-6 py-4">
                      <button 
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEPSSelect(eps);
                        }}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Sección Inferior: Períodos y Datos de Cartera */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tabla de Períodos Disponibles */}
        <div className="xl:col-span-1">
          <div className="card p-6 h-full">
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
                        <span className="ml-3 font-medium">{periodo.nombre}</span>
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

        {/* Tabla de Datos de Cartera IPS */}
        <div className="xl:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-900">Cartera por IPS</h3>
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
                      placeholder="Buscar IPS..."
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
                </div>
              )}
            </div>

            {/* Contenido Principal de la Tabla */}
            {selectedEPS && selectedPeriodo ? (
              <>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos de cartera...</p>
                  </div>
                ) : (
                  <>
                    {/* Tabla de Cartera */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-primary-900 to-primary-800">
                            <th className="table-header text-left py-4 px-4 rounded-l-lg min-w-60">
                              <div className="flex items-center space-x-2">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>IPS</span>
                              </div>
                            </th>
                            <th className="table-header text-right py-4 px-3 min-w-24">A30</th>
                            <th className="table-header text-right py-4 px-3 min-w-24">A60</th>
                            <th className="table-header text-right py-4 px-3 min-w-24">A90</th>
                            <th className="table-header text-right py-4 px-3 min-w-24">A120</th>
                            <th className="table-header text-right py-4 px-3 min-w-24">A180</th>
                            <th className="table-header text-right py-4 px-3 min-w-24">A360</th>
                            <th className="table-header text-right py-4 px-3 min-w-24">{'>'}360</th>
                            <th className="table-header text-right py-4 px-4 rounded-r-lg min-w-32">
                              <div className="flex items-center justify-end space-x-2">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                <span>Total</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedData.map((item) => (
                            <tr key={item.id} className="table-row">
                              <td className="table-cell">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-primary-900 truncate">{item.ips.nombre}</p>
                                    <p className="text-xs text-gray-500">{item.ips.codigo}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.a30, 'a30')}`}>
                                  {item.a30 > 0 ? carteraUtils.formatCurrency(item.a30) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.a60, 'a60')}`}>
                                  {item.a60 > 0 ? carteraUtils.formatCurrency(item.a60) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.a90, 'a90')}`}>
                                  {item.a90 > 0 ? carteraUtils.formatCurrency(item.a90) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.a120, 'a120')}`}>
                                  {item.a120 > 0 ? carteraUtils.formatCurrency(item.a120) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.a180, 'a180')}`}>
                                  {item.a180 > 0 ? carteraUtils.formatCurrency(item.a180) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.a360, 'a360')}`}>
                                  {item.a360 > 0 ? carteraUtils.formatCurrency(item.a360) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <span className={`font-medium ${carteraUtils.getCarteraColor(item.sup360, 'sup360')}`}>
                                  {item.sup360 > 0 ? carteraUtils.formatCurrency(item.sup360) : '-'}
                                </span>
                              </td>
                              <td className="table-cell text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <span className="font-bold text-primary-900 text-lg">
                                    {carteraUtils.formatCurrency(item.total)}
                                  </span>
                                  {item.total > 50000000 && (
                                    <ExclamationTriangleIcon className="w-4 h-4 text-warning-600" title="Cartera alta" />
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Resumen y Paginación */}
                    {filteredCarteraData.length > 0 && (
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        {/* Resumen */}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCarteraData.length)} de {filteredCarteraData.length}
                          </span>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-success-600" />
                            <span className="font-semibold text-success-600">
                              Total: {carteraUtils.formatCurrency(carteraUtils.calculateTotalCartera(filteredCarteraData))}
                            </span>
                          </div>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Anterior
                            </button>
                            
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                                      currentPage === page
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Siguiente
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {filteredCarteraData.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay datos de cartera</h3>
                        <p className="text-gray-600 mb-6">
                          No se encontraron datos para {selectedEPS.nombre} en {selectedPeriodo.nombre} {selectedPeriodo.year}
                        </p>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="btn-primary"
                        >
                          <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                          Cargar Información
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Selecciona EPS y Período
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Para ver los datos de cartera, primero selecciona una EPS en la tabla superior y luego un período disponible.
                    </p>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-xs">1</div>
                      <span>Selecciona EPS</span>
                    </div>
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-semibold text-xs">2</div>
                      <span>Elige período</span>
                    </div>
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-semibold text-xs">3</div>
                      <span>Ver cartera</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de Acción Móviles */}
      <div className="lg:hidden fixed bottom-4 right-4 space-y-3">
        <button 
          onClick={() => setShowUploadModal(true)}
          disabled={!selectedEPS || !selectedPeriodo}
          className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CloudArrowUpIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={handleDownloadTemplate}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        >
          <DocumentArrowDownIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={handleExportExcel}
          disabled={!selectedEPS || !selectedPeriodo || carteraData.length === 0}
          className="w-14 h-14 bg-success-600 hover:bg-success-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon className="w-6 h-6" />
        </button>
      </div>

    
      <ExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        selectedEPS={selectedEPS || undefined}
        selectedPeriodo={selectedPeriodo || undefined}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default InformacionCartera;