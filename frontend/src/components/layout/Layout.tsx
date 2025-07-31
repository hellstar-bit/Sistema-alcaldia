// frontend/src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

// Hook personalizado para detectar el tamaño de pantalla
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < 768,
    isTablet: screenSize.width >= 768 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024,
    isLarge: screenSize.width >= 1280,
  };
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const screenSize = useScreenSize();

  // Auto-colapsar sidebar en tablet
  useEffect(() => {
    if (screenSize.isTablet && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
    
    // Auto-expandir en desktop large
    if (screenSize.isLarge && sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  }, [screenSize.isTablet, screenSize.isLarge]);

  // Cerrar sidebar en mobile cuando se redimensiona a desktop
  useEffect(() => {
    if (screenSize.isDesktop && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [screenSize.isDesktop]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Calcular el margen izquierdo para el contenido principal
  const getMainContentMargin = () => {
    if (screenSize.isMobile) return 'ml-0';
    if (screenSize.isTablet) return sidebarCollapsed ? 'md:ml-16' : 'md:ml-72';
    return sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80';
  };

  // Calcular padding del contenido basado en el tamaño de pantalla
  const getContentPadding = () => {
    if (screenSize.isMobile) return 'p-4';
    if (screenSize.isTablet) return 'p-5';
    return 'p-6';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={toggleSidebarCollapse}
      />
      
      {/* Main Content Area */}
      <div className={`
        flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out
        ${getMainContentMargin()}
      `}>
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          onCollapseClick={toggleSidebarCollapse}
          isSidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Page Content */}
        <main className={`
          flex-1 overflow-auto bg-gray-50 
          ${getContentPadding()}
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
        `}>
          <div className={`
            max-w-none
            ${screenSize.isMobile ? 'min-h-[calc(100vh-8rem)]' : 'min-h-[calc(100vh-6rem)]'}
          `}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};