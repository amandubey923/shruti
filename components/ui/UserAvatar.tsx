'use client';

import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackLetter?: string;
}

const SIZE_MAP: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl font-serif',
};

export function UserAvatar({
  photoURL,
  name,
  email,
  size = 'sm',
  className = '',
  fallbackLetter,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error flag if photoURL updates
  useEffect(() => {
    setImageError(false);
  }, [photoURL]);

  const initial = (
    name?.[0] ||
    email?.[0] ||
    fallbackLetter ||
    'U'
  ).toUpperCase();

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;
  const hasValidPhoto = Boolean(photoURL && !imageError);

  if (hasValidPhoto) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 border border-background-border/80 shadow-sm select-none ${sizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoURL!}
          alt={name || email || 'User Profile Photo'}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-accent text-stone-950 font-bold flex items-center justify-center shadow-sm select-none flex-shrink-0 ${sizeClass} ${className}`}
      aria-label={name || email || 'User Initial'}
    >
      <span>{initial}</span>
    </div>
  );
}
