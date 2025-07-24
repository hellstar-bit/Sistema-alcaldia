// frontend/src/App.tsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;