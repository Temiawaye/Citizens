import type { IncidentCategory } from '@/types/database';
import { CATEGORIES } from '@/types/database';

export { CATEGORIES };
export const PAGE_SIZE = 15;
export const MAX_IMAGES = 4;
export const IMAGE_MAX_WIDTH = 1600;
export const IMAGE_QUALITY = 0.75;

export const CATEGORY_COLORS: Record<IncidentCategory, string> = {
  Accident: 'bg-amber-100 text-amber-800',
  Fighting: 'bg-orange-100 text-orange-800',
  Rioting: 'bg-purple-100 text-purple-800',
  Fire: 'bg-red-100 text-red-800',
  'Robbery/Theft': 'bg-slate-200 text-slate-800',
  Flooding: 'bg-blue-100 text-blue-800',
  'Medical Emergency': 'bg-emerald-100 text-emerald-800',
  Other: 'bg-zinc-200 text-zinc-800',
};
