import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Plus, Search, Building2, Users, Clock, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

type Priority = 'high' | 'medium' | 'low';
type MStatus = 'open' | 'in_progress' | 'resolved';

interface Request {
  id: string; ref: string; title: string; description: string;
  unit: string; property: string; tenant: string;
  priority: Priority; status: MStatus; reported: string;
}

const INITIAL: Request[] = [
  { id:'1', ref:'#001', title:'Plumbing leak in bathroom', description:'Persistent leak under the sink. Water damage to cabinet.', unit:'B-301', property:'City View', tenant:'David Maina', priority:'high', status:'open', reported:'2 days ago' },
  { id:'2', ref:'#002', title:'AC unit not cooling', description:'AC runs but no cold air. Possible refrigerant issue.', unit:'A-102', property:'Sunset', tenant:'John Kamau', priority:'medium', status:'in_progress', reported:'5 days ago' },
  { id:'3', ref:'#003', title:'Broken window lock', description:'Window handle broken, cannot lock securely.', unit:'B-201', property:'Green Valley', tenant:'Sarah Otieno', priority:'low', status:'resolved', reported:'2 weeks ago' },
  { id:'4', ref:'#004', title:'Electrical fault in kitchen', description:'Sparking from kitchen wall socket. Unit vacant.', unit:'A-103', property:'Sunset', tenant:'Vacant', priority:'high', status:'open', reported:'1 day ago' },
  { id:'5', ref:'#005', title:'Paint peeling in corridor', description:'Paint peeling from corridor walls near entrance.', unit:'B-202', property:'Green Valley', tenant:'Mike Njoroge', priority:'low', status:'open', reported:'3 weeks ago' },
];

const PC: Record<Priority,{label:string;bg:string;color:string;border:string}> = {
  high:   { label:'High',   bg:'#fee2e2', color:'#dc2626', border:'#fecaca' },
  medium: { label:'Medium', bg:'#fef9c3', color:'#ca8a04', border:'#fde68a' },
  low:    { label:'Low',    bg:'#dbeafe', color:'#2563eb', border:'#bfdbfe' },
};
const SC: Record<MStatus,{label:string;borderL:string}> = {
  open:        { label:'Open',        borderL:'#ef4444' },
  in_progress: { label:'In Progress', borderL:'#f59e0b' },
  resolved:    { label:'Resolved',    borderL:'#10b981' },
};
const COLS: {status:MStatus;label:string;bg:string;color:string}[] = [
  { status:'open',        label:'Open',        bg:'#fee2e2', color:'#dc2626' },
  { status:'in_progress', label:'In Progress', bg:'#fef9c3', color:'#ca8a04' },
  { status:'resolved',    label:'Resolved',    bg:'#dcfce7', color:'#16a34a' },
];

const card: React.CSSProperties = {
  background:'#ffffff', borderRadius: 0,
  boxShadow:'0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)',
  border:'1px solid rgba(0,0,0,0.04)', padding:'0',
};

