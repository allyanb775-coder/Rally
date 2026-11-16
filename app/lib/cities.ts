import { isAr } from './i18n.ts';
/** Saudi cities players can pick; Rally is not tied to one region. */
export const CITIES = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الظهران', 'بريدة', 'عنيزة', 'أبها', 'الطائف', 'تبوك', 'حائل', 'الأحساء'];

const EN: Record<string, string> = {
  الرياض: 'Riyadh', جدة: 'Jeddah', مكة: 'Makkah', المدينة: 'Madinah', الدمام: 'Dammam', الخبر: 'Khobar', الظهران: 'Dhahran',
  بريدة: 'Buraydah', عنيزة: 'Unaizah', أبها: 'Abha', الطائف: 'Taif', تبوك: 'Tabuk', حائل: 'Hail', الأحساء: 'Al Ahsa',
};
/** Cities are stored in Arabic; show them in the app language. */
export const cityLabel = (city: string) => (isAr() ? city : EN[city] ?? city);
