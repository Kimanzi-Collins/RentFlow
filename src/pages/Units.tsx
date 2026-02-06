import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GlassCard,
  PageHeader,
  Button,
  SearchInput,
  Tabs,
  DataTable,
  Avatar,
  StatusBadge,
  EmptyState,
  Modal,
  Input,
  Select,
  Skeleton,
  StatCard,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { animateCardsIn } from '@/lib/animations';
import {
  Home,
  Plus,
  Building2,
  Users,
  Edit,
  Droplets,
  CreditCard,
  Key,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const unitsData = [
  {
    id: '1',
    property_id: '1',
    property_name: 'Sunset Apartments',
    unit_number: 'A-101',
    bedrooms: 2,
    bathrooms: 1,
    rent_amount: 25000,
    deposit_amount: 25000,
    status: 'occupied',
    current_tenant_name: 'Grace Wanjiku',
    meter_number: 'WM-001234',
    last_meter_reading: 1268,
  },
  {
    id: '2',
    property_id: '1',
    property_name: 'Sunset Apartments',
    unit_number: 'A-102',
    bedrooms: 2,
    bathrooms: 1,
    rent_amount: 25000,
    deposit_amount: 25000,
    status: 'occupied',
    current_tenant_name: 'Peter Ochieng',
    meter_number: 'WM-001235',
    last_meter_reading: 918,
  },
  {
    id: '3',
    property_id: '1',
    property_name: 'Sunset Apartments',
    unit_number: 'A-103',
    bedrooms: 1,
    bathrooms: 1,
    rent_amount: 18000,
    deposit_amount: 18000,
    status: 'vacant',
    current_tenant_name: null,
    meter_number: 'WM-001236',
    last_meter_reading: 456,
  },
  {
    id: '4',
    property_id: '1',
    property_name: 'Sunset Apartments',
    unit_number: 'B-201',
    bedrooms: 3,
    bathrooms: 2,
    rent_amount: 32000,
    deposit_amount: 32000,
    status: 'maintenance',
    current_tenant_name: null,
    meter_number: 'WM-001237',
    last_meter_reading: 789,
  },
  {
    id: '5',
    property_id: '2',
    property_name: 'Green Valley',
    unit_number: 'C-301',
    bedrooms: 2,
    bathrooms: 1,
    rent_amount: 38000,
    deposit_amount: 38000,
    status: 'occupied',
    current_tenant_name: 'Mary Njeri',
    meter_number: 'WM-002145',
    last_meter_reading: 2145,
  },
  {
    id: '6',
    property_id: '3',
    property_name: 'City View Tower',
    unit_number: 'A-501',
    bedrooms: 3,
    bathrooms: 2,
    rent_amount: 55000,
    deposit_amount: 55000,
    status: 'occupied',
    current_tenant_name: 'John Kiprop',
    meter_number: 'WM-003001',
    last_meter_reading: 812,
  },
];

const stats = {
  totalUnits: 48,
  occupiedUnits: 42,
  vacantUnits: 4,
  maintenanceUnits: 2,
};

// ═══════════════════════════════════════════════════════════════════════════
// UNITS LIST
// ═══════════════════════════════════════════════════════════════════════════

export function Units() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
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

  const filteredUnits = unitsData.filter((u) => {
    const matchesSearch =
      u.unit_number.toLowerCase().includes(search.toLowerCase()) ||
      u.property_name.toLowerCase().includes(search.toLowerCase()) ||
      u.current_tenant_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'all', label: 'All', count: stats.totalUnits },
    { id: 'occupied', label: 'Occupied', count: stats.occupiedUnits },
    { id: 'vacant', label: 'Vacant', count: stats.vacantUnits },
    { id: 'maintenance', label: 'Maintenance', count: stats.maintenanceUnits },
  ];

  const columns = [
    {
      key: 'unit_number',
      header: 'Unit',
      render: (u: typeof unitsData[0]) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">{u.unit_number}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{u.property_name}</p>
        </div>
      ),
    },
    {
      key: 'specs',
      header: 'Specs',
      render: (u: typeof unitsData[0]) => (
        <span className="text-sm">
          {u.bedrooms} BR / {u.bathrooms} BA
        </span>
      ),
    },
    {
      key: 'rent',
      header: 'Rent',
      render: (u: typeof unitsData[0]) => (
        <span className="font-medium">{formatCurrency(u.rent_amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: typeof unitsData[0]) => <StatusBadge status={u.status} />,
    },
    {
      key: 'tenant',
      header: 'Tenant',
      render: (u: typeof unitsData[0]) =>
        u.current_tenant_name ? (
          <div className="flex items-center gap-2">
            <Avatar name={u.current_tenant_name} size="xs" />
            <span>{u.current_tenant_name}</span>
          </div>
        ) : (
          <span className="text-[var(--color-text-muted)]">—</span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Units" description="Manage all rental units" />
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
        title="Units"
        description="Manage all rental units across your properties"
        actions={
          <Button icon={Plus} onClick={() => setIsAddUnitOpen(true)}>
            Add Unit
          </Button>
        }
      />

      {/* Stats */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Total Units"
            value={stats.totalUnits}
            icon={Home}
            variant="accent"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Occupied"
            value={stats.occupiedUnits}
            icon={Users}
            variant="success"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Vacant"
            value={stats.vacantUnits}
            icon={Key}
            variant="warning"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Maintenance"
            value={stats.maintenanceUnits}
            icon={Building2}
            variant="danger"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={statusFilter} onChange={setStatusFilter} />
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <SearchInput
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Units Table */}
      <DataTable
        columns={columns}
        data={filteredUnits}
        keyField="id"
        onRowClick={(unit) => navigate(`/units/${unit.id}`)}
        emptyState={
          <EmptyState
            icon={Home}
            title="No units found"
            description={search ? 'Try adjusting your search' : 'Add units to your properties'}
            action={
              !search && (
                <Button icon={Plus} onClick={() => setIsAddUnitOpen(true)}>
                  Add Unit
                </Button>
              )
            }
          />
        }
      />

      {/* Add Unit Modal */}
      <AddUnitModal isOpen={isAddUnitOpen} onClose={() => setIsAddUnitOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT DETAIL
// ═══════════════════════════════════════════════════════════════════════════

export function UnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const unit = unitsData.find((u) => u.id === id);

  if (!unit) {
    return (
      <EmptyState
        icon={Home}
        title="Unit not found"
        description="The unit you're looking for doesn't exist"
        action={<Button onClick={() => navigate('/units')}>Back to Units</Button>}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tenant', label: 'Tenant' },
    { id: 'payments', label: 'Payments' },
    { id: 'meter', label: 'Meter' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Unit ${unit.unit_number}`}
        description={unit.property_name}
        breadcrumbs={[
          { label: 'Units', href: '/units' },
          { label: unit.unit_number },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={Edit}>
              Edit Unit
            </Button>
            {unit.status === 'vacant' && (
              <Button icon={Users}>Assign Tenant</Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
              <Home size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Bedrooms</p>
              <p className="text-lg font-semibold">{unit.bedrooms} BR / {unit.bathrooms} BA</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
              <CreditCard size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Monthly Rent</p>
              <p className="text-lg font-semibold">{formatCurrency(unit.rent_amount)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              unit.status === 'occupied' 
                ? 'bg-[var(--color-success-light)]' 
                : unit.status === 'vacant' 
                ? 'bg-[var(--color-warning-light)]'
                : 'bg-[var(--color-danger-light)]'
            }`}>
              <Users size={20} className={
                unit.status === 'occupied' 
                  ? 'text-[var(--color-success)]' 
                  : unit.status === 'vacant' 
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-danger)]'
              } />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Status</p>
              <StatusBadge status={unit.status} />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
              <Droplets size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Last Meter</p>
              <p className="text-lg font-semibold font-mono">{unit.last_meter_reading}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <GlassCard>
          <h3 className="text-title text-[var(--color-text-primary)] mb-4">Unit Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Unit Number</p>
              <p className="font-medium">{unit.unit_number}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Property</p>
              <p className="font-medium">{unit.property_name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Rent Amount</p>
              <p className="font-medium">{formatCurrency(unit.rent_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Deposit</p>
              <p className="font-medium">{formatCurrency(unit.deposit_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Meter Number</p>
              <p className="font-medium font-mono">{unit.meter_number}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Current Tenant</p>
              <p className="font-medium">
                {unit.current_tenant_name || 'No tenant assigned'}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'tenant' && (
        unit.current_tenant_name ? (
          <GlassCard>
            <div className="flex items-center gap-4">
              <Avatar name={unit.current_tenant_name} size="lg" />
              <div>
                <h3 className="text-title text-[var(--color-text-primary)]">
                  {unit.current_tenant_name}
                </h3>
                <p className="text-[var(--color-text-muted)]">Current Tenant</p>
              </div>
            </div>
          </GlassCard>
        ) : (
          <EmptyState
            icon={Users}
            title="No tenant assigned"
            description="This unit is currently vacant"
            action={<Button icon={Users}>Assign Tenant</Button>}
          />
        )
      )}

      {activeTab === 'payments' && (
        <EmptyState
          icon={CreditCard}
          title="Payment history"
          description="Payment history for this unit will appear here"
        />
      )}

      {activeTab === 'meter' && (
        <GlassCard>
          <h3 className="text-title text-[var(--color-text-primary)] mb-4">Meter Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Meter Number</p>
              <p className="font-medium font-mono text-lg">{unit.meter_number}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Last Reading</p>
              <p className="font-medium font-mono text-lg">{unit.last_meter_reading}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════

function AddUnitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
      title="Add New Unit"
      description="Add a new rental unit"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            Add Unit
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
        <Input label="Unit Number" placeholder="e.g., A-101" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bedrooms" type="number" placeholder="2" />
          <Input label="Bathrooms" type="number" placeholder="1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Rent Amount (KES)" type="number" placeholder="25000" required />
          <Input label="Deposit (KES)" type="number" placeholder="25000" />
        </div>
        <Input label="Meter Number" placeholder="WM-001234" />
      </form>
    </Modal>
  );
}

export default Units;
