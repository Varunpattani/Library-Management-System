'use client';

import { Download, Printer } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers: string[];
  title: string;
}

export function ExportButton({ data, filename, headers, title }: ExportButtonProps) {
  const exportToCSV = () => {
    // Convert data to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = getNestedValue(row, header);
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '');
          return stringValue.includes(',') || stringValue.includes('"') 
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printReport = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML for printing
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #333; margin-bottom: 10px; }
            .report-date { color: #666; margin-bottom: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${formatHeader(header)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => 
                `<tr>
                  ${headers.map(header => `<td>${getNestedValue(row, header) || ''}</td>`).join('')}
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        title="Export to CSV"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
      <button
        onClick={printReport}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        title="Print Report"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return current[key];
    }
    return '';
  }, obj);
}

// Helper function to format header names
function formatHeader(header: string): string {
  return header
    .split('.')
    .pop() // Get the last part after dots
    ?.replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim() || header;
}
