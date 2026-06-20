import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, StatusBadge, Select } from '@/components/ui';
import { Plus, Search, Home } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import type { UnitWithTenant } from '@/types';

const MOCK_UNITS: UnitWithTenant[] = [
  { id: '1', property_id: '1', unit_number: 'A-101', bedrooms: 2, bathrooms: 1, rent_amount: 25000, deposit_amount: 25000, status: 'occupied', created_at: new Date().toISOString(), amenities: [] },
  { id: '2', property_id: '1', unit_number: 'A-102', bedrooms: 2, bathrooms: 1, rent_amount: 25000, deposit_amount: 25000, status: 'vacant', created_at: new Date().toISOString(), amenities: [] },
  { id: '3', property_id: '2', unit_number: 'House 1', bedrooms: 3, bathrooms: 2, rent_amount: 45000, deposit_amount: 45000, status: 'maintenance', created_at: new Date().toISOString(), amenities: [] },
];

export const Units: React.FC = () => {
  const { profile } = useAuthStore();
  const isLandlord = profile?.role === 'landlord';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const columns = [
    {
      key: 'unit_number',
      header: 'Unit',
      render: (value: string, row: UnitWithTenant) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
            <Home size={18} className="text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{row.bedrooms} Bed, {row.bathrooms} Bath</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rent_amount',
      header: 'Rent',
      render: (value: number) => <span className="font-mono text-sm text-[var(--color-text-primary)]">{formatCurrency(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} dot />,
    },
  ];

  const filteredUnits = MOCK_UNITS.filter(u => 
    u.unit_number.toLowerCase().includes(search.toLowerCase()) && 
    (statusFilter ? u.status === statusFilter : true)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="Manage individual rental units across your properties."
        actions={
          isLandlord ? (
            <Button leftIcon={<Plus size={16} />}>Add Unit</Button>
          ) : null
        }
      />

      <Card padding="md">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="Search units..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full h-10 pl-9 pr-4 text-sm"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'vacant', label: 'Vacant' },
                { value: 'occupied', label: 'Occupied' },
                { value: 'maintenance', label: 'Maintenance' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredUnits}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => console.log('Clicked', row)}
          emptyMessage="No units found matching your search."
          emptyIcon={Home}
        />
      </Card>
    </div>
  );
};
