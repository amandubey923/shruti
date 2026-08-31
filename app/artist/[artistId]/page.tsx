'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Play, Layers, Music, User } from 'lucide-react';
import { Artist, Series, AudioTrack } from '@/types/audio';
import { getArtistById, getAllSeries, getAllTracks } from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { TrackRow } from '@/components/audio/TrackRow';

export default function ArtistDetailPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const { playSeriesAll } = usePlayback();

  useEffect(() => {
    async function loadArtist() {
      if (!artistId) return;
      const a = await getArtistById(artistId);
      if (a) {
        setArtist(a);
        const [allS, allT] = await Promise.all([getAllSeries(), getAllTracks()]);
        const matchedSeries = allS.filter(
          (s) => s.artistId === a.id || s.artistName.toLowerCase() === a.name.toLowerCase()
        );
        const matchedTracks = allT.filter(
          (t) => t.artistId === a.id || t.artistName?.toLowerCase() === a.name.toLowerCase()
        );
        setSeriesList(matchedSeries);
        setTracks(matchedTracks);
      }
      setLoading(false);
    }
    loadArtist();
  }, [artistId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-foreground-subtle text-sm">
        Loading speaker archive...
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">Speaker Not Found</h2>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold rounded-full text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-2xl bg-background-elevated flex-shrink-0 border-2 border-background-border">
          {artist.image ? (
            <Image
              src={artist.image}
              alt={artist.name}
              fill
              sizes="180px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-subtle">
              <User className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
              Master Speaker / Artist
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-1">
              {artist.name}
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted">{artist.role}</p>
          </div>

          {artist.bio && (
            <p className="text-xs sm:text-sm text-foreground-subtle leading-relaxed max-w-2xl">
              {artist.bio}
            </p>
          )}

          {artist.tags && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {artist.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-background-elevated border border-background-border text-[10px] text-foreground-muted font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {seriesList.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-background-border/60">
          <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Series by {artist.name} ({seriesList.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seriesList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </div>
      )}

      {tracks.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-background-border/60">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Music className="w-4 h-4 text-accent" />
              <span>Recordings & Discourses ({tracks.length})</span>
            </h3>

            <button
              onClick={() => playSeriesAll(tracks, 0)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-background font-semibold text-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>

          <div className="bg-background-card border border-background-border rounded-2xl p-2 divide-y divide-background-border/30">
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                onPlay={() => playSeriesAll(tracks, idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
