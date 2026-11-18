import { isValidPhone } from './phone';

export interface BookingDraft {
  serviceId: string | null;
  /** null — «любой свободный мастер» */
  barberId: string | null;
  barberChosen: boolean;
  date: string | null;
  time: number | null;
  name: string;
  phone: string;
  comment: string;
  consent: boolean;
}

export const emptyDraft: BookingDraft = {
  serviceId: null,
  barberId: null,
  barberChosen: false,
  date: null,
  time: null,
  name: '',
  phone: '',
  comment: '',
  consent: false,
};

/** Первый незаполненный шаг формы: 1 услуга, 2 мастер, 3 дата и время, 4 контакты. */
export function firstIncompleteStep(d: BookingDraft): number {
  if (!d.serviceId) return 1;
  if (!d.barberChosen) return 2;
  if (!d.date || d.time === null) return 3;
  return 4;
}

export type ContactErrors = Partial<Record<'name' | 'phone' | 'consent', string>>;

export function validateContacts(d: Pick<BookingDraft, 'name' | 'phone' | 'consent'>): ContactErrors {
  const e: ContactErrors = {};
  if (d.name.trim().length < 2) e.name = 'Введите имя — минимум два символа.';
  if (!isValidPhone(d.phone)) e.phone = 'Введите номер полностью: +7 и десять цифр.';
  if (!d.consent) e.consent = 'Нужно согласие на обработку данных, чтобы отправить заявку.';
  return e;
}

export interface BookingReceipt {
  id: string;
  createdAt: string;
  /** Всегда 'demo': заявка не передаётся в реальную систему записи. */
  mode: 'demo';
}

const STORAGE_KEY = 'blackline:demo-requests';

/**
 * ДЕМО-ИНТЕГРАЦИЯ. Заявка сохраняется только в localStorage браузера посетителя.
 * Чтобы подключить реальную запись, замените тело этой функции на запрос к вашему API/CRM
 * (контракт — BookingDraft → BookingReceipt) — остальной код менять не нужно.
 */
export async function submitBooking(draft: BookingDraft): Promise<BookingReceipt> {
  await new Promise((r) => setTimeout(r, 650));
  const receipt: BookingReceipt = {
    id: `BL-${Date.now().toString(36).toUpperCase().slice(-5)}`,
    createdAt: new Date().toISOString(),
    mode: 'demo',
  };
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, { ...draft, ...receipt }].slice(-20)));
  } catch {
    /* localStorage может быть недоступен (приватный режим) — для демо это не ошибка */
  }
  return receipt;
}
