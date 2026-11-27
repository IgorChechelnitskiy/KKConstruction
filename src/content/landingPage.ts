import galleryData from './gallery.json';
import type { GalleryPhoto } from './galleryTypes';

export const sectionIds = {
  main: 'main',
  top: 'top',
  about: 'about',
  services: 'services',
  visualizations: 'visualisierungen',
  approach: 'approach',
  contact: 'contact',
} as const;

export const services = [
  { title: 'Trockenbau', description: 'Innenausbau mit höchster Präzision', icon: 'drywall' },
  { title: 'Bodenbeläge', description: 'Verlegung aller Bodenarten, sauber und fachgerecht', icon: 'flooring' },
  { title: 'Montagearbeiten', description: 'Professionelle Montage und Installation', icon: 'assembly' },
  { title: 'Demontagearbeiten', description: 'Rückbau und Demontage, sicher und effizient', icon: 'demolition' },
  { title: 'Holz- und Bautenschutz', description: 'Schutz und Pflege für langfristige Qualität', icon: 'protection' },
];

export const gallery = galleryData as GalleryPhoto[];

export const projectImage = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

export const approachPoints = [
  { icon: 'craft', label: 'Präzise Handwerksarbeit' },
  { icon: 'materials', label: 'Sorgfältige Materialauswahl' },
  { icon: 'planning', label: 'Verlässliche Projektplanung' },
  { icon: 'tag', label: 'Transparente Kommunikation' },
];

export function projectImageSrcSet(file: string, fullWidth: number) {
  return `${projectImage(file.replace(/(\.[^.]+)$/, '-800$1'))} 800w, ${projectImage(file)} ${fullWidth}w`;
}
