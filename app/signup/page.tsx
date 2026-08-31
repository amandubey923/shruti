'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle, isConfigured } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail(email, password, name.trim());
      router.push('/library');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email.');
      } else {
        setError(err.message || 'Registration failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/library');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background-card border border-background-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="font-serif tracking-widest text-2xl font-bold text-foreground">
            SHRUTI
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Create Your Account
          </h2>
          <p className="text-xs text-foreground-muted">
            Join the listening archive. Keep your playlists and progress synchronized everywhere.
          </p>
        </div>

        {!isConfigured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Firebase credentials are not set in .env yet. You can still browse and listen offline.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-background-elevated hover:bg-background-hover border border-background-border text-foreground font-medium text-xs sm:text-sm rounded-full transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Sign Up with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-background-border/60 flex-1" />
          <span className="text-[10px] uppercase font-semibold text-foreground-subtle">or</span>
          <div className="h-px bg-background-border/60 flex-1" />
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-foreground-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seeker / Listener"
                className="w-full bg-background-elevated border border-background-border rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-foreground-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-background-elevated border border-background-border rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Password (6+ chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-foreground-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background-elevated border border-background-border rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <Button type="submit" className="w-full text-xs sm:text-sm" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-foreground-subtle pt-2">
          <span>Already have an account? </span>
          <Link href="/login" className="text-accent hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

