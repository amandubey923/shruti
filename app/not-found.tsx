import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center space-y-4 max-w-md mx-auto animate-fade-in">
      <h2 className="font-serif text-3xl font-bold text-foreground">Archive Not Found</h2>
      <p className="text-xs sm:text-sm text-foreground-muted">
        The discourse, series, or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-background font-semibold text-xs shadow hover:bg-accent-hover transition-colors"
      >
        <span>Return to Sanctuary</span>
      </Link>
    </div>
  );
}

