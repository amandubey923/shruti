'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, ShieldCheck, Heart, History, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout, isConfigured } = useAuth();
  const { favorites, savedSeries, history } = useLibrary();
  const { playbackRate, setSpeed } = usePlayback();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="border-b border-background-border/60 pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Listener Profile &amp; Preferences
          </h1>
          <p className="text-xs text-foreground-subtle mt-1">
            Manage your account settings, listening defaults, and archival preferences.
          </p>
        </div>

        {user && (
          <Button variant="danger" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-background-card border border-background-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent text-accent font-serif text-xl font-bold flex items-center justify-center flex-shrink-0">
            {profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {profile?.displayName || (user ? 'Registered Seeker' : 'Guest Listener')}
              </h2>
              {user && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Synced</span>
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-subtle mt-0.5">
              {user?.email || 'Listening locally in guest mode on this device.'}
            </p>
          </div>
        </div>

        {!user && (
          <Link href="/login">
            <Button size="sm">Sign In to Sync</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-background-card border border-background-border text-center">
          <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
          <span className="text-lg font-bold text-foreground">{favorites.length}</span>
          <p className="text-xs text-foreground-subtle">Saved Audio</p>
        </div>

        <div className="p-4 rounded-2xl bg-background-card border border-background-border text-center">
          <Bookmark className="w-5 h-5 text-accent mx-auto mb-2" />
          <span className="text-lg font-bold text-foreground">{savedSeries.length}</span>
          <p className="text-xs text-foreground-subtle">Saved Series</p>
        </div>

        <div className="p-4 rounded-2xl bg-background-card border border-background-border text-center">
          <History className="w-5 h-5 text-accent mx-auto mb-2" />
          <span className="text-lg font-bold text-foreground">{history.length}</span>
          <p className="text-xs text-foreground-subtle">Listened</p>
        </div>
      </div>

      <div className="space-y-4 p-6 rounded-3xl bg-background-card border border-background-border">
        <h3 className="font-serif text-base font-bold text-foreground">Listening Defaults &amp; Theme</h3>

        <div className="flex items-center justify-between py-3 border-b border-background-border/40">
          <div>
            <p className="text-xs font-semibold text-foreground">Color Theme</p>
            <p className="text-[11px] text-foreground-subtle">Switch between Warm Light &amp; Midnight Dark</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-background-border/40">
          <div>
            <p className="text-xs font-semibold text-foreground">Preferred Playback Speed</p>
            <p className="text-[11px] text-foreground-subtle">Default speed applied to all audio</p>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  playbackRate === s
                    ? 'bg-accent text-background font-bold border-accent'
                    : 'bg-background-elevated border-background-border text-foreground-muted hover:text-foreground'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-semibold text-foreground">Backend &amp; Storage Status</p>
            <p className="text-[11px] text-foreground-subtle">
              {isConfigured ? 'Connected to Firebase & Cloud Storage' : 'Operating in Offline / Local Seed mode'}
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
              isConfigured
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : 'bg-accent/10 text-accent border border-accent/30'
            }`}
          >
            {isConfigured ? 'ONLINE' : 'LOCAL CACHE'}
          </span>
        </div>
      </div>
    </div>
  );
}