export const Maintenance: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>(INITIAL);
  const [search, setSearch]     = useState('');
  const [priority, setPriority] = useState<Priority|'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', unit:'', property:'', tenant:'', priority:'medium' as Priority });
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = pageRef.current?.querySelector('[data-hdr]');
    if (el) gsap.fromTo(el, { opacity:0, y:-16 }, { opacity:1, y:0, duration:0.5, ease:'power3.out' });
    const cols = pageRef.current?.querySelectorAll('[data-col]') ?? [];
    gsap.fromTo(cols, { opacity:0, y:24 }, { opacity:1, y:0, duration:0.5, stagger:0.1, ease:'power3.out', delay:0.1 });
  }, { scope: pageRef });

  const filtered = requests.filter(r =>
    (search === '' || r.title.toLowerCase().includes(search.toLowerCase()) || r.tenant.toLowerCase().includes(search.toLowerCase())) &&
    (priority === 'all' || r.priority === priority)
  );

  const updateStatus = (id: string, s: MStatus) => setRequests(p => p.map(r => r.id===id ? {...r,status:s} : r));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.unit) return;
    const newReq: Request = {
      id: String(Date.now()), ref:`#${String(requests.length+1).padStart(3,'0')}`,
      title: form.title, description: form.description,
      unit: form.unit, property: form.property, tenant: form.tenant,
      priority: form.priority as Priority, status:'open', reported:'Just now',
    };
    setRequests(p => [newReq, ...p]);
    setShowModal(false);
    setForm({ title:'', description:'', unit:'', property:'', tenant:'', priority:'medium' });
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'9px 13px',
    background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:9,
    color:'#111827', fontSize:14, fontFamily:'var(--font-sans)', outline:'none',
    transition:'border-color 0.2s, box-shadow 0.2s',
  };
  const lbl: React.CSSProperties = {
    display:'block', fontSize:12, fontWeight:600,
    color:'#6b7280', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:5,
    fontFamily:'var(--font-sans)',
  };

  return (
    <div ref={pageRef}>
      {/* Header */}
      <div data-hdr style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:'#111827', letterSpacing:'-0.025em', margin:0 }}>Maintenance</h1>
          <p style={{ fontSize:14, color:'#9ca3af', marginTop:3, fontFamily:'DM Sans,sans-serif' }}>Track and resolve property maintenance requests</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', background: '#1c1c1c', color: '#ffffff', borderRadius: 0, border:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(28,28,28,0.25)' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        >
          <Plus style={{width:15,height:15}}/> New Request
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 220px' }}>
          <Search style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#9ca3af', pointerEvents:'none' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search requests…"
            style={{ ...inp, paddingLeft:34 }}
            onFocus={e=>{e.target.style.borderColor='#1c1c1c';e.target.style.boxShadow='0 0 0 3px rgba(28,28,28,0.1)';}}
            onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}
          />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(['all','high','medium','low'] as const).map(p => (
            <button type="button" key={p} onClick={()=>setPriority(p)}
              style={{ padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid', fontFamily:'DM Sans,sans-serif',
                ...(priority===p ? { background:'#111827', color:'#fff', borderColor:'#111827' } : { background:'transparent', color:'#6b7280', borderColor:'#e5e7eb' })
              }}
            >{p==='all'?'All':p.charAt(0).toUpperCase()+p.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, alignItems:'start' }}>
        {COLS.map(col => {
          const colCards = filtered.filter(r => r.status===col.status);
          return (
            <div key={col.status} data-col style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#ffffff', borderRadius: 0, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                {col.status==='open' && <AlertCircle style={{width:14,height:14,color:col.color}}/>}
                {col.status==='in_progress' && <Clock style={{width:14,height:14,color:col.color}}/>}
                {col.status==='resolved' && <CheckCircle2 style={{width:14,height:14,color:col.color}}/>}
                <span style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#111827', flex:1 }}>{col.label}</span>
                <span style={{ minWidth:22, height:22, borderRadius:99, background:col.bg, color:col.color, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{colCards.length}</span>
              </div>

              {colCards.length === 0 ? (
                <div style={{ padding:24, textAlign:'center', background:'#f9fafb', borderRadius: 0, border:'1px dashed #e5e7eb', color:'#9ca3af', fontSize:13, fontFamily:'DM Sans,sans-serif' }}>
                  No requests
                </div>
              ) : colCards.map(req => {
                const p = PC[req.priority];
                return (
                  <div key={req.id}
                    style={{ ...card, padding:16, borderLeft:`3px solid ${SC[req.status].borderL}`, transition:'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)';}}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#9ca3af', fontFamily:'DM Sans,sans-serif' }}>{req.ref}</span>
                      <span style={{ padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, background:p.bg, color:p.color, border:`1px solid ${p.border}`, fontFamily:'DM Sans,sans-serif' }}>{p.label}</span>
                    </div>
                    <p style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#111827', marginBottom:6, lineHeight:1.35 }}>{req.title}</p>
                    <p style={{ fontSize:12, color:'#9ca3af', marginBottom:10, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', fontFamily:'DM Sans,sans-serif' }}>{req.description}</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
                      {[{I:Building2,t:`${req.property} · ${req.unit}`},{I:Users,t:req.tenant},{I:Clock,t:`Reported ${req.reported}`}].map(({I,t},i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <I style={{width:11,height:11,color:'#9ca3af',flexShrink:0}}/>
                          <span style={{ fontSize:11, color:'#6b7280', fontFamily:'DM Sans,sans-serif' }}>{t}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ position:'relative' }}>
                      <select value={req.status} onChange={e=>updateStatus(req.id,e.target.value as MStatus)}
                        style={{ width:'100%', padding:'6px 26px 6px 10px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, color:'#374151', fontSize:12, fontWeight:500, fontFamily:'DM Sans,sans-serif', cursor:'pointer', appearance:'none', outline:'none' }}
                      >
                        <option value="open">→ Open</option>
                        <option value="in_progress">→ In Progress</option>
                        <option value="resolved">→ Resolved</option>
                      </select>
                      <ChevronDown style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:11, height:11, color:'#9ca3af', pointerEvents:'none' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginTop:24 }}>
        {[
          { label:'Total', value:requests.length, color:'#111827' },
          { label:'Open', value:requests.filter(r=>r.status==='open').length, color:'#dc2626' },
          { label:'In Progress', value:requests.filter(r=>r.status==='in_progress').length, color:'#ca8a04' },
          { label:'Resolved', value:requests.filter(r=>r.status==='resolved').length, color:'#16a34a' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:3, fontFamily:'DM Sans,sans-serif' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Request Modal */}
      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="New Maintenance Request" size="md"
        footer={<>
          <button type="button" onClick={()=>setShowModal(false)} style={{ padding:'9px 20px', background:'transparent', border:'1px solid #e5e7eb', borderRadius:9, color:'#6b7280', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Cancel</button>
          <button type="submit" form="maint-form" style={{ padding:'9px 24px', background:'#1c1c1c', border:'none', borderRadius:9, color:'#111827', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Submit Request</button>
        </>}
      >
        <form id="maint-form" onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={lbl}>Issue Title *</label><input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Describe the issue briefly" style={inp} onFocus={e=>{e.target.style.borderColor='#1c1c1c';e.target.style.boxShadow='0 0 0 3px rgba(28,28,28,0.1)';}} onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}/></div>
          <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Provide more details…" style={{ ...inp, resize:'vertical', lineHeight:1.5 }} onFocus={e=>{e.target.style.borderColor='#1c1c1c';e.target.style.boxShadow='0 0 0 3px rgba(28,28,28,0.1)';}} onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={lbl}>Unit *</label><input required value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="e.g. A-101" style={inp} onFocus={e=>{e.target.style.borderColor='#1c1c1c';e.target.style.boxShadow='0 0 0 3px rgba(28,28,28,0.1)';}} onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}/></div>
            <div><label style={lbl}>Property</label><input value={form.property} onChange={e=>setForm(f=>({...f,property:e.target.value}))} placeholder="e.g. Sunset Apts" style={inp} onFocus={e=>{e.target.style.borderColor='#1c1c1c';e.target.style.boxShadow='0 0 0 3px rgba(28,28,28,0.1)';}} onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={lbl}>Tenant</label><input value={form.tenant} onChange={e=>setForm(f=>({...f,tenant:e.target.value}))} placeholder="Tenant name" style={inp} onFocus={e=>{e.target.style.borderColor='#1c1c1c';e.target.style.boxShadow='0 0 0 3px rgba(28,28,28,0.1)';}} onBlur={e=>{e.target.style.borderColor='#e5e7eb';e.target.style.boxShadow='none';}}/></div>
            <div><label style={lbl}>Priority</label>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value as Priority}))} style={{ ...inp, cursor:'pointer', appearance:'none' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
