'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { CategoryInfo } from '@/types/audio';

interface CategoryCardProps {
  category: CategoryInfo;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/explore?category=${encodeURIComponent(category.title)}`}
      className="group relative h-32 sm:h-36 rounded-3xl overflow-hidden border border-background-border hover:border-accent/50 transition-all duration-300 flex flex-col justify-end p-5 shadow-xs hover:shadow-md"
    >
      <Image
        src={category.coverImage}
        alt={category.title}
        fill
        sizes="(max-width: 768px) 50vw, 250px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-85" />

      <div className="relative z-10 space-y-0.5">
        <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-accent">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Category</span>
        </div>
        <h4 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
          {category.title}
        </h4>
        <p className="text-xs text-stone-300 line-clamp-1">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
