import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Badge, Card } from '@/components/ui';
import { Plus, Building2, MapPin, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { PropertyWithStats } from '@/types';

// Mock Data
const MOCK_PROPERTIES: PropertyWithStats[] = [
  {
    id: '1', owner_id: '1', name: 'Sunset Apartments', address: '123 Sunset Blvd', city: 'Nairobi', property_type: 'apartment', water_rate: 150, penalty_rate: 10, penalty_type: 'percentage', billing_day: 5, grace_period_days: 5, total_units: 24, occupied_units: 22, created_at: new Date().toISOString()
  },
  {
    id: '2', owner_id: '1', name: 'Green Valley Estate', address: '45 Green Valley Rd', city: 'Mombasa', property_type: 'mixed', water_rate: 120, penalty_rate: 500, penalty_type: 'fixed', billing_day: 1, grace_period_days: 7, total_units: 12, occupied_units: 12, created_at: new Date().toISOString()
  }
];

export const Properties: React.FC = () => {
  const { profile } = useAuthStore();
  const isLandlord = profile?.role === 'landlord';
  const [search, setSearch] = useState('');

  const columns = [
    {
      key: 'name',
      header: 'Property',
      render: (value: string, row: PropertyWithStats) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
            <Building2 size={18} className="text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {row.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'property_type',
      header: 'Type',
      render: (value: string) => <Badge variant="default" className="capitalize">{value}</Badge>,
    },
    {
      key: 'total_units',
      header: 'Occupancy',
      render: (_: any, row: PropertyWithStats) => {
        const rate = row.total_units ? Math.round((row.occupied_units / row.total_units) * 100) : 0;
        return (
          <div className="w-full max-w-[120px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{row.occupied_units}/{row.total_units} units</span>
              <span className={rate > 90 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}>{rate}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-bar-fill ${rate > 90 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} 
                style={{ width: `${rate}%` }} 
              />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your buildings and estates."
        actions={
          isLandlord ? (
            <Button leftIcon={<Plus size={16} />}>Add Property</Button>
          ) : null
        }
      />

      <Card padding="md">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full h-10 pl-9 pr-4 text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={MOCK_PROPERTIES.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => console.log('Clicked', row)}
          emptyMessage="No properties found matching your search."
          emptyIcon={Building2}
        />
      </Card>
    </div>
  );
};
