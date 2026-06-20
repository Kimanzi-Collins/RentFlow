import React from 'react';
import { PageHeader, Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { Save, User, Bell, Shield, Wallet } from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile } = useAuthStore();

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and application settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <nav className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary transition-colors text-left">
            <User size={16} />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left">
            <Shield size={16} />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left">
            <Wallet size={16} />
            Billing
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left">
            <Bell size={16} />
            Notifications
          </button>
        </nav>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
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
                
                <div className="pt-4 flex justify-end">
                  <Button leftIcon={<Save size={16} />}>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/10">
                <div>
                  <h4 className="font-semibold text-sm">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button variant="danger" size="sm" className="shrink-0">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
