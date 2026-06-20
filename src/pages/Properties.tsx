import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import {
  Building2, MapPin, Plus, Search, Edit, Trash2, Download, MoreHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Modal from '@/components/ui/Modal';
import { downloadPDF } from '@/lib/export';
import type { PropertyWithStats } from '@/types';

// ── Shared style tokens ────────────────────────────────────────────────────────
const WHITE_CARD: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 0,
  boxShadow: 'none',
  border: '1px solid rgba(0,0,0,0.04)',
  padding: 24,
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 0,
  padding: '10px 14px',
  color: '#111827',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
};

const BTN_PRIMARY: React.CSSProperties = {
  background: '#1c1c1c', color: '#ffffff',
  fontWeight: 700,
  borderRadius: 0,
  padding: '10px 20px',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
};

const BTN_GHOST: React.CSSProperties = {
  background: 'transparent',
  color: '#6b7280',
  border: '1px solid #e5e7eb',
  borderRadius: 0,
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_PROPERTIES: PropertyWithStats[] = [
  {
    id: '1', owner_id: 'u1', name: 'Sunset Apartments', address: '123 Sunset Blvd',
    city: 'Nairobi', property_type: 'apartment', water_rate: 150, penalty_rate: 10,
    penalty_type: 'percentage', billing_day: 5, grace_period_days: 5,
    total_units: 24, occupied_units: 22, created_at: new Date().toISOString(),
  },
  {
    id: '2', owner_id: 'u1', name: 'Green Valley Estate', address: '45 Green Valley Rd',
    city: 'Mombasa', property_type: 'mixed', water_rate: 120, penalty_rate: 500,
    penalty_type: 'fixed', billing_day: 1, grace_period_days: 7,
    total_units: 12, occupied_units: 12, created_at: new Date().toISOString(),
  },
  {
    id: '3', owner_id: 'u1', name: 'City View Tower', address: '8 Lakeside Drive',
    city: 'Kisumu', property_type: 'commercial', water_rate: 200, penalty_rate: 15,
    penalty_type: 'percentage', billing_day: 1, grace_period_days: 3,
    total_units: 16, occupied_units: 14, created_at: new Date().toISOString(),
  },
  {
    id: '4', owner_id: 'u1', name: 'Riverside Villas', address: '21 River Road',
    city: 'Nakuru', property_type: 'house', water_rate: 100, penalty_rate: 300,
    penalty_type: 'fixed', billing_day: 10, grace_period_days: 7,
    total_units: 8, occupied_units: 7, created_at: new Date().toISOString(),
  },
];

const TYPE_FILTERS = ['All', 'apartment', 'mixed', 'commercial', 'house', 'villa'] as const;
type TypeFilter = typeof TYPE_FILTERS[number];

// ── Helpers ────────────────────────────────────────────────────────────────────
function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function typeBadgeStyle(type: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    apartment:  { bg: '#dcfce7', color: '#16a34a' },
    mixed:      { bg: '#dbeafe', color: '#1d4ed8' },
    commercial: { bg: '#fef9c3', color: '#ca8a04' },
    house:      { bg: '#f3e8ff', color: '#7c3aed' },
    villa:      { bg: '#ffe4e6', color: '#be123c' },
  };
  const { bg, color } = map[type] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return {
    display: 'inline-block', padding: '3px 10px', borderRadius: 99,
    fontSize: 11, fontWeight: 700, background: bg, color,
  };
}

function occupancyColor(rate: number): string {
  if (rate >= 90) return '#1c1c1c';
  if (rate >= 70) return '#4d7cff';
  return '#f59e0b';
}

// ── Property Form ──────────────────────────────────────────────────────────────
interface PropertyFormProps {
  initial?: Partial<typeof INITIAL_PROPERTIES[0]>;
  onSubmit: (data: typeof INITIAL_PROPERTIES[0]) => void;
  onCancel: () => void;
}

