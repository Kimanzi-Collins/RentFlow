import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TenantConfig, RentRecord, WaterReading } from '@/stores/billingStore';

// ── Generic flat-table PDF ─────────────────────────────────────────────────

export function downloadPDF(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const doc = new jsPDF();
  const title = filename.replace(/\.(csv|pdf)$/i, '').replace(/-/g, ' ').toUpperCase();
  doc.setFontSize(16);
  doc.text('RENTFLOW', 14, 16);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(title, 14, 24);
  doc.setTextColor(0);

  const headers = Object.keys(rows[0]);
  const data    = rows.map(row => headers.map(h => String(row[h] ?? '')));

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: data,
    theme: 'grid',
    styles:     { fontSize: 8, font: 'helvetica' },
    headStyles: { fillColor: [23, 23, 23], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
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

  // ── Header block ──────────────────────────────────────────────────────────
  doc.setFillColor(23, 23, 23);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RENTFLOW', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tenant Statement', 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 29);

  doc.setTextColor(0);

  // ── Tenant info box ───────────────────────────────────────────────────────
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, 42, 182, 38, 3, 3, 'F');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tenant.first_name} ${tenant.last_name}`, 20, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(`Unit: ${tenant.unit}`, 20, 60);
  doc.text(`Property: ${tenant.property}`, 20, 67);
  doc.text(`Monthly Rent: KSh ${tenant.rent_amount.toLocaleString()}`, 80, 60);
  doc.text(`Water Rate: KSh ${tenant.water_rate}/m³`, 80, 67);
  doc.text(`Phone: ${tenant.phone || '—'}`, 140, 60);
  doc.text(`Email: ${tenant.email || '—'}`, 140, 67);

  // ── Outstanding balance ───────────────────────────────────────────────────
  const totalOutstanding = rentRecords.reduce((s, r) => s + r.balance, 0);
  const totalRentPaid    = rentRecords.reduce((s, r) => s + r.amount_paid, 0);
  const totalWaterBilled = waterReadings.reduce((s, r) => s + r.amount, 0);

  doc.setTextColor(totalOutstanding > 0 ? 220 : 5, totalOutstanding > 0 ? 38 : 150, totalOutstanding > 0 ? 38 : 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Outstanding Balance: KSh ${totalOutstanding.toLocaleString()}`,
    196, 52, { align: 'right' }
  );
  doc.setTextColor(80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Rent Paid: KSh ${totalRentPaid.toLocaleString()}`, 196, 60, { align: 'right' });
  doc.text(`Total Water Billed: KSh ${totalWaterBilled.toLocaleString()}`, 196, 67, { align: 'right' });

  doc.setTextColor(0);

  // ── Rent history table ────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rent Payment History', 14, 92);

  autoTable(doc, {
    startY: 96,
    head: [['Period', 'Rent Due (KES)', 'Paid (KES)', 'Balance (KES)', 'Status']],
    body: rentRecords.map(r => [
      r.period,
      r.rent_due.toLocaleString(),
      r.amount_paid.toLocaleString(),
      r.balance.toLocaleString(),
      r.status.toUpperCase(),
    ]),
    theme: 'grid',
    styles:     { fontSize: 8 },
    headStyles: { fillColor: [23, 23, 23], textColor: 255 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center' },
    },
    bodyStyles: { textColor: 40 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
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
    styles:     { fontSize: 8 },
    headStyles: { fillColor: [14, 116, 144], textColor: 255 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'center' },
    },
    bodyStyles: { textColor: 40 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(
      `© 2026 Collins Mwandikwa · RentFlow · Page ${i} of ${pageCount}`,
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

  doc.setFillColor(23, 23, 23);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RENTFLOW', 14, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Property Report', 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 29);

  doc.setTextColor(0);

  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, 42, 182, 30, 3, 3, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(property.name, 20, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(property.address, 20, 60);
  doc.text(`Type: ${property.type}  ·  ${property.occupied}/${property.total_units} units occupied`, 20, 67);
  doc.setTextColor(0);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tenant Rent Status', 14, 84);

  if (tenantRows.length) {
    const headers = Object.keys(tenantRows[0]);
    autoTable(doc, {
      startY: 88,
      head: [headers],
      body: tenantRows.map(r => headers.map(h => String(r[h] ?? ''))),
      theme: 'grid',
      styles:     { fontSize: 8 },
      headStyles: { fillColor: [23, 23, 23], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`property-report-${property.name.replace(/\s+/g, '-').toLowerCase()}-${dateStr}.pdf`);
}
