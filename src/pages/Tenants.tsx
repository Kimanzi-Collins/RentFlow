import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Plus, Search, Mail, Phone, MoreVertical } from 'lucide-react';
const MOCK_TENANTS = [
  { id: 1, first_name: 'James', last_name: 'Mwangi', email: 'james@example.com', phone: '0712345678', id_number: '12345678' },
  { id: 2, first_name: 'Fatuma', last_name: 'Hassan', email: 'fatuma@example.com', phone: '0723456789', id_number: '87654321' },
  { id: 3, first_name: 'Peter', last_name: 'Ochieng', email: 'peter@example.com', phone: '0734567890', id_number: '11223344' },
];
export const Tenants: React.FC = () => {
  const [tenants] = useState(MOCK_TENANTS);
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
    { scope: containerRef, dependencies: [tenants, loading] }
  );

  const filtered = tenants.filter(
    (t) =>
      t.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Tenants
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Manage all tenant records and communications.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-organic"
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button className="btn-organic btn-primary">
            <Plus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-organic" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading tenants...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: 40 }}>Error: {error.message}</div>
          ) : (
            <table className="table-organic w-full">
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Contact Info</th>
                  <th>ID Number</th>
                  <th>Status</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                          {getInitials(tenant.first_name, tenant.last_name)}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                          {tenant.first_name} {tenant.last_name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                          <Mail size={12} /> {tenant.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                          <Phone size={12} /> {tenant.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {tenant.id_number || 'Pending'}
                    </td>
                    <td>
                      <span style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                        Active
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" style={{ width: 32, height: 32, border: 'none' }}>
                        <MoreVertical size={16} />
                      </button>
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
