import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input } from '@/components/ui';
import { animateCardsIn } from '@/lib/animations';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      animateCardsIn([cardRef.current], { delay: 0.2 });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication - In production, this would call Clerk
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo login - accept any credentials
    if (email && password) {
      localStorage.setItem('rentflow-auth', 'true');
      navigate('/dashboard');
    } else {
      setError('Please enter your email and password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Building2 size={28} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white">RentFlow</span>
            </div>

            {/* Hero Text */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Modern Property Management <System></System>
            </h1>
            <p className="text-lg text-blue-100 mb-12">
              Streamline rent collection, track payments, manage tenants, and grow your rental business with our premium platform.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Automated MPESA payment tracking',
                'Real-time tenant communication',
                'Water billing & meter readings',
                'Comprehensive financial reports',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-blue-100">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight size={12} className="text-white" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-40 right-40 w-20 h-20 bg-white/5 rounded-full blur-lg" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[var(--color-bg)]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">RentFlow</span>
          </div>

          {/* Form Card */}
          <div ref={cardRef} style={{ opacity: 0 }}>
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-headline text-[var(--color-text-primary)] mb-2">
                  Welcome back
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-[var(--color-danger-light)] text-[var(--color-danger)] text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[var(--color-border)]"
                    />
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="text-sm text-[var(--color-accent)] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Don't have an account?{' '}
                  <span className="text-[var(--color-text-secondary)]">
                    Contact your administrator
                  </span>
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
            © {new Date().getFullYear()} Collins Kimanzi Mwandikwa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
