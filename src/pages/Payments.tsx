import { useState, useRef, useEffect } from 'react';
import {
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
import { formatCurrency, formatDate, formatRelativeTime, formatPhone } from '@/lib/utils';
import { animateCardsIn } from '@/lib/animations';
import {
  CreditCard,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Smartphone,
  Building,
  Banknote,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const paymentsData = [
  {
    id: '1',
    tenant_name: 'Grace Wanjiku',
    tenant_phone: '0712345678',
    unit_number: 'A-101',
    property_name: 'Sunset Apartments',
    amount: 25000,
    payment_method: 'mpesa',
    payment_status: 'completed',
    mpesa_receipt_number: 'QWE123RTY456',
    payment_date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    tenant_name: 'Peter Ochieng',
    tenant_phone: '0723456789',
    unit_number: 'B-205',
    property_name: 'Sunset Apartments',
    amount: 18000,
    payment_method: 'mpesa',
    payment_status: 'completed',
    mpesa_receipt_number: 'ASD456FGH789',
    payment_date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    tenant_name: 'Mary Njeri',
    tenant_phone: '0734567890',
    unit_number: 'C-301',
    property_name: 'Green Valley',
    amount: 32000,
    payment_method: 'bank_transfer',
    payment_status: 'completed',
    mpesa_receipt_number: null,
    payment_date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '4',
    tenant_name: 'James Mwangi',
    tenant_phone: '0745678901',
    unit_number: 'A-108',
    property_name: 'Sunset Apartments',
    amount: 22000,
    payment_method: 'mpesa',
    payment_status: 'completed',
    mpesa_receipt_number: 'ZXC789VBN012',
    payment_date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: '5',
    tenant_name: 'Sarah Mutua',
    tenant_phone: '0756789012',
    unit_number: 'C-102',
    property_name: 'City View Tower',
    amount: 28000,
    payment_method: 'cash',
    payment_status: 'completed',
    mpesa_receipt_number: null,
    payment_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '6',
    tenant_name: 'David Otieno',
    tenant_phone: '0767890123',
    unit_number: 'B-401',
    property_name: 'Riverside Gardens',
    amount: 35000,
    payment_method: 'mpesa',
    payment_status: 'pending',
    mpesa_receipt_number: null,
    payment_date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

const stats = {
  todayCollected: 97000,
  monthCollected: 1620000,
  pendingPayments: 230000,
  overduePayments: 145000,
};

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENTS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
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

  const filteredPayments = paymentsData.filter((p) => {
    const matchesSearch =
      p.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
      p.unit_number.toLowerCase().includes(search.toLowerCase()) ||
      p.mpesa_receipt_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'all', label: 'All', count: paymentsData.length },
    { id: 'completed', label: 'Completed', count: paymentsData.filter((p) => p.payment_status === 'completed').length },
    { id: 'pending', label: 'Pending', count: paymentsData.filter((p) => p.payment_status === 'pending').length },
    { id: 'failed', label: 'Failed', count: 0 },
  ];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return Smartphone;
      case 'bank_transfer':
        return Building;
      case 'cash':
        return Banknote;
      default:
        return CreditCard;
    }
  };

  const columns = [
    {
      key: 'tenant_name',
      header: 'Tenant',
      render: (p: typeof paymentsData[0]) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.tenant_name} size="sm" />
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">{p.tenant_name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{formatPhone(p.tenant_phone)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (p: typeof paymentsData[0]) => (
        <div>
          <p className="font-medium">{p.unit_number}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{p.property_name}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p: typeof paymentsData[0]) => (
        <span className="font-semibold text-[var(--color-success)]">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (p: typeof paymentsData[0]) => {
        const Icon = getMethodIcon(p.payment_method);
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-[var(--color-text-muted)]" />
            <span className="capitalize">{p.payment_method.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: typeof paymentsData[0]) => <StatusBadge status={p.payment_status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (p: typeof paymentsData[0]) => (
        <div>
          <p>{formatDate(p.payment_date)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatRelativeTime(p.payment_date)}
          </p>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Payments" description="Track and manage rent payments" />
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
        title="Payments"
        description="Track and manage rent payments"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
            <Button icon={CreditCard} onClick={() => setIsRecordPaymentOpen(true)}>
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Today's Collection"
            value={formatCurrency(stats.todayCollected)}
            icon={CheckCircle}
            variant="success"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Monthly Collection"
            value={formatCurrency(stats.monthCollected)}
            icon={TrendingUp}
            variant="accent"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Pending Payments"
            value={formatCurrency(stats.pendingPayments)}
            icon={Clock}
            variant="warning"
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Overdue Payments"
            value={formatCurrency(stats.overduePayments)}
            icon={AlertCircle}
            variant="danger"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={statusFilter} onChange={setStatusFilter} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:min-w-[280px]">
            <SearchInput
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <Button variant="secondary" icon={Filter}>
            Filter
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        keyField="id"
        onRowClick={(payment) => console.log('View payment', payment)}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description={search ? 'Try adjusting your search' : 'Payments will appear here when received'}
          />
        }
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════

function RecordPaymentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
      description="Manually record a payment received"
      size="lg"
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
        <Select
          label="Tenant"
          options={paymentsData.map((p) => ({
            value: p.id,
            label: `${p.tenant_name} - ${p.unit_number}`,
          }))}
          placeholder="Select tenant"
        />
        <Input label="Amount (KES)" type="number" placeholder="25000" required />
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
        <Input label="Transaction ID / Receipt Number" placeholder="Optional" />
        <Input label="Payment Date" type="date" />
        <Input label="Notes" placeholder="Optional notes..." />
      </form>
    </Modal>
  );
}

export default Payments;
