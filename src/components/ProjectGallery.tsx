import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { gallery, projectImage, sectionIds } from '../content/landingPage';

export function ProjectGallery() {
  return (
    <section className="gallery-section" id={sectionIds.gallery} aria-labelledby="gallery-title">
      <div className="wrap section">
        <h2 id="gallery-title">Design inspiration</h2>
        <p className="section-intro">Explore ideas for your next build or renovation.</p>
        <Swiper
          modules={[A11y, Keyboard, Navigation, Pagination]}
          a11y={{ containerRoleDescriptionMessage: 'carousel', containerMessage: 'Design inspiration' }}
          keyboard={{ enabled: true }}
          navigation
          pagination={{ clickable: true }}
          rewind
        >
          {gallery.map(({ file, title, alt }) => (
            <SwiperSlide key={file}>
              <figure>
                <img src={projectImage(file)} alt={alt} loading="lazy" />
                <figcaption>{title}</figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
