export const fmtLevel = (n: number) => n.toLocaleString('ar-SA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const fmtNum = (n: number) => n.toLocaleString('ar-SA');
export const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString('ar-SA', { weekday: 'long', hour: 'numeric', minute: '2-digit' });
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
