// frontend/src/components/cartera/ExcelUploadModal.tsx - VERSIÓN CORREGIDA
import React, { useState, useRef } from 'react';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { carteraAPI, carteraUtils } from '../../services/carteraApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEPS?: { id: string; nombre: string };
  selectedPeriodo?: { id: string; nombre: string; year: number };
  onUploadSuccess: () => void;
}

// Interface local para el resultado del upload
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

  const handleFileSelect = (file: File) => {
    const validation = carteraUtils.validateExcelFile(file);
    
    if (!validation.valid) {
      showError({
        title: 'Formato de archivo inválido',
        text: validation.error!
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedEPS || !selectedPeriodo) return;

    setUploading(true);
    showLoading('Procesando archivo Excel...', 'Validando datos y creando registros');

    try {
      const response = await carteraAPI.uploadExcel(
        selectedFile,
        selectedEPS.id,
        selectedPeriodo.id
      );

      close();
      
      if (response.success) {
        // Mapear la respuesta de la API al formato local
        const localResult: LocalUploadResult = {
          processed: response.data.processed,
          errors: response.data.errors
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
          text: response.message
        });
      }

    } catch (error: any) {
      close();
      showError({
        title: 'Error en la importación',
        text: error.message || 'Ocurrió un error al procesar el archivo'
      });
    } finally {
      setUploading(false);
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
    } catch (error) {
      close();
      showError({
        title: 'Error al descargar',
        text: 'No se pudo generar la plantilla'
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    return carteraUtils.formatFileSize(bytes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <CloudArrowUpIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Importar Datos de Cartera</h2>
                <p className="text-primary-100 text-sm">Cargar información desde archivo Excel</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información del Contexto */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="w-8 h-8 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-800">EPS Seleccionada</p>
                  <p className="text-lg font-bold text-primary-900">{selectedEPS?.nombre || 'No seleccionada'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Período Seleccionado</p>
                  <p className="text-lg font-bold text-blue-900">
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
                  <li>• Completa los datos de cartera por IPS en los campos A30, A60, A90, A120, A180, A360, {'>'}360</li>
                  <li>• Si una IPS no existe en el sistema, se creará automáticamente</li>
                  <li>• El archivo debe ser formato .xlsx o .xls y no mayor a 50MB</li>
                  <li>• El campo "Total" se calculará automáticamente</li>
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
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-4">
                  <CheckCircleIcon className="w-16 h-16 text-success-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-success-900 mb-2">Archivo seleccionado</h3>
                    <div className="bg-white border border-success-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-8 h-8 text-success-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-success-600 hover:text-success-800 font-medium text-sm"
                  >
                    Seleccionar otro archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Arrastra el archivo Excel aquí
                    </h3>
                    <p className="text-gray-600 mb-4">o</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      Seleccionar Archivo
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Formatos soportados: .xlsx, .xls (máx. 50MB)
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
                      <ul className="space-y-1 text-sm">
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
                  <CloudArrowUpIcon className="w-5 h-5" />
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