const NBSP = ' ';

/** 1800 → «1 800 ₽» (неразрывный пробел между разрядами). */
export function formatPrice(value: number): string {
  const digits = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${digits}${NBSP}₽`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}${NBSP}мин`;
  return m ? `${h}${NBSP}ч ${m}${NBSP}мин` : `${h}${NBSP}ч`;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60).toString().padStart(2, '0');
  const m = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
