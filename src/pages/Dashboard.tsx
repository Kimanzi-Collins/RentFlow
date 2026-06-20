import React, { useState, useEffect } from 'react';
import { PageHeader, StatCard, Card, CardContent, CardHeader, CardTitle, Avatar } from '@/components/ui';
import { Home, Users, CreditCard, TrendingUp, AlertCircle, Droplets, ReceiptText, Wrench } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime } from '@/lib/utils';
import type { DashboardStats, RecentActivity } from '@/types';

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
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setActivities(MOCK_ACTIVITIES);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Admin'}`}
        description="Here's what's happening with your properties today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={stats?.total_revenue || 0}
          isCurrency
          icon={TrendingUp}
          variant="success"
          isLoading={isLoading}
          change={12.5}
          changeLabel="vs last month"
        />
        <StatCard
          label="Collected"
          value={stats?.collected_revenue || 0}
          isCurrency
          icon={CreditCard}
          variant="default"
          isLoading={isLoading}
        />
        <StatCard
          label="Overdue Amount"
          value={stats?.overdue_amount || 0}
          isCurrency
          icon={AlertCircle}
          variant="danger"
          isLoading={isLoading}
        />
        <StatCard
          label="Occupancy Rate"
          value={stats?.occupancy_rate || 0}
          change={2.1}
          icon={Home}
          variant="info"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Revenue Overview</CardTitle>
              <select className="h-8 w-[120px] rounded-md border border-input bg-background px-3 text-xs">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[200px] items-end justify-between gap-2 mt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full bg-muted rounded-t-sm animate-pulse" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-end justify-between gap-2 mt-4">
                  {[40, 65, 45, 80, 55, 90].map((height, i) => (
                    <div key={i} className="w-full relative group flex flex-col items-center">
                      <div className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm" style={{ height: `${height}%` }} />
                      <div className="text-xs text-muted-foreground mt-2">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border bg-card hover:bg-muted transition-colors">
                    <ReceiptText size={18} className="text-muted-foreground" />
                    <span className="text-xs font-medium">Payment</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border bg-card hover:bg-muted transition-colors">
                    <Droplets size={18} className="text-muted-foreground" />
                    <span className="text-xs font-medium">Meter</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border bg-card hover:bg-muted transition-colors">
                    <Users size={18} className="text-muted-foreground" />
                    <span className="text-xs font-medium">Tenant</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border bg-card hover:bg-muted transition-colors">
                    <AlertCircle size={18} className="text-muted-foreground" />
                    <span className="text-xs font-medium">Reminders</span>
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Collection Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">
                    {stats?.collection_rate || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of KES {(stats?.total_revenue || 0).toLocaleString()}
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-green-500" style={{ width: `${stats?.collection_rate || 0}%` }} />
                </div>

                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={`Tenant ${i}`} size="xs" />
                        <div>
                          <p className="text-sm font-medium">Tenant {i}</p>
                          <p className="text-xs text-red-500">{i * 5} days overdue</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">KES {(25000 * i).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                  {activities.map((activity) => {
                    let Icon = CreditCard;
                    
                    if (activity.type === 'lease') Icon = Users;
                    else if (activity.type === 'meter_reading') Icon = Droplets;
                    else if (activity.type === 'maintenance') Icon = Wrench;

                    return (
                      <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                          <Icon size={14} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-odd:text-right md:group-even:pl-8">
                          <p className="text-sm font-semibold">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          <time className="block text-[10px] font-medium text-muted-foreground mt-2 uppercase tracking-wider">
                            {formatRelativeTime(new Date(activity.timestamp))}
                          </time>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
