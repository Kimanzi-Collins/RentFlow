import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  GlassCard,
  PageHeader,
  Button,
  Badge,
  SearchInput,
  Tabs,
  Modal,
  Input,
  Select,
  Textarea,
  EmptyState,
  Skeleton,
  DataTable,
  Avatar,
  ProgressBar,
} from '@/components/ui';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { animateCardsIn } from '@/lib/animations';
import {
  Plus,
  Building2,
  Home,
  Users,
  MapPin,
  Edit,
  Droplets,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const propertiesData = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Mombasa Road',
    city: 'Nairobi',
    county: 'Nairobi',
    property_type: 'apartment' as const,
    total_units: 24,
    occupied_units: 22,
    water_rate: 50,
    billing_day: 1,
    image_url: null,
    monthly_revenue: 528000,
    pending_amount: 45000,
  },
  {
    id: '2',
    name: 'Green Valley Estate',
    address: '456 Ngong Road',
    city: 'Nairobi',
    county: 'Nairobi',
    property_type: 'house' as const,
    total_units: 12,
    occupied_units: 10,
    water_rate: 45,
    billing_day: 1,
    image_url: null,
    monthly_revenue: 380000,
    pending_amount: 28000,
  },
  {
    id: '3',
    name: 'City View Tower',
    address: '789 Kenyatta Avenue',
    city: 'Nairobi',
    county: 'Nairobi',
    property_type: 'apartment' as const,
    total_units: 8,
    occupied_units: 7,
    water_rate: 55,
    billing_day: 1,
    image_url: null,
    monthly_revenue: 420000,
    pending_amount: 0,
  },
  {
    id: '4',
    name: 'Riverside Gardens',
    address: '321 Riverside Drive',
    city: 'Nairobi',
    county: 'Nairobi',
    property_type: 'mixed' as const,
    total_units: 4,
    occupied_units: 3,
    water_rate: 60,
    billing_day: 1,
    image_url: null,
    monthly_revenue: 292000,
    pending_amount: 32000,
  },
];

const unitsData = [
  { id: '1', property_id: '1', unit_number: 'A-101', bedrooms: 2, rent_amount: 25000, status: 'occupied', tenant_name: 'Grace Wanjiku' },
  { id: '2', property_id: '1', unit_number: 'A-102', bedrooms: 2, rent_amount: 25000, status: 'occupied', tenant_name: 'Peter Ochieng' },
  { id: '3', property_id: '1', unit_number: 'A-103', bedrooms: 1, rent_amount: 18000, status: 'vacant', tenant_name: null },
  { id: '4', property_id: '1', unit_number: 'A-104', bedrooms: 3, rent_amount: 32000, status: 'occupied', tenant_name: 'Mary Njeri' },
  { id: '5', property_id: '1', unit_number: 'B-201', bedrooms: 2, rent_amount: 25000, status: 'maintenance', tenant_name: null },
  { id: '6', property_id: '1', unit_number: 'B-202', bedrooms: 2, rent_amount: 25000, status: 'occupied', tenant_name: 'James Mwangi' },
];

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTIES LIST
// ═══════════════════════════════════════════════════════════════════════════

