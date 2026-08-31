'use client';

import React, { useState } from 'react';
import {
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Music,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { validateAudioFilename, uploadAudioFile, uploadCoverImage } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { AudioTrack } from '@/types/audio';
import { slugify } from '@/lib/utils';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [artistName, setArtistName] = useState('Osho');
  const [seriesName, setSeriesName] = useState('Krishna Smriti');
  const [category, setCategory] = useState('Discourses');
  const [language, setLanguage] = useState('Hindi');
  const [duration, setDuration] = useState('4200');
  const [trackNumber, setTrackNumber] = useState('1');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('krishna, discourses, philosophy');
  const [isDownloadable, setIsDownloadable] = useState(true);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateAudioFilename(file.name);
      if (!validation.valid) {
        setStatusMessage({ type: 'error', text: validation.error || 'Invalid filename' });
      } else {
        setStatusMessage(null);
      }
      setAudioFile(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Title is required.' });
      return;
    }

    if (audioFile) {
      const val = validateAudioFilename(audioFile.name);
      if (!val.valid) {
        setStatusMessage({ type: 'error', text: val.error! });
        return;
      }
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      let audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';
      let coverUrl = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop';

      if (isFirebaseConfigured && audioFile) {
        audioUrl = await uploadAudioFile(
          audioFile,
          category,
          seriesName || artistName,
          (pct) => setUploadProgress(pct)
        );
      }

      if (isFirebaseConfigured && coverFile) {
        coverUrl = await uploadCoverImage(
          coverFile,
          'tracks',
          slugify(title),
          (pct) => setUploadProgress(pct)
        );
      }

      const newTrack: AudioTrack = {
        id: slugify(title),
        slug: slugify(title),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        artistName: artistName.trim(),
        seriesName: seriesName.trim() || undefined,
        seriesId: seriesName ? slugify(seriesName) : undefined,
        category,
        language,
        duration: parseInt(duration, 10) || 0,
        trackNumber: parseInt(trackNumber, 10) || 1,
        audioUrl,
        coverImage: coverUrl,
        description: description.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        isDownloadable,
        published: true,
        createdAt: new Date().toISOString(),
      };

      setStatusMessage({
        type: 'success',
        text: `Track "${newTrack.title}" validated and prepared successfully for distribution!`,
      });

      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setAudioFile(null);
      setCoverFile(null);
      setUploadProgress(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to upload audio or publish metadata.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Curator & Ingestion</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Audio Ingestion Portal
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted mt-1">
          Upload legally verified recordings, validate naming conventions, and publish structured metadata.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Guidelines Box */}
      <div className="p-4 rounded-2xl bg-background-card border border-background-border text-xs text-foreground-muted space-y-2">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <span>Naming Convention Rules</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-foreground-subtle">
          <li>Audio files must be lowercase kebab-case (e.g. <code className="text-accent">krishna-smriti-01.mp3</code>).</li>
          <li>Never commit large MP3s to git; upload directly to Firebase Storage via this portal.</li>
          <li>Ensure track durations are accurately entered in seconds for precise resume timecodes.</li>
        </ul>
      </div>

      {/* Ingestion Form */}
      <form onSubmit={handlePublish} className="bg-background-card border border-background-border/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Track Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Krishna Smriti — Part 06"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Total Acceptance of Life"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Speaker / Artist
            </label>
            <input
              type="text"
              required
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g. Osho, J. Krishnamurti"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Series / Collection Name (Optional)
            </label>
            <input
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder="e.g. Krishna Smriti"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="Discourses">Discourses & Talks</option>
              <option value="Meditation">Meditation & Stillness</option>
              <option value="Philosophy">Philosophy & Gita</option>
              <option value="Music">Classical & Ambient Music</option>
              <option value="Audiobooks">Audiobooks</option>
              <option value="Chants">Chants & Mantras</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Instrumental">Instrumental</option>
              <option value="Sanskrit">Sanskrit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Duration (Seconds)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 4200"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Track Part Number
            </label>
            <input
              type="number"
              value={trackNumber}
              onChange={(e) => setTrackNumber(e.target.value)}
              placeholder="1"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Audio File Selection */}
        <div className="space-y-3 pt-2 border-t border-background-border/40">
          <label className="block text-xs font-medium text-foreground-muted">
            Audio Binary File (.mp3, .m4a)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-background-elevated hover:bg-background-hover border border-background-border rounded-xl text-xs text-foreground transition-colors">
              <Upload className="w-4 h-4 text-accent" />
              <span>Choose Audio File</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
            </label>
            {audioFile && (
              <span className="text-xs text-foreground-muted font-mono truncate">
                {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            )}
          </div>
        </div>

        {/* Cover Artwork Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-foreground-muted">
            Cover Artwork (.webp, .jpg, .png)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-background-elevated hover:bg-background-hover border border-background-border rounded-xl text-xs text-foreground transition-colors">
              <ImageIcon className="w-4 h-4 text-accent" />
              <span>Choose Artwork</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
            {coverFile && (
              <span className="text-xs text-foreground-muted font-mono truncate">
                {coverFile.name}
              </span>
            )}
          </div>
        </div>

        {/* Tags and Description */}
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="krishna, gita, discourses, awareness"
            className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Discourse Description & Notes
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context and summary of the discourse..."
            className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Downloadable Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="downloadable"
            checked={isDownloadable}
            onChange={(e) => setIsDownloadable(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <label htmlFor="downloadable" className="text-xs text-foreground-muted cursor-pointer">
            Allow users to download this audio recording
          </label>
        </div>

        {uploadProgress !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-foreground-subtle">
              <span>Uploading to Firebase Storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-background-hover rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={loading} className="text-xs sm:text-sm">
            Validate & Publish Recording
          </Button>
        </div>
      </form>
    </div>
  );
}

