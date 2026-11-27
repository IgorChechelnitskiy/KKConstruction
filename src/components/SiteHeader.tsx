import { useEffect, useRef, useState } from 'react';
import { sectionIds } from '../content/landingPage';
import { BrandMark } from './BrandMark';

const links = [
  ['Home', sectionIds.top],
  ['Über uns', sectionIds.about],
  ['Leistungen', sectionIds.services],
  ['Projekte', sectionIds.gallery],
  ['Warum wir', sectionIds.approach],
  ['Kontakt', sectionIds.contact],
] as const;

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<(typeof links)[number][1]>(sectionIds.top);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let frame = 0;
    const update = () => {
      let current: (typeof links)[number][1] = sectionIds.top;
      const readingLine = Math.max(0, header.getBoundingClientRect().bottom) + 32;
      for (const [, id] of links) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= readingLine) current = id;
      }
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sectionIds.contact;
      }
      setActiveId(current);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
      schedule();
    });
    observer.observe(header);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);

  return (
    <header ref={headerRef} className="site-header" lang="de">
      <div className="header-inner">
        <a className="brand" href={`#${sectionIds.top}`}>
          <BrandMark />
          <span>KK CONSTRUCTION GbR.</span>
        </a>
        <nav aria-label="Hauptnavigation">
          {links.map(([label, id]) => (
            <a href={`#${id}`} key={id} aria-current={activeId === id ? 'location' : undefined}>{label}</a>
          ))}
        </nav>
        <a className="header-quote" href={`#${sectionIds.contact}`}>Angebot anfordern</a>
      </div>
    </header>
  );
}
