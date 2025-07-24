// frontend/src/components/layout/Layout.tsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content - CORRECCIÓN CRÍTICA AQUÍ */}
      <div className="lg:ml-80 flex flex-col min-h-screen">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Page Content - CONTENEDOR RESPONSIVO MEJORADO */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
