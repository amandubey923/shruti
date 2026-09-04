'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Layers, Mic, User, Search, X, ArrowUpDown } from 'lucide-react';
import { AudioTrack, Series, Artist } from '@/types/audio';
import { getAllTracks, getAllSeries, getAllArtists } from '@/lib/firestore';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { TrackRow } from '@/components/audio/TrackRow';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialTab = searchParams.get('tab') || 'series';
  const initialQuery = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'tracks' | 'series' | 'artists'>(
    (initialTab as 'tracks' | 'series' | 'artists') || 'series'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'default' | 'tracks_desc' | 'duration_desc' | 'title_asc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [t, s, a] = await Promise.all([
        getAllTracks(),
        getAllSeries(),
        getAllArtists(),
      ]);
      setTracks(t);
      setSeriesList(s);
      setArtists(a);
      setLoading(false);
    }
    loadData();
  }, []);

  const categories = ['All', 'Discourses', 'Philosophy', 'Upanishads'];
  const languages = ['All', 'Hindi'];

  const filteredTracks = useMemo(() => {
    let result = tracks.filter((t) => {
      const catMatch =
        selectedCategory === 'All' ||
        t.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Discourses' && t.category.includes('Discourses')) ||
        (selectedCategory === 'Philosophy' && t.category.includes('Philosophy')) ||
        (selectedCategory === 'Upanishads' && t.category.includes('Upanishad'));
      const langMatch =
        selectedLanguage === 'All' ||
        t.language?.toLowerCase() === selectedLanguage.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const queryMatch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.subtitle || '').toLowerCase().includes(q) ||
        (t.seriesName || '').toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
      return catMatch && langMatch && queryMatch;
    });

    if (sortBy === 'duration_desc') {
      result = [...result].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'title_asc') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [tracks, selectedCategory, selectedLanguage, searchQuery, sortBy]);

  const filteredSeries = useMemo(() => {
    let result = seriesList.filter((s) => {
      const catMatch =
        selectedCategory === 'All' ||
        s.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Discourses' && s.category.includes('Discourses')) ||
        (selectedCategory === 'Philosophy' && s.category.includes('Philosophy')) ||
        (selectedCategory === 'Upanishads' && s.category.includes('Upanishad'));
      const langMatch =
        selectedLanguage === 'All' ||
        s.language?.toLowerCase() === selectedLanguage.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const queryMatch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.subtitle || '').toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.tags || []).some((tag) => tag.toLowerCase().includes(q));
      return catMatch && langMatch && queryMatch;
    });

    if (sortBy === 'tracks_desc') {
      result = [...result].sort((a, b) => (b.totalTracks || 0) - (a.totalTracks || 0));
    } else if (sortBy === 'duration_desc') {
      result = [...result].sort((a, b) => (b.totalDuration || 0) - (a.totalDuration || 0));
    } else if (sortBy === 'title_asc') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [seriesList, selectedCategory, selectedLanguage, searchQuery, sortBy]);

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

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-background-card/90 border border-background-border rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'series'
                ? 'Search series, discourses, Upanishads...'
                : activeTab === 'tracks'
                ? 'Search discourse titles, series, topics...'
                : 'Search spiritual speakers...'
            }
            className="w-full bg-background-elevated border border-background-border/80 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeTab !== 'artists' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-foreground-subtle" />
            <span className="text-xs font-medium text-foreground-subtle whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background-elevated border border-background-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="default">Default Order</option>
              {activeTab === 'series' && <option value="tracks_desc">Most Tracks</option>}
              <option value="duration_desc">Longest Duration</option>
              <option value="title_asc">Title (A – Z)</option>
            </select>
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

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-card border border-background-border rounded-3xl p-4 space-y-3"
            >
              <div className="aspect-[16/10] bg-background-elevated rounded-2xl w-full" />
              <div className="h-4 bg-background-elevated rounded-md w-3/4" />
              <div className="h-3 bg-background-elevated rounded-md w-1/2" />
              <div className="h-3 bg-background-elevated rounded-md w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Tab: Tracks */}
      {!loading && activeTab === 'tracks' && (
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
      {!loading && activeTab === 'series' && (
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
      {!loading && activeTab === 'artists' && (
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
