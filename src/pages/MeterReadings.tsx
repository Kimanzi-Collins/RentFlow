import React, { useState } from 'react';
import { PageHeader, DataTable, Button, Card, CardContent, Badge } from '@/components/ui';
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
          <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-blue-50 dark:bg-blue-900/20 text-blue-500 shrink-0">
            <Droplets size={14} />
          </div>
          <div>
            <p className="font-medium">A-101</p>
            <p className="text-xs text-muted-foreground">Sunset Apts</p>
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
      render: (value: number) => <span className="font-mono text-sm text-primary font-medium">{value}</span>,
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
        <Badge variant={value ? 'success' : 'warning'}>
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
            <Button variant="outline" leftIcon={<Download size={16} />}>Export</Button>
            <Button leftIcon={<Plus size={16} />}>Record Reading</Button>
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
                placeholder="Search by unit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className="border-0 rounded-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
