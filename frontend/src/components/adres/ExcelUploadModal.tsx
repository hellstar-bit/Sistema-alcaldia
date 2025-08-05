// frontend/src/components/adres/ExcelUploadModal.tsx - ERRORES CRÍTICOS CORREGIDOS

import React, { useState, useRef } from 'react';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// ✅ CORRECCIÓN 1: Import correcto
// ❌ TIENES: import { AdresAPI, adresUtils } from '../../services/adresApi';
// ✅ DEBE SER: import { adresAPI, adresUtils } from '../../services/adresApi';
import { adresAPI, adresUtils } from '../../services/adresApi';

import { useSweetAlert } from '../../hooks/useSweetAlert';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEPS?: { id: string; nombre: string };
  selectedPeriodo?: { id: string; nombre: string; year: number };
  onUploadSuccess: () => void;
}

interface LocalUploadResult {
  processed: number;
  errors: string[];
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  selectedEPS,
  selectedPeriodo,
  onUploadSuccess
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<LocalUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showLoading, close } = useSweetAlert();

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // ✅ CORRECCIÓN 2: Función handleFileSelect COMPLETA (estaba cortada)
  const handleFileSelect = async (file: File) => {
    console.log('🔍 Seleccionando archivo:', file.name);
    
    const validation = adresUtils.validateExcelFile(file);
    if (!validation.isValid) {
      showError({
        title: 'Formato de archivo inválido',
        text: validation.error!
      });
      return;
    }

    // ✅ AGREGAR: Establecer el archivo seleccionado
    setSelectedFile(file);
    setUploadResult(null);
    console.log('✅ Archivo seleccionado correctamente:', file.name);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // ✅ CORRECCIÓN 3: Usar adresAPI (instancia) en lugar de AdresAPI (clase)
  const handleUpload = async () => {
    if (!selectedFile || !selectedEPS || !selectedPeriodo) {
      console.warn('❌ Faltan datos requeridos para la importación:', {
        selectedFile: !!selectedFile,
        selectedEPS: !!selectedEPS,
        selectedPeriodo: !!selectedPeriodo
      });
      return;
    }

    console.log('🚀 Iniciando importación ADRES:', {
      file: selectedFile.name,
      eps: selectedEPS.nombre,
      periodo: `${selectedPeriodo.nombre} ${selectedPeriodo.year}`
    });

    setUploading(true);
    showLoading('Procesando archivo...', 'Validando datos y creando registros');

    try {
      // ✅ CORRECCIÓN: Usar adresAPI (instancia) no AdresAPI (clase)
      const response = await adresAPI.uploadFile(
        selectedFile,
        selectedEPS.id,
        selectedPeriodo.id
      );

      console.log('✅ Respuesta de la API:', response);
      close();
      
      if (response.success) {
        const localResult: LocalUploadResult = {
          processed: response.data.processed,
          errors: response.data.errors || []
        };
        
        setUploadResult(localResult);
        showSuccess('¡Importación exitosa!', {
          title: '¡Datos importados!',
          text: `Se procesaron ${localResult.processed} registros correctamente`
        });
        onUploadSuccess();
      } else {
        showError({
          title: 'Error en la importación',
          text: response.message || 'Error desconocido en la importación'
        });
      }

    } catch (error: any) {
      console.error('❌ Error en importación ADRES:', error);
      close();
      showError({
        title: 'Error en la importación',
        text: error.message || 'Ocurrió un error al procesar el archivo'
      });
    } finally {
      setUploading(false);
    }
  };

  // ✅ CORRECCIÓN 4: Usar adresAPI (instancia) no AdresAPI (clase)
  const handleDownloadTemplate = async () => {
    try {
      console.log('📥 Descargando plantilla ADRES...');
      showLoading('Generando plantilla...', 'Preparando archivo de ejemplo');
      
      // ✅ CORRECCIÓN: Usar adresAPI (instancia) no AdresAPI (clase)
      const blob = await adresAPI.downloadPlantilla();
      adresUtils.downloadBlob(blob, 'Plantilla_ADRES.xlsx');
      
      close();
      showSuccess('¡Plantilla descargada!', {
        title: 'Descarga exitosa',
        text: 'La plantilla se ha descargado correctamente'
      });
    } catch (error: any) {
      console.error('❌ Error al descargar plantilla:', error);
      close();
      showError({
        title: 'Error en la descarga',
        text: error.message || 'No se pudo descargar la plantilla'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-xl">
                <CloudArrowUpIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Importar Datos ADRES</h2>
                <p className="text-sm text-gray-600">Carga masiva de información desde Excel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Información de EPS y Período */}
          <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">EPS Seleccionada</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedEPS ? selectedEPS.nombre : 'No seleccionada'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Período</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPeriodo ? `${selectedPeriodo.nombre} ${selectedPeriodo.year}` : 'No seleccionado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mb-6 bg-gradient-to-br from-info-50 to-info-100 border border-info-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-6 h-6 text-info-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-info-900 mb-2">Instrucciones para la importación:</h3>
                <ul className="text-sm text-info-800 space-y-1">
                  <li>• Descarga la plantilla Excel haciendo clic en el botón inferior</li>
                  <li>• Completa los datos con los siguientes campos obligatorios:</li>
                  <li className="ml-4 font-mono text-xs bg-white px-2 py-1 rounded">
                    EPS | UPC | Valor Girado
                  </li>
                  <li>• Si una EPS no existe en el sistema, se creará automáticamente</li>
                  <li>• El archivo debe ser formato .xlsx, .xls o .csv y no mayor a 50MB</li>
                  <li>• Asegúrate de que los valores sean positivos y no haya duplicados por EPS/período</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Descargar Plantilla */}
          <div className="mb-6">
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <DocumentArrowDownIcon className="w-6 h-6" />
              <span className="font-semibold">Descargar Plantilla Excel</span>
            </button>
          </div>

          {/* Área de Drop */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-primary-400 bg-primary-50'
                  : selectedFile
                  ? 'border-success-400 bg-success-50'
                  : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center space-y-3">
                  <CheckCircleIcon className="w-12 h-12 text-success-600" />
                  <div>
                    <p className="font-semibold text-success-900">{selectedFile.name}</p>
                    <p className="text-sm text-success-700">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Remover archivo
                  </button>
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-600">
                    Formatos soportados: .xlsx, .xls, .csv (máximo 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resultado de Upload */}
          {uploadResult && (
            <div className="mb-6 rounded-xl p-4 border bg-success-50 border-success-200">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-success-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-success-900">
                    ¡Importación completada exitosamente!
                  </h4>
                  
                  <div className="mb-3 flex items-center space-x-4 text-sm">
                    <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full font-medium">
                      ✅ {uploadResult.processed} registros procesados
                    </span>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <div>
                      <p className="font-medium mb-2 text-warning-700">
                        Advertencias encontradas:
                      </p>
                      <ul className="space-y-1 text-small">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="flex items-start space-x-2 text-warning-700">
                            <span className="font-mono text-xs mt-0.5">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li className="text-gray-600 text-xs italic">
                            ... y {uploadResult.errors.length - 5} advertencias más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedEPS || !selectedPeriodo || uploading}
              className="w-full sm:w-auto btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4" />
                  <span>Importar Datos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};