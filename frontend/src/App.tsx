// frontend/src/App.tsx - ACTUALIZACIÓN DE RUTAS PARA EL NUEVO MÓDULO DASHBOARDS EPS/IPS
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard/Dashboard';
import InformacionCartera from './components/cartera/InformacionCartera';
import { InformacionFlujo } from './components/flujo/InformacionFlujo';
import { InformacionAdres } from './components/adres/InformacionAdres';
import GestionEPS from './components/gestion/GestionEPS';
import GestionIPS from './components/gestion/GestionIPS';
import { DashboardsEpsIps } from './components/dashboards-eps-ips'; //
import { ReporteEjecutivoEPS } from './components/dashboards-eps-ips/reportes/ReporteEjecutivoEPS';

import './App.css';

function App() {
  return (    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Layout>
            <Routes>
              {/* Ruta principal - Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Módulo de Carga de Información */}
              <Route path="/carga/cartera" element={<InformacionCartera />} />
              <Route path="/carga/flujo" element={<InformacionFlujo />} />
              <Route path="/carga/adres" element={<InformacionAdres />} />
              
              {/* ✅ NUEVO MÓDULO UNIFICADO: Dashboards EPS/IPS */}
              <Route path="/dashboards/eps-ips" element={<DashboardsEpsIps />} />
              <Route path="/dashboards/eps-ips/*" element={<DashboardsEpsIps />} />
              
              {/* ✅ REDIRECCIONES: Rutas antiguas del módulo de dashboards EPS */}
              {/* Todas las rutas anteriores ahora redirigen al nuevo módulo unificado */}
              <Route 
                path="/dashboards/cartera/periodo" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              <Route 
                path="/dashboards/cartera/eps-ips" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              <Route 
                path="/dashboards/cartera/ips" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              <Route 
                path="/dashboards/cartera/total" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              <Route 
                path="/dashboards/flujo" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              
              {/* Compatibilidad con rutas que puedan existir en marcadores */}
              <Route 
                path="/dashboards/cartera/*" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              <Route 
                path="/dashboards/*" 
                element={<Navigate to="/dashboards/eps-ips" replace />} 
              />
              
              {/* Módulo de Gestión */}
              <Route path="/gestion/eps" element={<GestionEPS />} />
              <Route path="/gestion/ips" element={<GestionIPS />} />
              
              {/* Módulo de Información Base */}
              <Route path="/base/cartera" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Información Base - Cartera
                    </h1>
                    <p className="text-gray-600">
                      Módulo de información base para datos de cartera.
                    </p>
                  </div>
                </div>
              } />
              <Route path="/base/adres" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Información Base - ADRES
                    </h1>
                    <p className="text-gray-600">
                      Módulo de información base para datos de ADRES.
                    </p>
                  </div>
                </div>
              } />
              <Route path="/base/flujo" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Información Base - Flujo
                    </h1>
                    <p className="text-gray-600">
                      Módulo de información base para datos de flujo.
                    </p>
                  </div>
                </div>
              } />
              
              {/* Módulo de Reportes */}
              <Route path="/reportes/mensuales" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Reportes Mensuales
                    </h1>
                    <p className="text-gray-600">
                      Módulo de generación de reportes mensuales.
                    </p>
                  </div>
                </div>
              } />
              <Route path="/reportes/tendencias" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Análisis de Tendencias
                    </h1>
                    <p className="text-gray-600">
                      Módulo de análisis y tendencias de datos.
                    </p>
                  </div>
                </div>
              } />
              
              {/* Módulo de Configuración */}
              <Route path="/configuracion/sistema" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Configuración del Sistema
                    </h1>
                    <p className="text-gray-600">
                      Configuración general del sistema.
                    </p>
                  </div>
                </div>
              } />
              <Route path="/configuracion/usuarios" element={
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Gestión de Usuarios
                    </h1>
                    <p className="text-gray-600">
                      Administración de usuarios del sistema.
                    </p>
                  </div>
                </div>
              } />
              
              {/* Ruta 404 - Redirigir al dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;