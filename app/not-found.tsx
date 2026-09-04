import React from 'react';
import Link from 'next/link';
import { Compass, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6">
      {/* Subtle Spiritual Concentric Circles Geometry */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full border border-accent/10 animate-pulse [animation-duration:6s]" />
        <div className="absolute w-72 h-72 sm:w-[360px] sm:h-[360px] rounded-full border border-accent/15" />
        <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-accent/20 bg-accent/5 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto text-center space-y-6 animate-fade-in">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] sm:text-xs font-bold tracking-widest uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Silence &bull; 404</span>
        </div>

        {/* Primary Message */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            This path could not be found.
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed max-w-md mx-auto font-normal">
            Like a quiet ripple returning to stillness, the discourse, collection, or destination you seek is not present here.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-accent/20 transition-all active:scale-95 min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-background-elevated hover:bg-background-hover border border-background-border text-foreground hover:text-accent font-semibold text-xs sm:text-sm transition-all active:scale-95 min-h-[44px]"
          >
            <Compass className="w-4 h-4 text-accent" />
            <span>Explore Discourses</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


