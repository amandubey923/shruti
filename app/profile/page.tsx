'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Heart,
  ListMusic,
  History,
  LogOut,
  ShieldAlert,
  Gauge,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const { favorites, playlists, history } = useLibrary();
  const { playbackRate, setSpeed } = usePlayback();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted mt-1">
          Manage your listening profile, speeds, and synchronization.
        </p>
      </div>

      {/* User Information Card */}
      <div className="p-6 rounded-3xl bg-background-card border border-background-border/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent text-2xl font-bold font-serif flex-shrink-0">
          {profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'L'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">
            {profile?.displayName || (user ? 'Registered Seeker' : 'Guest Listener')}
          </h2>
          <p className="text-xs text-foreground-subtle truncate">
            {user?.email || 'Listening offline in Guest mode'}
          </p>

          {!user && (
            <div className="pt-3">
              <Link href="/login">
                <Button size="sm">Sign In to Cloud Sync</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Listening Statistics */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-background-card border border-background-border text-center">
          <Heart className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <span className="text-xl font-bold font-serif text-foreground block">
            {favorites.length}
          </span>
          <span className="text-[11px] text-foreground-subtle">Favorites</span>
        </div>

        <div className="p-4 rounded-2xl bg-background-card border border-background-border text-center">
          <ListMusic className="w-5 h-5 text-accent mx-auto mb-2" />
          <span className="text-xl font-bold font-serif text-foreground block">
            {playlists.length}
          </span>
          <span className="text-[11px] text-foreground-subtle">Playlists</span>
        </div>

        <div className="p-4 rounded-2xl bg-background-card border border-background-border text-center">
          <History className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <span className="text-xl font-bold font-serif text-foreground block">
            {history.length}
          </span>
          <span className="text-[11px] text-foreground-subtle">History</span>
        </div>
      </div>

      {/* Listening Preferences */}
      <div className="p-6 rounded-3xl bg-background-card border border-background-border space-y-4">
        <h3 className="font-serif text-base font-bold text-foreground">
          Listening Preferences
        </h3>

        {/* Default Speed */}
        <div className="flex items-center justify-between py-2 border-b border-background-border/40">
          <div className="flex items-center gap-3">
            <Gauge className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs font-medium text-foreground">Default Playback Speed</p>
              <p className="text-[11px] text-foreground-subtle">Set your preferred listening pace</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 1.25, 1.5, 1.75].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  playbackRate === speed
                    ? 'bg-accent text-background font-semibold'
                    : 'bg-background-elevated hover:bg-background-hover text-foreground-muted'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Admin Link */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-foreground-subtle" />
            <div>
              <p className="text-xs font-medium text-foreground">Admin Ingestion Portal</p>
              <p className="text-[11px] text-foreground-subtle">Upload audio & curate catalog</p>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="text-xs">
              Open Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* Logout */}
      {user && (
        <div className="pt-4 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        </div>
      )}
    </div>
  );
}

