import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, User, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuthStore } from '@/stores/authStore';

// ── Google icon ───────────────────────────────────────────────────────────
const GoogleIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// ── Left panel feature bullets ────────────────────────────────────────────
const LEFT_FEATURES = [
  'M-PESA & bank rent collection — automated',
  'Real-time financial dashboards & PDF reports',
  'Full tenant lifecycle management',
  'Maintenance request tracking & resolution',
];

// ── Shared sub-components (must live outside SignIn to avoid remount on every keystroke) ──

interface FieldProps {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.FC<{ size: number; color?: string }>; right?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, right }) => (
  <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Icon size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, pointerEvents: 'none', flexShrink: 0 } as React.CSSProperties} />
      <input
        id={id} type={type} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}
        required autoComplete={id}
        style={{
          width: '100%', padding: '12px 14px 12px 40px',
          background: '#fff',
          border: '1.5px solid #e5e7eb',
          borderRadius: 10, fontSize: 14, outline: 'none',
          fontFamily: 'inherit', color: '#111827',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          paddingRight: right ? 44 : 14,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#171717'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(23,23,23,0.07)'; }}
        onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      {right}
    </div>
  </div>
);

const EyeToggle: React.FC<{ show: boolean; onToggle: () => void }> = ({ show, onToggle }) => (
  <button
    type="button" onClick={onToggle}
    style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}
  >
    {show ? <EyeOff size={17} /> : <Eye size={17} />}
  </button>
);

