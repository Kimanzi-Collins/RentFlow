import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';

export const SignIn: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'landlord' | 'caretaker'>('landlord');
  
  const { signIn, signUp, loading, isDemoMode } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ type: 'error', title: 'Sign in failed', description: error });
      } else {
        toast({ type: 'success', title: 'Welcome back!', description: isDemoMode ? 'Running in demo mode.' : undefined });
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, fullName, role);
      if (error) {
        toast({ type: 'error', title: 'Sign up failed', description: error });
      } else {
        toast({ type: 'success', title: 'Account created!', description: 'Welcome to RentFlow.' });
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] relative overflow-hidden text-[var(--color-text-primary)]">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-accent)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 opacity-10 blur-[120px]" />
        <div className="absolute inset-0 glass-noise mix-blend-overlay opacity-40" />
      </div>

      <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-8 p-6 relative z-10 animate-scale-in">
        
        {/* Left Column - Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 glass-strong rounded-3xl border border-[var(--color-border)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)]">
                <Building2 size={24} className="text-white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">RentFlow</span>
            </div>
            
            <h1 className="text-display mb-6">Property<br />Management,<br />Reimagined.</h1>
            <p className="text-body text-[var(--color-text-secondary)] max-w-sm">
              Streamline rent collection, track payments, manage tenants, and grow your rental business with our premium platform designed for the Kenyan market.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 text-sm font-medium text-[var(--color-text-tertiary)]">
              <span>Automated MPESA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-active)]" />
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <Card variant="strong" padding="lg" className="w-full max-w-md mx-auto rounded-3xl backdrop-blur-[40px] shadow-2xl">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-headline mb-2">{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p className="text-body-sm">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up to start managing your properties.'}
            </p>
            {isDemoMode && (
              <div className="mt-4 p-3 bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20 rounded-lg text-xs text-[var(--color-warning)] flex items-start gap-2 text-left">
                <span className="shrink-0 mt-0.5">ℹ️</span>
                <span>Running in Demo Mode (Supabase credentials missing). You can sign in with any email and password.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}
            
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div>
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isLogin && (
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-xs font-medium hover:underline">Forgot password?</a>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-label text-[var(--color-text-secondary)]">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      role === 'landlord'
                        ? 'bg-[var(--color-accent-muted)] border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'glass-subtle text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    Landlord
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('caretaker')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      role === 'caretaker'
                        ? 'bg-[var(--color-accent-muted)] border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'glass-subtle text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    Caretaker
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={loading}
              rightIcon={<ArrowRight size={18} />}
              className="mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
