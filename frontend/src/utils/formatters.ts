// frontend/src/utils/formatters.ts - UTILIDADES DE FORMATO
export const formatCurrency = (value: number, abbreviated: boolean = false): string => {
  if (!value && value !== 0) return '$0';
  
  if (abbreviated) {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  if (!value && value !== 0) return '0';
  return value.toLocaleString('es-CO');
};

// frontend/src/utils/exportUtils.ts - UTILIDADES DE EXPORTACIÓN
export const exportToPDF = async (data: any, filename: string): Promise<void> => {
  console.log('📄 Exportando a PDF:', filename);
  // Implementación real con jsPDF o similar
  alert('Funcionalidad de exportación PDF en desarrollo');
};

export const exportToExcel = async (data: any, filename: string): Promise<void> => {
  console.log('📊 Exportando a Excel:', filename);
  // Implementación real con XLSX
  alert('Funcionalidad de exportación Excel en desarrollo');
};