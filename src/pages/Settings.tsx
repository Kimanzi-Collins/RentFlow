import { useState } from 'react';
import {
  GlassCard,
  PageHeader,
  Button,
  Input,
  Select,
  Tabs,
  Badge,
  Avatar,
} from '@/components/ui';
import {
  User,
  Building2,
  Bell,
  Shield,
  Smartphone,
  CreditCard,
  Save,
  Plus,
  Trash2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'billing', label: 'Billing' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'team', label: 'Team' },
  ];

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === 'profile' && <ProfileSettings onSave={handleSave} loading={loading} />}
        {activeTab === 'billing' && <BillingSettings onSave={handleSave} loading={loading} />}
        {activeTab === 'notifications' && <NotificationSettings onSave={handleSave} loading={loading} />}
        {activeTab === 'integrations' && <IntegrationSettings />}
        {activeTab === 'team' && <TeamSettings />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

function ProfileSettings({ onSave, loading }: { onSave: () => void; loading: boolean }) {
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
            <User size={20} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">Profile Information</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Update your personal details</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <Avatar name="Bruce Mwikya" size="xl" />
          <div>
            <Button variant="secondary" size="sm">Change Photo</Button>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue="Bruce Mwikya" />
          <Input label="Email Address" type="email" defaultValue="bruce@rentflow.co.ke" />
          <Input label="Phone Number" defaultValue="0712345678" />
          <Select
            label="Role"
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'landlord', label: 'Landlord' },
              { value: 'caretaker', label: 'Caretaker' },
            ]}
            defaultValue="landlord"
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Save} loading={loading} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-danger-light)] flex items-center justify-center">
            <Shield size={20} className="text-[var(--color-danger)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">Security</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Manage your password and security settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm Password" type="password" placeholder="••••••••" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="secondary">Update Password</Button>
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BILLING SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

function BillingSettings({ onSave, loading }: { onSave: () => void; loading: boolean }) {
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
            <Building2 size={20} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">Default Billing Settings</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Configure default billing rules for new properties</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Default Billing Day"
            type="number"
            defaultValue="1"
            hint="Day of month rent is due"
          />
          <Input
            label="Grace Period (Days)"
            type="number"
            defaultValue="5"
            hint="Days before penalty applies"
          />
          <Input
            label="Default Penalty Rate (%)"
            type="number"
            defaultValue="10"
            hint="Percentage of rent amount"
          />
          <Input
            label="Default Water Rate (KES/unit)"
            type="number"
            defaultValue="50"
            hint="Cost per unit of water"
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Save} loading={loading} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
            <CreditCard size={20} className="text-[var(--color-success)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">Invoice Settings</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Customize your invoice appearance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Business Name" defaultValue="Kamau Properties Ltd" />
          <Input label="Invoice Prefix" defaultValue="INV" />
          <Input label="Tax ID / PIN" placeholder="P051234567X" />
          <Input label="Bank Account" placeholder="For payment reference" />
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Save} loading={loading} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

function NotificationSettings({ onSave, loading }: { onSave: () => void; loading: boolean }) {
  const [smsReminders, setSmsReminders] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
            <Bell size={20} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">Notification Preferences</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Configure how you receive notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            title="SMS Rent Reminders"
            description="Send automatic SMS reminders to tenants before rent is due"
            enabled={smsReminders}
            onChange={setSmsReminders}
          />
          <NotificationToggle
            title="Payment Received Alerts"
            description="Get notified when a payment is received"
            enabled={paymentAlerts}
            onChange={setPaymentAlerts}
          />
          <NotificationToggle
            title="Overdue Payment Alerts"
            description="Get alerted when payments become overdue"
            enabled={overdueAlerts}
            onChange={setOverdueAlerts}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Save} loading={loading} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-light)] flex items-center justify-center">
            <Smartphone size={20} className="text-[var(--color-warning)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">SMS Settings</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Configure SMS provider and templates</p>
          </div>
        </div>

        <div className="space-y-4">
          <Select
            label="SMS Provider"
            options={[
              { value: 'africastalking', label: "Africa's Talking" },
              { value: 'twilio', label: 'Twilio' },
              { value: 'infobip', label: 'Infobip' },
            ]}
            defaultValue="africastalking"
          />
          <Input label="Sender ID" defaultValue="RENTFLOW" hint="Your SMS sender name" />
        </div>
      </GlassCard>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-glass)] hover:bg-[var(--color-glass-hover)] transition-colors">
      <div>
        <p className="font-medium text-[var(--color-text-primary)]">{title}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border-strong)]'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
            <Smartphone size={20} className="text-[var(--color-success)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">MPESA Integration</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Connect your MPESA Paybill account</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--color-success-light)] border border-[var(--color-success)] mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="success">Connected</Badge>
            <span className="text-sm text-[var(--color-success)]">Paybill: 123456</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Consumer Key" type="password" placeholder="••••••••" />
          <Input label="Consumer Secret" type="password" placeholder="••••••••" />
          <Input label="Shortcode / Paybill" placeholder="123456" />
          <Input label="Passkey" type="password" placeholder="••••••••" />
        </div>

        <div className="mt-4">
          <Input
            label="Confirmation URL"
            value="https://api.rentflow.co.ke/mpesa/confirmation"
            disabled
            hint="Register this URL in your MPESA portal"
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button>Update Credentials</Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-light)] flex items-center justify-center">
            <Bell size={20} className="text-[var(--color-warning)]" />
          </div>
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">SMS Provider</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Configure SMS sending for notifications</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--color-warning-light)] border border-[var(--color-warning)] mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Not Configured</Badge>
            <span className="text-sm text-[var(--color-warning)]">Set up to enable SMS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="API Key" type="password" placeholder="••••••••" />
          <Input label="Username" placeholder="sandbox" />
        </div>

        <div className="flex justify-end mt-6">
          <Button>Save Configuration</Button>
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEAM SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

function TeamSettings() {
  const teamMembers = [
    { id: '1', name: 'Bruce Mwikya', email: 'bruce@rentflow.co.ke', role: 'admin' },
    { id: '2', name: 'Mary Wanjiku', email: 'mary@rentflow.co.ke', role: 'caretaker' },
    { id: '3', name: 'Peter Ochieng', email: 'peter@rentflow.co.ke', role: 'caretaker' },
  ];

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
              <User size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="text-title text-[var(--color-text-primary)]">Team Members</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Manage access to your account</p>
            </div>
          </div>
          <Button icon={Plus} size="sm">
            Invite Member
          </Button>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-glass)]"
            >
              <div className="flex items-center gap-3">
                <Avatar name={member.name} size="md" />
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{member.name}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={member.role === 'admin' ? 'info' : 'default'}>
                  {member.role}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export default Settings;
