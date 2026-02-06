import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  DataTable,
  Avatar,
  StatusBadge,
} from '@/components/ui';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils';
import { animateCardsIn } from '@/lib/animations';
import {
  Plus,
  Users,
  Phone,
  Mail,
  Home,
  CreditCard,
  FileText,
  Edit,
  MessageSquare,
  Calendar,
  AlertCircle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const tenantsData = [
  {
    id: '1',
    full_name: 'Grace Wanjiku',
    phone: '0712345678',
    email: 'grace@email.com',
    status: 'active',
    current_unit_number: 'A-101',
    current_property_name: 'Sunset Apartments',
    balance: 0,
    move_in_date: '2023-06-15',
  },
  {
    id: '2',
    full_name: 'Peter Ochieng',
    phone: '0723456789',
    email: 'peter@email.com',
    status: 'active',
    current_unit_number: 'A-102',
    current_property_name: 'Sunset Apartments',
    balance: 5000,
    move_in_date: '2023-08-01',
  },
  {
    id: '3',
    full_name: 'Mary Njeri',
    phone: '0734567890',
    email: null,
    status: 'active',
    current_unit_number: 'C-301',
    current_property_name: 'Green Valley',
    balance: 0,
    move_in_date: '2024-01-10',
  },
  {
    id: '4',
    full_name: 'Alice Kamau',
    phone: '0745678901',
    email: 'alice@email.com',
    status: 'active',
    current_unit_number: 'B-103',
    current_property_name: 'Sunset Apartments',
    balance: 45000,
    move_in_date: '2022-03-20',
  },
  {
    id: '5',
    full_name: 'John Kiprop',
    phone: '0756789012',
    email: null,
    status: 'active',
    current_unit_number: 'A-205',
    current_property_name: 'City View Tower',
    balance: 28000,
    move_in_date: '2023-11-05',
  },
  {
    id: '6',
    full_name: 'James Mwangi',
    phone: '0767890123',
    email: 'james.m@email.com',
    status: 'active',
    current_unit_number: 'B-202',
    current_property_name: 'Sunset Apartments',
    balance: 0,
    move_in_date: '2024-02-01',
  },
];

const paymentHistory = [
  { id: '1', date: '2024-01-05', amount: 25000, method: 'MPESA', reference: 'QWE123RTY', status: 'completed' },
  { id: '2', date: '2023-12-03', amount: 25000, method: 'MPESA', reference: 'ASD456FGH', status: 'completed' },
  { id: '3', date: '2023-11-04', amount: 25000, method: 'MPESA', reference: 'ZXC789VBN', status: 'completed' },
  { id: '4', date: '2023-10-05', amount: 25000, method: 'Bank Transfer', reference: 'BNK001234', status: 'completed' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TENANTS LIST
// ═══════════════════════════════════════════════════════════════════════════

export function Tenants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const rows = cardsRef.current.querySelectorAll('tbody tr');
      animateCardsIn(rows, { stagger: 0.03 });
    }
  }, []);

  const filteredTenants = tenantsData.filter((t) => {
    const matchesSearch =
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.current_unit_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'all', label: 'All', count: tenantsData.length },
    { id: 'active', label: 'Active', count: tenantsData.filter((t) => t.status === 'active').length },
    { id: 'inactive', label: 'Inactive', count: tenantsData.filter((t) => t.status === 'inactive').length },
  ];

  const columns = [
    {
      key: 'full_name',
      header: 'Tenant',
      render: (t: typeof tenantsData[0]) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.full_name} size="sm" />
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">{t.full_name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{formatPhone(t.phone)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (t: typeof tenantsData[0]) => (
        <div>
          <p className="font-medium">{t.current_unit_number}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{t.current_property_name}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: typeof tenantsData[0]) => <StatusBadge status={t.status} />,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (t: typeof tenantsData[0]) => (
        <span
          className={
            t.balance > 0
              ? 'text-[var(--color-danger)] font-medium'
              : 'text-[var(--color-success)]'
          }
        >
          {t.balance > 0 ? formatCurrency(t.balance) : 'Paid'}
        </span>
      ),
    },
    {
      key: 'move_in_date',
      header: 'Move-in Date',
      render: (t: typeof tenantsData[0]) => formatDate(t.move_in_date),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tenants"
        description={`${tenantsData.length} total tenants`}
        actions={
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add Tenant
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={statusFilter} onChange={setStatusFilter} />
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <SearchInput
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div ref={cardsRef}>
        <DataTable
          columns={columns}
          data={filteredTenants}
          keyField="id"
          onRowClick={(tenant) => navigate(`/tenants/${tenant.id}`)}
          emptyState={
            <EmptyState
              icon={Users}
              title="No tenants found"
              description={search ? 'Try adjusting your search' : 'Add your first tenant to get started'}
              action={
                !search && (
                  <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                    Add Tenant
                  </Button>
                )
              }
            />
          }
        />
      </div>

      {/* Add Tenant Modal */}
      <AddTenantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TENANT DETAIL
// ═══════════════════════════════════════════════════════════════════════════

export function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  const tenant = tenantsData.find((t) => t.id === id);

  if (!tenant) {
    return (
      <EmptyState
        icon={Users}
        title="Tenant not found"
        description="The tenant you're looking for doesn't exist"
        action={<Button onClick={() => navigate('/tenants')}>Back to Tenants</Button>}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'Payments' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'documents', label: 'Documents' },
  ];

  const paymentColumns = [
    { key: 'date', header: 'Date', render: (p: typeof paymentHistory[0]) => formatDate(p.date) },
    { key: 'amount', header: 'Amount', render: (p: typeof paymentHistory[0]) => formatCurrency(p.amount) },
    { key: 'method', header: 'Method' },
    { key: 'reference', header: 'Reference' },
    { key: 'status', header: 'Status', render: (p: typeof paymentHistory[0]) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={tenant.full_name}
        description={`${tenant.current_unit_number} • ${tenant.current_property_name}`}
        breadcrumbs={[
          { label: 'Tenants', href: '/tenants' },
          { label: tenant.full_name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={MessageSquare}>
              Send SMS
            </Button>
            <Button icon={CreditCard} onClick={() => setIsRecordPaymentOpen(true)}>
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Tenant Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <GlassCard>
          <h3 className="text-title text-[var(--color-text-primary)] mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-glass)] flex items-center justify-center">
                <Phone size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Phone</p>
                <p className="text-sm font-medium">{formatPhone(tenant.phone)}</p>
              </div>
            </div>
            {tenant.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-glass)] flex items-center justify-center">
                  <Mail size={16} className="text-[var(--color-text-muted)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                  <p className="text-sm font-medium">{tenant.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-glass)] flex items-center justify-center">
                <Calendar size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Move-in Date</p>
                <p className="text-sm font-medium">{formatDate(tenant.move_in_date, 'long')}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Unit Info */}
        <GlassCard>
          <h3 className="text-title text-[var(--color-text-primary)] mb-4">Current Unit</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
                <Home size={16} className="text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Unit</p>
                <p className="text-sm font-medium">{tenant.current_unit_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-glass)] flex items-center justify-center">
                <FileText size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Property</p>
                <p className="text-sm font-medium">{tenant.current_property_name}</p>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full mt-4" icon={Edit}>
            View Unit Details
          </Button>
        </GlassCard>

        {/* Balance */}
        <GlassCard
          className={
            tenant.balance > 0
              ? 'border-[var(--color-danger)] border-2'
              : 'border-[var(--color-success)] border-2'
          }
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title text-[var(--color-text-primary)]">Account Balance</h3>
            {tenant.balance > 0 && (
              <Badge variant="danger" dot>
                Overdue
              </Badge>
            )}
          </div>
          <p
            className={`text-3xl font-bold ${
              tenant.balance > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'
            }`}
          >
            {tenant.balance > 0 ? formatCurrency(tenant.balance) : 'No Outstanding'}
          </p>
          {tenant.balance > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-danger-light)] flex items-start gap-2">
              <AlertCircle size={16} className="text-[var(--color-danger)] mt-0.5" />
              <p className="text-sm text-[var(--color-danger)]">
                This tenant has an outstanding balance. Consider sending a reminder.
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <GlassCard>
          <h3 className="text-title text-[var(--color-text-primary)] mb-4">Recent Activity</h3>
          <p className="text-[var(--color-text-muted)]">Activity timeline will be shown here</p>
        </GlassCard>
      )}

      {activeTab === 'payments' && (
        <DataTable
          columns={paymentColumns}
          data={paymentHistory}
          keyField="id"
          emptyState={
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Payment history will appear here"
            />
          }
        />
      )}

      {activeTab === 'invoices' && (
        <EmptyState
          icon={FileText}
          title="No invoices"
          description="Invoices for this tenant will appear here"
        />
      )}

      {activeTab === 'documents' && (
        <EmptyState
          icon={FileText}
          title="No documents"
          description="Upload lease agreements and other documents"
        />
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        tenant={tenant}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════

function AddTenantModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
      title="Add New Tenant"
      description="Enter the tenant's information"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            Add Tenant
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone Number" placeholder="0712345678" required />
          <Input label="Email (Optional)" type="email" placeholder="john@email.com" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="ID Type"
            options={[
              { value: 'national_id', label: 'National ID' },
              { value: 'passport', label: 'Passport' },
              { value: 'alien_id', label: 'Alien ID' },
            ]}
            placeholder="Select type"
          />
          <Input label="ID Number" placeholder="12345678" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Emergency Contact Name" placeholder="Jane Doe" />
          <Input label="Emergency Contact Phone" placeholder="0712345678" />
        </div>
        <Textarea label="Notes" placeholder="Additional notes about the tenant..." />
      </form>
    </Modal>
  );
}

function RecordPaymentModal({
  isOpen,
  onClose,
  tenant,
}: {
  isOpen: boolean;
  onClose: () => void;
  tenant: typeof tenantsData[0];
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
      title="Record Payment"
      description={`Recording payment for ${tenant.full_name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit} variant="success">
            Record Payment
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input
          label="Amount (KES)"
          type="number"
          placeholder="25000"
          required
        />
        <Select
          label="Payment Method"
          options={[
            { value: 'mpesa', label: 'MPESA' },
            { value: 'cash', label: 'Cash' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'cheque', label: 'Cheque' },
          ]}
          placeholder="Select method"
        />
        <Input label="Transaction ID / Reference" placeholder="Optional" />
        <Input label="Payment Date" type="date" />
        <Textarea label="Notes" placeholder="Payment notes..." />
      </form>
    </Modal>
  );
}

export default Tenants;
