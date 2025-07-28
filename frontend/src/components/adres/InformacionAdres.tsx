// frontend/src/components/adres/InformacionAdres.tsx - VERSIÓN COMPLETA Y CORREGIDA

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { ExcelUploadModal } from './ExcelUploadModal';
import { adresAPI, adresUtils, EPS, Periodo, AdresData, EPSPeriodoStatus } from '../../services/adresApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';

const MESES_ANIO = [
  { numero: 1, abrev: 'ENE' },
  { numero: 2, abrev: 'FEB' },
  { numero: 3, abrev: 'MAR' },
  { numero: 4, abrev: 'ABR' },
  { numero: 5, abrev: 'MAY' },
  { numero: 6, abrev: 'JUN' },
  { numero: 7, abrev: 'JUL' },
  { numero: 8, abrev: 'AGO' },
  { numero: 9, abrev: 'SEP' },
  { numero: 10, abrev: 'OCT' },
  { numero: 11, abrev: 'NOV' },
  { numero: 12, abrev: 'DIC' }
];

export const InformacionAdres: React.FC = () => {
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [periodosList, setPeriodosList] = useState<Periodo[]>([]);
  const [selectedEPS, setSelectedEPS] = useState<EPS | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [adresData, setAdresData] = useState<AdresData[]>([]);
  const [epsPeriodoStatus, setEpsPeriodoStatus] = useState<EPSPeriodoStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { showSuccess, showError, showConfirmation, showLoading, close } = useSweetAlert();

  // ✅ FUNCIONES DE CÁLCULO CORREGIDAS
  const calculateTotalValorGirado = (): number => {
    try {
      if (!Array.isArray(adresData) || adresData.length === 0) {
        console.log('🔍 calculateTotalValorGirado: No data available');
        return 0;
      }

      let total = 0;
      
      adresData.forEach((item, index) => {
        let valor = 0;
        
        if (item.valorGirado !== undefined && item.valorGirado !== null) {
          if (typeof item.valorGirado === 'number') {
            valor = item.valorGirado;
          } else if (typeof item.valorGirado === 'string' || typeof item.valorGirado === 'boolean' || typeof item.valorGirado === 'object') {
            const cleanValue = item.valorGirado.toString().replace(/[,$\s]/g, '');
            valor = parseFloat(cleanValue);
          }
        }
        
        if (!isNaN(valor) && isFinite(valor)) {
          total += valor;
        } else {
          console.warn(`🔍 Item ${index} tiene valor inválido:`, {
            valorGirado: item.valorGirado,
            typeOf: typeof item.valorGirado,
            convertedValue: valor
          });
        }
      });

      console.log('🔍 calculateTotalValorGirado resultado:', {
        dataLength: adresData.length,
        calculatedTotal: total,
        formattedTotal: adresUtils.formatCurrency(total)
      });

      return total;
    } catch (error) {
      console.error('❌ Error en calculateTotalValorGirado:', error);
      return 0;
    }
  };

  const calculateTotalUPC = (): number => {
    try {
      if (!Array.isArray(adresData) || adresData.length === 0) {
        console.log('🔍 calculateTotalUPC: No data available');
        return 0;
      }

      let total = 0;
      
      adresData.forEach((item, index) => {
        let valor = 0;
        
        if (item.upc !== undefined && item.upc !== null) {
          if (typeof item.upc === 'number') {
            valor = item.upc; } else if (typeof item.upc === 'string' || typeof item.upc === 'boolean' || typeof item.upc === 'object') { const cleanValue = String(item.upc).replace(/[,$\s]/g, '');
            valor = parseFloat(cleanValue);
          }
        }
        
        if (!isNaN(valor) && isFinite(valor)) {
          total += valor;
        } else {
          console.warn(`🔍 Item ${index} tiene UPC inválido:`, {
            upc: item.upc,
            typeOf: typeof item.upc,
            convertedValue: valor
          });
        }
      });

      console.log('🔍 calculateTotalUPC resultado:', {
        dataLength: adresData.length,
        calculatedTotal: total,
        formattedTotal: adresUtils.formatCurrency(total)
      });

      return total;
    } catch (error) {
      console.error('❌ Error en calculateTotalUPC:', error);
      return 0;
    }
  };

  const getTotalRegistros = (): number => {
    if (!Array.isArray(adresData)) {
      console.log('🔍 getTotalRegistros: adresData no es un array');
      return 0;
    }
    
    const total = adresData.length;
    console.log('🔍 getTotalRegistros:', {
      dataLength: total,
      isArray: Array.isArray(adresData)
    });
    
    return total;
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const epsRes = await adresAPI.getAllEPS();
      const periodosRes = await adresAPI.getAllPeriodos();
      const statusRes = await adresAPI.getEPSPeriodoStatus();
      setEpsList(epsRes.data || []);
      setPeriodosList(periodosRes.data || []);
      setEpsPeriodoStatus(statusRes.data || []);
    } catch (error) {
      showError({ title: 'Error', text: 'No se pudieron cargar los datos iniciales' });
    } finally {
      setLoading(false);
    }
  };

  const handleEPSSelect = (eps: EPS) => {
    setSelectedEPS(eps);
    setSelectedPeriodo(null);
    setAdresData([]);
  };

  const handleCellClick = async (eps: EPS, periodo: Periodo) => {
    setSelectedEPS(eps);
    setSelectedPeriodo(periodo);
    try {
      setLoading(true);
      const res = await adresAPI.getAdresData({ epsId: eps.id, periodoId: periodo.id });
      const data = res.data.data || [];
      
      // ✅ DEBUG: Ver estructura de los datos
      console.log('🔍 Datos recibidos de la API:', {
        responseStructure: Object.keys(res.data),
        dataArray: data,
        firstItem: data[0] ? {
          id: data[0].id,
          upc: data[0].upc,
          upcType: typeof data[0].upc,
          valorGirado: data[0].valorGirado,
          valorGiradoType: typeof data[0].valorGirado,
          eps: data[0].eps?.nombre
        } : 'No data'
      });
      
      setAdresData(data);
    } catch (error) {
      showError({ title: 'Error', text: 'No se pudieron cargar los datos de ADRES' });
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
        loadInitialData();
      } else {
        showError({ title: 'Error', text: res.message });
      }
    } catch (error) {
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
      const filename = adresUtils.generateFileName('ADRES_Export', selectedEPS?.nombre, selectedPeriodo ? `${selectedPeriodo.nombre} ${selectedPeriodo.year}` : undefined);
      adresUtils.downloadBlob(blob, filename);
      close();
      showSuccess({ title: '¡Exportación completada!', text: 'El archivo se ha descargado exitosamente' });
    } catch (error) {
      close();
      showError({ title: 'Error', text: 'No se pudo generar la exportación' });
    }
  };

  const handleOpenUploadModal = (eps: EPS, periodo: Periodo) => {
    setSelectedEPS(eps);
    setSelectedPeriodo(periodo);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadInitialData();
    if (selectedEPS && selectedPeriodo) {
      handleCellClick(selectedEPS, selectedPeriodo);
    }
  };

  const getEPSPeriodoStatus = (epsId: string, periodoId: string): EPSPeriodoStatus | undefined => {
    return epsPeriodoStatus.find(item => item.epsId === epsId && item.periodoId === periodoId);
  };

  const getAvailablePeriodsForEPS = (epsId: string): Periodo[] => {
    return periodosList.filter(periodo => {
      const status = getEPSPeriodoStatus(epsId, periodo.id);
      return status?.tieneData;
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.mes - a.mes;
    });
  };

  if (loading) return <div className="flex justify-center items-center h-64">Cargando sistema de ADRES...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-elegant">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de ADRES</h1>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-lg p-2"
        >
          {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <h2 className="text-xl font-semibold mb-4">Estado de información por EPS y mes del año {selectedYear}</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left border">EPS</th>
              {MESES_ANIO.map((mes) => (
                <th key={mes.numero} className="p-3 text-center border">{mes.abrev}</th>
              ))}
              <th className="p-3 text-left border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {epsList.map((eps) => (
              <tr key={eps.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEPSSelect(eps)}>
                <td className="p-3 border">{eps.nombre} ({eps.codigo})</td>
                {MESES_ANIO.map((mes) => {
                  const periodo = periodosList.find(p => p.mes === mes.numero && p.year === selectedYear);
                  const status = periodo ? getEPSPeriodoStatus(eps.id, periodo.id) : undefined;
                  const hasData = status?.tieneData || false;
                  const cellColor = hasData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500';
                  return (
                    <td 
                      key={mes.numero} 
                      className={`p-3 text-center border ${cellColor}`} 
                      onClick={(e) => { e.stopPropagation(); if (periodo) handleCellClick(eps, periodo); }}
                    >
                      {hasData ? '✅' : '-'}
                    </td>
                  );
                })}
                <td className="p-3 border">
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* Lógica para añadir manual, e.g., modal */ }}
                      className="btn-primary text-sm"
                    >
                      Añadir Manual
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEPS && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Períodos disponibles para {selectedEPS.nombre}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getAvailablePeriodsForEPS(selectedEPS.id).map(periodo => (
              <div 
                key={periodo.id} 
                className={`p-4 rounded-xl cursor-pointer transition-colors ${selectedPeriodo?.id === periodo.id ? 'bg-primary-100 border-primary-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => handleCellClick(selectedEPS, periodo)}
              >
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{adresUtils.formatPeriodoName(periodo)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Registros: {getEPSPeriodoStatus(selectedEPS.id, periodo.id)?.totalRegistros || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEPS && selectedPeriodo && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold">
              Datos para {selectedEPS.nombre} - {adresUtils.formatPeriodoName(selectedPeriodo)}
            </h4>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleOpenUploadModal(selectedEPS, selectedPeriodo)}
                className="btn-primary flex items-center space-x-2"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                <span>Importar Datos</span>
              </button>
              <button 
                onClick={handleExport}
                className="btn-secondary flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Exportar</span>
              </button>
              <button 
                onClick={() => handleDeleteByPeriodo(selectedEPS.id, selectedPeriodo.id)}
                className="btn-danger flex items-center space-x-2"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Eliminar Período</span>
              </button>
            </div>
          </div>

          {/* ✅ ESTADÍSTICAS MOVIDAS ARRIBA DE LA TABLA */}
          {adresData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Valor Girado</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {adresUtils.formatCurrency(calculateTotalValorGirado())}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Total UPC</p>
                    <p className="text-2xl font-bold text-green-900">
                      {adresUtils.formatCurrency(calculateTotalUPC())}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Total Registros</p>
                    <p className="text-2xl font-bold text-purple-900">{getTotalRegistros()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-center py-8">Cargando datos de ADRES...</p>
          ) : adresData.length > 0 ? (
            <>
              {/* ✅ TABLA PRINCIPAL AHORA DEBAJO DE LAS ESTADÍSTICAS */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">EPS</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">UPC</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Valor Girado</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Observaciones</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha Creación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adresData.map((item, index) => (
                        <tr key={item.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.eps.nombre}
                            <div className="text-xs text-gray-500">{item.eps.codigo}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900 font-mono">
                            {adresUtils.formatCurrency(item.upc)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900 font-mono font-semibold">
                            {adresUtils.formatCurrency(item.valorGirado)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.observaciones || (
                              <span className="text-gray-400 italic">Sin observaciones</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {adresUtils.formatDateTime(item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
                  <p className="text-gray-600 mb-4">
                    No se encontraron datos para {selectedEPS?.nombre ?? ''} en {selectedPeriodo ? adresUtils.formatPeriodoName(selectedPeriodo) : ''}
                  </p>
                  <button 
                    onClick={() => { if (selectedEPS && selectedPeriodo) handleOpenUploadModal(selectedEPS, selectedPeriodo); }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Importar Datos Ahora</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        selectedEPS={selectedEPS ?? undefined}
        selectedPeriodo={selectedPeriodo ?? undefined}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
