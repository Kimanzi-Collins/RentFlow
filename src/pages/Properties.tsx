import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, CardContent, Badge } from '@/components/ui';
import { Plus, Building2, MapPin, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { PropertyWithStats } from '@/types';

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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted shrink-0">
            <Building2 size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {row.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'property_type',
      header: 'Type',
      render: (value: string) => <Badge variant="secondary" className="capitalize">{value}</Badge>,
    },
    {
      key: 'total_units',
      header: 'Occupancy',
      render: (_: any, row: PropertyWithStats) => {
        const rate = row.total_units ? Math.round((row.occupied_units / row.total_units) * 100) : 0;
        return (
          <div className="w-full max-w-[150px]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{row.occupied_units}/{row.total_units} units</span>
              <span className="font-medium">{rate}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${rate > 90 ? 'bg-green-500' : 'bg-primary'}`} 
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

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className="border-0 rounded-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
