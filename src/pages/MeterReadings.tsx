import { useState, useRef, useEffect } from 'react';
import {
  PageHeader,
  Button,
  Badge,
  SearchInput,
  DataTable,
  EmptyState,
  Modal,
  Input,
  Select,
  Skeleton,
  StatCard,
  Avatar,
} from '@/components/ui';
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { animateCardsIn } from '@/lib/animations';
import {
  Droplets,
  Plus,
  Upload,
  Camera,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const meterReadingsData = [
  {
    id: '1',
    unit_number: 'A-101',
    property_name: 'Sunset Apartments',
    tenant_name: 'Grace Wanjiku',
    previous_reading: 1245,
    current_reading: 1268,
    consumption: 23,
    reading_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    recorder_name: 'John Caretaker',
    is_billed: true,
  },
  {
    id: '2',
    unit_number: 'A-102',
    property_name: 'Sunset Apartments',
    tenant_name: 'Peter Ochieng',
    previous_reading: 890,
    current_reading: 918,
    consumption: 28,
    reading_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    recorder_name: 'John Caretaker',
    is_billed: true,
  },
  {
    id: '3',
    unit_number: 'B-201',
    property_name: 'Sunset Apartments',
    tenant_name: null,
    previous_reading: 456,
    current_reading: 456,
    consumption: 0,
    reading_date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    recorder_name: 'John Caretaker',
    is_billed: false,
  },
  {
    id: '4',
    unit_number: 'C-301',
    property_name: 'Green Valley',
    tenant_name: 'Mary Njeri',
    previous_reading: 2100,
    current_reading: 2145,
    consumption: 45,
    reading_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    recorder_name: 'Mary Caretaker',
    is_billed: false,
  },
  {
    id: '5',
    unit_number: 'A-205',
    property_name: 'City View Tower',
    tenant_name: 'John Kiprop',
    previous_reading: 780,
    current_reading: 812,
    consumption: 32,
    reading_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    recorder_name: 'Peter Caretaker',
    is_billed: true,
  },
];

const stats = {
  totalReadings: 48,
  pendingBilling: 12,
  avgConsumption: 28,
  totalBilled: 156000,
};

// ═══════════════════════════════════════════════════════════════════════════
// METER READINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MeterReadings() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.stat-card');
      animateCardsIn(cards, { stagger: 0.08 });
    }
  }, [loading]);

  const filteredReadings = meterReadingsData.filter(
    (r) =>
      r.unit_number.toLowerCase().includes(search.toLowerCase()) ||
      r.property_name.toLowerCase().includes(search.toLowerCase()) ||
      r.tenant_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'unit',
      header: 'Unit',
      render: (r: typeof meterReadingsData[0]) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">{r.unit_number}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{r.property_name}</p>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Tenant',
      render: (r: typeof meterReadingsData[0]) =>
        r.tenant_name ? (
          <div className="flex items-center gap-2">
            <Avatar name={r.tenant_name} size="xs" />
            <span>{r.tenant_name}</span>
          </div>
        ) : (
          <span className="text-[var(--color-text-muted)]">Vacant</span>
        ),
    },
    {
      key: 'previous',
      header: 'Previous',
      render: (r: typeof meterReadingsData[0]) => (
        <span className="font-mono">{r.previous_reading}</span>
      ),
    },
    {
      key: 'current',
      header: 'Current',
      render: (r: typeof meterReadingsData[0]) => (
        <span className="font-mono font-medium">{r.current_reading}</span>
      ),
    },
    {
      key: 'consumption',
      header: 'Consumption',
      render: (r: typeof meterReadingsData[0]) => (
        <Badge variant={r.consumption > 30 ? 'warning' : 'success'}>
          {r.consumption} units
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: typeof meterReadingsData[0]) => (
        <Badge variant={r.is_billed ? 'success' : 'warning'} dot>
          {r.is_billed ? 'Billed' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (r: typeof meterReadingsData[0]) => (
        <div>
          <p>{formatDate(r.reading_date)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatRelativeTime(r.reading_date)}
          </p>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Meter Readings" description="Track water consumption" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} className="rounded-[var(--radius-xl)]" />
          ))}
        </div>
        <Skeleton height={400} className="rounded-[var(--radius-xl)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meter Readings"
        description="Track water consumption and billing"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={Upload}>
              Bulk Upload
            </Button>
            <Button icon={Plus} onClick={() => setIsAddReadingOpen(true)}>
              Add Reading
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Total Readings"
            value={stats.totalReadings}
            icon={Droplets}
            variant="accent"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Pending Billing"
            value={stats.pendingBilling}
            icon={AlertCircle}
            variant="warning"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Avg. Consumption"
            value={`${stats.avgConsumption} units`}
            icon={TrendingUp}
            variant="default"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Total Billed"
            value={formatCurrency(stats.totalBilled)}
            icon={CheckCircle}
            variant="success"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select
          options={[
            { value: 'all', label: 'All Properties' },
            { value: '1', label: 'Sunset Apartments' },
            { value: '2', label: 'Green Valley' },
            { value: '3', label: 'City View Tower' },
          ]}
          placeholder="Filter by property"
        />
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <SearchInput
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Readings Table */}
      <DataTable
        columns={columns}
        data={filteredReadings}
        keyField="id"
        emptyState={
          <EmptyState
            icon={Droplets}
            title="No readings found"
            description={search ? 'Try adjusting your search' : 'Add meter readings to track water consumption'}
            action={
              !search && (
                <Button icon={Plus} onClick={() => setIsAddReadingOpen(true)}>
                  Add Reading
                </Button>
              )
            }
          />
        }
      />

      {/* Add Reading Modal */}
      <AddReadingModal isOpen={isAddReadingOpen} onClose={() => setIsAddReadingOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════

function AddReadingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Meter Reading"
      description="Record a new water meter reading"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            Save Reading
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Select
          label="Property"
          options={[
            { value: '1', label: 'Sunset Apartments' },
            { value: '2', label: 'Green Valley' },
            { value: '3', label: 'City View Tower' },
          ]}
          placeholder="Select property"
        />
        <Select
          label="Unit"
          options={[
            { value: '1', label: 'A-101 - Grace Wanjiku' },
            { value: '2', label: 'A-102 - Peter Ochieng' },
            { value: '3', label: 'B-201 - Vacant' },
          ]}
          placeholder="Select unit"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Previous Reading" type="number" placeholder="1245" disabled />
          <Input label="Current Reading" type="number" placeholder="1268" required />
        </div>
        <Input label="Reading Date" type="date" required />
        
        {/* Photo Upload */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Meter Photo (Optional)
          </label>
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center hover:border-[var(--color-accent)] transition-colors cursor-pointer">
            <Camera size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              PNG, JPG up to 5MB
            </p>
          </div>
        </div>

        <Input label="Notes" placeholder="Optional notes..." />
      </form>
    </Modal>
  );
}

export default MeterReadings;
