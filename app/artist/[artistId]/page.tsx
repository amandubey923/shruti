'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User, Layers, Music, ArrowLeft } from 'lucide-react';
import { Artist, Series, AudioTrack } from '@/types/audio';
import { getArtistById, getAllSeries, getAllTracks } from '@/lib/firestore';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { TrackRow } from '@/components/audio/TrackRow';

export default function ArtistDetailPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistSeries, setArtistSeries] = useState<Series[]>([]);
  const [artistTracks, setArtistTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtist() {
      if (!artistId) return;
      const a = await getArtistById(artistId);
      if (a) {
        setArtist(a);
        const [allS, allT] = await Promise.all([getAllSeries(), getAllTracks()]);
        setArtistSeries(allS.filter((s) => s.artistId === a.id || s.artistName.toLowerCase() === a.name.toLowerCase()));
        setArtistTracks(allT.filter((t) => t.artistId === a.id || t.artistName?.toLowerCase() === a.name.toLowerCase()));
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
    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
      {/* Back Link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      {/* Speaker Bio Header */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start bg-background-card border border-background-border/80 rounded-3xl p-6 sm:p-8">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0 bg-background-elevated border-2 border-background-border shadow-xl">
          {artist.image ? (
            <Image
              src={artist.image}
              alt={artist.name}
              fill
              sizes="150px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent">
              <User className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
              Speaker / Master
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {artist.name}
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-0.5">{artist.role}</p>
          </div>

          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed max-w-2xl">
            {artist.bio}
          </p>

          {artist.tags && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {artist.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-0.5 bg-background-elevated text-foreground-subtle rounded-full border border-background-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Series by Speaker */}
      {artistSeries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-xl font-bold text-foreground">
              Series Collections ({artistSeries.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artistSeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      )}

      {/* Audio Tracks by Speaker */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-accent" />
          <h2 className="font-serif text-xl font-bold text-foreground">
            Audio Recordings ({artistTracks.length})
          </h2>
        </div>

        {artistTracks.length === 0 ? (
          <div className="py-8 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border">
            No recordings currently available.
          </div>
        ) : (
          <div className="bg-background-card border border-background-border rounded-2xl p-3 divide-y divide-background-border/30">
            {artistTracks.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

