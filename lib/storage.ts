import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

export interface UploadProgressCallback {
  (percentage: number): void;
}

/**
 * Validate audio filename (kebab-case, lowercase, valid extension)
 */
export function validateAudioFilename(filename: string): { valid: boolean; error?: string } {
  if (!filename) return { valid: false, error: 'Filename is required' };
  
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!['mp3', 'm4a', 'aac', 'ogg', 'wav'].includes(ext || '')) {
    return { valid: false, error: 'File must be an audio format (.mp3, .m4a, .aac, .ogg, .wav)' };
  }

  const baseName = filename.substring(0, filename.lastIndexOf('.'));
  const isKebab = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseName);
  if (!isKebab) {
    return {
      valid: false,
      error: `Filename "${filename}" must be lowercase kebab-case (e.g., krishna-smriti-01.mp3)`,
    };
  }

  return { valid: true };
}

/**
 * Upload audio file to Firebase Storage
 */
export async function uploadAudioFile(
  file: File,
  category: string,
  seriesOrArtist: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase Storage is not configured. Please add your credentials.');
  }

  const filename = file.name.toLowerCase().replace(/\s+/g, '-');
  const catFolder = category.toLowerCase().replace(/\s+/g, '-');
  const seriesFolder = seriesOrArtist.toLowerCase().replace(/\s+/g, '-');
  const storagePath = `audio/${catFolder}/${seriesFolder}/${filename}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'audio/mpeg',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

/**
 * Upload cover artwork to Firebase Storage
 */
export async function uploadCoverImage(
  file: File,
  folder: 'series' | 'albums' | 'artists' | 'tracks',
  identifier: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase Storage is not configured.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const cleanId = identifier.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const storagePath = `covers/${folder}/${cleanId}.${ext}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

