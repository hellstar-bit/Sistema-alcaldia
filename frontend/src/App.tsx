// frontend/src/App.tsx - VERSIÓN CON ROUTING COMPLETO
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard/Dashboard';
import InformacionCartera from './components/cartera/InformacionCartera';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Layout>
            <Routes>
              {/* Ruta principal - Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Módulo de Carga de Información */}
              <Route path="/carga/cartera" element={<InformacionCartera />} />
              <Route path="/carga/flujo" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Información Flujo</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              
              {/* Módulo de Dashboards EPS */}
              <Route path="/dashboards/cartera/periodo" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Dashboard por Período</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/dashboards/cartera/eps-ips" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Dashboard EPS e IPS</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/dashboards/cartera/ips" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Dashboard IPS</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/dashboards/cartera/total" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Dashboard Total</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/dashboards/flujo" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Dashboard Flujo</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              
              {/* Módulo de Información Base */}
              <Route path="/base/cartera" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Base Cartera</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/base/adres" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Base ADRES</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/base/flujo" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Base Flujo</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              
              {/* Módulo de Reportes */}
              <Route path="/reportes/mensuales" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Reportes Mensuales</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/reportes/tendencias" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Análisis de Tendencias</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              
              {/* Módulo de Configuración */}
              <Route path="/config/usuarios" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Gestión de Usuarios</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              <Route path="/config/parametros" element={<div className="p-6"><h1 className="text-2xl font-bold text-primary-900">Parámetros del Sistema</h1><p className="text-gray-600 mt-2">Módulo en desarrollo...</p></div>} />
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🚧</span>
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 mb-2">Página no encontrada</h1>
                    <p className="text-gray-600 mb-6">La página que buscas no existe o está en desarrollo.</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="btn-primary"
                    >
                      Volver al Dashboard
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </Layout>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;