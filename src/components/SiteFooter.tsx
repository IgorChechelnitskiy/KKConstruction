import { socialLinks } from '../config/socialLinks';
import { sectionIds } from '../content/landingPage';
import { BrandMark } from './BrandMark';

const links = [
  ['Home', sectionIds.top],
  ['Über uns', sectionIds.about],
  ['Leistungen', sectionIds.services],
  ['Visualisierungen', sectionIds.visualizations],
  ['Kontakt', sectionIds.contact],
] as const;

const socialIcons = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M14 22v-9h3l.5-3H14V8c0-1 .4-2 2-2h2V3.2C17.3 3.1 16.4 3 15.5 3 12.6 3 11 4.8 11 8v2H8v3h3v9z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16.8 3 21l4.3-1.1A9 9 0 1 0 4 16.8Z" />
      <path d="M9 8.2c-.5 0-1 .5-1 1.3 0 2.4 3 5.4 5.5 5.9 1 .2 2-.3 2.3-1.2l-2-1.2-.8 1c-1.5-.7-2.6-1.8-3.3-3.2l.9-.8-.9-1.8z" />
    </svg>
  ),
};

const platforms = ['instagram', 'facebook', 'whatsapp'] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer" lang="de">
      <div className="footer-inner">
        <div className="footer-brand">
          <BrandMark />
          <div>
            <strong>KK CONSTRUCTION GbR.</strong>
            <small>© {new Date().getFullYear()} Alle Rechte vorbehalten.</small>
          </div>
        </div>
        <nav aria-label="Fußnavigation">
          {links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <div className="footer-socials">
          {platforms.map(platform => {
            const { label, url } = socialLinks[platform];
            const props = { className: 'footer-social', 'data-platform': platform, 'aria-label': label, title: label };
            return url.trim()
              ? <a key={platform} {...props} href={url.trim()}>{socialIcons[platform]}</a>
              : <span key={platform} {...props} role="img">{socialIcons[platform]}</span>;
          })}
        </div>
      </div>
    </footer>
  );
}
