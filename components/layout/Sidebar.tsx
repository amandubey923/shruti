'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Home,
  Heart,
  Bookmark,
  History,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLibrary } from '@/context/LibraryContext';

export function Sidebar() {
  const pathname = usePathname();
  const { favorites, savedSeries } = useLibrary();

  const primaryLinks = [
    { label: 'Archive Sanctuary', href: '/', icon: Home },
    { label: 'Browse Catalog', href: '/explore', icon: Compass },
    { label: 'My Library', href: '/library', icon: Layers },
  ];

  const libraryLinks = [
    {
      label: 'Saved Audio',
      href: '/library/favorites',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
    {
      label: 'Saved Series',
      href: '/library/series',
      icon: Bookmark,
      badge: savedSeries.length > 0 ? savedSeries.length : undefined,
    },
    { label: 'Listening History', href: '/library/history', icon: History },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-background-border/80 bg-background/60 backdrop-blur-md p-5 space-y-7">
      {/* Archive Discovery */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3">
          <Sparkles className="w-3 h-3 text-accent" />
          <p className="text-[11px] font-bold tracking-[0.2em] text-foreground-subtle uppercase">
            Archive
          </p>
        </div>
        <nav className="space-y-1.5 pt-1" aria-label="Main Navigation">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-150 group',
                  isActive
                    ? 'bg-accent/15 text-accent font-bold shadow-xs'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-hover'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-accent' : 'text-foreground-subtle group-hover:text-foreground'
                    )}
                  />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* My Listening Sanctuary */}
      <div className="space-y-2 pt-4 border-t border-background-border/60">
        <p className="px-3 text-[11px] font-bold tracking-[0.2em] text-foreground-subtle uppercase">
          My Listening
        </p>
        <nav className="space-y-1.5 pt-1" aria-label="Personal Library">
          {libraryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-150 group',
                  isActive
                    ? 'bg-accent/15 text-accent font-bold shadow-xs'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-hover'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-accent' : 'text-foreground-subtle group-hover:text-foreground'
                    )}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-background-elevated border border-background-border text-foreground-muted">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Archival Contemplation Footer */}
      <div className="mt-auto p-4 rounded-2xl bg-background-elevated/70 border border-background-border/80 text-xs text-foreground-subtle leading-relaxed shadow-xs">
        <p className="font-serif italic text-foreground-muted leading-snug">
          &ldquo;Listening is the deepest art. When you listen totally, the mind ceases.&rdquo;
        </p>
        <span className="text-[10px] uppercase font-bold tracking-widest text-accent mt-2 block">
          — OSHO
        </span>
      </div>
    </aside>
  );
}
