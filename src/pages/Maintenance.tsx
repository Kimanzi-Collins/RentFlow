import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Plus, Search, Wrench, Clock, CheckCircle2 } from 'lucide-react';

// Mock Data
const MAINTENANCE_TICKETS = [
  { id: 1, title: 'Leaking Sink', unit: 'B-204', date: '2026-06-19', priority: 'High', status: 'pending' },
  { id: 2, title: 'Broken Window Handle', unit: 'C-301', date: '2026-06-15', priority: 'Low', status: 'resolved' },
];

export const Maintenance: React.FC = () => {
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
            Maintenance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Manage and track all unit repair requests.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-organic"
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button className="btn-organic btn-primary">
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', val: 24, icon: <Wrench size={20}/>, color: 'var(--brand-primary)' },
          { label: 'Pending', val: 8, icon: <Clock size={20}/>, color: '#f59e0b' },
          { label: 'Resolved', val: 16, icon: <CheckCircle2 size={20}/>, color: '#10b981' },
        ].map((stat, i) => (
          <div key={i} className="card-organic gsap-item" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-hover)', color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stat.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-organic gsap-item" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: 24 }}>
          <table className="table-organic w-full">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Issue Description</th>
                <th>Unit</th>
                <th>Date Reported</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MAINTENANCE_TICKETS.map((ticket) => (
                <tr key={ticket.id} className="gsap-item">
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#TKT-{ticket.id.toString().padStart(4, '0')}</td>
                  <td style={{ fontWeight: 700 }}>{ticket.title}</td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{ticket.unit}</td>
                  <td style={{ fontWeight: 500 }}>{ticket.date}</td>
                  <td>
                    <span style={{ color: ticket.priority === 'High' ? '#ef4444' : 'var(--text-main)', fontWeight: 700 }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                      background: ticket.status === 'resolved' ? '#ecfdf5' : '#fffbeb',
                      color: ticket.status === 'resolved' ? '#10b981' : '#f59e0b'
                    }}>
                      {ticket.status}
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
