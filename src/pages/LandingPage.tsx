import { BrandIntro, useBrandIntro } from '../animation/BrandIntro';
import { HeroTitle } from '../animation/HeroTitle';
import { BrandMark } from '../components/BrandMark';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectGallery } from '../components/ProjectGallery';
import { projectImage, projectImageSrcSet, sectionIds, services } from '../content/landingPage';

export function LandingPage() {
  const intro = useBrandIntro();
  return (
    <>
      {intro.phase === 'playing' && <BrandIntro onFinish={intro.finish} onSkip={intro.skip} />}
      <div className="landing-page" onFocusCapture={intro.phase === 'playing' ? intro.skip : undefined}>
        <a className="skip-link" href={`#${sectionIds.main}`}>Skip to content</a>
        <header className="site-header">
          <div className="wrap header-inner">
            <a className="brand" href={`#${sectionIds.top}`}><BrandMark /> KK Construction</a>
            <nav aria-label="Main navigation">
              <a href={`#${sectionIds.services}`}>Services</a>
              <a href={`#${sectionIds.gallery}`}>Gallery</a>
              <a href={`#${sectionIds.contact}`}>Contact</a>
            </nav>
          </div>
        </header>
        <main id={sectionIds.main}>
          <section className="hero" id={sectionIds.top} aria-labelledby="hero-title">
            <picture className="hero-picture">
              <source media="(max-width: 600px)" srcSet={projectImage('hero-mobile.jpg')} />
              <img className="hero-image" src={projectImage('exterior.jpg')}
                srcSet={projectImageSrcSet('exterior.jpg', 1800)}
                sizes="100vw" alt="" fetchPriority="high" />
            </picture>
            <div className="wrap hero-content">
              <HeroTitle animate={intro.phase === 'title'} />
              <p>Construction and renovation shaped around the way you want to live.</p>
              <a className="button" href={`#${sectionIds.contact}`}>Discuss your project</a>
            </div>
          </section>
          <section className="wrap section" id={sectionIds.services} aria-labelledby="services-title">
            <h2 id="services-title">What we build</h2>
            <div className="services">
              {services.map(({ title, description }) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
          <ProjectGallery />
          <section className="wrap section contact" id={sectionIds.contact} aria-labelledby="contact-title">
            <div>
              <h2 id="contact-title">Tell us what<br />you’re planning.</h2>
              <p className="section-intro">Share what you’d like to build or change, where it’s located, and when you’d like to get started.</p>
            </div>
            <ProjectForm />
          </section>
        </main>
        <footer><div className="wrap footer-inner"><span>KK Construction</span><a href={`#${sectionIds.top}`}>Back to top</a></div></footer>
      </div>
    </>
  );
}
