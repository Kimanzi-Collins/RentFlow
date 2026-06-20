import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Plus, Search, DollarSign, Filter, ArrowUpRight, TrendingUp } from 'lucide-react';

// Mock Data
const PAYMENTS = [
  { id: 1, tenant: 'James Mwangi', unit: 'A-104', amount: 18000, date: '2026-06-19', status: 'paid', method: 'M-PESA' },
  { id: 2, tenant: 'Fatuma Hassan', unit: 'C-301', amount: 25000, date: '2026-06-18', status: 'pending', method: 'Bank Transfer' },
  { id: 3, tenant: 'Peter Ochieng', unit: 'B-204', amount: 45000, date: '2026-06-15', status: 'overdue', method: 'M-PESA' },
];

export const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const rows = containerRef.current.querySelectorAll('.gsap-item');
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Payments
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Track rent collections and financial records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search transactions..."
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
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-organic gsap-item" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Total Collected</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>KSh 850,000</div>
        </div>
        <div className="card-organic gsap-item" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Pending Clearance</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>KSh 125,000</div>
        </div>
        <div className="card-organic gsap-item" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Overdue Amount</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>KSh 45,000</div>
        </div>
      </div>

      {/* Table */}
      <div className="card-organic gsap-item" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: 24 }}>
          <table className="table-organic w-full">
            <thead>
              <tr>
                <th>Transaction Date</th>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Method</th>
                <th>Amount (KES)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((payment) => (
                <tr key={payment.id} className="gsap-item">
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{payment.date}</td>
                  <td style={{ fontWeight: 700 }}>{payment.tenant}</td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{payment.unit}</td>
                  <td style={{ fontWeight: 500 }}>{payment.method}</td>
                  <td style={{ fontWeight: 800 }}>{payment.amount.toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                      background: payment.status === 'paid' ? '#ecfdf5' : payment.status === 'pending' ? '#fffbeb' : '#fef2f2',
                      color: payment.status === 'paid' ? '#10b981' : payment.status === 'pending' ? '#f59e0b' : '#ef4444'
                    }}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
