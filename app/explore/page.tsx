'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Layers, Mic, User, Sparkles } from 'lucide-react';
import { AudioTrack, Series, Artist } from '@/types/audio';
import { getAllTracks, getAllSeries, getAllArtists } from '@/lib/firestore';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { TrackRow } from '@/components/audio/TrackRow';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialTab = searchParams.get('tab') || 'series';

  const [activeTab, setActiveTab] = useState<'tracks' | 'series' | 'artists'>(
    (initialTab as 'tracks' | 'series' | 'artists') || 'series'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function loadData() {
      const [t, s, a] = await Promise.all([
        getAllTracks(),
        getAllSeries(),
        getAllArtists(),
      ]);
      setTracks(t);
      setSeriesList(s);
      setArtists(a);
    }
    loadData();
  }, []);

  const categories = ['All', 'Discourses', 'Philosophy', 'Upanishads'];
  const languages = ['All', 'Hindi'];

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const catMatch =
        selectedCategory === 'All' ||
        t.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Discourses' && t.category.includes('Discourses')) ||
        (selectedCategory === 'Philosophy' && t.category.includes('Philosophy')) ||
        (selectedCategory === 'Upanishads' && t.category.includes('Upanishad'));
      const langMatch =
        selectedLanguage === 'All' ||
        t.language?.toLowerCase() === selectedLanguage.toLowerCase();
      return catMatch && langMatch;
    });
  }, [tracks, selectedCategory, selectedLanguage]);

  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      const catMatch =
        selectedCategory === 'All' ||
        s.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Discourses' && s.category.includes('Discourses')) ||
        (selectedCategory === 'Philosophy' && s.category.includes('Philosophy')) ||
        (selectedCategory === 'Upanishads' && s.category.includes('Upanishad'));
      const langMatch =
        selectedLanguage === 'All' ||
        s.language?.toLowerCase() === selectedLanguage.toLowerCase();
      return catMatch && langMatch;
    });
  }, [seriesList, selectedCategory, selectedLanguage]);

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase">
          <Compass className="w-3.5 h-3.5" />
          <span>Archival Catalog</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-foreground">
          Browse Audio Archives &amp; Series
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted max-w-2xl font-normal">
          Explore complete audio series, Vedic Upanishadic commentaries, and profound spoken discourses.
        </p>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-background-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'series'
                ? 'bg-accent text-stone-950 shadow-md shadow-accent/20'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated border border-background-border/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Series &amp; Books ({filteredSeries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tracks'
                ? 'bg-accent text-stone-950 shadow-md shadow-accent/20'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated border border-background-border/50'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>All Recordings ({filteredTracks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'artists'
                ? 'bg-accent text-stone-950 shadow-md shadow-accent/20'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated border border-background-border/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Speakers ({artists.length})</span>
          </button>
        </div>

        {activeTab === 'tracks' && (
          <div className="hidden sm:flex items-center gap-1 bg-background-elevated p-1 rounded-xl border border-background-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground-subtle hover:text-foreground'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground-subtle hover:text-foreground'
              }`}
            >
              List
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & Language */}
      {activeTab !== 'artists' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background font-bold shadow-sm'
                    : 'bg-background-card hover:bg-background-elevated text-foreground-muted border border-background-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-foreground-subtle">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-background-elevated border border-background-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tab: Tracks */}
      {activeTab === 'tracks' && (
        <>
          {filteredTracks.length === 0 ? (
            <div className="py-20 text-center text-foreground-subtle text-xs sm:text-sm bg-background-card rounded-3xl border border-background-border">
              No audio recordings match the selected filters.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredTracks.map((track) => (
                <AudioCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="bg-background-card border border-background-border rounded-3xl p-3 sm:p-4 space-y-2">
              {filteredTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Series */}
      {activeTab === 'series' && (
        <>
          {filteredSeries.length === 0 ? (
            <div className="py-20 text-center text-foreground-subtle text-xs sm:text-sm bg-background-card rounded-3xl border border-background-border">
              No series match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredSeries.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Artists / Speakers */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="bg-background-card border border-background-border rounded-3xl p-6 hover:border-accent/40 transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-background-elevated flex-shrink-0 border border-background-border">
                  <Image
                    src={artist.image || '/brand/shruti-mark.svg'}
                    alt={artist.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {artist.name}
                  </h3>
                  <p className="text-xs font-medium text-accent">
                    {artist.role || 'Spiritual Mystic & Master'}
                  </p>
                  <p className="text-xs text-foreground-subtle mt-0.5">
                    {artist.trackCount || 64} Recordings • {artist.seriesCount || 5} Series
                  </p>
                </div>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">
                {artist.bio}
              </p>

              <Link
                href={`/artist/${artist.slug || artist.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:text-accent-hover transition-colors pt-2"
              >
                <span>View Speaker Archive</span>
                <Compass className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-foreground-subtle text-sm">
          Loading archive catalog...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
