'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { PlaybackProvider } from '@/context/PlaybackContext';
import { LibraryProvider } from '@/context/LibraryContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { AudioPlayer } from '@/components/player/AudioPlayer';
import { SearchModal } from '@/components/search/SearchModal';

export function AppClientLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthProvider>
      <PlaybackProvider>
        <LibraryProvider>
          <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30 selection:text-white">
            {/* Top Navigation */}
            <Header onOpenSearch={() => setSearchOpen(true)} />

            <div className="flex-1 flex w-full max-w-7xl mx-auto">
              {/* Desktop Left Navigation Drawer */}
              <Sidebar />

              {/* Main Content View */}
              <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-36 lg:pb-32">
                {children}
              </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNavigation onOpenSearch={() => setSearchOpen(true)} />

            {/* Global Persistent Audio Player */}
            <AudioPlayer />

            {/* Global Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          </div>
        </LibraryProvider>
      </PlaybackProvider>
    </AuthProvider>
  );
}

