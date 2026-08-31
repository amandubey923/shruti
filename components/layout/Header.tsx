'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-background-border/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex flex-col">
            <span className="font-serif tracking-widest text-xl sm:text-2xl font-semibold text-foreground group-hover:text-accent transition-colors">
              SHRUTI
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-foreground-subtle group-hover:text-foreground-muted transition-colors -mt-1 font-sans">
              Sacred Sound & Talks
            </span>
          </Link>
        </div>

        {/* Search Bar Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-foreground-muted bg-background-elevated/70 hover:bg-background-elevated hover:text-foreground border border-background-border rounded-full transition-all group"
            aria-label="Search audio, speakers, or topics"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-accent/80 group-hover:text-accent transition-colors" />
              <span>Search discourses, ragas, meditation, speakers...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-foreground-subtle bg-background-surface rounded border border-background-border">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Actions & User Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="p-2 text-foreground-muted hover:text-foreground md:hidden rounded-full hover:bg-background-elevated transition-colors"
            aria-label="Open search modal"
          >
            <Search className="w-5 h-5" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-background-elevated hover:bg-background-hover border border-background-border rounded-full transition-colors"
                aria-expanded={menuOpen}
              >
                <span className="text-xs font-medium text-foreground-muted max-w-[120px] truncate hidden sm:inline">
                  {profile?.displayName || user.email?.split('@')[0]}
                </span>
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-semibold">
                  {profile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-background-surface border border-background-border rounded-xl shadow-xl py-1.5 z-30 animate-fade-in text-xs">
                    <div className="px-3 py-2 border-b border-background-border/60">
                      <p className="font-medium text-foreground truncate">
                        {profile?.displayName || 'Listener'}
                      </p>
                      <p className="text-foreground-subtle truncate text-[11px]">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-foreground-muted hover:text-foreground hover:bg-background-hover transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile & Settings</span>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-foreground-muted hover:text-foreground hover:bg-background-hover transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Ingestion</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors border-t border-background-border/60 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 text-xs font-medium text-foreground hover:text-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 text-xs font-medium bg-accent text-background rounded-full hover:bg-accent-hover transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
