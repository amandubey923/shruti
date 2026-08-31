'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ListMusic, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist } = useLibrary();
  const [modalOpen, setModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    setIsSubmitting(true);
    try {
      await createPlaylist(playlistName.trim(), playlistDesc.trim());
      setPlaylistName('');
      setPlaylistDesc('');
      setModalOpen(false);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-background-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-accent mb-1">
            <ListMusic className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Custom Compilations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            My Playlists
          </h1>
          <p className="text-xs text-foreground-subtle mt-1">
            Create and organize personal listening selections.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-16 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border space-y-3">
          <ListMusic className="w-8 h-8 text-foreground-subtle/50 mx-auto" />
          <p className="text-sm font-medium text-foreground">No playlists created yet</p>
          <p className="text-xs text-foreground-subtle max-w-xs mx-auto">
            Create custom collections of discourses, meditation tracks, or classical ragas.
          </p>
          <Button onClick={() => setModalOpen(true)} variant="secondary" size="sm">
            Create First Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="p-5 rounded-2xl bg-background-card border border-background-border/70 hover:border-background-border transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                    <ListMusic className="w-5 h-5" />
                  </div>

                  <button
                    onClick={() => deletePlaylist(pl.id)}
                    className="p-1.5 text-foreground-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link href={`/playlists/${pl.id}`}>
                  <h3 className="font-serif text-base font-bold text-foreground group-hover:text-accent transition-colors">
                    {pl.name}
                  </h3>
                </Link>

                {pl.description && (
                  <p className="text-xs text-foreground-subtle mt-1 line-clamp-2">
                    {pl.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-background-border/40 flex items-center justify-between text-xs">
                <span className="text-foreground-subtle font-mono">{pl.trackCount || 0} Tracks</span>
                <Link
                  href={`/playlists/${pl.id}`}
                  className="text-accent hover:text-accent-hover font-semibold inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Playlist">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              required
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="e.g. Evening Stillness, Gita Reflections..."
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={playlistDesc}
              onChange={(e) => setPlaylistDesc(e.target.value)}
              placeholder="Add personal notes or context..."
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Playlist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
