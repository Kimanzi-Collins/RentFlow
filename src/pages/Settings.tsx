import React from 'react';
import { PageHeader, Card, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { Save, User, Bell, Shield, Wallet } from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and application settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] transition-colors text-left">
            <User size={18} />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-colors text-left">
            <Shield size={18} />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-colors text-left">
            <Wallet size={18} />
            Billing
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-colors text-left">
            <Bell size={18} />
            Notifications
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <Card padding="lg">
            <h3 className="text-title mb-6">Profile Information</h3>
            
            <div className="space-y-5 max-w-md">
              <Input
                label="Full Name"
                defaultValue={profile?.full_name || ''}
              />
              <Input
                label="Email Address"
                type="email"
                defaultValue={profile?.email || ''}
                disabled
                hint="Contact support to change your email address."
              />
              <Input
                label="Phone Number"
                type="tel"
                defaultValue={profile?.phone || ''}
                placeholder="+254 7XX XXX XXX"
              />
              
              <div className="pt-4 border-t border-[var(--color-border)]/50">
                <Button leftIcon={<Save size={16} />}>Save Changes</Button>
              </div>
            </div>
          </Card>

          <Card padding="lg" variant="subtle">
            <h3 className="text-title mb-2 text-[var(--color-danger)]">Danger Zone</h3>
            <p className="text-body-sm text-[var(--color-text-secondary)] mb-6">Irreversible and destructive actions.</p>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger-muted)]">
              <div>
                <h4 className="font-medium text-white text-sm">Delete Account</h4>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1 max-w-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
