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
  { title: 'New construction', description: 'Plan a new build around your site, your priorities, and how you want to use the space.' },
  { title: 'Renovations', description: 'Rethink an existing layout, update the finishes, or make more room for everyday life.' },
  { title: 'Interior fit-outs', description: 'Shape the details of an interior, from built-in storage and lighting to materials and finishes.' },
];

export const gallery = [
  { file: 'exterior.jpg', width: 1800, title: 'Contemporary exteriors', alt: 'A contemporary home with large windows and contrasting exterior materials' },
  { file: 'interior.jpg', width: 1400, title: 'Open interiors', alt: 'A bright residential interior with natural finishes' },
  { file: 'details.jpg', width: 1400, title: 'Materials and finishes', alt: 'A residential interior with carefully coordinated finishes' },
];

export const projectImage = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

export function projectImageSrcSet(file: string, fullWidth: number) {
  return `${projectImage(file.replace('.jpg', '-800.jpg'))} 800w, ${projectImage(file)} ${fullWidth}w`;
}
