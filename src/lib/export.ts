import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TenantConfig, RentRecord, WaterReading } from '@/stores/billingStore';

// ── Corporate Header Helper ───────────────────────────────────────────────
function drawCorporateHeader(doc: jsPDF, title: string, subtitle?: string) {
  // RentFlow Logo Mark (Drawn as vectors to match favicon)
  doc.setFillColor(10, 10, 10);
  doc.roundedRect(14, 14, 12, 12, 2.6, 2.6, 'F');
  
  // Roof
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.6);
  doc.line(15.68, 18.87, 20.00, 16.06);
  doc.line(20.00, 16.06, 24.31, 18.87);
  
  // Building body
  doc.setFillColor(10, 10, 10);
  doc.setLineWidth(0.56);
  doc.roundedRect(16.62, 18.68, 6.75, 5.25, 0.45, 0.45, 'FD');
  
  // Windows & Door
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(17.56, 19.81, 1.5, 1.31, 0.22, 0.22, 'F');
  doc.roundedRect(20.93, 19.81, 1.5, 1.31, 0.22, 0.22, 'F');
  doc.roundedRect(19.06, 21.68, 1.87, 2.25, 0.22, 0.22, 'F');

  // Company Name
  doc.setTextColor(20, 30, 50); // Dark navy
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RENTFLOW', 30, 21);
  
  // Tagline
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPERTY MANAGEMENT', 30, 25);

  // Corporate Address (Right aligned)
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RentFlow Properties Ltd', 196, 16, { align: 'right' });
  doc.text('123 Business Park, Nairobi, Kenya', 196, 20, { align: 'right' });
  doc.text('+254 712 345 678 | admin@rentflow.co.ke', 196, 24, { align: 'right' });

  // Divider Line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // Document Title
  doc.setTextColor(20, 30, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 42);

  if (subtitle) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 48);
  }

  return subtitle ? 52 : 46; // Return next Y position
}

// ── Generic flat-table PDF ─────────────────────────────────────────────────

export function downloadPDF(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const doc = new jsPDF();
  const title = filename.replace(/\.(csv|pdf)$/i, '').replace(/-/g, ' ');
  
  const startY = drawCorporateHeader(doc, title, `Generated on ${new Date().toLocaleDateString()}`);

  const headers = Object.keys(rows[0]);
  const data    = rows.map(row => headers.map(h => String(row[h] ?? '')));

  autoTable(doc, {
    startY: startY + 4,
    head: [headers],
    body: data,
    theme: 'grid',
    styles:     { fontSize: 8, font: 'helvetica', cellPadding: 4 },
    headStyles: { fillColor: [245, 245, 245], textColor: [20, 30, 50], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
  });

  doc.save(filename.endsWith('.pdf') ? filename : filename.replace(/\.csv$/i, '.pdf'));
}

// ── Tenant combined statement (rent + water) ───────────────────────────────

export function downloadTenantStatement(
  tenant: TenantConfig,
  rentRecords: RentRecord[],
  waterReadings: WaterReading[],
): void {
  const doc = new jsPDF();

  const startY = drawCorporateHeader(doc, 'Tenant Statement', `Generated: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`);

  // ── Tenant info box ───────────────────────────────────────────────────────
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, startY, 182, 34, 2, 2, 'FD');

  doc.setTextColor(20, 30, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tenant.first_name} ${tenant.last_name}`, 20, startY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Unit: ${tenant.unit}`, 20, startY + 16);
  doc.text(`Property: ${tenant.property}`, 20, startY + 23);
  doc.text(`Phone: ${tenant.phone || '—'}`, 20, startY + 30);
  
  doc.text(`Email: ${tenant.email || '—'}`, 80, startY + 16);
  doc.text(`Monthly Rent: KSh ${tenant.rent_amount.toLocaleString()}`, 80, startY + 23);
  doc.text(`Water Rate: KSh ${tenant.water_rate}/m³`, 80, startY + 30);

  // ── Outstanding balance ───────────────────────────────────────────────────
  const rentOutstanding  = rentRecords.reduce((s, r) => s + r.balance, 0);
  const waterOutstanding = waterReadings.reduce((s, r) => s + r.balance, 0);
  const totalOutstanding = rentOutstanding + waterOutstanding;
  
  const totalRentPaid    = rentRecords.reduce((s, r) => s + r.amount_paid, 0);
  const totalWaterPaid   = waterReadings.reduce((s, r) => s + r.amount_paid, 0);

  doc.setTextColor(totalOutstanding > 0 ? 220 : 20, totalOutstanding > 0 ? 38 : 120, totalOutstanding > 0 ? 38 : 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Total Outstanding: KSh ${totalOutstanding.toLocaleString()}`,
    190, startY + 16, { align: 'right' }
  );
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Rent Paid: KSh ${totalRentPaid.toLocaleString()}`, 190, startY + 23, { align: 'right' });
  doc.text(`Total Water Paid: KSh ${totalWaterPaid.toLocaleString()}`, 190, startY + 30, { align: 'right' });

  // ── Rent history table ────────────────────────────────────────────────────
  doc.setTextColor(20, 30, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rent Payment History', 14, startY + 46);

  autoTable(doc, {
    startY: startY + 50,
    head: [['Period', 'Rent Due (KES)', 'Paid (KES)', 'Balance (KES)', 'Status']],
    body: rentRecords.map(r => [
      r.period,
      r.rent_due.toLocaleString(),
      r.amount_paid.toLocaleString(),
      r.balance.toLocaleString(),
      r.status.toUpperCase(),
    ]),
    theme: 'grid',
    styles:     { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [245, 245, 245], textColor: [20, 30, 50], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const val = String(data.cell.raw).toLowerCase();
        if (val === 'unpaid')  data.cell.styles.textColor = [220, 38, 38];
        if (val === 'paid')    data.cell.styles.textColor = [5, 150, 105];
        if (val === 'partial') data.cell.styles.textColor = [37, 99, 235];
      }
      if (data.column.index === 3 && data.section === 'body') {
        const val = parseFloat(String(data.cell.raw).replace(/,/g, ''));
        if (val > 0) data.cell.styles.textColor = [220, 38, 38];
        else         data.cell.styles.textColor = [5, 150, 105];
      }
    },
  });

  const afterRentY = (doc as any).lastAutoTable.finalY + 14;

  // ── Water billing table ───────────────────────────────────────────────────
  doc.setTextColor(20, 30, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Water Billing History', 14, afterRentY);

  autoTable(doc, {
    startY: afterRentY + 4,
    head: [['Period', 'Prev (m³)', 'Curr (m³)', 'Consumed (m³)', 'Rate (KES/m³)', 'Bill (KES)', 'Status']],
    body: waterReadings.map(r => [
      r.period,
      r.prev_reading.toLocaleString(),
      r.curr_reading.toLocaleString(),
      r.units_consumed.toLocaleString(),
      r.rate.toLocaleString(),
      r.amount.toLocaleString(),
      r.status.toUpperCase(),
    ]),
    theme: 'grid',
    styles:     { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [240, 248, 255], textColor: [14, 116, 144], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'center' },
    },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `© ${new Date().getFullYear()} RentFlow Properties Ltd · Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`statement-${tenant.first_name}-${tenant.last_name}-${dateStr}.pdf`);
}

// ── Property report ────────────────────────────────────────────────────────

export function downloadPropertyReport(
  property: { name: string; address: string; type: string; total_units: number; occupied: number },
  tenantRows: Record<string, unknown>[],
): void {
  const doc = new jsPDF();

  const startY = drawCorporateHeader(doc, 'Property Report', `Generated: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`);

  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, startY, 182, 30, 2, 2, 'FD');

  doc.setTextColor(20, 30, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(property.name, 20, startY + 9);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(property.address, 20, startY + 16);
  doc.text(`Type: ${property.type}`, 20, startY + 23);
  doc.text(`Occupancy: ${property.occupied}/${property.total_units} units`, 90, startY + 23);

  doc.setTextColor(20, 30, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tenant Rent Status', 14, startY + 42);

  if (tenantRows.length) {
    const headers = Object.keys(tenantRows[0]);
    autoTable(doc, {
      startY: startY + 46,
      head: [headers],
      body: tenantRows.map(r => headers.map(h => String(r[h] ?? ''))),
      theme: 'grid',
      styles:     { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [245, 245, 245], textColor: [20, 30, 50], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
      bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [252, 252, 252] },
    });
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `© ${new Date().getFullYear()} RentFlow Properties Ltd · Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`property-report-${property.name.replace(/\s+/g, '-').toLowerCase()}-${dateStr}.pdf`);
}

