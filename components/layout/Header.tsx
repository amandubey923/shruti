'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
                alt="SHRUTI Brand Symbol"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.2em] text-xl sm:text-2xl font-extrabold text-foreground group-hover:text-accent transition-colors leading-none">
                SHRUTI
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-accent -mt-0.5 font-sans">
                Audio Archive
              </span>
            </div>
          </Link>
        </div>

        {/* Search Bar Trigger - Centered & Generous Touch Target */}
        <div className="flex-1 max-w-lg hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm text-foreground-muted bg-background-elevated hover:bg-background-hover hover:text-foreground border border-background-border rounded-full transition-all group shadow-sm"
            aria-label="Search audio, discourses, series, or speakers"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Search className="w-4 h-4 text-accent group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate">Search discourses, Upanishads, Gita, series...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-foreground-subtle bg-background-surface rounded-md border border-background-border shadow-xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Actions, Theme Toggle & User Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Search Button - Large 44px touch target */}
          <button
            onClick={onOpenSearch}
            className="w-11 h-11 text-foreground-muted hover:text-foreground md:hidden rounded-full hover:bg-background-elevated transition-colors border border-background-border/60 flex items-center justify-center active:scale-95"
            aria-label="Open search modal"
          >
            <Search className="w-5 h-5 text-accent" />
          </button>

          {/* Prominent Theme Toggle */}
          <ThemeToggle />

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 bg-background-elevated hover:bg-background-hover border border-background-border rounded-full transition-all shadow-sm"
                aria-expanded={menuOpen}
              >
                <span className="text-xs font-semibold text-foreground max-w-[120px] truncate hidden sm:inline">
                  {profile?.displayName || user.email?.split('@')[0]}
                </span>
                <div className="w-8 h-8 rounded-full bg-accent text-stone-950 flex items-center justify-center text-xs font-bold shadow-sm">
                  {profile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-background-surface border border-background-border rounded-2xl shadow-2xl py-2 z-30 animate-fade-in text-xs">
                    <div className="px-4 py-2.5 border-b border-background-border/60">
                      <p className="font-bold text-foreground truncate">
                        {profile?.displayName || 'Listener'}
                      </p>
                      <p className="text-foreground-subtle truncate text-[11px] mt-0.5">
                        {user.email}
                      </p>
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