// ── Component ─────────────────────────────────────────────────────────────
export const SignIn: React.FC = () => {
  const [tab, setTab]               = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [fullName, setFullName]     = useState('');
  const [role, setRole]             = useState<'landlord' | 'caretaker'>('landlord');
  const [showPwd, setShowPwd]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);

  const { signIn, signUp, loading, isDemoMode } = useAuthStore();
  const navigate = useNavigate();

  const rightRef  = useRef<HTMLDivElement>(null);
  const leftRef   = useRef<HTMLDivElement>(null);
  const orbRef    = useRef<HTMLDivElement>(null);

  // Entrance animations
  useGSAP(() => {
    if (leftRef.current) {
      const items = leftRef.current.querySelectorAll('[data-left]');
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
      );
    }
    if (rightRef.current) {
      const items = rightRef.current.querySelectorAll('[data-animate]');
      gsap.fromTo(items,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.35 }
      );
    }
  }, []);

  // Orb ambient animation
  useGSAP(() => {
    if (!orbRef.current) return;
    gsap.to(orbRef.current, {
      x: 30, y: -20, duration: 6, ease: 'sine.inOut',
      yoyo: true, repeat: -1,
    });
  }, []);

  // Re-animate form on tab switch
  useGSAP(() => {
    if (!rightRef.current) return;
    const items = rightRef.current.querySelectorAll('[data-animate]');
    gsap.fromTo(items,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
    );
  }, { dependencies: [tab] });

  function resetForm() {
    setEmail(''); setPassword(''); setConfirmPwd('');
    setFullName(''); setError(null); setSuccess(null);
  }

  function switchTab(t: 'signin' | 'signup') {
    setTab(t);
    resetForm();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); return; }
      navigate('/dashboard');
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Something went wrong.');
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match.'); return; }
    try {
      const { error: err } = await signUp(email, password, fullName, role);
      if (err) { setError(err); return; }
      setSuccess('Account created! Check your email to confirm, then sign in.');
      switchTab('signin');
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Something went wrong.');
    }
  }


  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>

      {/* ── Left Panel ── */}
      <div ref={leftRef} className="auth-panel-left hidden md:flex">
        {/* Ambient orb */}
        <div ref={orbRef} style={{
          position: 'absolute', width: 480, height: 480,
          borderRadius: '50%', top: -100, right: -120,
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', bottom: 40, left: -80,
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div data-left style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto', opacity: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={18} color="#0a0a0a" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.02em' }}>RentFlow</span>
        </div>

        {/* Back to home */}
        <button
          data-left type="button" onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', marginBottom: 64, opacity: 0, paddingLeft: 0 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} /> Back to home
        </button>

        {/* Headline */}
        <div style={{ marginBottom: 40, opacity: 0 }} data-left>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Property management<br />
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>that actually works.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 340 }}>
            Built for Kenyan landlords — from single units to large multi-property portfolios.
          </p>
        </div>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 'auto', opacity: 0 }} data-left>
          {LEFT_FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Trust footer */}
        <div data-left style={{ paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)', opacity: 0 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            Trusted by <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>120+ property managers</span> across Kenya
          </p>
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i * 60}, 50%, 60%)`, border: '2px solid #0a0a0a', marginLeft: i ? -8 : 0 }} />
            ))}
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 12, alignSelf: 'center' }}>+115 others</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        ref={rightRef}
        className="auth-panel-right"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Subtle warm overlay so the image shows through but form stays legible */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,248,246,0.48)' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div data-animate className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, opacity: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#111827', letterSpacing: '-0.02em' }}>RentFlow</span>
          </div>

          {/* Tab switcher */}
          <div data-animate style={{ display: 'flex', background: '#f3f4f6', borderRadius: 99, padding: 4, marginBottom: 36, opacity: 0 }}>
            {(['signin', 'signup'] as const).map(t => (
              <button
                key={t} type="button"
                onClick={() => switchTab(t)}
                className={`auth-tab flex-1 ${tab === t ? 'auth-tab-active' : 'auth-tab-inactive'}`}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div data-animate style={{ marginBottom: 28, opacity: 0 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em', marginBottom: 6 }}>
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              {tab === 'signin'
                ? 'Sign in to access your property dashboard.'
                : 'Get started — it only takes a minute.'}
            </p>
          </div>

          {/* Demo notice */}
          {isDemoMode && (
            <div data-animate style={{ marginBottom: 20, padding: '12px 14px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, opacity: 0 }}>
              <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                Demo mode · use any credentials to preview the dashboard.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div data-animate style={{ marginBottom: 16, padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, opacity: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div data-animate style={{ marginBottom: 16, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, opacity: 0 }}>
              <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>{success}</span>
            </div>
          )}

          {/* ── Sign In Form ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field id="email" label="Email address" type="email" icon={Mail}
                value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field id="password" label="Password" type={showPwd ? 'text' : 'password'} icon={Lock}
                value={password} onChange={setPassword} placeholder="••••••••"
                right={<EyeToggle show={showPwd} onToggle={() => setShowPwd(v => !v)} />}
              />

              <div data-animate style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: '#171717', cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Remember me</span>
                </label>
                <button type="button" style={{ fontSize: 13, fontWeight: 700, color: '#171717', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Forgot password?
                </button>
              </div>

              <div data-animate style={{ marginTop: 4, opacity: 0 }}>
                <button type="submit" disabled={loading} className="btn-organic btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12 }}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : <>Sign In <ChevronRight size={16} /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── Sign Up Form ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field id="fullName" label="Full Name" icon={User}
                value={fullName} onChange={setFullName} placeholder="e.g. Collins Mwandikwa" />
              <Field id="signupEmail" label="Email address" type="email" icon={Mail}
                value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field id="signupPassword" label="Password" type={showPwd ? 'text' : 'password'} icon={Lock}
                value={password} onChange={setPassword} placeholder="Min. 8 characters"
                right={<EyeToggle show={showPwd} onToggle={() => setShowPwd(v => !v)} />}
              />
              <Field id="confirmPassword" label="Confirm Password" type={showConfirm ? 'text' : 'password'} icon={Lock}
                value={confirmPwd} onChange={setConfirmPwd} placeholder="Repeat password"
                right={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
              />

              {/* Role selector */}
              <div data-animate style={{ opacity: 0 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>I am a</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['landlord', 'caretaker'] as const).map(r => (
                    <button
                      key={r} type="button" onClick={() => setRole(r)}
                      style={{
                        padding: '12px', borderRadius: 10, border: `2px solid ${role === r ? '#171717' : '#e5e7eb'}`,
                        background: role === r ? '#171717' : '#fff', color: role === r ? '#fff' : '#6b7280',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.18s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Building2 size={14} />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div data-animate style={{ marginTop: 4, opacity: 0 }}>
                <button type="submit" disabled={loading} className="btn-organic btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12 }}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account…</> : <>Create Account <ChevronRight size={16} /></>}
                </button>
              </div>

              <p data-animate style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, opacity: 0 }}>
                By creating an account you agree to our{' '}
                <span style={{ color: '#171717', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>{' '}
                and{' '}
                <span style={{ color: '#171717', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>.
              </p>
            </form>
          )}

          {/* Divider + Google */}
          <div data-animate style={{ margin: '28px 0 0', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>
            <button
              type="button"
              onClick={async () => {
                const { error: err } = await useAuthStore.getState().signInWithGoogle();
                if (err) setError(err);
              }}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: '#fff', border: '1.5px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#d1d5db'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e5e7eb'; el.style.boxShadow = 'none'; }}
            >
              <GoogleIcon /> Continue with Google
            </button>
          </div>

          {/* Copyright */}
          <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: '0.01em' }}>
            © 2026 Collins Mwandikwa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
