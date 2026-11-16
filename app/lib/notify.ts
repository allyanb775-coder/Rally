import { Alert, Platform } from 'react-native';
import { tr } from './i18n';

export function notify(message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('', message);
}

/** Map database errors to Arabic messages players understand. */
export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  if (msg.includes('match is full')) return tr('المباراة اكتملت.', 'The match is full.');
  if (msg.includes('level out of range')) return tr('هذي المباراة مو بمستواك. تقدر تلعب بس مع ناس بمستواك.', "This match isn't at your level. You can only play with people at your level.");
  if (msg.includes('match already started')) return tr('المباراة بدأت.', 'The match has started.');
  if (msg.includes('tournament is full')) return tr('البطولة اكتملت.', 'The tournament is full.');
  if (msg.includes('duplicate key')) return tr('أنت مسجّل من قبل.', "You're already registered.");
  if (msg.includes('result exists')) return tr('النتيجة مسجّلة من قبل.', 'A result was already reported.');
  if (msg.includes('opponent must confirm')) return tr('لازم واحد من الفريق الثاني يأكد النتيجة.', 'A player from the other team must confirm the result.');
  if (msg.includes('match not started')) return tr('ما تقدر تسجل النتيجة قبل وقت المباراة.', "You can't report a result before the match starts.");
  if (msg.includes('match not full')) return tr('النتيجة تتسجل بس للمباريات المكتملة بـ4 لاعبين.', 'Results can only be reported for full 4-player matches.');
  if (msg.includes('receipt required')) return tr('لازم ترفع إيصال التحويل عشان تنضم.', 'Upload the transfer receipt to join.');
  if (msg.includes('level locked')) return tr('مستواك صار يتحدد من نتائج مبارياتك.', 'Your level is now set by your match results.');
  return tr('صار خطأ، حاول مرة ثانية.', 'Something went wrong, please try again.');
}
