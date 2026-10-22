import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TenantConfig, RentRecord, WaterReading } from '@/stores/billingStore';
import { useAuthStore } from '@/stores/authStore';
import { combinedStatus } from '@/lib/balances';
import type { TenantBalance } from '@/lib/balances';

// Landlord details printed on tenant-facing documents come from the signed-in profile
// (Settings → company name, phone, email) instead of placeholder text.
function senderDetails() {
  const p = useAuthStore.getState().profile;
  return {
    name: p?.company_name?.trim() || p?.full_name?.trim() || 'RentFlow',
    contact: [p?.phone, p?.email].filter(Boolean).join(' | '),
  };
}

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
  const sender = senderDetails();
  doc.text(sender.name, 196, 18, { align: 'right' });
  if (sender.contact) doc.text(sender.contact, 196, 23, { align: 'right' });

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
    190, startY + 9, { align: 'right' }
  );
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rent Outstanding: KSh ${rentOutstanding.toLocaleString()}`, 190, startY + 16, { align: 'right' });
  doc.text(`Water Outstanding: KSh ${waterOutstanding.toLocaleString()}`, 190, startY + 23, { align: 'right' });
  doc.setFontSize(8);
  doc.text(
    `Paid to date - Rent: KSh ${totalRentPaid.toLocaleString()} | Water: KSh ${totalWaterPaid.toLocaleString()}`,
    190, startY + 30, { align: 'right' }
  );

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
    head: [['Period', 'Prev (m³)', 'Curr (m³)', 'Used (m³)', 'Rate', 'Bill (KES)', 'Paid (KES)', 'Balance (KES)', 'Status']],
    body: waterReadings.map(r => [
      r.period,
      r.prev_reading.toLocaleString(),
      r.curr_reading.toLocaleString(),
      r.units_consumed.toLocaleString(),
      r.rate.toLocaleString(),
      r.amount.toLocaleString(),
      r.amount_paid.toLocaleString(),
      r.balance.toLocaleString(),
      // The store labels unpaid water "outstanding"; the rent table says "unpaid" — use one word.
      (r.status === 'outstanding' ? 'unpaid' : r.status).toUpperCase(),
    ]),
    theme: 'grid',
    styles:     { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: [240, 248, 255], textColor: [14, 116, 144], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      if (data.column.index === 8) {
        const val = String(data.cell.raw).toLowerCase();
        if (val === 'unpaid')  data.cell.styles.textColor = [220, 38, 38];
        if (val === 'paid')    data.cell.styles.textColor = [5, 150, 105];
        if (val === 'partial') data.cell.styles.textColor = [37, 99, 235];
      }
      if (data.column.index === 7) {
        const val = parseFloat(String(data.cell.raw).replace(/,/g, ''));
        data.cell.styles.textColor = val > 0 ? [220, 38, 38] : [5, 150, 105];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `© ${new Date().getFullYear()} ${senderDetails().name} · Page ${i} of ${pageCount}`,
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
      `© ${new Date().getFullYear()} ${senderDetails().name} · Page ${i} of ${pageCount}`,
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
  waterReading?: WaterReading,
  /** Amounts still owed for this billing period; shown under the total so a partial payment is never mistaken for a full one. */
  outstanding?: { rent: number; water: number },
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
  const totalRowIndex = tableBody.length - 1;

  // Balance rows: indices of rows to colour red (still owed) or green (settled)
  const balanceRowIndices: number[] = [];
  if (outstanding) {
    const totalOwed = outstanding.rent + outstanding.water;
    tableBody.push(['Rent Balance Remaining', outstanding.rent.toLocaleString()]);
    balanceRowIndices.push(tableBody.length - 1);
    tableBody.push(['Water Balance Remaining', outstanding.water.toLocaleString()]);
    balanceRowIndices.push(tableBody.length - 1);
    tableBody.push([totalOwed > 0 ? 'BALANCE STILL DUE' : 'BALANCE', totalOwed > 0 ? totalOwed.toLocaleString() : 'NIL - FULLY PAID']);
    balanceRowIndices.push(tableBody.length - 1);
  }

  autoTable(doc, {
    startY: startY + 50,
    head: [['Description', 'Amount (KES)']],
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
      if (data.section !== 'body') return;
      const isTotalRow = data.row.index === totalRowIndex;
      const isReadingRow = waterReading && waterReading.curr_reading > 0 && data.row.index === 2;

      if (isTotalRow) {
        data.cell.styles.fillColor = [240, 248, 255];
        data.cell.styles.textColor = [14, 116, 144];
      }
      if (isReadingRow) {
        data.cell.styles.textColor = [120, 120, 120];
        data.cell.styles.fontStyle = 'italic';
      }
      if (outstanding && balanceRowIndices.includes(data.row.index)) {
        const rowAmount = [outstanding.rent, outstanding.water, outstanding.rent + outstanding.water][balanceRowIndices.indexOf(data.row.index)];
        data.cell.styles.textColor = rowAmount > 0 ? [220, 38, 38] : [5, 150, 105];
        if (data.row.index === balanceRowIndices[2]) data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `© ${new Date().getFullYear()} ${senderDetails().name} · Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    );
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`receipt-${tenant.first_name}-${tenant.last_name}-${periodName.replace(/\s+/g, '-')}-${dateStr}.pdf`);
}

