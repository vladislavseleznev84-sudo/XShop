import type { PhotoKey } from '../components/Photo';

export interface GalleryItem {
  photo: PhotoKey;
  alt: string;
  caption: string;
  /** Соотношение сторон превью (если кадр кадрируется). */
  ratio?: number;
  position?: string;
  /** Скорость параллакса: положительная — кадр «уезжает» медленнее скролла. */
  speed: number;
  slot: string;
}

export const gallery: readonly GalleryItem[] = [
  { photo: 'interior', alt: 'Зал барбершопа: три кресла у зеркал, кирпичная стена, лампы над рабочими местами', caption: 'Зал, три кресла', speed: 0.04, slot: 'a' },
  { photo: 'fade', alt: 'Мастер выбривает контур на затылке опасной бритвой, крупный план', caption: 'Контур опасной бритвой', speed: 0.09, slot: 'b' },
  { photo: 'chair', alt: 'Кожаное барберское кресло с хромированными деталями в полумраке', caption: 'Кресло, вид спереди', speed: 0.05, slot: 'c' },
  { photo: 'shave', alt: 'Нанесение пены кистью перед бритьём бороды', caption: 'Пена и горячее полотенце', speed: 0.07, slot: 'd' },
  { photo: 'nape', alt: 'Затылок клиента после стрижки, рука мастера с расчёской', caption: 'Затылок, финальный проход', ratio: 0.8, position: '50% 40%', speed: 0.1, slot: 'e' },
  { photo: 'tools', alt: 'Машинки, ножницы, расчёска и средства для укладки на деревянной столешнице, вид сверху', caption: 'Рабочий стол', speed: 0.04, slot: 'f' },
  { photo: 'clipper', alt: 'Мастер работает машинкой по затылку, на руках татуировки', caption: 'Машинка, затылок', ratio: 0.8, position: '40% 50%', speed: 0.08, slot: 'g' },
  { photo: 'razor', alt: 'Клиент в кресле, мастер подправляет бороду ножницами в полутьме', caption: 'Борода, ножницы', ratio: 2.1, position: '50% 45%', speed: 0.03, slot: 'h' },
] as const;
