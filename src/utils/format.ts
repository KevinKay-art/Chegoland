export function formatKes(amount: number): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  return `KES ${rounded.toLocaleString('en-KE')}`;
}

export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(?:\+254|254|0)(?:7|1)\d{8}$/.test(cleaned);
}

export function formatShortDate(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
