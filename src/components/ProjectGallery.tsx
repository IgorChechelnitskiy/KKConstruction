import { useState } from 'react';
import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { gallery, projectImage, sectionIds } from '../content/landingPage';

export function ProjectGallery() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="gallery-section" id={sectionIds.gallery} aria-labelledby="gallery-title" lang="de">
      <div className="wrap section">
        <span className="eyebrow">Unsere Projekte</span>
        <h2 id="gallery-title">Ausgewählte Projektideen</h2>
        <div id="project-images">
          {!expanded ? (
            <Swiper
              modules={[A11y, Keyboard, Navigation, Pagination]}
              a11y={{ containerMessage: 'Ausgewählte Projektideen', prevSlideMessage: 'Vorheriges Bild', nextSlideMessage: 'Nächstes Bild' }}
              slidesPerView={3}
              spaceBetween={8}
              breakpoints={{ 601: { spaceBetween: 16 }, 1025: { slidesPerView: 4, spaceBetween: 16 } }}
              keyboard={{ enabled: true }}
              navigation
              pagination={{ clickable: true }}
              watchOverflow
              rewind
            >
              {gallery.map(({ file, alt }) => (
                <SwiperSlide key={file}>
                  <img src={projectImage(file)} alt={alt} loading="lazy" />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="project-grid project-grid-expanded">
              {gallery.map(({ file, alt }) => (
                <img key={file} src={projectImage(file)} alt={alt} loading="lazy" />
              ))}
            </div>
          )}
        </div>
        <button
          className="project-gallery-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls="project-images"
          onClick={() => setExpanded(previous => !previous)}
        >
          {expanded ? 'Kompakte Ansicht anzeigen' : 'Alle Projekte ansehen'}
        </button>
      </div>
    </section>
  );
}
