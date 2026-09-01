'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Layers, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onOpenSearch: () => void;
}

export function BottomNavigation({ onOpenSearch }: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Search', action: onOpenSearch, icon: Search },
    { label: 'Favorites', href: '/library/favorites', icon: Heart },
    { label: 'Library', href: '/library', icon: Layers },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background-card/98 backdrop-blur-lg border-t border-background-border px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href ? pathname === item.href : false;

        if (item.action) {
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 text-foreground-muted hover:text-foreground active:scale-90 transition-all rounded-xl"
              aria-label="Open Search"
            >
              <Icon className="w-5 h-5 text-foreground-muted" />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            className={cn(
              'flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl active:scale-90',
              isActive
                ? 'text-accent font-bold'
                : 'text-foreground-muted hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={cn('w-5 h-5', isActive ? 'text-accent stroke-[2.5]' : '')} />
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
