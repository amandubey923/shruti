'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Home,
  Heart,
  ListMusic,
  History,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLibrary } from '@/context/LibraryContext';

export function Sidebar() {
  const pathname = usePathname();
  const { favorites, playlists } = useLibrary();

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Library', href: '/library', icon: Layers },
    {
      label: 'Favorites',
      href: '/library/favorites',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
    {
      label: 'Playlists',
      href: '/playlists',
      icon: ListMusic,
      badge: playlists.length > 0 ? playlists.length : undefined,
    },
    { label: 'History', href: '/library/history', icon: History },
  ];

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col border-r border-background-border/60 bg-background/50 backdrop-blur-sm p-4 space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-medium tracking-wider text-foreground-subtle uppercase">
          Menu
        </p>
        <nav className="space-y-1 pt-1.5" aria-label="Main Navigation">
          {navLinks.slice(0, 3).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 group',
                  isActive
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-hover'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
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

      <div className="space-y-1 pt-3 border-t border-background-border/40">
        <p className="px-3 text-[11px] font-medium tracking-wider text-foreground-subtle uppercase">
          My Listening
        </p>
        <nav className="space-y-1 pt-1.5" aria-label="Personal Library">
          {navLinks.slice(3).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 group',
                  isActive
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-hover'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-accent' : 'text-foreground-subtle group-hover:text-foreground'
                    )}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background-elevated border border-background-border text-foreground-muted">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Editorial Quotation Card */}
      <div className="mt-auto p-3.5 rounded-xl bg-background-elevated/40 border border-background-border/40 text-[11px] text-foreground-subtle leading-relaxed">
        <span className="font-serif italic text-foreground-muted block mb-1">
          &ldquo;Listening is the deepest art. When you listen totally, the mind ceases.&rdquo;
        </span>
        <span className="text-[10px] uppercase tracking-wider text-accent/80">— SHRUTI</span>
      </div>
    </aside>
  );
}

