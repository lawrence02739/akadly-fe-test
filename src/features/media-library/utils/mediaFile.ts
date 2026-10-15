import type { MediaType } from '../types';
import { MEDIA_EXTENSIONS } from '../constants';

export function resolveMediaTypeFromFileName(
  fileName: string,
  mimeType?: string,
): MediaType | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mime = mimeType?.toLowerCase() || '';

  if (
    (ext && MEDIA_EXTENSIONS.VIDEO.includes(ext)) ||
    mime.startsWith('video/')
  ) {
    return 'VIDEO';
  }
  if (
    (ext && MEDIA_EXTENSIONS.AUDIO.includes(ext)) ||
    mime.startsWith('audio/')
  ) {
    return 'AUDIO';
  }
  if (
    (ext && MEDIA_EXTENSIONS.IMAGE.includes(ext)) ||
    mime.startsWith('image/')
  ) {
    return 'IMAGE';
  }
  if (
    (ext && MEDIA_EXTENSIONS.DOCUMENT.includes(ext)) ||
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('word') ||
    mime.includes('presentation') ||
    mime.includes('sheet') ||
    mime.startsWith('text/')
  ) {
    return 'DOCUMENT';
  }

  return null;
}

export function extractMediaMetadataFromFile(
  file: File,
): Promise<{ durationSeconds?: number; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const type = resolveMediaTypeFromFileName(file.name, file.type);
    if (!type) {
      resolve({});
      return;
    }

    if (type === 'VIDEO') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          durationSeconds: Math.round(video.duration || 0),
          width: video.videoWidth || undefined,
          height: video.videoHeight || undefined,
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
    } else if (type === 'AUDIO') {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          durationSeconds: Math.round(audio.duration || 0),
        });
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
    } else if (type === 'IMAGE') {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth || undefined,
          height: img.naturalHeight || undefined,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
    } else {
      resolve({});
    }
  });
}
