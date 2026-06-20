import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuthStore } from '@/stores/authStore';

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, loading, isDemoMode } = useAuthStore();
  const navigate = useNavigate();

  const formRef = useRef<HTMLDivElement>(null);

  // Stagger in form fields on mount
  useGSAP(
    () => {
      if (!formRef.current) return;
      const items = formRef.current.querySelectorAll('[data-animate]');
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          clearProps: 'opacity,transform',
        }
      );
    },
    { scope: formRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const inputWrapStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: 16,
    width: 20,
    height: 20,
    color: '#9ca3af',
    pointerEvents: 'none',
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 8,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Image Setup */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80" 
          alt="Premium interior" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Soft overlay gradient to ensure readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,24,39,0.7) 0%, rgba(17,24,39,0.3) 100%)' }} />
      </div>

      {/* Main Glass Form */}
      <div
        className="card-organic"
        ref={formRef}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '48px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.4)',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          margin: '24px' // mobile safe margin
        }}
      >
        {/* Logo */}
        <div
          data-animate
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 48,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
            }}
          >
            <Building2 style={{ width: 24, height: 24, color: '#ffffff' }} />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 24,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}
          >
            RentFlow
          </span>
        </div>

        {/* Heading */}
        <div data-animate style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            Please enter your details to sign in.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            data-animate
            style={{
              marginBottom: 20,
              padding: '14px 16px',
              background: '#fff0f0',
              border: '1px solid #ffd6d6',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Demo mode notice */}
        {isDemoMode && (
          <div
            data-animate
            style={{
              marginBottom: 24,
              padding: '14px 16px',
              background: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <p style={{ fontSize: 13, color: '#ca8a04', fontWeight: 600 }}>
              Demo mode active. Use any credentials to preview.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Email */}
          <div data-animate>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <div style={inputWrapStyle}>
              <Mail style={inputIconStyle} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-organic"
                style={{ paddingLeft: 46 }}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div data-animate>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={inputWrapStyle}>
              <Lock style={inputIconStyle} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-organic"
                style={{ paddingLeft: 46, paddingRight: 46 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute', right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div
            data-animate
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }}
              />
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Remember me</span>
            </label>
            <a href="#" style={{ fontSize: 14, color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 700 }}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <div data-animate style={{ marginTop: 12 }}>
            <button type="submit" disabled={loading} className="btn-organic btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div data-animate style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>or sign in with</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
        </div>

        {/* Google sign-in */}
        <div data-animate>
          <button type="button" className="btn-organic btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '15px' }}>
            <GoogleIcon />
            Google
          </button>
        </div>

        {/* Footer link */}
        <p data-animate style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
          Don't have an account?{' '}
          <Link to="/" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 700 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
