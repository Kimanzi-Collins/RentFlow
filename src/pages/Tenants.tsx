import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, StatusBadge, Avatar } from '@/components/ui';
import { Plus, Search, Users, Phone } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatPhone } from '@/lib/utils';
import type { TenantWithLease } from '@/types';

const MOCK_TENANTS: TenantWithLease[] = [
  { id: '1', full_name: 'Grace Wanjiku', phone: '0712345678', email: 'grace@example.com', status: 'active', balance: 0, total_paid: 150000, created_at: new Date().toISOString() },
  { id: '2', full_name: 'Peter Ochieng', phone: '0723456789', email: 'peter@example.com', status: 'active', balance: 25000, total_paid: 75000, created_at: new Date().toISOString() },
  { id: '3', full_name: 'Sarah Mutisya', phone: '0734567890', status: 'evicted', balance: 45000, total_paid: 10000, created_at: new Date().toISOString() },
];

export const Tenants: React.FC = () => {
  const { profile } = useAuthStore();
  const isLandlord = profile?.role === 'landlord';
  const [search, setSearch] = useState('');

  const columns = [
    {
      key: 'full_name',
      header: 'Tenant',
      render: (_: any, row: TenantWithLease) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.full_name} size="sm" />
          <div>
            <p className="font-medium text-white">{row.full_name}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (value: string) => (
        <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
          <Phone size={14} className="text-[var(--color-text-tertiary)]" />
          {formatPhone(value)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} dot />,
    },
    {
      key: 'balance',
      header: 'Outstanding Balance',
      render: (value: number) => (
        <span className={`font-mono text-sm font-medium ${value > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
          {formatCurrency(value)}
        </span>
      ),
      align: 'right' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Manage your tenant records and balances."
        actions={
          isLandlord ? (
            <Button leftIcon={<Plus size={16} />}>Add Tenant</Button>
          ) : null
        }
      />

      <Card padding="md">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full h-10 pl-9 pr-4 text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={MOCK_TENANTS.filter(t => t.full_name.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => console.log('Clicked', row)}
          emptyMessage="No tenants found matching your search."
          emptyIcon={Users}
        />
      </Card>
    </div>
  );
};
