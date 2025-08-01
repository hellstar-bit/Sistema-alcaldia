// frontend/src/utils/exportUtils.ts - CREAR ESTE ARCHIVO PRIMERO
export const exportToPDF = async (data: any, filename: string): Promise<void> => {
  console.log('📄 Exportando a PDF:', filename, data);
  
  // Implementación básica para desarrollo
  // En producción, usar librerías como jsPDF, html2pdf, etc.
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.pdf', '.json'); // Temporal para desarrollo
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Mostrar mensaje al usuario
  alert(`Archivo ${filename} preparado para descarga (formato JSON temporal)`);
};

export const exportToExcel = async (data: any, filename: string): Promise<void> => {
  console.log('📊 Exportando a Excel:', filename, data);
  
  // Implementación básica para desarrollo
  // En producción, usar librerías como XLSX, ExcelJS, etc.
  let csvContent = '';
  
  if (Array.isArray(data) && data.length > 0) {
    // Convertir array de objetos a CSV
    const headers = Object.keys(data[0].data[0]);
    csvContent = headers.join(',') + '\n';
    
    data.forEach(sheet => {
      sheet.data.forEach((row: any[]) => {
        csvContent += row.join(',') + '\n';
      });
    });
  } else {
    csvContent = JSON.stringify(data, null, 2);
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.xlsx', '.csv'); // Temporal para desarrollo
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Mostrar mensaje al usuario
  alert(`Archivo ${filename} preparado para descarga (formato CSV temporal)`);
};