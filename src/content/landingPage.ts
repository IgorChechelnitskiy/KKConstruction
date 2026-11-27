export const sectionIds = {
  main: 'main',
  top: 'top',
  about: 'about',
  services: 'services',
  gallery: 'gallery',
  approach: 'approach',
  contact: 'contact',
} as const;

export const services = [
  { title: 'Trockenbau', description: 'Innenausbau mit höchster Präzision', icon: 'M8 43V6h25v37H8zm8 0V6m9 37V6M8 19h25M8 31h25m0-14 13 22-4 3-9-15' },
  { title: 'Bodenbeläge', description: 'Verlegung aller Bodenarten, sauber und fachgerecht', icon: 'm7 30 22-22 7 7-22 22zm12 9 22-22 5 5-22 22zM5 22 22 5l3 3-17 17z' },
  { title: 'Montagearbeiten', description: 'Professionelle Montage und Installation', icon: 'M27 13 40 4l4 4-10 12-5 1-18 21-5-5 21-18zm-7 5-7-3-3-10-5 5 2 9 8 3 17 19 6-5-12-12' },
  { title: 'Demontagearbeiten', description: 'Rückbau und Demontage, sicher und effizient', icon: 'M8 43 29 20l4 4L12 47zM24 9l9-6 11 10-6 7-5-5-5 5-8-8zM8 24l8 7m13 1 9 10 5-4-10-11' },
  { title: 'Holz- und Bautenschutz', description: 'Schutz und Pflege für langfristige Qualität', icon: 'M24 4c7 5 13 6 18 7-1 14-6 24-18 32C12 35 7 25 6 11c5-1 11-2 18-7zm-7 21 5 5 10-11' },
];

export const gallery = [
  { file: 'project-villa.jpg', alt: 'Moderne Villa mit beleuchteter Glasfassade' },
  { file: 'project-pool.jpg', alt: 'Betonvilla mit Terrasse und Pool' },
  { file: 'project-kitchen.jpg', alt: 'Küche mit dunkler Holzverkleidung und Steininsel' },
  { file: 'project-aerial.jpg', alt: 'Zeitgenössisches Wohnhaus mit Terrasse aus erhöhter Perspektive' },
];

export const projectImage = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

export function projectImageSrcSet(file: string, fullWidth: number) {
  return `${projectImage(file.replace('.jpg', '-800.jpg'))} 800w, ${projectImage(file)} ${fullWidth}w`;
}
