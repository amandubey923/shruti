'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Sparkles, Compass, Clock, ArrowRight, Search, Flame, BookOpen } from 'lucide-react';
import { AudioTrack, Series, CategoryInfo } from '@/types/audio';
import { PlaybackProgress } from '@/types/user';
import {
  getAllTracks,
  getAllSeries,
  getAllCategories,
} from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { CategoryCard } from '@/components/audio/CategoryCard';
import { formatDuration, resolveTrackCover } from '@/lib/utils';

const THEMES = [
  { id: 'all', label: 'All Traditions' },
  { id: 'upanishads', label: 'Upanishads', tag: 'Upanishads' },
  { id: 'advaita', label: 'Ashtavakra & Advaita', tag: 'Ashtavakra' },
  { id: 'krishna', label: 'Krishna Smriti', tag: 'Krishna' },
  { id: 'mysticism', label: 'Gorakh & Mysticism', tag: 'Gorakh' },
  { id: 'mahaveer', label: 'Mahaveer Vani', tag: 'Mahaveer' },
];

export default function HomePage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [lastProgress, setLastProgress] = useState<PlaybackProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [showAllMobileSeries, setShowAllMobileSeries] = useState(false);

  const { playTrack, playSeriesAll } = usePlayback();

  useEffect(() => {
    async function loadContent() {
      const [allT, allS] = await Promise.all([
        getAllTracks(),
        getAllSeries(),
      ]);
      setTracks(allT);
      setSeriesList(allS);
      setCategories(getAllCategories());

      try {
        const raw = localStorage.getItem('shruti_playback_progress');
        if (raw) {
          const map: Record<string, PlaybackProgress> = JSON.parse(raw);
          const entries = Object.values(map).sort(
            (a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
          );
          if (entries.length > 0 && !entries[0].completed && entries[0].lastPosition > 10) {
            setLastProgress(entries[0]);
          }
        }
      } catch (err) {
        console.error('Error loading resume progress:', err);
      }
    }
    loadContent();
  }, []);

  const handleResumeLast = () => {
    if (!lastProgress) return;
    const track = tracks.find((t) => t.id === lastProgress.audioId);
    if (track) {
      playTrack(track, lastProgress.lastPosition);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const filteredSeries = useMemo(() => {
    if (selectedTheme === 'all') return seriesList;
    const activeTheme = THEMES.find((t) => t.id === selectedTheme);
    if (!activeTheme?.tag) return seriesList;
    return seriesList.filter((s) =>
      (s.tags || []).some((tag) => tag.toLowerCase().includes(activeTheme.tag!.toLowerCase())) ||
      s.title.toLowerCase().includes(activeTheme.tag!.toLowerCase())
    );
  }, [seriesList, selectedTheme]);

  const featuredSeries = seriesList.find((s) => s.id === 'krishna-smriti') || seriesList[0];
  const popularTracks = tracks.slice(0, 8);

  const resumePercentage = lastProgress && lastProgress.duration > 0
    ? Math.min(100, Math.round((lastProgress.lastPosition / lastProgress.duration) * 100))
    : 0;

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* Editorial Hero Header with Direct Search */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-card via-background-elevated to-background-card border border-background-border/80 p-6 sm:p-9 lg:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Spoken Audio Sanctuary</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Listen. Contemplate. <span className="text-accent italic font-normal">Awaken.</span>
          </h1>

          <p className="text-foreground-muted text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl font-normal">
            Authentic archival recordings by Osho — complete discourse series on Upanishads, Ashtavakra Geeta, Gorakhnath, and direct paths of inner transformation.
          </p>

          {/* Integrated Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discourses, series, topics..."
              className="w-full pl-11 pr-24 py-3 sm:py-3.5 bg-background-card/90 border border-background-border/90 hover:border-accent/50 focus:border-accent rounded-full text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle shadow-inner focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs rounded-full shadow-sm transition-all active:scale-95"
            >
              Explore
            </button>
          </form>
        </div>

        {/* Subtle Decorative Geometry */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-accent/10 pointer-events-none hidden lg:block" />
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full border border-accent/15 pointer-events-none hidden lg:block" />
      </section>

      {/* Prominent Continue Listening Card */}
      {lastProgress && (
        <section className="bg-gradient-to-r from-background-elevated via-background-card to-background-elevated border border-accent/30 rounded-3xl p-4 sm:p-6 shadow-md transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-background-border flex-shrink-0 border border-accent/30 shadow-md">
                {lastProgress.coverImage ? (
                  <Image
                    src={lastProgress.coverImage}
                    alt={lastProgress.trackTitle || 'Track cover'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent text-stone-950">
                    <Clock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-current opacity-90 drop-shadow" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    Continue Listening
                  </span>
                  {lastProgress.seriesName && (
                    <span className="text-xs text-foreground-subtle truncate hidden md:inline">
                      • {lastProgress.seriesName}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground truncate mt-1">
                  {lastProgress.trackTitle}
                </p>
                <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1.5">
                  <div className="w-32 sm:w-48 h-1.5 bg-background-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{ width: `${resumePercentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-foreground-muted">
                    {formatDuration(lastProgress.lastPosition)} / {formatDuration(lastProgress.duration)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResumeLast}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm rounded-full shadow-md shadow-accent/25 transition-all active:scale-95 min-h-[44px] flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Discourse</span>
            </button>
          </div>
        </section>
      )}

      {/* Explore by Theme Pill Chips */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground-muted">
          <BookOpen className="w-3.5 h-3.5 text-accent" />
          <span>Explore by Tradition</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {THEMES.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-accent text-stone-950 font-bold shadow-sm shadow-accent/20'
                    : 'bg-background-elevated hover:bg-background-hover text-foreground-muted hover:text-foreground border border-background-border/70'
                }`}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </section>




      {/* Available Audio Series / Books */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
              Collections &amp; Series
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              {selectedTheme === 'all' ? 'Featured Discourse Collections' : `${THEMES.find((t) => t.id === selectedTheme)?.label || 'Selected Series'}`}
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs sm:text-sm text-foreground-muted hover:text-accent font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span>All Series ({seriesList.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-column mobile grid, 2-column tablet, 3-column desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {filteredSeries.map((series, idx) => (
            <div
              key={series.id}
              className={idx >= 6 && !showAllMobileSeries ? 'hidden sm:block h-full' : 'block h-full'}
            >
              <SeriesCard series={series} />
            </div>
          ))}
        </div>

        {/* Mobile View More button */}
        {!showAllMobileSeries && filteredSeries.length > 6 && (
          <div className="sm:hidden pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllMobileSeries(true)}
              className="w-full py-2.5 px-4 bg-background-elevated hover:bg-background-hover border border-background-border rounded-xl text-xs font-bold text-accent transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-xs"
            >
              <span>View More Series ({filteredSeries.length - 6} More)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Popular & Recommended Discourses */}
      {popularTracks.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-accent">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Selected Tracks</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
                Popular &amp; Revered Discourses
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs sm:text-sm text-foreground-muted hover:text-accent font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {popularTracks.map((track) => (
              <AudioCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Archive Categories */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
              Themes of Inquiry
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              Browse Categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs sm:text-sm text-foreground-muted hover:text-accent font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  );
}
