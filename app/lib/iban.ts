/** Saudi IBANs are "SA" + 22 digits. */
export const normalizeIban = (s: string) => s.replace(/\s+/g, '').toUpperCase();
export const isSaudiIban = (s: string) => /^SA\d{22}$/.test(normalizeIban(s));
/** "SA03 8000 0000 6080 1016 7519" for reading and copying by eye. */
export const formatIban = (s: string) => normalizeIban(s).replace(/(.{4})/g, '$1 ').trim();
