import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GlassCard,
  StatCard,
  Badge,
  Avatar,
  ProgressBar,
  Button,
  PageHeader,
} from '@/components/ui';
import { cn, formatCurrency, formatRelativeTime, formatPercentage } from '@/lib/utils';
import { animateCardsIn, animateCurrencyCounter } from '@/lib/animations';
import {
  Building2,
  Home,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Droplets,
  Plus,
  Download,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const stats = {
  totalProperties: 4,
  totalUnits: 48,
  occupiedUnits: 42,
  vacantUnits: 6,
  occupancyRate: 87.5,
  totalRevenue: 1850000,
  collectedRevenue: 1620000,
  pendingRevenue: 230000,
  collectionRate: 87.6,
  overdueAmount: 145000,
  overdueCount: 8,
};

const recentPayments = [
  {
    id: '1',
    tenant: 'Grace Wanjiku',
    unit: 'A-102',
    property: 'Sunset Apartments',
    amount: 25000,
    method: 'MPESA',
    time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    tenant: 'Peter Ochieng',
    unit: 'B-205',
    property: 'Sunset Apartments',
    amount: 18000,
    method: 'MPESA',
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    tenant: 'Mary Njeri',
    unit: 'C-301',
    property: 'Green Valley',
    amount: 32000,
    method: 'Bank Transfer',
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '4',
    tenant: 'James Mwangi',
    unit: 'A-108',
    property: 'Sunset Apartments',
    amount: 22000,
    method: 'MPESA',
    time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const overdueAccounts = [
  { id: '1', tenant: 'Alice Kamau', unit: 'B-103', amount: 45000, days: 12 },
  { id: '2', tenant: 'John Kiprop', unit: 'A-205', amount: 28000, days: 8 },
  { id: '3', tenant: 'Sarah Mutua', unit: 'C-102', amount: 38000, days: 5 },
  { id: '4', tenant: 'David Otieno', unit: 'B-401', amount: 34000, days: 3 },
];

const properties = [
  { id: '1', name: 'Sunset Apartments', units: 24, occupied: 22, revenue: 528000 },
  { id: '2', name: 'Green Valley Estate', units: 12, occupied: 10, revenue: 380000 },
  { id: '3', name: 'City View Tower', units: 8, occupied: 7, revenue: 420000 },
  { id: '4', name: 'Riverside Gardens', units: 4, occupied: 3, revenue: 292000 },
];

const recentActivities = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment received',
    description: 'Grace Wanjiku paid KES 25,000 for A-102',
    time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    icon: CreditCard,
    color: 'success',
  },
  {
    id: '2',
    type: 'lease',
    title: 'New lease created',
    description: 'Michael Odera moved into B-108',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    icon: CheckCircle,
    color: 'info',
  },
  {
    id: '3',
    type: 'meter',
    title: 'Meter reading submitted',
    description: 'Water readings for Sunset Apartments updated',
    time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    icon: Droplets,
    color: 'default',
  },
  {
    id: '4',
    type: 'overdue',
    title: 'Payment overdue',
    description: 'Alice Kamau has outstanding balance of KES 45,000',
    time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    icon: AlertCircle,
    color: 'danger',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function Dashboard() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const revenueRef = useRef<HTMLSpanElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentMonth] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
  });

  useEffect(() => {
    // Animate stat cards
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.stat-card');
      animateCardsIn(cards, { stagger: 0.08 });
    }

    // Animate revenue counter
    if (revenueRef.current) {
      animateCurrencyCounter(revenueRef.current, stats.collectedRevenue, {
        duration: 1.5,
      });
    }
  }, []);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    
    // Simulate generating report
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create report data
    const reportData = {
      title: `RentFlow Monthly Report - ${currentMonth}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalProperties: stats.totalProperties,
        totalUnits: stats.totalUnits,
        occupiedUnits: stats.occupiedUnits,
        vacantUnits: stats.vacantUnits,
        occupancyRate: stats.occupancyRate,
        totalRevenue: stats.totalRevenue,
        collectedRevenue: stats.collectedRevenue,
        pendingRevenue: stats.pendingRevenue,
        collectionRate: stats.collectionRate,
        overdueAmount: stats.overdueAmount,
        overdueCount: stats.overdueCount,
      },
      recentPayments: recentPayments.map(p => ({
        tenant: p.tenant,
        unit: p.unit,
        property: p.property,
        amount: p.amount,
        method: p.method,
        date: new Date(p.time).toLocaleDateString('en-KE'),
      })),
      overdueAccounts: overdueAccounts.map(a => ({
        tenant: a.tenant,
        unit: a.unit,
        amount: a.amount,
        daysOverdue: a.days,
      })),
      properties: properties.map(p => ({
        name: p.name,
        totalUnits: p.units,
        occupied: p.occupied,
        revenue: p.revenue,
        occupancyRate: Math.round((p.occupied / p.units) * 100),
      })),
    };
    
    // Create and download file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rentflow-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${currentMonth}`}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              icon={Download}
              loading={isDownloading}
              onClick={handleDownloadReport}
            >
              {isDownloading ? 'Generating...' : 'Download Report'}
            </Button>
            <Button icon={Plus} size="sm">
              Quick Action
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={Building2}
            variant="accent"
            change={{ value: 0, label: 'vs last month' }}
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Total Units"
            value={`${stats.occupiedUnits} / ${stats.totalUnits}`}
            icon={Home}
            variant="success"
            change={{ value: 4.2, label: 'occupancy' }}
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Active Tenants"
            value={stats.occupiedUnits}
            icon={Users}
            variant="default"
            change={{ value: 2, label: 'new this month' }}
          />
        </div>
        <div className="stat-card" style={{ opacity: 0 }}>
          <StatCard
            title="Collection Rate"
            value={formatPercentage(stats.collectionRate)}
            icon={TrendingUp}
            variant="success"
            change={{ value: 3.4, label: 'vs last month' }}
          />
        </div>
      </div>

      {/* Revenue Overview + Collection Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-title text-[var(--color-text-primary)]">Revenue Overview</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{currentMonth}</p>
            </div>
            <Badge variant="success" dot>
              On Track
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Collected</p>
              <p className="text-2xl font-semibold text-[var(--color-success)]">
                <span ref={revenueRef}>KES 0</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Pending</p>
              <p className="text-2xl font-semibold text-[var(--color-warning)]">
                {formatCurrency(stats.pendingRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Expected</p>
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={stats.collectionRate}
              variant="success"
              label="Collection Progress"
            />
          </div>

          {/* Simple Bar Chart Placeholder */}
          <div className="mt-8 h-48 flex items-end gap-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [65, 78, 82, 70, 88, 87];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-[var(--color-accent)] rounded-t-md transition-all"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">{month}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Overdue Accounts */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title text-[var(--color-text-primary)]">Overdue Accounts</h3>
            <Badge variant="danger">{stats.overdueCount}</Badge>
          </div>

          <div className="space-y-3">
            {overdueAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-glass)] hover:bg-[var(--color-glass-hover)] transition-colors cursor-pointer"
              >
                <Avatar name={account.tenant} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {account.tenant}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Unit {account.unit} • {account.days} days overdue
                  </p>
                </div>
                <p className="text-sm font-medium text-[var(--color-danger)]">
                  {formatCurrency(account.amount)}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/payments"
            className="flex items-center justify-center gap-2 mt-4 py-2 text-sm text-[var(--color-accent)] hover:underline"
          >
            View all overdue
            <ArrowRight size={14} />
          </Link>
        </GlassCard>
      </div>

      {/* Recent Payments + Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title text-[var(--color-text-primary)]">Recent Payments</h3>
            <Link
              to="/payments"
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-glass)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
                  <CreditCard size={18} className="text-[var(--color-success)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {payment.tenant}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {payment.unit} • {payment.property}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--color-success)]">
                    +{formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {formatRelativeTime(payment.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Properties Overview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title text-[var(--color-text-primary)]">Properties</h3>
            <Link
              to="/properties"
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {properties.map((property) => {
              const occupancyRate = (property.occupied / property.units) * 100;
              return (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className="block p-3 rounded-lg hover:bg-[var(--color-glass)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {property.name}
                    </p>
                    <Badge
                      variant={occupancyRate >= 80 ? 'success' : occupancyRate >= 50 ? 'warning' : 'danger'}
                    >
                      {property.occupied}/{property.units} units
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Revenue: {formatCurrency(property.revenue)}</span>
                    <span>{formatPercentage(occupancyRate)} occupied</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        occupancyRate >= 80
                          ? 'bg-[var(--color-success)]'
                          : occupancyRate >= 50
                          ? 'bg-[var(--color-warning)]'
                          : 'bg-[var(--color-danger)]'
                      )}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Activity Feed */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-title text-[var(--color-text-primary)]">Recent Activity</h3>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            const colorClasses = {
              success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
              danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
              info: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
              default: 'bg-[var(--color-glass)] text-[var(--color-text-muted)]',
            };

            return (
              <div
                key={activity.id}
                className="p-4 rounded-lg bg-[var(--color-glass)] hover:bg-[var(--color-glass-hover)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      colorClasses[activity.color as keyof typeof colorClasses]
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {activity.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 flex items-center gap-1">
                      <Clock size={12} />
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

export default Dashboard;
