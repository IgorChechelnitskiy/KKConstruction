export const galleryOrigins = {
  generated: 'KI-generiert',
  edited: 'KI-bearbeitet',
  photo: 'Foto',
} as const;

export type GalleryOrigin = keyof typeof galleryOrigins;

export type GalleryPhoto = {
  file: string;
  alt: string;
  origin: GalleryOrigin;
};
