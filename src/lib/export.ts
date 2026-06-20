import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadPDF(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const doc = new jsPDF();
  
  const title = filename.replace(/\.(csv|pdf)$/i, '').toUpperCase();
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  const headers = Object.keys(rows[0]);
  const data = rows.map(row => headers.map(h => String(row[h] ?? '')));

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: { fontSize: 8, font: 'helvetica' },
    headStyles: { fillColor: [0, 102, 204] }
  });

  const finalFilename = filename.endsWith('.pdf') ? filename : filename.replace(/\.csv$/i, '.pdf');
  doc.save(finalFilename);
}
