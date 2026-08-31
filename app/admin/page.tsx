'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Music, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadAudioFile, uploadCoverImage, validateAudioFilename } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { SEED_CATEGORIES } from '@/lib/seedData';

export default function AdminIngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Discourses');
  const [seriesName, setSeriesName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [isDownloadable, setIsDownloadable] = useState(true);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validation = validateAudioFilename(selected.name);
      if (!validation.valid) {
        setStatusMessage({ type: 'error', text: validation.error || 'Invalid file format' });
        return;
      }
      setFile(selected);
      setStatusMessage(null);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage({ type: 'error', text: 'Please select an audio file to upload.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(0);

    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase configuration is required for cloud upload. Configure your .env keys.');
      }

      const audioUrl = await uploadAudioFile(
        file,
        category,
        seriesName || artistName || 'general',
        (progress) => setUploadProgress(progress)
      );

      let coverUrl: string | undefined = undefined;
      if (coverFile) {
        coverUrl = await uploadCoverImage(
          coverFile,
          seriesName ? 'series' : 'tracks',
          seriesName || title || 'cover'
        );
      }

      setStatusMessage({
        type: 'success',
        text: `Audio published successfully! Live URL: ${audioUrl.slice(0, 45)}...`,
      });

      // Reset form
      setFile(null);
      setCoverFile(null);
      setTitle('');
      setDescription('');
      setDuration('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Upload failed. Please check network and permissions.',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="border-b border-background-border/60 pb-6">
        <div className="flex items-center gap-2 text-accent mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-semibold">Curation Portal</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Admin Audio Ingestion
        </h1>
        <p className="text-xs text-foreground-subtle mt-1">
          Upload and archive audio recordings with standardized kebab-case names and metadata.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 text-accent text-xs leading-relaxed">
          <p className="font-semibold mb-1">Notice: Local Development Mode</p>
          <p className="text-foreground-muted">
            Firebase credentials are not yet configured in `.env`. Live uploads to Firebase Storage require active keys.
          </p>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="bg-background-card border border-background-border rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Audio File Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Audio File (.mp3, .m4a, .aac, .ogg)
          </label>
          <div className="border-2 border-dashed border-background-border hover:border-accent/40 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-background-elevated/40 relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Music className="w-8 h-8 text-accent mx-auto mb-2" />
            {file ? (
              <p className="text-xs font-mono text-foreground font-semibold">{file.name}</p>
            ) : (
              <div>
                <p className="text-xs font-medium text-foreground">Click to select audio recording</p>
                <p className="text-[10px] text-foreground-subtle mt-0.5">MP3 or M4A recommended (max 500MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Series Cover / Artwork Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Series Cover Artwork (Shared across all episodes/parts of this series)
          </label>
          <div className="border border-background-border hover:border-accent/40 rounded-2xl p-4 transition-colors bg-background-elevated/40 relative flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-10 h-10 rounded-xl bg-background-elevated flex items-center justify-center text-accent flex-shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              {coverFile ? (
                <p className="text-xs font-mono text-foreground truncate">{coverFile.name}</p>
              ) : (
                <div>
                  <p className="text-xs font-medium text-foreground">Select coherent series cover (.webp or .jpg)</p>
                  <p className="text-[10px] text-foreground-subtle">Recommended: 800x800 square artwork</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Track / Episode Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Krishna Smriti — Part 01"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              {SEED_CATEGORIES.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Series / Collection Name (Optional)
            </label>
            <input
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder="e.g. Krishna Smriti"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Speaker / Artist Name
            </label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g. Osho, Pt. Hariprasad Chaurasia"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">
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
            <label className="block text-xs font-medium text-foreground-muted mb-1">
              Duration in Seconds (Optional)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 4200 for 1h 10m"
              className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1">
            Description & Discourse Reflections
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add discourse summary, chapter notes, or quotes..."
            className="w-full bg-background-elevated border border-background-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="downloadable"
            checked={isDownloadable}
            onChange={(e) => setIsDownloadable(e.target.checked)}
            className="rounded bg-background-elevated border-background-border text-accent focus:ring-accent"
          />
          <label htmlFor="downloadable" className="text-xs text-foreground-muted cursor-pointer">
            Allow listeners to download this recording for offline use
          </label>
        </div>

        {uploadProgress !== null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-foreground-subtle">
              <span>Uploading to Storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-background-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button type="submit" isLoading={isUploading} className="w-full gap-2">
          <Upload className="w-4 h-4" />
          <span>Publish to SHRUTI Archive</span>
        </Button>
      </form>
    </div>
  );
}
