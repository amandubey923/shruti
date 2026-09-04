'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur-md border-b border-background-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 select-none" aria-label="SHRUTI Audio Archive Home">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0 group-hover:ring-2 group-hover:ring-accent/40 transition-all">
              <Image
                src="/brand/shruti-mark.svg"
                alt="SHRUTI Monogram"
                fill
                sizes="40px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-wider text-foreground">
                  SHRUTI
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-accent">
                  श्रुति
                </span>
              </div>
              <span className="text-[10px] text-foreground-subtle hidden sm:block tracking-wide">
                Spoken Audio Archive
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-background-elevated hover:bg-background-hover border border-background-border hover:border-accent/40 rounded-full text-xs text-foreground-muted transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
              <span>Search recordings, series, speakers...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-background-card border border-background-border rounded text-foreground-subtle">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2.5 text-foreground-muted hover:text-foreground rounded-full hover:bg-background-elevated transition-colors"
            aria-label="Open search dialog"
          >
            <Search className="w-5 h-5 text-accent" />
          </button>

          {/* Mobile: icon-only toggle. Desktop: segmented toggle */}
          <ThemeToggle variant="icon" className="sm:hidden" />
          <ThemeToggle className="hidden sm:flex" />

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 bg-background-elevated hover:bg-background-hover border border-background-border rounded-full transition-all shadow-sm"
                aria-expanded={menuOpen}
              >
                <span className="text-xs font-semibold text-foreground max-w-[120px] truncate hidden sm:inline">
                  {profile?.displayName || user.displayName || user.email?.split('@')[0]}
                </span>
                <UserAvatar
                  photoURL={profile?.photoURL || user.photoURL}
                  name={profile?.displayName || user.displayName}
                  email={user.email}
                  size="sm"
                />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-background-surface border border-background-border rounded-2xl shadow-2xl py-2 z-30 animate-fade-in text-xs">
                    <div className="px-4 py-3 border-b border-background-border/60 flex items-center gap-3">
                      <UserAvatar
                        photoURL={profile?.photoURL || user.photoURL}
                        name={profile?.displayName || user.displayName}
                        email={user.email}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground truncate">
                          {profile?.displayName || user.displayName || 'Listener'}
                        </p>
                        <p className="text-foreground-subtle truncate text-[11px] mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-background-hover transition-colors font-medium"
                    >
                      <User className="w-4 h-4 text-accent" />
                      <span>Profile &amp; Preferences</span>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-foreground-muted hover:text-foreground hover:bg-background-hover transition-colors font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-accent" />
                      <span>Admin Ingestion</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 transition-colors border-t border-background-border/60 mt-1 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-semibold text-foreground hover:text-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-xs font-bold bg-accent text-stone-950 rounded-full hover:bg-accent-hover transition-all shadow-sm active:scale-95"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
