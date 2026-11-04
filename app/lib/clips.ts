import type { PickedClip } from './types.ts';

export const MAX_CLIP_MB = 50;
export const MAX_CLIP_SECONDS = 60;
export const MAX_CAPTION = 120;

/** Arabic reason the clip can't be posted, or null if it's fine. */
export function clipProblem(clip: PickedClip): string | null {
  if (clip.fileSize && clip.fileSize > MAX_CLIP_MB * 1024 * 1024) return `المقطع أكبر من ${MAX_CLIP_MB} ميقا. اختر مقطع أقصر.`;
  // Pickers report duration in milliseconds.
  if (clip.duration && clip.duration / 1000 > MAX_CLIP_SECONDS + 1) return `أقصى مدة للقطة ${MAX_CLIP_SECONDS} ثانية.`;
  return null;
}

export function clipExtension(mimeType?: string): string {
  if (mimeType === 'video/quicktime') return 'mov';
  if (mimeType === 'video/webm') return 'webm';
  return 'mp4';
}
