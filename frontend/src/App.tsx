// frontend/src/App.tsx - ACTUALIZACIÓN PARA INCLUIR DASHBOARDS EPS E IPS
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
import { DashboardsEpsIps } from './components/dashboards-eps-ips'; // ✅ NUEVO COMPONENTE
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
              <Route path="/carga/flujo" element={<InformacionFlujo />} />
              <Route path="/carga/adres" element={<InformacionAdres />} />
              
              {/* ✅ NUEVO MÓDULO: Dashboards EPS e IPS */}
              <Route path="/dashboards/eps-ips" element={<DashboardsEpsIps />} />
              <Route path="/dashboards/eps-ips/*" element={<DashboardsEpsIps />} />
              
              {/* Módulos Antiguos de Dashboards (ahora redirigen al nuevo) */}
              <Route path="/dashboards/cartera/periodo" element={<Navigate to="/dashboards/eps-ips" replace />} />
              <Route path="/dashboards/cartera/eps-ips" element={<Navigate to="/dashboards/eps-ips" replace />} />
              <Route path="/dashboards/cartera/ips" element={<Navigate to="/dashboards/eps-ips" replace />} />
              <Route path="/dashboards/cartera/total" element={<Navigate to="/dashboards/eps-ips" replace />} />
              <Route path="/dashboards/flujo" element={<Navigate to="/dashboards/eps-ips" replace />} />
              
              {/* Módulo de Gestión */}
              <Route path="/gestion/eps" element={<GestionEPS />} />
              <Route path="/gestion/ips" element={<GestionIPS />} />
              
              {/* Módulo de Información Base */}
              <Route path="/base/cartera" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-primary-900">Información Base - Cartera</h1>
                  <p className="text-gray-600 mt-2">Consulta de datos maestros de cartera...</p>
                </div>
              } />
              <Route path="/base/adres" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-primary-900">Información Base - ADRES</h1>
                  <p className="text-gray-600 mt-2">Consulta de datos maestros de ADRES...</p>
                </div>
              } />
              <Route path="/base/flujo" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-primary-900">Información Base - Flujo</h1>
                  <p className="text-gray-600 mt-2">Consulta de datos maestros de flujo...</p>
                </div>
              } />
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
                  <p className="text-gray-600">La página que buscas no existe.</p>
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
