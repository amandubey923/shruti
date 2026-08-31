'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ListMusic, ArrowLeft, Play, Trash2, Plus } from 'lucide-react';
import { Playlist } from '@/types/playlist';
import { AudioTrack } from '@/types/audio';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { getAllTracks, getPlaylistItems } from '@/lib/firestore';
import { TrackRow } from '@/components/audio/TrackRow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params.playlistId as string;

  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useLibrary();
  const { playSeriesAll } = usePlayback();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<AudioTrack[]>([]);
  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    async function load() {
      const pl = playlists.find((p) => p.id === playlistId);
      if (pl) {
        setPlaylist(pl);
        const all = await getAllTracks();
        setAllTracks(all);
        const itemIds = await getPlaylistItems(pl.userId, pl.id);
        const matched = all.filter((t) => itemIds.includes(t.id));
        setPlaylistTracks(matched);
      }
    }
    load();
  }, [playlistId, playlists]);

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

  const handleAddTrack = async (track: AudioTrack) => {
    await addTrackToPlaylist(playlist.id, track.id);
    setPlaylistTracks((prev) => [...prev, track]);
  };

  const handleRemoveTrack = async (trackId: string) => {
    await removeTrackFromPlaylist(playlist.id, trackId);
    setPlaylistTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const filteredForAdd = allTracks.filter(
    (t) =>
      !playlistTracks.some((pt) => pt.id === t.id) &&
      (t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.artistName?.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-background-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-accent mb-1">
            <ListMusic className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Playlist</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              {playlist.description}
            </p>
          )}
          <p className="text-xs text-foreground-subtle mt-1">{playlistTracks.length} Tracks</p>
        </div>

        <div className="flex items-center gap-3">
          {playlistTracks.length > 0 && (
            <button
              onClick={() => playSeriesAll(playlistTracks, 0)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-background font-semibold text-xs shadow-md shadow-accent/20 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          )}

          <Button onClick={() => setAddModalOpen(true)} variant="secondary" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Audio</span>
          </Button>
        </div>
      </div>

      {playlistTracks.length === 0 ? (
        <div className="py-16 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border space-y-3">
          <p className="text-sm text-foreground">Playlist is empty</p>
          <p className="text-xs text-foreground-subtle">
            Add discourses, meditation tracks, or classical ragas to this playlist.
          </p>
          <Button onClick={() => setAddModalOpen(true)} size="sm">
            Add Recordings
          </Button>
        </div>
      ) : (
        <div className="bg-background-card border border-background-border rounded-2xl p-2 divide-y divide-background-border/30">
          {playlistTracks.map((track, idx) => (
            <div key={track.id} className="flex items-center justify-between group">
              <div className="flex-1 min-w-0">
                <TrackRow
                  track={track}
                  index={idx}
                  onPlay={() => playSeriesAll(playlistTracks, idx)}
                />
              </div>
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="p-2 text-foreground-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                title="Remove from playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Track to Playlist"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Filter catalog tracks..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          />

          <div className="max-h-64 overflow-y-auto space-y-1 divide-y divide-background-border/30">
            {filteredForAdd.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-background-hover transition-colors"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-semibold text-foreground truncate">{track.title}</p>
                  <p className="text-[10px] text-foreground-subtle truncate">
                    {track.artistName || track.seriesName}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleAddTrack(track)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
