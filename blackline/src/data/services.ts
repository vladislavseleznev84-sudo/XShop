import type { PhotoKey } from '../components/Photo';

export interface Service {
  id: string;
  name: string;
  price: number;
  minutes: number;
  description: string;
  preview: PhotoKey;
}

export const services: readonly Service[] = [
  {
    id: 'classic',
    name: 'Classic Haircut',
    price: 1800,
    minutes: 60,
    description: 'Ножницы и машинка. Консультация, мытьё головы, укладка.',
    preview: 'scissors',
  },
  {
    id: 'fade',
    name: 'Skin Fade',
    price: 2000,
    minutes: 75,
    description: 'Плавный переход до кожи. Контур опасной бритвой.',
    preview: 'fade',
  },
  {
    id: 'beard',
    name: 'Beard Design',
    price: 1200,
    minutes: 40,
    description: 'Форма, контур, горячее полотенце, масло.',
    preview: 'shave',
  },
  {
    id: 'combo',
    name: 'Haircut + Beard',
    price: 2700,
    minutes: 90,
    description: 'Стрижка и борода за один визит. Выгоднее на 300 ₽.',
    preview: 'razor',
  },
] as const;

export const serviceById = (id: string | null) => services.find((s) => s.id === id) ?? null;
