'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ListMusic, Plus, Music, Trash2 } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist } = useLibrary();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createPlaylist(name.trim(), description.trim());
      setName('');
      setDescription('');
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
            <ListMusic className="w-3.5 h-3.5" />
            <span>Curations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Custom Playlists
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Personal listening journeys and thematic collections.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-background-card rounded-2xl border border-background-border">
          <ListMusic className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h3 className="font-serif text-lg font-medium text-foreground">No Playlists Created</h3>
          <p className="text-xs text-foreground-subtle max-w-sm mx-auto">
            Group your favorite discourses, morning meditations, or sitar ragas into custom playlists.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            Create First Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="p-5 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                  <Music className="w-6 h-6" />
                </div>

                <Link
                  href={`/playlists/${playlist.id}`}
                  className="font-serif text-base font-bold text-foreground group-hover:text-accent transition-colors block truncate"
                >
                  {playlist.name}
                </Link>

                {playlist.description && (
                  <p className="text-xs text-foreground-muted mt-1 line-clamp-2 leading-relaxed">
                    {playlist.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-background-border/40 flex items-center justify-between">
                <span className="text-[11px] text-foreground-subtle">
                  {playlist.trackCount || 0} Tracks
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deletePlaylist(playlist.id)}
                    className="p-1.5 text-foreground-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/playlists/${playlist.id}`}
                    className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Playlist"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Playlist Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Gita Contemplation"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of discourses for deep morning focus..."
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Create Playlist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

