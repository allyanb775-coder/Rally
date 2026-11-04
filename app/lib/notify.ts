import { Alert, Platform } from 'react-native';

export function notify(message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('', message);
}

/** Map database errors to Arabic messages players understand. */
export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  if (msg.includes('match is full')) return 'المباراة اكتملت.';
  if (msg.includes('level out of range')) return 'هذي المباراة مو بمستواك. تقدر تلعب بس مع ناس بمستواك.';
  if (msg.includes('match already started')) return 'المباراة بدأت.';
  if (msg.includes('tournament is full')) return 'البطولة اكتملت.';
  if (msg.includes('duplicate key')) return 'أنت مسجّل من قبل.';
  if (msg.includes('result exists')) return 'النتيجة مسجّلة من قبل.';
  if (msg.includes('opponent must confirm')) return 'لازم واحد من الفريق الثاني يأكد النتيجة.';
  if (msg.includes('match not started')) return 'ما تقدر تسجل النتيجة قبل وقت المباراة.';
  if (msg.includes('match not full')) return 'النتيجة تتسجل بس للمباريات المكتملة بـ4 لاعبين.';
  if (msg.includes('level locked')) return 'مستواك صار يتحدد من نتائج مبارياتك.';
  return 'صار خطأ، حاول مرة ثانية.';
}
