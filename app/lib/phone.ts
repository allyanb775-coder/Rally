/** Normalize a Saudi mobile number to E.164 (+9665XXXXXXXX). Returns null if invalid. */
export function normalizeSaudiPhone(input: string): string | null {
  // Arabic-Indic digits → Latin
  const latin = input.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  let digits = latin.replace(/\D/g, '');
  if (digits.startsWith('00966')) digits = digits.slice(5);
  else if (digits.startsWith('966')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return /^5\d{8}$/.test(digits) ? `+966${digits}` : null;
}
