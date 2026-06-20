import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Plus, Search, MapPin, Building2, MoreVertical, ArrowUpRight } from 'lucide-react';
const MOCK_PROPERTIES = [
  { id: 1, name: 'Serra Apartments', address: 'Westlands, Nairobi', total_units: 45 },
  { id: 2, name: 'SOJAG Head Office', address: 'Upper Hill, Nairobi', total_units: 12 },
  { id: 3, name: 'LSU Logistics', address: 'Industrial Area, Nairobi', total_units: 8 },
];
export const Properties: React.FC = () => {
  const [properties] = useState(MOCK_PROPERTIES);
  const loading = false;
  const error = null;
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.property-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
      );
    },
    { scope: containerRef, dependencies: [properties, loading] }
  );

  const filtered = properties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Properties
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Manage and oversee all your real estate assets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-organic"
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button className="btn-organic btn-primary">
            <Plus size={16} /> Add Property
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 15 }}>Loading properties...</div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#ef4444', fontSize: 15 }}>Error: {error.message}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <div key={property.id} className="card-organic property-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} />
                </div>
                <button className="btn-icon" style={{ width: 32, height: 32, border: 'none' }}>
                  <MoreVertical size={16} />
                </button>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{property.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
                <MapPin size={14} /> {property.address}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units</span>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{property.total_units}</span>
                </div>
                <button className="btn-icon" style={{ background: 'var(--surface-hover)' }}>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', background: 'var(--surface-card)', borderRadius: 24, color: 'var(--text-muted)' }}>
              No properties found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