function PropertyForm({ initial, onSubmit, onCancel }: PropertyFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    property_type: (initial?.property_type ?? 'apartment') as PropertyWithStats['property_type'],
    water_rate: String(initial?.water_rate ?? ''),
    billing_day: String(initial?.billing_day ?? ''),
    grace_period_days: String(initial?.grace_period_days ?? ''),
  });
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  function inputStyle(field: string): React.CSSProperties {
    return {
      ...INPUT_STYLE,
      borderColor: focusedField === field ? '#1c1c1c' : '#e5e7eb',
      boxShadow: focusedField === field ? '0 0 0 3px rgba(28,28,28,0.12)' : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Name, address and city are required.');
      return;
    }
    if (!form.water_rate || !form.billing_day || !form.grace_period_days) {
      setError('Water rate, billing day and grace period are required.');
      return;
    }
    const billingDay = Number(form.billing_day);
    if (billingDay < 1 || billingDay > 28) {
      setError('Billing day must be between 1 and 28.');
      return;
    }
    setError('');
    onSubmit({
      id: initial?.id ?? String(Date.now()),
      owner_id: 'u1',
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      property_type: form.property_type,
      water_rate: Number(form.water_rate),
      penalty_rate: initial?.penalty_rate ?? 10,
      penalty_type: initial?.penalty_type ?? 'percentage',
      billing_day: billingDay,
      grace_period_days: Number(form.grace_period_days),
      total_units: initial?.total_units ?? 0,
      occupied_units: initial?.occupied_units ?? 0,
      created_at: initial?.created_at ?? new Date().toISOString(),
    });
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: 6,
    fontSize: 11, color: '#9ca3af', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.08em',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Name - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="prop-name" style={labelStyle}>Property Name *</label>
          <input
            id="prop-name"
            aria-label="Property Name"
            style={inputStyle('name')}
            placeholder="e.g. Sunset Apartments"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField('')}
          />
        </div>

        {/* Address - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="prop-address" style={labelStyle}>Address *</label>
          <input
            id="prop-address"
            aria-label="Address"
            style={inputStyle('address')}
            placeholder="Street address"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField('')}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="prop-city" style={labelStyle}>City *</label>
          <input
            id="prop-city"
            aria-label="City"
            style={inputStyle('city')}
            placeholder="e.g. Nairobi"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            onFocus={() => setFocusedField('city')}
            onBlur={() => setFocusedField('')}
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="prop-type" style={labelStyle}>Type</label>
          <select
            id="prop-type"
            aria-label="Property Type"
            style={inputStyle('type')}
            value={form.property_type}
            onChange={e => setForm(f => ({ ...f, property_type: e.target.value as PropertyWithStats['property_type'] }))}
            onFocus={() => setFocusedField('type')}
            onBlur={() => setFocusedField('')}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="commercial">Commercial</option>
            <option value="mixed">Mixed Use</option>
            <option value="villa">Villa</option>
          </select>
        </div>

        {/* Water Rate */}
        <div>
          <label htmlFor="prop-water-rate" style={labelStyle}>Water Rate (KES / m³) *</label>
          <input
            id="prop-water-rate"
            aria-label="Water Rate KES per cubic metre"
            style={inputStyle('water_rate')}
            type="number"
            placeholder="150"
            min="0"
            value={form.water_rate}
            onChange={e => setForm(f => ({ ...f, water_rate: e.target.value }))}
            onFocus={() => setFocusedField('water_rate')}
            onBlur={() => setFocusedField('')}
          />
        </div>

        {/* Billing Day */}
        <div>
          <label htmlFor="prop-billing-day" style={labelStyle}>Billing Day (1-28) *</label>
          <input
            id="prop-billing-day"
            aria-label="Billing Day"
            style={inputStyle('billing_day')}
            type="number"
            placeholder="1"
            min="1"
            max="28"
            value={form.billing_day}
            onChange={e => setForm(f => ({ ...f, billing_day: e.target.value }))}
            onFocus={() => setFocusedField('billing_day')}
            onBlur={() => setFocusedField('')}
          />
        </div>

        {/* Grace Period - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="prop-grace" style={labelStyle}>Grace Period (days) *</label>
          <input
            id="prop-grace"
            aria-label="Grace Period in days"
            style={inputStyle('grace_period_days')}
            type="number"
            placeholder="5"
            min="0"
            value={form.grace_period_days}
            onChange={e => setForm(f => ({ ...f, grace_period_days: e.target.value }))}
            onFocus={() => setFocusedField('grace_period_days')}
            onBlur={() => setFocusedField('')}
          />
        </div>
      </div>

      <div className="prop-form-actions">
        <button type="button" className="prop-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="prop-form-submit">
          {initial?.id ? 'Save Changes' : 'Create Property'}
        </button>
      </div>
    </form>
  );
}

// ── Property Card ──────────────────────────────────────────────────────────────
interface PropertyCardProps {
  property: PropertyWithStats;
  onEdit: () => void;
  onDelete: () => void;
}

function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const occupancyRate = property.total_units
    ? Math.round((property.occupied_units / property.total_units) * 100)
    : 0;
  const barColor = occupancyColor(occupancyRate);

  return (
    <div
      style={{
        ...WHITE_CARD,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top badge + menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 0' }}>
        <span style={typeBadgeStyle(property.property_type)}>
          {typeLabel(property.property_type)}
        </span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6 }}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 20,
                background: '#ffffff', border: '1px solid #e5e7eb',
                borderRadius: 0, padding: 6, minWidth: 130,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              {[
                { label: 'Edit',   icon: <Edit size={14} />,   action: () => { onEdit(); setMenuOpen(false); } },
                { label: 'Delete', icon: <Trash2 size={14} />, action: () => { onDelete(); setMenuOpen(false); }, danger: true },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 10px', background: 'none', border: 'none',
                    borderRadius: 7, cursor: 'pointer', fontSize: 13,
                    color: item.danger ? '#dc2626' : '#374151',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero image area */}
      <div style={{
        margin: '12px 16px', height: 110, borderRadius: 0,
        background: 'linear-gradient(135deg, rgba(28,28,28,0.12) 0%, rgba(77,124,255,0.12) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(28,28,28,0.15)',
      }}>
        <Building2 size={40} style={{ color: 'rgba(0,180,125,0.7)' }} />
      </div>

      {/* Body */}
      <div style={{ padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {property.name}
          </h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af' }}>
            <MapPin size={12} /> {property.city}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Water Rate</p>
            <p style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>KES {property.water_rate}/m³</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Billing Day</p>
            <p style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Day {property.billing_day}</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {[
            { label: 'Total', value: property.total_units },
            { label: 'Occupied', value: property.occupied_units },
            { label: 'Rate', value: `${occupancyRate}%` },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        <div style={{ width: '100%', height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: barColor, borderRadius: 99, width: `${occupancyRate}%`, transition: 'width 0.6s ease' }} />
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
          <button
            onClick={onEdit}
            style={{
              background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: 6, cursor: 'pointer', color: '#6b7280', display: 'flex',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#111827'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={onDelete}
            style={{
              background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8,
              padding: 6, cursor: 'pointer', color: '#dc2626', display: 'flex',
            }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const Properties: React.FC = () => {
  const { profile } = useAuthStore();
  const isLandlord = profile?.role === 'landlord';

  const [properties, setProperties] = useState<PropertyWithStats[]>(INITIAL_PROPERTIES);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<PropertyWithStats | null>(null);
  const [focusedSearch, setFocusedSearch] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.prop-card-wrap');
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, { scope: containerRef });

  const filtered = properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.city.toLowerCase().includes(search.toLowerCase()) ||
                        p.address.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'All' || p.property_type === typeFilter;
    return matchSearch && matchType;
  });

  function handleAddProperty(data: PropertyWithStats) {
    setProperties(prev => [...prev, data]);
    setShowModal(false);
  }

  function handleEditProperty(data: PropertyWithStats) {
    setProperties(prev => prev.map(p => p.id === data.id ? data : p));
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this property? This cannot be undone.')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  }

  function handleExport() {
    downloadPDF('properties.csv', properties.map(p => ({
      Name: p.name,
      Address: p.address,
      City: p.city,
      Type: p.property_type,
      'Water Rate (KES)': p.water_rate,
      'Billing Day': p.billing_day,
      'Grace Period (days)': p.grace_period_days,
      'Total Units': p.total_units,
      'Occupied Units': p.occupied_units,
    })));
  }

  return (
    <div ref={containerRef} style={{ paddingBottom: '2rem' }}>

      {/* ── Header bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 800, color: '#111827' }}>
          Properties
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleExport}
            style={{ ...BTN_GHOST, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
          >
            <Download size={15} /> Export
          </button>
          {isLandlord && (
            <button
              style={BTN_PRIMARY}
              onClick={() => { setEditTarget(null); setShowModal(true); }}
            >
              <Plus size={16} /> Add Property
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Filter bar ── */}
      <div style={{ ...WHITE_CARD, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocusedSearch(true)}
            onBlur={() => setFocusedSearch(false)}
            style={{
              ...INPUT_STYLE,
              paddingLeft: 36,
              borderColor: focusedSearch ? '#1c1c1c' : '#e5e7eb',
              boxShadow: focusedSearch ? '0 0 0 3px rgba(28,28,28,0.12)' : 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
        </div>

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                background: typeFilter === f ? '#1c1c1c' : '#f9fafb',
                color: typeFilter === f ? '#111827' : '#6b7280',
                borderColor: typeFilter === f ? '#1c1c1c' : '#e5e7eb',
                transition: 'all 0.2s',
              }}
            >
              {f === 'All' ? 'All' : typeLabel(f)}
            </button>
          ))}
        </div>

        {/* Count */}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {/* ── Property Cards Grid ── */}
      <div
        ref={gridRef}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
      >
        {filtered.map(property => (
          <div key={property.id} className="prop-card-wrap" style={{ opacity: 0 }}>
            <PropertyCard
              property={property}
              onEdit={() => { setEditTarget(property); setShowModal(true); }}
              onDelete={() => handleDelete(property.id)}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#9ca3af' }}>
            <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 15 }}>No properties match your search.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Property' : 'Add Property'}
        description={editTarget ? 'Update the property details below.' : 'Fill in the details to create a new property.'}
        size="md"
      >
        <PropertyForm
          initial={editTarget ?? undefined}
          onSubmit={editTarget ? handleEditProperty : handleAddProperty}
          onCancel={() => { setShowModal(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
};
