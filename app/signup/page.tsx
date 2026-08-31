'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail(email, password, name.trim() || undefined);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Google sign-up was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 sm:py-16 px-4 animate-fade-in pb-20">
      <div className="text-center mb-8 space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Return home">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src="/brand/shruti-mark.svg"
              alt="SHRUTI Logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <span className="font-serif tracking-[0.2em] text-2xl font-extrabold text-foreground group-hover:text-accent transition-colors">
            SHRUTI
          </span>
        </Link>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Create Your Listening Account
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted">
          Begin your contemplative journey into sacred spoken audio.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="bg-background-card border border-background-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-background-elevated hover:bg-background-hover text-foreground font-semibold text-xs sm:text-sm border border-background-border transition-all active:scale-95 min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign Up with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-background-border" />
          <span className="px-3 text-[10px] text-foreground-subtle uppercase tracking-widest font-bold">
            or
          </span>
          <div className="flex-1 border-t border-background-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seeker"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-accent min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="listener@domain.com"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-accent min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-accent min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-accent/25 transition-all active:scale-95 min-h-[44px] mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-foreground-subtle">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