// ── Payment Receipt ────────────────────────────────────────────────────────

export function downloadReceipt(
  tenant: TenantConfig,
  periodName: string,
  rentPaid: number,
  waterPaid: number,
  paymentMethod: string,
  waterReading?: WaterReading
): void {
  const doc = new jsPDF();

  const startY = drawCorporateHeader(doc, 'Payment Receipt', `Date: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`);

  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, startY, 182, 34, 2, 2, 'FD');

  doc.setTextColor(20, 30, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Received From: ${tenant.first_name} ${tenant.last_name}`, 20, startY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Unit: ${tenant.unit}`, 20, startY + 16);
  doc.text(`Property: ${tenant.property}`, 20, startY + 23);
  doc.text(`Billing Period: ${periodName}`, 20, startY + 30);
  
  doc.text(`Payment Method: ${paymentMethod}`, 100, startY + 16);
  doc.text(`Receipt No: RCT-${Math.floor(Math.random() * 1000000)}`, 100, startY + 23);

  const totalPaid = rentPaid + waterPaid;
  doc.setTextColor(20, 30, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', 14, startY + 46);

  const tableBody = [
    ['Rent Payment', rentPaid.toLocaleString()],
    ['Water Bill Payment', waterPaid.toLocaleString()],
  ];

  if (waterReading && waterReading.curr_reading > 0) {
    tableBody.push([
      `Water Readings (Prev: ${waterReading.prev_reading} m³, Curr: ${waterReading.curr_reading} m³)`,
      ''
    ]);
  }

  tableBody.push(['Total Paid', totalPaid.toLocaleString()]);

  autoTable(doc, {
    startY: startY + 50,
    head: [['Description', 'Amount Paid (KES)']],
    body: tableBody,
    theme: 'grid',
    styles:     { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [245, 245, 245], textColor: [20, 30, 50], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      const isTotalRow = data.row.index === tableBody.length - 1;
      const isReadingRow = waterReading && waterReading.curr_reading > 0 && data.row.index === 2;

      if (isTotalRow && data.section === 'body') {
        data.cell.styles.fillColor = [240, 248, 255];
        data.cell.styles.textColor = [14, 116, 144];
      }
      if (isReadingRow && data.section === 'body') {
        data.cell.styles.textColor = [120, 120, 120];
        data.cell.styles.fontStyle = 'italic';
      }
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `© ${new Date().getFullYear()} RentFlow Properties Ltd · Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`receipt-${tenant.first_name}-${tenant.last_name}-${periodName.replace(/\s+/g, '-')}-${dateStr}.pdf`);
}
