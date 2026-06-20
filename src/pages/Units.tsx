import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Plus, Search, Filter, Home, CheckCircle2, AlertCircle } from 'lucide-react';
const MOCK_UNITS = [
  { id: 1, unit_number: 'A-101', type: 'Residential', rent_amount: 35000, status: 'occupied', properties: { name: 'Serra Apartments' } },
  { id: 2, unit_number: 'B-204', type: 'Residential', rent_amount: 45000, status: 'occupied', properties: { name: 'Serra Apartments' } },
  { id: 3, unit_number: 'C-301', type: 'Commercial', rent_amount: 120000, status: 'vacant', properties: { name: 'SOJAG Head Office' } },
];
export const Units: React.FC = () => {
  const [units] = useState(MOCK_UNITS);
  const loading = false;
  const error = null;
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const rows = containerRef.current.querySelectorAll('tbody tr');
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: containerRef, dependencies: [units, loading] }
  );

  const filtered = units.filter(
    (u) =>
      u.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.properties?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const occupiedCount = units.filter((u) => u.status === 'occupied').length;
  const vacantCount = units.filter((u) => u.status === 'vacant').length;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Units
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Overview of all residential and commercial units.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-organic"
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button className="btn-icon">
            <Filter size={18} />
          </button>
          <button className="btn-organic btn-primary">
            <Plus size={16} /> Add Unit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{units.length}</div>
          </div>
        </div>
        <div className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupied</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{occupiedCount}</div>
          </div>
        </div>
        <div className="card-organic" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vacant</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{vacantCount}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-organic" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading units...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: 40 }}>Error: {error.message}</div>
          ) : (
            <table className="table-organic w-full">
              <thead>
                <tr>
                  <th>Unit #</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Rent (KES)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((unit) => (
                  <tr key={unit.id}>
                    <td style={{ fontWeight: 700 }}>{unit.unit_number}</td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{unit.properties?.name}</td>
                    <td><span style={{ background: 'var(--surface-hover)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{unit.type || 'Standard'}</span></td>
                    <td style={{ fontWeight: 600 }}>KSh {unit.rent_amount?.toLocaleString() || 0}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                        background: unit.status === 'occupied' ? '#ecfdf5' : '#fffbeb',
                        color: unit.status === 'occupied' ? '#10b981' : '#f59e0b'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
