import React, { useState, useEffect } from 'react';
import { PageHeader, StatCard, Card, Badge, Avatar } from '@/components/ui';
import { Building2, Home, Users, CreditCard, TrendingUp, AlertCircle, Droplets, ReceiptText, Wrench } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils';
import type { DashboardStats, RecentActivity } from '@/types';

// Mock Data for Demo
const MOCK_STATS: DashboardStats = {
  total_properties: 4,
  total_units: 48,
  occupied_units: 42,
  occupancy_rate: 87.5,
  total_revenue: 1850000,
  collected_revenue: 1620000,
  collection_rate: 87.6,
  overdue_amount: 145000,
  overdue_count: 8,
  active_tenants: 42,
  pending_maintenance: 3,
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  { id: '1', type: 'payment', title: 'Payment Received', description: 'KES 25,000 from Grace Wanjiku via MPESA', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '2', type: 'lease', title: 'New Lease Signed', description: 'Peter Ochieng moved into Sunset A-101', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', type: 'meter_reading', title: 'Meter Readings Updated', description: 'Readings recorded for Green Valley Estate', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '4', type: 'maintenance', title: 'Maintenance Request', description: 'Plumbing issue reported at City View Tower', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

export const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setActivities(MOCK_ACTIVITIES);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Admin'}`}
        description="Here's what's happening with your properties today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          label="Total Revenue (Monthly)"
          value={stats?.total_revenue || 0}
          isCurrency
          icon={TrendingUp}
          variant="success"
          isLoading={isLoading}
          change={12.5}
          changeLabel="vs last month"
          className="animate-fade-up stagger-1"
        />
        <StatCard
          label="Collected Revenue"
          value={stats?.collected_revenue || 0}
          isCurrency
          icon={CreditCard}
          variant="default"
          isLoading={isLoading}
          className="animate-fade-up stagger-2"
        />
        <StatCard
          label="Overdue Amount"
          value={stats?.overdue_amount || 0}
          isCurrency
          icon={AlertCircle}
          variant="danger"
          isLoading={isLoading}
          className="animate-fade-up stagger-3"
        />
        <StatCard
          label="Occupancy Rate"
          value={stats?.occupancy_rate || 0}
          change={2.1}
          icon={Home}
          variant="info"
          isLoading={isLoading}
          className="animate-fade-up stagger-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Main Content Area (Charts / Tables) */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg" className="animate-fade-up stagger-5 min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-title">Revenue Overview</h3>
              <select className="bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-md px-2 py-1 text-xs">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            
            {/* Simple CSS Bar Chart Placeholder */}
            {isLoading ? (
              <div className="flex h-48 items-end justify-between gap-2 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full bg-[rgba(255,255,255,0.05)] rounded-t-md" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-end justify-between gap-2">
                {[40, 65, 45, 80, 55, 90].map((height, i) => (
                  <div key={i} className="w-full relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface-3)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-[var(--color-border)]">
                      KES {Math.round(height * 20000).toLocaleString()}
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-[var(--color-accent-muted)] to-[var(--color-accent)] rounded-t-[var(--radius-sm)] chart-bar" 
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-center text-[10px] text-[var(--color-text-tertiary)] mt-2 uppercase font-medium tracking-wider">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card padding="md" className="animate-fade-up stagger-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[var(--color-border-hover)] transition-all">
                  <ReceiptText size={20} className="text-[var(--color-accent)]" />
                  <span className="text-xs font-medium">Record Payment</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[var(--color-border-hover)] transition-all">
                  <Droplets size={20} className="text-[var(--color-info)]" />
                  <span className="text-xs font-medium">Meter Reading</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[var(--color-border-hover)] transition-all">
                  <Users size={20} className="text-[var(--color-success)]" />
                  <span className="text-xs font-medium">Add Tenant</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[var(--color-border-hover)] transition-all">
                  <AlertCircle size={20} className="text-[var(--color-warning)]" />
                  <span className="text-xs font-medium">Send Reminders</span>
                </button>
              </div>
            </Card>
            
            <Card padding="md" className="animate-fade-up stagger-7">
               <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Collection Progress</h3>
              </div>
              <div className="flex items-end justify-between mb-2">
                <div className="text-2xl font-bold font-mono text-[var(--color-success)]">
                  {stats?.collection_rate || 0}%
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] mb-1">
                  of KES {(stats?.total_revenue || 0).toLocaleString()} expected
                </div>
              </div>
              <div className="progress-bar mb-6">
                <div 
                  className="progress-bar-fill bg-[var(--color-success)]" 
                  style={{ width: `${stats?.collection_rate || 0}%` }} 
                />
              </div>

              <h4 className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Top Overdue Accounts</h4>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={`Tenant ${i}`} size="sm" />
                      <div>
                        <p className="text-sm">Tenant {i}</p>
                        <p className="text-[10px] text-[var(--color-danger)]">{i * 5} days overdue</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-medium">KES {(25000 * i).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar (Activity Feed) */}
        <div className="space-y-6">
          <Card padding="md" className="animate-fade-up stagger-5 h-full">
            <h3 className="font-medium mb-6">Recent Activity</h3>
            
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border)]" />
                <div className="space-y-6 relative">
                  {activities.map((activity, i) => {
                    let Icon = CreditCard;
                    let colorClass = 'text-[var(--color-success)] bg-[var(--color-success-muted)]';
                    
                    if (activity.type === 'lease') {
                      Icon = Users;
                      colorClass = 'text-[var(--color-info)] bg-[var(--color-info-muted)]';
                    } else if (activity.type === 'meter_reading') {
                      Icon = Droplets;
                      colorClass = 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]';
                    } else if (activity.type === 'maintenance') {
                      Icon = Wrench;
                      colorClass = 'text-[var(--color-warning)] bg-[var(--color-warning-muted)]';
                    }

                    return (
                      <div key={activity.id} className="flex gap-4 relative">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[var(--color-surface)] ring-4 ring-[var(--color-surface)] z-10', colorClass)}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{activity.description}</p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1.5 uppercase font-medium tracking-wider">
                            {formatRelativeTime(new Date(activity.timestamp))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
