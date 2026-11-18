import { useSyncExternalStore } from 'react';
import { emptyDraft, firstIncompleteStep, type BookingDraft } from './booking';

/** Небольшое внешнее хранилище: секции «Услуги» и «Мастера» подставляют выбор в форму записи. */
let state: { draft: BookingDraft; step: number; nonce: number } = { draft: emptyDraft, step: 1, nonce: 0 };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const bookingStore = {
  get: () => state,
  /** Обновляет черновик и переводит форму на первый незаполненный шаг (или на указанный). */
  set(patch: Partial<BookingDraft>, step?: number) {
    const draft = { ...state.draft, ...patch };
    state = { draft, step: step ?? firstIncompleteStep(draft), nonce: state.nonce + 1 };
    emit();
  },
  setStep(step: number) {
    state = { ...state, step, nonce: state.nonce + 1 };
    emit();
  },
  reset() {
    state = { draft: emptyDraft, step: 1, nonce: state.nonce + 1 };
    emit();
  },
};

export const useBooking = () => useSyncExternalStore(subscribe, bookingStore.get, bookingStore.get);

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
