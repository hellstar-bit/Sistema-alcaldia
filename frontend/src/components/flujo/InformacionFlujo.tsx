import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { flujoAPI, flujoUtils, ControlCargaGrid, FlujoIpsData, FlujoEpsData, FlujoFilterParams, EpsAdresInfo } from '../../services/flujoApi';
import { carteraAPI } from '../../services/carteraApi';
import { FlujoExcelUploadModal } from './ExcelUploadModal';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface EPS {
  id: string;
  codigo: string;
  nombre: string;
  activa: boolean;
}

interface Periodo {
  id: string;
  year: number;
  mes: number;
  nombre: string;
  activo: boolean;
}

export const InformacionFlujo: React.FC = () => {
  // Estados principales
  const [controlCargaGrid, setControlCargaGrid] = useState<ControlCargaGrid[]>([]);
  const [allEPS, setAllEPS] = useState<EPS[]>([]);
  const [allPeriodos, setAllPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de selección
  const [selectedEPS, setSelectedEPS] = useState<EPS | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);

  // Estados de datos
  const [flujoIpsData, setFlujoIpsData] = useState<FlujoIpsData[]>([]);
  const [flujoEpsData, setFlujoEpsData] = useState<FlujoEpsData | null>(null);
  const [epsAdresInfo, setEpsAdresInfo] = useState<EpsAdresInfo[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAdresInfo, setLoadingAdresInfo] = useState(false);

  // Estados de UI
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados de resumen con inicialización segura
  const [summary, setSummary] = useState({
    totalValorFacturado: 0,
    totalReconocido: 0,
    totalPagado: 0,
    totalSaldoAdeudado: 0
  });

  const { showSuccess, showError, showLoading, showConfirmation, close } = useSweetAlert();

  // ===============================================
  // EFECTOS
  // ===============================================
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEPS && selectedPeriodo) {
      loadFlujoData();
    } else {
      // Reset seguro del estado
      setFlujoIpsData([]);
      setFlujoEpsData(null);
      setEpsAdresInfo([]);
      setSummary({
        totalValorFacturado: 0,
        totalReconocido: 0,
        totalPagado: 0,
        totalSaldoAdeudado: 0
      });
    }
  }, [selectedEPS, selectedPeriodo, currentPage, searchTerm]);

  // ===============================================
  // FUNCIONES DE CARGA DE DATOS
  // ===============================================
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [controlCargaResponse, epsResponse, periodosResponse] = await Promise.all([
        flujoAPI.getControlCargaGrid(),
        carteraAPI.getAllEPS(),
        carteraAPI.getAllPeriodos()
      ]);

      if (controlCargaResponse.success) {
        setControlCargaGrid(controlCargaResponse.data);
      }

      if (epsResponse.success) {
        setAllEPS(epsResponse.data);
      }

      if (periodosResponse.success) {
        const currentYear = new Date().getFullYear();
        const currentYearPeriods = periodosResponse.data
            .filter(periodo => periodo.year === currentYear && periodo.activo)
            .sort((a, b) => a.mes - b.mes)
            .slice(0, 12);
        
        setAllPeriodos(currentYearPeriods);
        }

    } catch (error: any) {
      console.error('Error loading initial data:', error);
      showError({
        title: 'Error de conexión',
        text: 'No se pudieron cargar los datos iniciales'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFlujoData = async () => {
    if (!selectedEPS || !selectedPeriodo) {
      console.log('❌ No hay EPS o período seleccionado');
      return;
    }

    try {
      setLoadingData(true);
      setLoadingAdresInfo(true);
      console.log('🔄 Iniciando carga de datos...');

      const filters: FlujoFilterParams = {
        epsId: selectedEPS.id,
        periodoId: selectedPeriodo.id,
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      console.log('📤 Filtros enviados:', filters);
      
      const [ipsDataResponse, epsDataResponse, adresInfoResponse] = await Promise.all([
        flujoAPI.getFlujoIpsData(filters),
        flujoAPI.getFlujoEpsData(selectedEPS.id, selectedPeriodo.id),
        flujoAPI.getEpsAdresInfo(selectedEPS.id)
      ]);
      
      console.log('📥 Respuesta completa IPS:', ipsDataResponse);
      console.log('📥 Success IPS:', ipsDataResponse.success);
      console.log('📥 Data IPS:', ipsDataResponse.data);
      
      if (ipsDataResponse.success && ipsDataResponse.data) {
        console.log('✅ Procesando datos exitosamente');
        console.log('📊 Datos a establecer:', ipsDataResponse.data.data);
        console.log('📊 Length de datos:', ipsDataResponse.data.data?.length);
        
        setFlujoIpsData(ipsDataResponse.data.data || []);
        setSummary(ipsDataResponse.data.summary || {
          totalValorFacturado: 0,
          totalReconocido: 0,
          totalPagado: 0,
          totalSaldoAdeudado: 0
        });
        
        console.log('✅ Estados actualizados');
        
        setTimeout(() => {
          console.log('🔍 Estado final flujoIpsData.length:', flujoIpsData.length);
        }, 100);
        
      } else {
        console.log('⚠️ Respuesta no exitosa o sin datos');
        setFlujoIpsData([]);
        setSummary({
          totalValorFacturado: 0,
          totalReconocido: 0,
          totalPagado: 0,
          totalSaldoAdeudado: 0
        });
      }

      if (epsDataResponse.success && epsDataResponse.data) {
        console.log('📈 Datos EPS encontrados:', epsDataResponse.data);
        setFlujoEpsData(epsDataResponse.data);
      } else {
        console.log('📈 No hay datos EPS');
        setFlujoEpsData(null);
      }

      if (adresInfoResponse.success && adresInfoResponse.data) {
        console.log('🔍 Información de ADRES encontrada:', adresInfoResponse.data);
        setEpsAdresInfo(adresInfoResponse.data);
      } else {
        console.log('🔍 No hay información de ADRES');
        setEpsAdresInfo([]);
      }

    } catch (error: any) {
      console.error('❌ Error en loadFlujoData:', error);
      setFlujoIpsData([]);
      setFlujoEpsData(null);
      setEpsAdresInfo([]);
      setSummary({
        totalValorFacturado: 0,
        totalReconocido: 0,
        totalPagado: 0,
        totalSaldoAdeudado: 0
      });
      showError({
        title: 'Error al cargar datos',
        text: 'No se pudieron cargar los datos de flujo'
      });
    } finally {
      setLoadingData(false);
      setLoadingAdresInfo(false);
    }
  };

  // ===============================================
  // FUNCIONES DE ACCIONES
  // ===============================================
  const handleDeletePeriodoData = async (eps: EPS, periodo: Periodo) => {
    const result = await showConfirmation({
      title: '¿Eliminar datos del período?',
      text: `Esta acción eliminará todos los datos de flujo de ${eps.nombre} para ${periodo.nombre} ${periodo.year}. Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      showLoading('Eliminando datos...', 'Procesando eliminación');

      const response = await flujoAPI.deleteFlujoPeriodoData(eps.id, periodo.id);

      close();

      if (response.success) {
        showSuccess('¡Datos eliminados!', {
          title: 'Eliminación exitosa',
          text: `Se eliminaron ${response.data?.deletedCount || 0} registros`
        });

        await loadInitialData();
        if (selectedEPS?.id === eps.id && selectedPeriodo?.id === periodo.id) {
          setFlujoIpsData([]);
          setFlujoEpsData(null);
          setEpsAdresInfo([]);
          setSummary({
            totalValorFacturado: 0,
            totalReconocido: 0,
            totalPagado: 0,
            totalSaldoAdeudado: 0
          });
        }
      } else {
        showError({
          title: 'Error al eliminar',
          text: response.message
        });
      }

    } catch (error: any) {
      close();
      showError({
        title: 'Error al eliminar',
        text: error.message || 'Ocurrió un error al eliminar los datos'
      });
    }
  };

  const handleExportData = async () => {
    if (!selectedEPS || !selectedPeriodo) {
      showError({
        title: 'Selección requerida',
        text: 'Selecciona una EPS y un período para exportar'
      });
      return;
    }

    try {
      showLoading('Generando archivo...', 'Preparando datos para exportación');

      const filters: FlujoFilterParams = {
        epsId: selectedEPS.id,
        periodoId: selectedPeriodo.id
      };

      const blob = await flujoAPI.exportToExcel(filters);
      const filename = flujoUtils.generateFileName(
        'Flujo_Export',
        selectedEPS.nombre,
        flujoUtils.formatPeriodoName(selectedPeriodo)
      );

      flujoUtils.downloadBlob(blob, filename);

      close();
      showSuccess('¡Archivo exportado!', {
        title: 'Exportación exitosa',
        text: 'El archivo se ha guardado en tu carpeta de descargas'
      });

    } catch (error: any) {
      close();
      showError({
        title: 'Error al exportar',
        text: error.message || 'No se pudo generar el archivo'
      });
    }
  };

  const handleUploadSuccess = async () => {
    await loadInitialData();
    if (selectedEPS && selectedPeriodo) {
      await loadFlujoData();
    }
    setShowUploadModal(false);
  };

  // ===============================================
  // FUNCIONES DE UTILIDAD
  // ===============================================
  const getGridCellStatus = (eps: EPS, periodo: Periodo) => {
    const epsGrid = controlCargaGrid.find(grid => grid.eps.id === eps.id);
    const periodoData = epsGrid?.periodos.find(p => p.periodo.id === periodo.id);
    
    return {
      tieneData: periodoData?.tieneData || false,
      totalRegistros: periodoData?.totalRegistros || 0
    };
  };

  const handleCellClick = (eps: EPS, periodo: Periodo) => {
    setSelectedEPS(eps);
    setSelectedPeriodo(periodo);
    setCurrentPage(1);
  };

  const getPaymentStatusBadge = (item: FlujoIpsData) => {
    const status = flujoUtils.getPaymentStatus(item);
    const colorClass = flujoUtils.getPaymentStatusColor(status);
    const statusText = flujoUtils.getPaymentStatusText(status);

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {statusText}
      </span>
    );
  };

  const getMesNombre = (mes: number): string => {
    const meses = [
      'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
    ];
    return meses[mes - 1] || '';
  };

  // ===============================================
  // RENDER
  // ===============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de flujo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Información Flujo</h1>
              <p className="text-blue-100">Sistema de gestión y análisis de flujo por EPS e IPS</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              <span>🔄</span>
              <span>Actualizar</span>
            </button>
            
            <button
              onClick={handleExportData}
              disabled={!selectedEPS || !selectedPeriodo}
              className="flex items-center space-x-2 bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLA 1: Métricas Detalladas por EPS y Período - MOVIDA ARRIBA */}
      {selectedEPS && (
        <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-purple-900 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Métricas Detalladas por EPS y Período - {selectedEPS.nombre}
              </h2>
              <p className="text-sm text-purple-600">Datos UPC y valor girado por período</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingAdresInfo ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando métricas detalladas...</p>
                </div>
              </div>
            ) : epsAdresInfo.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EPS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UPC
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      92% UPC
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      60% UPC
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Girado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {epsAdresInfo.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.eps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.periodo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatCurrency(item.upc)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        <span className="text-green-600 font-medium">
                          {flujoUtils.formatCurrency(item.upc92)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        <span className="text-blue-600 font-medium">
                          {flujoUtils.formatCurrency(item.upc60)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatCurrency(item.valorGirado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay métricas disponibles</h3>
                <p className="text-gray-600">
                  No se encontraron datos de ADRES para la EPS seleccionada
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABLA 2: Control de Carga - AHORA ESTÁ DESPUÉS DE MÉTRICAS */}
      <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2" />
              Control de Carga {new Date().getFullYear()}
            </h2>
            <p className="text-sm text-gray-600">Estado de información por EPS e IPS</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  EPS
                </th>
                {allPeriodos.map(periodo => (
                  <th key={periodo.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{getMesNombre(periodo.mes)}</span>
                      <span className="text-xs">{periodo.mes}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allEPS.map(eps => (
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
                  {allPeriodos.map(periodo => {
                    const status = getGridCellStatus(eps, periodo);
                    const isSelected = selectedEPS?.id === eps.id && selectedPeriodo?.id === periodo.id;
                    
                    return (
                      <td key={periodo.id} className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleCellClick(eps, periodo)}
                          className={`w-full h-12 rounded-lg border-2 transition-all duration-200 relative group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-100'
                              : status.tieneData
                              ? 'border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {status.tieneData ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mb-1" />
                              <span className="text-xs font-medium text-green-800">
                                {status.totalRegistros}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <XCircleIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

      {/* Información de selección actual */}
      {selectedEPS && selectedPeriodo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">EPS Seleccionada</p>
                <p className="text-lg font-bold text-blue-900">{selectedEPS.nombre}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Período Seleccionado</p>
                <p className="text-lg font-bold text-purple-900">
                  {flujoUtils.formatPeriodoName(selectedPeriodo)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      {selectedEPS && selectedPeriodo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Total Facturado</p>
                <p className="text-lg font-bold text-green-900">
                  {flujoUtils.formatCurrency(summary?.totalValorFacturado || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Total Reconocido</p>
                <p className="text-lg font-bold text-blue-900">
                  {flujoUtils.formatCurrency(summary?.totalReconocido || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Total Pagado</p>
                <p className="text-lg font-bold text-yellow-900">
                  {flujoUtils.formatCurrency(summary?.totalPagado || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Saldo Adeudado</p>
                <p className="text-lg font-bold text-red-900">
                  {flujoUtils.formatCurrency(summary?.totalSaldoAdeudado || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Datos de IPS */}
      {selectedEPS && selectedPeriodo && (
        <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-green-900 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Datos de IPS - {selectedEPS.nombre} ({flujoUtils.formatPeriodoName(selectedPeriodo)})
              </h2>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DocumentArrowUpIcon className="w-4 h-4" />
                  <span>Importar</span>
                </button>
                
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar IPS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando datos de IPS...</p>
                </div>
              </div>
            ) : flujoIpsData.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IPS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incremento %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Contrato
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Facturado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reconocido
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Adeudado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flujoIpsData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.ips.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.ips.codigo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatPercentage(item.incremento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.tipoContrato || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatCurrency(item.valorFacturado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatCurrency(item.reconocido)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatCurrency(item.valorPagado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {flujoUtils.formatCurrency(item.saldoAdeudado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getPaymentStatusBadge(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de IPS</h3>
                <p className="text-gray-600 mb-4">
                  No se encontraron datos para la combinación EPS/Período seleccionada
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                  Importar Datos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de importación */}
      <FlujoExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        selectedEPS={selectedEPS ? { id: selectedEPS.id, nombre: selectedEPS.nombre } : undefined}
        selectedPeriodo={selectedPeriodo ? { 
          id: selectedPeriodo.id, 
          nombre: selectedPeriodo.nombre, 
          year: selectedPeriodo.year 
        } : undefined}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