// ── Water Invoice Slip ─────────────────────────────────────────────────────

export function downloadWaterInvoice(
  tenant: TenantConfig,
  periodName: string,
  prevReading: number,
  currReading: number,
  unitsConsumed: number,
  rate: number,
  totalBill: number,
  /** Payment position for this bill; omit for a brand-new bill with nothing paid and no arrears. */
  account: { amountPaid?: number; previousBalance?: number } = {},
): void {
  // Use a5 format for a smaller slip
  const doc = new jsPDF({ format: 'a5' });

  const amountPaid      = Math.min(account.amountPaid ?? 0, totalBill);
  const billBalance     = Math.max(0, totalBill - amountPaid);
  const previousBalance = account.previousBalance ?? 0;
  const totalDue        = billBalance + previousBalance;
  const status          = billBalance <= 0 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID';
  const statusColor: [number, number, number] =
    status === 'PAID' ? [5, 150, 105] : status === 'PARTIAL' ? [37, 99, 235] : [220, 38, 38];

  const startY = drawCorporateHeader(doc, 'Water Bill Invoice', `Billing Period: ${periodName}`);

  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  // a5 width is ~148mm, so we use width 120 (14 + 120 = 134mm, leaves 14mm right margin)
  doc.roundedRect(14, startY, 120, 28, 2, 2, 'FD');

  doc.setTextColor(20, 30, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Billed To: ${tenant.first_name} ${tenant.last_name}`, 18, startY + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Unit: ${tenant.unit} | Property: ${tenant.property}`, 18, startY + 15);
  doc.text(`Date Recorded: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}`, 18, startY + 22);

  // Payment status stamp (top-right of the info box)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...statusColor);
  doc.text(status, 130, startY + 8, { align: 'right' });

  const body: string[][] = [
    ['Previous Meter Reading', `${prevReading.toLocaleString()} m³`],
    ['Current Meter Reading', `${currReading.toLocaleString()} m³`],
    ['Total Units Consumed', `${unitsConsumed.toLocaleString()} m³`],
    ['Rate per Unit (m³)', `KSh ${rate.toLocaleString()}`],
    ['Water Bill This Period', `KSh ${totalBill.toLocaleString()}`],
    ['Amount Paid', `KSh ${amountPaid.toLocaleString()}`],
    ['Balance This Period', `KSh ${billBalance.toLocaleString()}`],
  ];
  if (previousBalance > 0) {
    body.push(['Previous Unpaid Water', `KSh ${previousBalance.toLocaleString()}`]);
  }
  body.push(['TOTAL WATER BALANCE DUE', `KSh ${totalDue.toLocaleString()}`]);

  const idx = { paid: 5, billBalance: 6, previous: 7, total: body.length - 1 };

  autoTable(doc, {
    startY: startY + 34,
    head: [['Description', 'Value']],
    body,
    theme: 'grid',
    styles:     { fontSize: 9.5, cellPadding: 3.5 },
    headStyles: { fillColor: [240, 248, 255], textColor: [14, 116, 144], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { textColor: [40, 40, 40], lineColor: [220, 220, 220], lineWidth: 0.1 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const row = data.row.index;
      if (row === 4) {
        data.cell.styles.fillColor = [240, 248, 255];
        data.cell.styles.textColor = [14, 116, 144];
      }
      if (row === idx.paid && amountPaid > 0) data.cell.styles.textColor = [5, 150, 105];
      if (row === idx.billBalance) data.cell.styles.textColor = billBalance > 0 ? [220, 38, 38] : [5, 150, 105];
      if (previousBalance > 0 && row === idx.previous) data.cell.styles.textColor = [220, 38, 38];
      if (row === idx.total) {
        data.cell.styles.fillColor = totalDue > 0 ? [254, 242, 242] : [236, 253, 245];
        data.cell.styles.textColor = totalDue > 0 ? [220, 38, 38] : [5, 150, 105];
        data.cell.styles.fontSize = 11;
      }
    }
  });

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`water-invoice-${tenant.first_name}-${tenant.unit}-${periodName.replace(/\s+/g, '-')}-${dateStr}.pdf`);
}

