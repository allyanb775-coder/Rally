import { isAr } from './i18n.ts';

/** Saudi Arabia's 13 regions and their main cities. Cities are stored in Arabic; labels follow the app language. */
export type Region = { id: string; ar: string; en: string; cities: [string, string][] };

export const REGIONS: Region[] = [
  { id: 'riyadh', ar: 'منطقة الرياض', en: 'Riyadh Region', cities: [
    ['الرياض', 'Riyadh'], ['الخرج', 'Al Kharj'], ['الدرعية', 'Diriyah'], ['المجمعة', 'Al Majmaah'], ['الزلفي', 'Az Zulfi'],
    ['الدوادمي', 'Ad Dawadmi'], ['شقراء', 'Shaqra'], ['وادي الدواسر', 'Wadi Ad Dawasir'], ['عفيف', 'Afif'], ['القويعية', 'Al Quwayiyah'] ] },
  { id: 'makkah', ar: 'منطقة مكة المكرمة', en: 'Makkah Region', cities: [
    ['جدة', 'Jeddah'], ['مكة', 'Makkah'], ['الطائف', 'Taif'], ['رابغ', 'Rabigh'], ['القنفذة', 'Al Qunfudhah'], ['الليث', 'Al Lith'] ] },
  { id: 'madinah', ar: 'منطقة المدينة المنورة', en: 'Madinah Region', cities: [
    ['المدينة', 'Madinah'], ['ينبع', 'Yanbu'], ['العلا', 'AlUla'], ['بدر', 'Badr'], ['المهد', 'Al Mahd'] ] },
  { id: 'qassim', ar: 'منطقة القصيم', en: 'Qassim Region', cities: [
    ['بريدة', 'Buraydah'], ['عنيزة', 'Unaizah'], ['الرس', 'Ar Rass'], ['البكيرية', 'Al Bukayriyah'], ['المذنب', 'Al Mithnab'],
    ['البدائع', 'Al Badai'], ['الأسياح', 'Al Asyah'], ['عيون الجواء', 'Uyun Al Jiwa'], ['رياض الخبراء', 'Riyadh Al Khabra'],
    ['الشماسية', 'Ash Shimasiyah'], ['النبهانية', 'An Nabhaniyah'], ['عقلة الصقور', 'Uqlat As Suqur'], ['ضرية', 'Dariyah'] ] },
  { id: 'eastern', ar: 'المنطقة الشرقية', en: 'Eastern Province', cities: [
    ['الدمام', 'Dammam'], ['الخبر', 'Khobar'], ['الظهران', 'Dhahran'], ['الأحساء', 'Al Ahsa'], ['الجبيل', 'Jubail'], ['القطيف', 'Qatif'],
    ['حفر الباطن', 'Hafar Al Batin'], ['الخفجي', 'Khafji'], ['رأس تنورة', 'Ras Tanura'], ['بقيق', 'Abqaiq'], ['النعيرية', 'Nairyah'] ] },
  { id: 'asir', ar: 'منطقة عسير', en: 'Asir Region', cities: [
    ['أبها', 'Abha'], ['خميس مشيط', 'Khamis Mushait'], ['بيشة', 'Bisha'], ['محايل عسير', 'Muhayil'], ['النماص', 'An Namas'], ['أحد رفيدة', 'Ahad Rafidah'] ] },
  { id: 'tabuk', ar: 'منطقة تبوك', en: 'Tabuk Region', cities: [
    ['تبوك', 'Tabuk'], ['ضباء', 'Duba'], ['الوجه', 'Al Wajh'], ['أملج', 'Umluj'], ['تيماء', 'Tayma'], ['حقل', 'Haql'] ] },
  { id: 'hail', ar: 'منطقة حائل', en: 'Hail Region', cities: [['حائل', 'Hail'], ['بقعاء', 'Baqaa'], ['الغزالة', 'Al Ghazalah'], ['الشنان', 'Ash Shinan']] },
  { id: 'northern', ar: 'منطقة الحدود الشمالية', en: 'Northern Borders', cities: [['عرعر', 'Arar'], ['رفحاء', 'Rafha'], ['طريف', 'Turaif']] },
  { id: 'jazan', ar: 'منطقة جازان', en: 'Jazan Region', cities: [['جازان', 'Jazan'], ['صبيا', 'Sabya'], ['أبو عريش', 'Abu Arish'], ['صامطة', 'Samtah']] },
  { id: 'najran', ar: 'منطقة نجران', en: 'Najran Region', cities: [['نجران', 'Najran'], ['شرورة', 'Sharurah']] },
  { id: 'baha', ar: 'منطقة الباحة', en: 'Al Baha Region', cities: [['الباحة', 'Al Baha'], ['بلجرشي', 'Baljurashi'], ['المندق', 'Al Mandaq']] },
  { id: 'jouf', ar: 'منطقة الجوف', en: 'Al Jouf Region', cities: [['سكاكا', 'Sakaka'], ['دومة الجندل', 'Dumat Al Jandal'], ['القريات', 'Al Qurayyat'], ['طبرجل', 'Tabarjal']] },
];

/** Every city, in Arabic, region by region. */
export const CITIES = REGIONS.flatMap((r) => r.cities.map(([ar]) => ar));

const EN: Record<string, string> = Object.fromEntries(REGIONS.flatMap((r) => r.cities));
const REGION_OF: Record<string, Region> = Object.fromEntries(REGIONS.flatMap((r) => r.cities.map(([ar]) => [ar, r])));

/** Show a city in the app language. */
export const cityLabel = (city: string) => (isAr() ? city : EN[city] ?? city);
export const regionLabel = (r: Region) => (isAr() ? r.ar : r.en);
/** The region a city belongs to, if we know it. */
export const regionOf = (city: string): Region | undefined => REGION_OF[city];
