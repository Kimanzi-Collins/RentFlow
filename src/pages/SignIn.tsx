import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);

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
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    paddingLeft: 44,
    paddingRight: 16,
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    color: '#1d1d1f',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  };

  const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: 14,
    width: 18,
    height: 18,
    color: '#a1a1a6',
    pointerEvents: 'none',
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#86868b',
    marginBottom: 6,
    fontFamily: 'var(--font-body)',
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#0066cc';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,102,204,0.1)';
  };

  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f5f5f7',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* LEFT IMAGE PANEL */}
      <div
        className="hidden lg:flex"
        style={{
          flex: '0 0 50%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" 
          alt="Modern architecture" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 64,
          left: 64,
          right: 64,
          color: '#ffffff'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 16
          }}>
            Automate your portfolio.
          </h2>
          <p style={{
            fontSize: 21,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.8)',
            maxWidth: 400,
            letterSpacing: '0.01em'
          }}>
            RentFlow brings clarity to property management with Apple-inspired simplicity.
          </p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          overflowY: 'auto',
          background: '#ffffff',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }} ref={formRef}>
          {/* Logo */}
          <div
            data-animate
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 48,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 style={{ width: 20, height: 20, color: '#0066cc' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 20,
                color: '#1d1d1f',
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
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}
            >
              Sign in to your account
            </h1>
            <p style={{ fontSize: 15, color: '#86868b' }}>
              Welcome back to your dashboard
            </p>
          </div>

          {/* Error notification */}
          {error && (
            <div
              data-animate
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: '#fff0f0',
                border: '1px solid #ffd6d6',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ff3b30',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: '#c92a2a', lineHeight: 1.4 }}>
                {error}
              </span>
            </div>
          )}

          {/* Demo mode notice */}
          {isDemoMode && (
            <div
              data-animate
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: '#fff9e6',
                border: '1px solid #ffeba3',
                borderRadius: 12,
              }}
            >
              <p style={{ fontSize: 13, color: '#d97706', lineHeight: 1.5 }}>
                <strong>Demo mode:</strong> Supabase not configured. Use any credentials to preview the UI.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div data-animate>
              <label htmlFor="email" style={labelStyle}>
                Email address
              </label>
              <div style={inputWrapStyle}>
                <Mail style={inputIconStyle} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  required
                  style={inputStyle}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div data-animate>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <div style={inputWrapStyle}>
                <Lock style={inputIconStyle} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#a1a1a6',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = '#1d1d1f';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 16, height: 16 }} />
                  ) : (
                    <Eye style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div
              data-animate
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: '#0066cc',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 13, color: '#86868b' }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                style={{
                  fontSize: 13,
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <div data-animate style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: loading ? '#0071e3' : '#0066cc',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 400,
                  fontFamily: 'var(--font-body)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#0071e3';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#0066cc';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div
            data-animate
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              margin: '32px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
            <span style={{ fontSize: 13, color: '#a1a1a6', whiteSpace: 'nowrap' }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
          </div>

          {/* Google sign-in */}
          <div data-animate>
            <button
              type="button"
              style={{
                width: '100%',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '9999px',
                color: '#1d1d1f',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Footer link */}
          <p
            data-animate
            style={{
              marginTop: 32,
              textAlign: 'center',
              fontSize: 14,
              color: '#86868b',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/"
              style={{
                color: '#0066cc',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