// ── Balance Reminder (one page per tenant) ─────────────────────────────────

export interface ReminderOptions {
  includeRent: boolean;
  includeWater: boolean;
  /** ISO date (yyyy-mm-dd) the tenant is asked to pay by. */
  payBy?: string;
  /** Free-text payment instructions, e.g. "M-PESA Paybill 123456, Account: Unit number". */
  paymentInstructions?: string;
  /** Extra message printed at the bottom of the reminder. */
  note?: string;
}

/**
 * Generates a PDF with one balance-reminder page per tenant, listing every month that
 * still has an unpaid or partially paid rent/water balance.
 *
 * @returns The number of reminders written (tenants with nothing owing are skipped).
 */
export function downloadBalanceReminders(balances: TenantBalance[], opts: ReminderOptions): number {
  const doc = new jsPDF();
  const today = new Date();
  const longDate = (d: Date) => d.toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });
  const kes = (n: number) => n.toLocaleString('en-KE', { maximumFractionDigits: 2 });

  let written = 0;
  let firstWritten: TenantConfig | null = null;

  for (const bal of balances) {
    // Only count the parts the user asked to include
    const rows = bal.periods
      .map(p => {
        const rent  = opts.includeRent  ? p.rent  : null;
        const water = opts.includeWater ? p.water : null;
        const balance = (rent?.balance ?? 0) + (water?.balance ?? 0);
        return { p, rent, water, balance, status: combinedStatus(rent, water) };
      })
      .filter(r => r.balance > 0);
    if (!rows.length) continue;

    const rentTotal  = rows.reduce((s, r) => s + (r.rent?.balance ?? 0), 0);
    const waterTotal = rows.reduce((s, r) => s + (r.water?.balance ?? 0), 0);
    const grandTotal = rentTotal + waterTotal;

    if (written > 0) doc.addPage();
    written++;

    const t = bal.tenant;
    if (!firstWritten) firstWritten = t;
    const startY = drawCorporateHeader(doc, 'Balance Reminder', `Statement date: ${longDate(today)}`);

    // ── Tenant box ──
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, startY, 182, 30, 2, 2, 'FD');

    doc.setTextColor(20, 30, 50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.first_name} ${t.last_name}`.trim(), 20, startY + 9);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Unit: ${t.unit}`, 20, startY + 16);
    doc.text(`Property: ${t.property}`, 20, startY + 23);
    doc.text(`Phone: ${t.phone || '-'}`, 100, startY + 16);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('TOTAL BALANCE DUE', 190, startY + 8, { align: 'right' });
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`KSh ${kes(grandTotal)}`, 190, startY + 17, { align: 'right' });

    // ── Message ──
    let y = startY + 42;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const parts = [opts.includeRent && 'rent', opts.includeWater && 'water'].filter(Boolean).join(' and ');
    const intro = `Dear ${t.first_name || 'Tenant'}, our records show an outstanding ${parts} balance of KSh ${kes(grandTotal)} ` +
      `for Unit ${t.unit} as at ${longDate(today)}.` +
      (opts.payBy ? ` Kindly settle this by ${longDate(new Date(`${opts.payBy}T00:00:00`))}.` : ' Kindly settle this at your earliest convenience.') +
      ' The months that are not fully paid are listed below.';
    const introLines = doc.splitTextToSize(intro, 182) as string[];
    doc.text(introLines, 14, y);
    y += introLines.length * 5 + 4;

    // ── Month-by-month breakdown ──
    const head: string[] = ['Month'];
    if (opts.includeRent)  head.push('Rent Due', 'Rent Paid', 'Rent Balance');
    if (opts.includeWater) head.push('Water Bill', 'Water Paid', 'Water Balance');
    head.push('Balance', 'Status');

    const body = rows.map(r => {
      const cells = [r.p.period];
      if (opts.includeRent)  cells.push(r.rent  ? kes(r.rent.due)    : '-', r.rent  ? kes(r.rent.paid)    : '-', r.rent  ? kes(r.rent.balance)    : '-');
      if (opts.includeWater) cells.push(r.water ? kes(r.water.billed) : '-', r.water ? kes(r.water.paid)   : '-', r.water ? kes(r.water.balance)   : '-');
      cells.push(kes(r.balance), r.status.toUpperCase());
      return cells;
    });

    const foot: string[] = ['TOTAL'];
    if (opts.includeRent)  foot.push('', '', kes(rentTotal));
    if (opts.includeWater) foot.push('', '', kes(waterTotal));
    foot.push(kes(grandTotal), '');

    const lastCol = head.length - 1;
    const balanceCols = new Set<number>();
    head.forEach((h, i) => { if (h.endsWith('Balance') || h === 'Balance') balanceCols.add(i); });

    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      foot: [foot],
      showFoot: 'lastPage',
      theme: 'grid',
      styles:     { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [245, 245, 245], textColor: [20, 30, 50], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
      bodyStyles: { textColor: [60, 60, 60], lineColor: [220, 220, 220], lineWidth: 0.1 },
      footStyles: { fillColor: [254, 242, 242], textColor: [220, 38, 38], fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      columnStyles: Object.fromEntries(
        head.map((_, i) => [i, {
          halign: i === 0 ? 'left' : i === lastCol ? 'center' : 'right',
          // keep "September 2026" and "PARTIAL" on one line
          ...(i === 0 ? { cellWidth: 28 } : i === lastCol ? { cellWidth: 20 } : {}),
        } as const])
      ),
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (balanceCols.has(data.column.index)) {
            const v = parseFloat(String(data.cell.raw).replace(/,/g, ''));
            if (v > 0) { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
          }
          if (data.column.index === lastCol) {
            data.cell.styles.textColor = String(data.cell.raw) === 'PARTIAL' ? [37, 99, 235] : [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    // ── Payment details ──
    y = (doc as any).lastAutoTable.finalY + 10;
    const block = (label: string, text: string) => {
      const lines = doc.splitTextToSize(text, 170) as string[];
      if (y + 8 + lines.length * 5 > 275) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 30, 50);
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(lines, 14, y + 5);
      y += 8 + lines.length * 5;
    };
    if (opts.payBy) block('Please pay by', longDate(new Date(`${opts.payBy}T00:00:00`)));
    if (opts.paymentInstructions?.trim()) block('How to pay', opts.paymentInstructions.trim());
    if (opts.note?.trim()) block('Note', opts.note.trim());

    block('', 'If you have already paid, please share your payment confirmation so we can update your account. Thank you.');
  }

  if (written === 0) return 0;

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `© ${today.getFullYear()} ${senderDetails().name} · Page ${i} of ${pageCount}`,
      105, 290, { align: 'center' }
    );
  }

  const dateStr = today.toISOString().split('T')[0];
  const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  doc.save(
    firstWritten && written === 1
      ? `balance-reminder-${safe(`${firstWritten.first_name} ${firstWritten.last_name}`)}-${dateStr}.pdf`
      : `balance-reminders-${dateStr}.pdf`
  );
  return written;
}
