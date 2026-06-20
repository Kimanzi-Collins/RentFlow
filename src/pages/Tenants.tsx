import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, CardContent, StatusBadge, Avatar } from '@/components/ui';
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
            <p className="font-medium text-foreground">{row.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (value: string) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone size={14} />
          {formatPhone(value)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (value: number) => (
        <span className={`font-mono text-sm font-medium ${value > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
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

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className="border-0 rounded-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
