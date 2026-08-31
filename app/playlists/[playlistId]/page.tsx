'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ListMusic,
  Play,
  Shuffle,
  Trash2,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { getAllTracks, getPlaylistItems } from '@/lib/firestore';
import { AudioTrack } from '@/types/audio';
import { Playlist } from '@/types/playlist';
import { TrackRow } from '@/components/audio/TrackRow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.playlistId as string;

  const {
    playlists,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = useLibrary();
  const { playSeriesAll } = usePlayback();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<AudioTrack[]>([]);
  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const found = playlists.find((p) => p.id === playlistId);
      if (found) {
        setPlaylist(found);
      }
      const all = await getAllTracks();
      setAllTracks(all);

      if (found) {
        // Fetch track IDs for this playlist
        const trackIds = await getPlaylistItems(found.userId, found.id);
        const matched = trackIds
          .map((id) => all.find((t) => t.id === id))
          .filter(Boolean) as AudioTrack[];
        setPlaylistTracks(matched);
      }
      setLoading(false);
    }
    load();
  }, [playlistId, playlists]);

  if (loading) {
    return (
      <div className="py-24 text-center text-foreground-subtle text-sm">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">Playlist Not Found</h2>
        <Link
          href="/playlists"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold rounded-full text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Playlists</span>
        </Link>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playSeriesAll(playlistTracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (playlistTracks.length > 0) {
      const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
      playSeriesAll(shuffled, 0);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(playlist.id);
      router.push('/playlists');
    }
  };

  const handleAddTrack = async (trackId: string) => {
    await addTrackToPlaylist(playlist.id, trackId);
    const addedTrack = allTracks.find((t) => t.id === trackId);
    if (addedTrack) {
      setPlaylistTracks((prev) => [...prev, addedTrack]);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </Link>

      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-background-card border border-background-border/80 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
            <ListMusic className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
              Playlist
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-xs sm:text-sm text-foreground-muted mt-1 max-w-lg">
                {playlist.description}
              </p>
            )}
            <p className="text-xs text-foreground-subtle mt-2 font-mono">
              {playlistTracks.length} Tracks
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {playlistTracks.length > 0 && (
            <>
              <button
                onClick={handlePlayAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold text-xs rounded-full shadow transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All</span>
              </button>
              <button
                onClick={handleShuffleAll}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-elevated hover:bg-background-hover text-foreground font-medium text-xs rounded-full border border-background-border transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Audio</span>
          </Button>

          <button
            onClick={handleDelete}
            className="p-2.5 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tracks in Playlist */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-foreground">
          Tracks ({playlistTracks.length})
        </h3>

        {playlistTracks.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-background-card rounded-2xl border border-background-border">
            <p className="text-xs text-foreground-subtle">
              No tracks in this playlist yet. Add audio from the catalog.
            </p>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              Add Audio Tracks
            </Button>
          </div>
        ) : (
          <div className="bg-background-card border border-background-border rounded-2xl p-2 divide-y divide-background-border/30">
            {playlistTracks.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                onPlay={() => playSeriesAll(playlistTracks, idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Track Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Audio to Playlist"
        maxWidth="lg"
      >
        <div className="max-h-80 overflow-y-auto space-y-1 divide-y divide-background-border/30 p-1">
          {allTracks.map((track) => {
            const inPlaylist = playlistTracks.some((t) => t.id === track.id);
            return (
              <div
                key={track.id}
                className="flex items-center justify-between p-2 hover:bg-background-hover rounded-xl transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-[10px] text-foreground-subtle truncate">{track.artistName}</p>
                </div>

                <Button
                  size="sm"
                  variant={inPlaylist ? 'secondary' : 'primary'}
                  disabled={inPlaylist}
                  onClick={() => handleAddTrack(track.id)}
                  className="text-xs ml-3"
                >
                  {inPlaylist ? 'Added' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

