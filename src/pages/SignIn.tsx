import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 overflow-hidden rounded-2xl bg-background shadow-xl border">
        
        {/* Left Column - Branding */}
        <div className="hidden md:flex flex-col justify-between bg-zinc-950 p-12 text-zinc-50">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight">RentFlow</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight mb-6">Property<br />Management,<br />Reimagined.</h1>
            <p className="text-zinc-400 max-w-sm text-sm">
              Streamline rent collection, track payments, manage tenants, and grow your rental business with our premium platform designed for the Kenyan market.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
            <span>Automated MPESA</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Real-time Analytics</span>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up to start managing your properties.'}
              </p>
              {isDemoMode && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Demo Mode:</strong> Supabase credentials missing. Sign in with any email and password to preview the UI.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium leading-none">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('landlord')}
                      className={`rounded-md border p-3 text-sm font-medium transition-colors ${
                        role === 'landlord'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      Landlord
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('caretaker')}
                      className={`rounded-md border p-3 text-sm font-medium transition-colors ${
                        role === 'caretaker'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input bg-background hover:bg-muted'
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
                className="mt-2"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-foreground hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
