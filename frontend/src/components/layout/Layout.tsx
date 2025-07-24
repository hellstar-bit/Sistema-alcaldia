// frontend/src/components/layout/Layout.tsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : ''}`}>
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          onCollapseClick={toggleSidebarCollapse}
          isSidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
