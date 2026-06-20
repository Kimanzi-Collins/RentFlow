import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, CardContent, StatusBadge, Avatar } from '@/components/ui';
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
          <p className="font-medium font-mono text-sm">{value || 'N/A'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(row.payment_date, 'medium')}</p>
        </div>
      ),
    },
    {
      key: 'tenant_id',
      header: 'Tenant',
      render: () => (
        <div className="flex items-center gap-2">
          <Avatar name="Tenant Name" size="xs" />
          <span className="text-sm font-medium">Tenant Name</span>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (value: string) => <span className="text-sm text-muted-foreground">{getPaymentMethodLabel(value)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: number) => <span className="font-mono text-sm font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track rent collection and transactions."
        actions={
          <>
            <Button variant="outline" leftIcon={<Download size={16} />}>Export Report</Button>
            <Button leftIcon={<Plus size={16} />}>Record Payment</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search by transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className="border-0 rounded-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
