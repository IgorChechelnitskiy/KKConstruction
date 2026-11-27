import { useRef, useState, type MouseEvent } from 'react';
import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { gallery, projectImage, sectionIds } from '../content/landingPage';
import { galleryOrigins } from '../content/galleryTypes';

function isBackdropClick(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX >= bounds.right ||
    event.clientY < bounds.top || event.clientY >= bounds.bottom;
}

export function ProjectGallery() {
  const [expanded, setExpanded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);
  const photo = gallery[activePhoto];

  function movePhoto(direction: number) {
    setActivePhoto(index => (index + direction + gallery.length) % gallery.length);
  }

  function renderPhoto({ file, alt, origin }: (typeof gallery)[number], index: number) {
    return (
      <button key={file} type="button" className="project-photo" aria-haspopup="dialog"
        aria-label={`Bild vergrößern: ${alt}`} onClick={() => {
          setActivePhoto(index);
          dialogRef.current?.showModal();
        }}>
        <img src={projectImage(file)} alt="" loading="lazy" />
        <span className="gallery-photo-origin">{galleryOrigins[origin]}</span>
      </button>
    );
  }

  return (
    <section className="gallery-section" id={sectionIds.visualizations} aria-labelledby="visualizations-title" aria-describedby="visualizations-note" lang="de">
      <div className="wrap section">
        <span className="eyebrow">Visualisierungen</span>
        <h2 id="visualizations-title">Architektur &amp; Raumkonzepte</h2>
        {gallery.length === 0 && <p className="gallery-image-note">Derzeit sind keine Visualisierungen verfügbar.</p>}
        <div id="visualizations-images">
          {gallery.length > 0 && (!expanded ? (
            <Swiper
              modules={[A11y, Keyboard, Navigation, Pagination]}
              a11y={{ containerMessage: 'Architektur & Raumkonzepte', prevSlideMessage: 'Vorheriges Bild', nextSlideMessage: 'Nächstes Bild' }}
              slidesPerView={3}
              spaceBetween={8}
              breakpoints={{ 601: { spaceBetween: 16 }, 1025: { slidesPerView: 4, spaceBetween: 16 } }}
              keyboard={{ enabled: true }}
              navigation
              pagination={{ clickable: true }}
              watchOverflow
              rewind
            >
              {gallery.map((entry, index) => (
                <SwiperSlide key={entry.file}>
                  {renderPhoto(entry, index)}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="project-grid project-grid-expanded">
              {gallery.map(renderPhoto)}
            </div>
          ))}
        </div>
        {gallery.length > 0 && <button
          className="project-gallery-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls="visualizations-images"
          onClick={() => setExpanded(previous => !previous)}
        >
          {expanded ? 'Kompakte Ansicht anzeigen' : 'Alle Visualisierungen ansehen'}
        </button>}
        <p className="visualizations-note" id="visualizations-note">
          Die gezeigten Bilder dienen der Veranschaulichung möglicher Bau- und Gestaltungskonzepte. Sie stellen keine tatsächlich von KK Construction GbR ausgeführten Referenzprojekte dar.
        </p>
        {photo && <dialog ref={dialogRef} className="project-dialog" aria-label="Visualisierungen"
          onPointerDown={event => { startedOnBackdrop.current = isBackdropClick(event); }}
          onClick={event => {
            if (startedOnBackdrop.current && isBackdropClick(event)) event.currentTarget.close();
            startedOnBackdrop.current = false;
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              event.stopPropagation();
              movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
            }
          }}>
          <div className="project-dialog-header">
            <span className="gallery-image-note">{galleryOrigins[photo.origin]}</span>
            <button type="button" autoFocus aria-label="Galerie schließen" onClick={() => dialogRef.current?.close()}>×</button>
          </div>
          <img className="project-dialog-image" src={projectImage(photo.file)} alt={photo.alt} loading="lazy" />
          {gallery.length > 1 && <div className="project-dialog-controls">
            <button type="button" aria-label="Vorheriges Bild" onClick={() => movePhoto(-1)}>‹</button>
            <span role="status">{activePhoto + 1} / {gallery.length}</span>
            <button type="button" aria-label="Nächstes Bild" onClick={() => movePhoto(1)}>›</button>
          </div>}
        </dialog>}
      </div>
    </section>
  );
}
