'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Compass, Layers, Music, User } from 'lucide-react';
import { AudioTrack, Series, Artist } from '@/types/audio';
import { getAllTracks, getAllSeries, getAllArtists } from '@/lib/firestore';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { TrackRow } from '@/components/audio/TrackRow';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialTab = searchParams.get('tab') || 'tracks';

  const [activeTab, setActiveTab] = useState<'tracks' | 'series' | 'artists'>(
    (initialTab as 'tracks' | 'series' | 'artists') || 'tracks'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
    loadData();
  }, []);

  const categories = ['All', 'Discourses', 'Meditation', 'Philosophy', 'Music', 'Audiobooks', 'Chants'];
  const languages = ['All', 'Hindi', 'English', 'Instrumental', 'Sanskrit'];

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const catMatch =
        selectedCategory === 'All' ||
        t.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Discourses & Talks' && t.category === 'Discourses');
      const langMatch =
        selectedLanguage === 'All' ||
        t.language?.toLowerCase() === selectedLanguage.toLowerCase();
      return catMatch && langMatch;
    });
  }, [tracks, selectedCategory, selectedLanguage]);

  // Filtered series
  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      const catMatch =
        selectedCategory === 'All' ||
        s.category.toLowerCase() === selectedCategory.toLowerCase();
      const langMatch =
        selectedLanguage === 'All' ||
        s.language?.toLowerCase() === selectedLanguage.toLowerCase();
      return catMatch && langMatch;
    });
  }, [seriesList, selectedCategory, selectedLanguage]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Explore Archives</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Discover Sacred Audio & Discourses
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted mt-1">
          Explore complete discourses, meditation recordings, classical music, and spiritual series.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-background-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'tracks'
                ? 'bg-accent text-background font-semibold shadow-sm'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Tracks ({filteredTracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'series'
                ? 'bg-accent text-background font-semibold shadow-sm'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Series ({filteredSeries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'artists'
                ? 'bg-accent text-background font-semibold shadow-sm'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Speakers ({artists.length})</span>
          </button>
        </div>

        {activeTab === 'tracks' && (
          <div className="hidden sm:flex items-center gap-1 bg-background-elevated p-1 rounded-lg border border-background-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background-hover text-foreground shadow-sm'
                  : 'text-foreground-subtle hover:text-foreground'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-background-hover text-foreground shadow-sm'
                  : 'text-foreground-subtle hover:text-foreground'
              }`}
            >
              List
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & Language Filter */}
      {activeTab !== 'artists' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-background-card hover:bg-background-elevated text-foreground-muted border border-background-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-foreground-subtle">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-background-elevated border border-background-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-accent"
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

      {/* Content Rendering */}
      {activeTab === 'tracks' && (
        <>
          {filteredTracks.length === 0 ? (
            <div className="py-16 text-center text-foreground-subtle text-sm">
              No audio tracks match the selected filters.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTracks.map((track) => (
                <AudioCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="bg-background-card border border-background-border rounded-2xl p-2 divide-y divide-background-border/40">
              {filteredTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'series' && (
        <>
          {filteredSeries.length === 0 ? (
            <div className="py-16 text-center text-foreground-subtle text-sm">
              No series match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeries.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="bg-background-card border border-background-border rounded-2xl p-5 flex flex-col items-center text-center group hover:border-accent/40 transition-all"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-background-elevated">
                {artist.image && (
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <h3 className="font-serif text-base font-bold text-foreground group-hover:text-accent transition-colors">
                {artist.name}
              </h3>
              <p className="text-xs text-foreground-subtle mt-0.5">{artist.role}</p>
              <p className="text-xs text-foreground-muted mt-2 line-clamp-3 leading-relaxed">
                {artist.bio}
              </p>
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
          Loading audio catalog...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

