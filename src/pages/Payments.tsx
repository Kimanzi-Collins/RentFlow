import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, StatusBadge, Avatar } from '@/components/ui';
import { Plus, Search, CreditCard, Download } from 'lucide-react';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import type { PaymentWithDetails } from '@/types';

const MOCK_PAYMENTS: PaymentWithDetails[] = [
  { id: '1', tenant_id: '1', property_id: '1', amount: 25000, payment_method: 'mpesa', payment_status: 'completed', payment_date: new Date().toISOString(), transaction_id: 'RGH89KJH23', created_at: new Date().toISOString() },
  { id: '2', tenant_id: '2', property_id: '1', amount: 15000, payment_method: 'bank_transfer', payment_status: 'pending', payment_date: new Date(Date.now() - 86400000).toISOString(), created_at: new Date().toISOString() },
];

export const Payments: React.FC = () => {
  const [search, setSearch] = useState('');

  const columns = [
    {
      key: 'transaction_id',
      header: 'Transaction',
      render: (value: string, row: PaymentWithDetails) => (
        <div>
          <p className="font-medium font-mono text-sm text-white">{value || 'N/A'}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">{formatDate(row.payment_date, 'medium')}</p>
        </div>
      ),
    },
    {
      key: 'tenant_id',
      header: 'Tenant',
      render: () => (
        <div className="flex items-center gap-2">
          <Avatar name="Tenant Name" size="xs" />
          <span className="text-sm">Tenant Name</span>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (value: string) => <span className="text-sm text-[var(--color-text-secondary)]">{getPaymentMethodLabel(value)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: number) => <span className="font-mono text-sm font-medium text-[var(--color-success)]">{formatCurrency(value)}</span>,
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} dot size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track rent collection and transactions."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Download size={16} />}>Export Report</Button>
            <Button leftIcon={<Plus size={16} />}>Record Payment</Button>
          </>
        }
      />

      <Card padding="md">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="Search by transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full h-10 pl-9 pr-4 text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={MOCK_PAYMENTS.filter(p => (p.transaction_id || '').toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => console.log('Clicked', row)}
          emptyMessage="No payments found."
          emptyIcon={CreditCard}
        />
      </Card>
    </div>
  );
};
