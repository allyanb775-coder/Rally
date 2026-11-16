import { tr } from './i18n.ts';
import type { PickedClip } from './types.ts';

export const MAX_CLIP_MB = 50;
export const MAX_CLIP_SECONDS = 60;
export const MAX_CAPTION = 120;

/** Arabic reason the clip can't be posted, or null if it's fine. */
export function clipProblem(clip: PickedClip): string | null {
  if (clip.fileSize && clip.fileSize > MAX_CLIP_MB * 1024 * 1024) return tr(`المقطع أكبر من ${MAX_CLIP_MB} ميقا. اختر مقطع أقصر.`, `The clip is larger than ${MAX_CLIP_MB} MB. Pick a shorter one.`);
  // Pickers report duration in milliseconds.
  if (clip.duration && clip.duration / 1000 > MAX_CLIP_SECONDS + 1) return tr(`أقصى مدة للقطة ${MAX_CLIP_SECONDS} ثانية.`, `Clips can be up to ${MAX_CLIP_SECONDS} seconds.`);
  return null;
}

export function clipExtension(mimeType?: string): string {
  if (mimeType === 'video/quicktime') return 'mov';
  if (mimeType === 'video/webm') return 'webm';
  return 'mp4';
}
