import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPagesProps {
  mode: 'login' | 'signup' | 'forgot-password';
  onNavigate: (view: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode, onNavigate }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsDemo,
    sendResetEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await signInWithEmail(email, password);
        onNavigate('dashboard');
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          throw new Error('Please provide your name or spiritual handle.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signUpWithEmail(email, password, displayName.trim());
        onNavigate('onboarding');
      } else if (mode === 'forgot-password') {
        if (!email) {
          throw new Error('Please enter your email address to receive reset instructions.');
        }
        await sendResetEmail(email);
        setSuccess('Password reset link sent to your email address.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Incorrect email or password. Please verify or use Instant Demo mode.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('This email is already registered. Please log in or reset password.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onNavigate('dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in was interrupted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 mb-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-serif font-bold text-slate-950 text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              1B
            </div>
            <span className="font-serif font-bold text-xl text-white">OneBody</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Welcome Back in Christ'}
            {mode === 'signup' && 'Join the Global Fellowship'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            {mode === 'login' && 'Sign in to access your Bible quizzes, competitions, and fellowship.'}
            {mode === 'signup' && 'Create your account to study Scripture and connect worldwide.'}
            {mode === 'forgot-password' && 'Enter your email address and we will send you a reset link.'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Social Google Sign-in */}
          {mode !== 'forgot-password' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">
                  or email
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name / Spiritual Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sister Ruth"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => onNavigate('forgot-password')}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In to Fellowship'
                  : mode === 'signup'
                  ? 'Create My Account'
                  : 'Send Reset Email'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Preview Option */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={async () => {
                await signInAsDemo('member');
                onNavigate('dashboard');
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Member Preview Mode</span>
            </button>
          </div>
        </div>

        {/* Footer switcher */}
        <div className="text-center mt-5 text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-amber-400 hover:underline font-semibold"
              >
                Sign up free
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-amber-400 hover:underline font-semibold"
              >
                Sign in here
              </button>
            </p>
          )}

          {mode === 'forgot-password' && (
            <p>
              Remembered your password?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-amber-400 hover:underline font-semibold"
              >
                Return to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
