import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, CardContent, StatusBadge, Select } from '@/components/ui';
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted shrink-0">
            <Home size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.bedrooms} Bed, {row.bathrooms} Bath</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rent_amount',
      header: 'Rent',
      render: (value: number) => <span className="font-mono text-sm">{formatCurrency(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
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

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search units..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className="border-0 rounded-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