export function Properties() {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.property-card');
      animateCardsIn(cards, { stagger: 0.08 });
    }
  }, [loading]);

  const filteredProperties = propertiesData.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Properties" description="Manage your rental properties" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={280} className="rounded-[var(--radius-xl)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Properties"
        description={`${propertiesData.length} properties • ${propertiesData.reduce((a, p) => a + p.total_units, 0)} total units`}
        actions={
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add Property
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description={search ? 'Try adjusting your search' : 'Add your first property to get started'}
          action={
            !search && (
              <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                Add Property
              </Button>
            )
          }
        />
      ) : (
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const occupancyRate = (property.occupied_units / property.total_units) * 100;
            return (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="property-card"
                style={{ opacity: 0 }}
              >
                <GlassCard hover padding="none" className="overflow-hidden">
                  {/* Property Image / Placeholder */}
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 size={48} className="text-white/30" />
                    </div>
                    <Badge
                      variant={occupancyRate >= 80 ? 'success' : 'warning'}
                      className="absolute top-3 right-3"
                    >
                      {formatPercentage(occupancyRate)} occupied
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-title text-[var(--color-text-primary)] mb-1">
                      {property.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1 mb-4">
                      <MapPin size={14} />
                      {property.address}, {property.city}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Units</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {property.occupied_units} / {property.total_units}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Monthly Revenue</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {formatCurrency(property.monthly_revenue)}
                        </p>
                      </div>
                    </div>

                    <ProgressBar
                      value={occupancyRate}
                      showValue={false}
                      variant={occupancyRate >= 80 ? 'success' : 'warning'}
                      size="sm"
                    />
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY DETAIL
// ═══════════════════════════════════════════════════════════════════════════

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('units');
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);

  const property = propertiesData.find((p) => p.id === id);
  const units = unitsData.filter((u) => u.property_id === id);

  if (!property) {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={Building2}
          title="Property not found"
          description="The property you're looking for doesn't exist"
          action={
            <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
          }
        />
      </div>
    );
  }

  const occupancyRate = (property.occupied_units / property.total_units) * 100;

  const tabs = [
    { id: 'units', label: 'Units', count: units.length },
    { id: 'tenants', label: 'Tenants', count: property.occupied_units },
    { id: 'payments', label: 'Payments' },
    { id: 'settings', label: 'Settings' },
  ];

  const unitColumns = [
    { key: 'unit_number', header: 'Unit', width: '100px' },
    { key: 'bedrooms', header: 'Bedrooms', render: (u: typeof units[0]) => `${u.bedrooms} BR` },
    {
      key: 'rent_amount',
      header: 'Rent',
      render: (u: typeof units[0]) => formatCurrency(u.rent_amount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: typeof units[0]) => (
        <Badge
          variant={
            u.status === 'occupied'
              ? 'success'
              : u.status === 'vacant'
              ? 'warning'
              : 'info'
          }
        >
          {u.status}
        </Badge>
      ),
    },
    {
      key: 'tenant_name',
      header: 'Tenant',
      render: (u: typeof units[0]) =>
        u.tenant_name ? (
          <div className="flex items-center gap-2">
            <Avatar name={u.tenant_name} size="xs" />
            <span>{u.tenant_name}</span>
          </div>
        ) : (
          <span className="text-[var(--color-text-muted)]">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={property.name}
        description={`${property.address}, ${property.city}`}
        breadcrumbs={[
          { label: 'Properties', href: '/properties' },
          { label: property.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={Edit}>
              Edit
            </Button>
            <Button icon={Plus} onClick={() => setIsAddUnitModalOpen(true)}>
              Add Unit
            </Button>
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
              <p className="text-xs text-[var(--color-text-muted)]">Total Units</p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {property.total_units}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
              <Users size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Occupancy</p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {formatPercentage(occupancyRate)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
              <Building2 size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Monthly Revenue</p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {formatCurrency(property.monthly_revenue)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-light)] flex items-center justify-center">
              <Droplets size={20} className="text-[var(--color-warning)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Pending</p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {formatCurrency(property.pending_amount)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'units' && (
        <DataTable
          columns={unitColumns}
          data={units}
          keyField="id"
          onRowClick={(unit) => navigate(`/units/${unit.id}`)}
          emptyState={
            <EmptyState
              icon={Home}
              title="No units yet"
              description="Add your first unit to this property"
              action={
                <Button icon={Plus} onClick={() => setIsAddUnitModalOpen(true)}>
                  Add Unit
                </Button>
              }
            />
          }
        />
      )}

      {activeTab === 'tenants' && (
        <EmptyState
          icon={Users}
          title="Tenant list"
          description="View all tenants in this property"
        />
      )}

      {activeTab === 'payments' && (
        <EmptyState
          icon={Building2}
          title="Payment history"
          description="View all payments for this property"
        />
      )}

      {activeTab === 'settings' && (
        <GlassCard>
          <h3 className="text-title text-[var(--color-text-primary)] mb-4">Property Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Water Rate (KES per unit)"
              type="number"
              value={property.water_rate}
              readOnly
            />
            <Input
              label="Billing Day"
              type="number"
              value={property.billing_day}
              readOnly
            />
          </div>
        </GlassCard>
      )}

      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        propertyId={property.id}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════

function AddPropertyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
      title="Add New Property"
      description="Enter the details for your new property"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            Add Property
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input label="Property Name" placeholder="e.g., Sunset Apartments" required />
        <Input label="Address" placeholder="123 Main Street" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" placeholder="Nairobi" required />
          <Input label="County" placeholder="Nairobi" />
        </div>
        <Select
          label="Property Type"
          options={[
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'mixed', label: 'Mixed Use' },
          ]}
          placeholder="Select type"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Water Rate (KES/unit)" type="number" placeholder="50" />
          <Input label="Billing Day" type="number" placeholder="1" />
        </div>
        <Textarea label="Description" placeholder="Property description..." />
      </form>
    </Modal>
  );
}

function AddUnitModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}) {
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
      description="Enter the details for the new unit"
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
        <Input label="Unit Number" placeholder="e.g., A-101" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bedrooms" type="number" placeholder="2" />
          <Input label="Bathrooms" type="number" placeholder="1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Rent Amount (KES)" type="number" placeholder="25000" required />
          <Input label="Deposit (KES)" type="number" placeholder="25000" />
        </div>
        <Input label="Size (sqm)" type="number" placeholder="60" />
        <Input label="Meter Number" placeholder="Optional" />
        <Textarea label="Description" placeholder="Unit description..." />
      </form>
    </Modal>
  );
}

export default Properties;
