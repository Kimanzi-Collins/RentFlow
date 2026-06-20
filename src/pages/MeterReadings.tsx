import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, Badge, Avatar } from '@/components/ui';
import { Plus, Search, Droplets, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { MeterReadingWithDetails } from '@/types';

const MOCK_READINGS: MeterReadingWithDetails[] = [
  { id: '1', unit_id: '1', property_id: '1', previous_reading: 1050, current_reading: 1065, consumption: 15, reading_date: new Date().toISOString(), recorded_by: '1', is_billed: false, created_at: new Date().toISOString() },
  { id: '2', unit_id: '2', property_id: '1', previous_reading: 2040, current_reading: 2048, consumption: 8, reading_date: new Date().toISOString(), recorded_by: '1', is_billed: true, created_at: new Date().toISOString() },
];

export const MeterReadings: React.FC = () => {
  const [search, setSearch] = useState('');

  const columns = [
    {
      key: 'unit_id',
      header: 'Unit',
      render: (_: any, row: MeterReadingWithDetails) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[rgba(59,130,246,0.1)] text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Droplets size={14} />
          </div>
          <div>
            <p className="font-medium text-white">A-101</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Sunset Apts</p>
          </div>
        </div>
      ),
    },
    {
      key: 'reading_date',
      header: 'Date',
      render: (value: string) => <span className="text-sm">{formatDate(value, 'medium')}</span>,
    },
    {
      key: 'previous_reading',
      header: 'Previous',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>,
      align: 'right' as const,
    },
    {
      key: 'current_reading',
      header: 'Current',
      render: (value: number) => <span className="font-mono text-sm text-[var(--color-accent)] font-medium">{value}</span>,
      align: 'right' as const,
    },
    {
      key: 'consumption',
      header: 'Usage',
      render: (value: number) => <span className="font-mono text-sm font-bold">{value} units</span>,
      align: 'right' as const,
    },
    {
      key: 'is_billed',
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'} size="sm">
          {value ? 'Billed' : 'Unbilled'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meter Readings"
        description="Record and track water consumption."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Download size={16} />}>Export</Button>
            <Button leftIcon={<Plus size={16} />}>Record Reading</Button>
          </>
        }
      />

      <Card padding="md">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="Search by unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full h-10 pl-9 pr-4 text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={MOCK_READINGS}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => console.log('Clicked', row)}
          emptyMessage="No meter readings found."
          emptyIcon={Droplets}
        />
      </Card>
    </div>
  );
};
