/** Avatar letter, always in English: "Fahad" → "F", "أنت" → "A", "تركي" → "T". */
const AR: Record<string, string> = {
  ا: 'A', أ: 'A', إ: 'A', آ: 'A', ء: 'A', ع: 'A', ب: 'B', ت: 'T', ث: 'T', ط: 'T', ج: 'J', ح: 'H', ه: 'H', ة: 'H', خ: 'K', ك: 'K',
  د: 'D', ذ: 'D', ض: 'D', ر: 'R', ز: 'Z', ظ: 'Z', س: 'S', ش: 'S', ص: 'S', غ: 'G', ف: 'F', ق: 'Q', ل: 'L', م: 'M', ن: 'N', و: 'W', ي: 'Y', ى: 'Y',
};

export function initial(name: string | undefined): string {
  const ch = (name ?? '').trim()[0];
  if (!ch) return '?';
  if (/[a-z]/i.test(ch)) return ch.toUpperCase();
  return AR[ch] ?? '?';
}
