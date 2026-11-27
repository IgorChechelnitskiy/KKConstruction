import { BrandIntro, useBrandIntro } from '../animation/BrandIntro';
import { HeroTitle } from '../animation/HeroTitle';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BrandMark } from '../components/BrandMark';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectGallery } from '../components/ProjectGallery';
import { approachPoints, projectImage, projectImageSrcSet, sectionIds, services } from '../content/landingPage';

export function LandingPage() {
  const intro = useBrandIntro();
  return (
    <>
      {intro.phase === 'playing' && <BrandIntro onFinish={intro.finish} onSkip={intro.skip} />}
      <div className="landing-page" onFocusCapture={intro.phase === 'playing' ? intro.skip : undefined}>
        <a className="skip-link" href={`#${sectionIds.main}`}>Zum Inhalt springen</a>
        <SiteHeader />
        <main id={sectionIds.main}>
          <section className="hero" id={sectionIds.top} aria-labelledby="hero-title">
            <picture className="hero-picture">
              <source media="(max-width: 600px)" srcSet={projectImage('villa-mobile.jpg')} />
              <img className="hero-image" src={projectImage('villa-dusk.jpg')}
                srcSet={projectImageSrcSet('villa-dusk.jpg', 1800)}
                sizes="100vw" alt="" fetchPriority="high" />
            </picture>
            <div className="wrap hero-content" lang="de">
              <span className="eyebrow">Qualität. Zuverlässigkeit. Präzision.</span>
              <HeroTitle animate={intro.phase === 'title'} />
              <p>Hochwertige Bau- und Montageservices für private und gewerbliche Kunden in ganz Deutschland.</p>
              <div className="hero-actions">
                <a className="button" href={`#${sectionIds.contact}`}>Kostenloses Angebot</a>
                <a className="hero-gallery-link" href={`#${sectionIds.visualizations}`}>Visualisierungen ansehen</a>
              </div>
            </div>
          </section>
          <section className="wrap section services-section" id={sectionIds.services} aria-labelledby="services-title" lang="de">
            <h2 className="eyebrow" id="services-title">Unsere Leistungen</h2>
            <div className="services">
              {services.map(({ title, description, icon }) => (
                <article key={title}>
                  <img className="service-icon" src={projectImage(`service-${icon}.svg`)} width="80" height="72" alt="" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
          <div className="company-overview" lang="de">
            <img src={projectImage('company-interior.jpg')} alt="Wohnraum mit dunklem Holz und warmem Licht" loading="lazy" />
            <section className="company-copy" id={sectionIds.about}>
              <span className="eyebrow">Über uns</span>
              <h2>Qualität, auf die Sie bauen können</h2>
              <p>KK Construction GbR widmet sich Neubau, Renovierung und Innenausbau. Im Mittelpunkt steht die Frage, wie Sie Ihre Räume nutzen möchten.</p>
            </section>
            <section className="company-copy" id={sectionIds.approach}>
              <h2 className="eyebrow">Warum wir</h2>
              <ul className="approach-list">
                {approachPoints.map(({ icon, label }) => (
                  <li key={icon}>
                    <svg className="approach-icon" aria-hidden="true">
                      <use href={`${projectImage('approach-icons.svg')}#${icon}`} />
                    </svg>
                    {label}
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <ProjectGallery />
          <section className="wrap section contact" id={sectionIds.contact} aria-labelledby="contact-title">
            <div lang="de">
              <span className="eyebrow">Kontakt</span>
              <h2 id="contact-title">Lassen Sie uns Ihr Projekt verwirklichen</h2>
              <p className="section-intro">Erzählen Sie uns von Ihrem Vorhaben. Wir melden uns mit einem unverbindlichen Angebot.</p>
            </div>
            <ProjectForm />
            <div className="contact-brand">
              <BrandMark />
              <span>KK CONSTRUCTION GbR.</span>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
