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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background-surface/90 backdrop-blur-md border-t border-background-border/60 px-4 py-2 flex items-center justify-around"
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
              className="flex flex-col items-center gap-1 text-foreground-muted hover:text-foreground active:scale-95 transition-all p-1"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            className={cn(
              'flex flex-col items-center gap-1 transition-all p-1',
              isActive ? 'text-accent font-semibold' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

