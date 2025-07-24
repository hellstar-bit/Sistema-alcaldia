import React, { useState } from 'react'
import './App.css'

function App() {
  const [selectedEPS, setSelectedEPS] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  // Datos de prueba
  const epsData = [
    { codigo: 'COMPENSAR', nombre: 'COMPENSAR EPS', estado: 'loaded' },
    { codigo: 'COOSALUD', nombre: 'COOSALUD EPS', estado: 'empty' },
    { codigo: 'FAMISANAR', nombre: 'FAMISANAR EPS', estado: 'empty' },
    { codigo: 'SANITAS', nombre: 'SANITAS EPS', estado: 'loaded' },
    { codigo: 'SURA', nombre: 'SURA EPS', estado: 'loaded' },
  ]

  const handleUpload = () => {
    setUploadStatus('uploading')
    setTimeout(() => {
      setUploadStatus('success')
      setTimeout(() => setUploadStatus('idle'), 2000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Alcaldía de Barranquilla</h1>
                <p className="text-primary-200 text-sm">Sistema de Gestión Presupuestal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary-200">Admin Usuario</span>
              <div className="w-8 h-8 bg-primary-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><span className="text-gray-500">Inicio</span></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-500">Carga de Información</span></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-primary-900 font-medium">Información Cartera</span></li>
          </ol>
        </nav>

        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-2">
            📊 Módulo de Carga de Información - Cartera
          </h2>
          <p className="text-gray-600">
            Gestión de cartera y distribución de deudas del sector salud (EPS/IPS)
          </p>
        </div>

        {/* Upload Section */}
        <div className="card p-6 mb-8">
          <h3 className="text-xl font-semibold text-primary-900 mb-4">
            📁 Cargar Archivo Excel
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-primary-500 transition-colors">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-600 mb-4">
              Arrastra tu archivo Excel aquí o haz clic para seleccionar
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                className="btn-primary"
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cargando...
                  </div>
                ) : (
                  'Seleccionar Archivo'
                )}
              </button>
              <button className="btn-outline">
                📥 Descargar Plantilla
              </button>
            </div>
          </div>

          {uploadStatus === 'success' && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-success-500 text-xl mr-3">✅</div>
                <div>
                  <p className="text-success-800 font-medium">¡Archivo cargado exitosamente!</p>
                  <p className="text-success-600 text-sm">Se procesaron 1,250 registros correctamente</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control de Carga */}
        <div className="card mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-primary-900">
              📋 Control de Carga por EPS
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Estado de carga de información por entidad promotora de salud
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="table-cell text-left font-semibold">EPS</th>
                  <th className="table-cell text-center font-semibold">ENE</th>
                  <th className="table-cell text-center font-semibold">FEB</th>
                  <th className="table-cell text-center font-semibold">MAR</th>
                  <th className="table-cell text-center font-semibold">ABR</th>
                  <th className="table-cell text-center font-semibold">MAY</th>
                  <th className="table-cell text-center font-semibold">JUN</th>
                  <th className="table-cell text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {epsData.map((eps, index) => (
                  <tr 
                    key={eps.codigo} 
                    className={`table-row cursor-pointer ${selectedEPS === eps.codigo ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedEPS(selectedEPS === eps.codigo ? null : eps.codigo)}
                  >
                    <td className="table-cell font-medium text-primary-900">
                      {eps.nombre}
                    </td>
                    <td className="table-cell text-center">
                      {eps.estado === 'loaded' && index % 2 === 0 ? (
                        <span className="text-success-500 text-xl">✅</span>
                      ) : (
                        <span className="text-danger-500 text-xl">❌</span>
                      )}
                    </td>
                    <td className="table-cell text-center">
                      {eps.estado === 'loaded' ? (
                        <span className="text-success-500 text-xl">✅</span>
                      ) : (
                        <span className="text-danger-500 text-xl">❌</span>
                      )}
                    </td>
                    <td className="table-cell text-center">
                      {eps.estado === 'loaded' && index % 3 === 0 ? (
                        <span className="text-success-500 text-xl">✅</span>
                      ) : (
                        <span className="text-danger-500 text-xl">❌</span>
                      )}
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-danger-500 text-xl">❌</span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-danger-500 text-xl">❌</span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="text-danger-500 text-xl">❌</span>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="btn-secondary text-xs px-2 py-1">
                          Ver Detalle
                        </button>
                        <button className="btn-success text-xs px-2 py-1">
                          Exportar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalle de EPS Seleccionada */}
        {selectedEPS && (
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-primary-900">
                📊 Detalle de Cartera - {selectedEPS}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Información detallada por IPS y plazos de vencimiento
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell text-left font-semibold">IPS</th>
                    <th className="table-cell text-right font-semibold">A30</th>
                    <th className="table-cell text-right font-semibold">A60</th>
                    <th className="table-cell text-right font-semibold">A90</th>
                    <th className="table-cell text-right font-semibold">A120</th>
                    <th className="table-cell text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row">
                    <td className="table-cell font-medium">CLÍNICA LA MERCED BARRANQUILLA</td>
                    <td className="table-cell text-right">$2,956,512.00</td>
                    <td className="table-cell text-right">$6,927,601.00</td>
                    <td className="table-cell text-right">$24,448,736.00</td>
                    <td className="table-cell text-right">$57,557,846.00</td>
                    <td className="table-cell text-right font-bold text-primary-900">$91,890,695.00</td>
                  </tr>
                  <tr className="table-row">
                    <td className="table-cell font-medium">FUNDACIÓN OFTALMOLÓGICA DEL CARIBE</td>
                    <td className="table-cell text-right">$6,641,716.00</td>
                    <td className="table-cell text-right">$9,413,973.00</td>
                    <td className="table-cell text-right">$1,236,637.00</td>
                    <td className="table-cell text-right">$0.00</td>
                    <td className="table-cell text-right font-bold text-primary-900">$17,292,326.00</td>
                  </tr>
                  <tr className="table-row">
                    <td className="table-cell font-medium">CLÍNICA REINA CATALINA & CÍA. LTDA.</td>
                    <td className="table-cell text-right">$0.00</td>
                    <td className="table-cell text-right">$9,921,965.00</td>
                    <td className="table-cell text-right">$15,024,300.00</td>
                    <td className="table-cell text-right">$8,456,231.00</td>
                    <td className="table-cell text-right font-bold text-primary-900">$33,402,496.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-primary-100 border-t-2 border-primary-300">
                    <td className="table-cell font-bold text-primary-900">TOTAL GENERAL</td>
                    <td className="table-cell text-right font-bold text-primary-900">$9,598,228.00</td>
                    <td className="table-cell text-right font-bold text-primary-900">$26,263,539.00</td>
                    <td className="table-cell text-right font-bold text-primary-900">$40,709,673.00</td>
                    <td className="table-cell text-right font-bold text-primary-900">$66,014,077.00</td>
                    <td className="table-cell text-right font-bold text-primary-900 text-lg">$142,585,517.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">Sistema funcionando correctamente</span>
            <div className="text-xs text-gray-500">
              | Tailwind CSS ✅ | React ✅ | Vite ✅
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
