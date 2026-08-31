'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CategoryInfo } from '@/types/audio';

interface CategoryCardProps {
  category: CategoryInfo;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/explore?category=${encodeURIComponent(category.title)}`}
      className="group relative h-28 sm:h-32 rounded-2xl overflow-hidden border border-background-border/60 hover:border-accent/40 transition-all duration-300 flex flex-col justify-end p-4 shadow-sm"
    >
      <Image
        src={category.coverImage}
        alt={category.title}
        fill
        sizes="(max-width: 768px) 50vw, 250px"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90" />

      <div className="relative z-10">
        <h4 className="font-serif text-sm sm:text-base font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
          {category.title}
        </h4>
        <p className="text-[10px] text-foreground-subtle line-clamp-1 mt-0.5">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
