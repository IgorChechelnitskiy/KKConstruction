import { defineConfig, loadEnv } from 'vite';
import { galleryAdmin } from './gallery-admin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const formId = env.VITE_FORMSPREE_FORM_ID?.trim() ?? '';
  const siteUrl = env.VITE_SITE_URL?.trim() ? new URL(env.VITE_SITE_URL.trim()) : undefined;
  if (siteUrl && (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash)) {
    throw new Error('VITE_SITE_URL must be the public HTTPS site URL.');
  }

  return {
    build: {
      rollupOptions: {
        input: { home: 'index.html', impressum: 'impressum/index.html', datenschutz: 'datenschutz/index.html' },
        output: { manualChunks: { swiper: ['swiper/react', 'swiper/modules'] } },
      },
    },
    plugins: [galleryAdmin(), {
      name: 'native-inquiry-form',
      transformIndexHtml(html) {
        if (!html.includes('<!-- project-inquiry-fallback -->')) return html;
        const form = /^[a-z\d]+$/i.test(formId)
          ? `<form class="form-card" action="https://formspree.io/f/${formId}" method="post">
              <div hidden><label>Website<input name="_gotcha" tabindex="-1" autocomplete="off" /></label></div>
              <fieldset>
                <legend class="sr-only">Projektanfrage</legend>
                <input name="name" aria-label="Ihr Name" placeholder="Ihr Name" autocomplete="name" pattern="(?:[^\\p{L}]*\\p{L}){3}.*" maxlength="100" required />
                <input name="phone" type="tel" aria-label="Telefonnummer (optional)" placeholder="Telefonnummer" autocomplete="tel" />
                <input name="email" type="email" aria-label="E-Mail-Adresse" placeholder="E-Mail-Adresse" autocomplete="email" maxlength="254" required />
                <textarea name="message" aria-label="Beschreiben Sie Ihr Projekt" placeholder="Beschreiben Sie Ihr Projekt" rows="4" minlength="5" maxlength="3000" required></textarea>
              </fieldset>
              <button class="button">Angebot anfordern</button>
            </form>`
          : '<p class="form-card">Online-Anfragen sind derzeit nicht verfügbar.</p>';

        return html.replace('<!-- project-inquiry-fallback -->', form);
      },
    }, {
      name: 'site-search-metadata',
      transformIndexHtml(html, context) {
        if (context.path !== '/index.html' && context.path !== '/') return html;
        if (!siteUrl) return html;
        const canonical = siteUrl.href.endsWith('/') ? siteUrl.href : siteUrl.href + '/';
        return { html, tags: [
          { tag: 'link', attrs: { rel: 'canonical', href: canonical } },
          { tag: 'meta', attrs: { property: 'og:url', content: canonical } },
          { tag: 'meta', attrs: { property: 'og:image', content: new URL('images/villa-dusk.jpg', canonical).href } },
        ] };
      },
      generateBundle() {
        const canonical = siteUrl && (siteUrl.href.endsWith('/') ? siteUrl.href : siteUrl.href + '/');
        const robots = 'User-agent: *\nAllow: /\n';
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: canonical ? robots + 'Sitemap: ' + canonical + 'sitemap.xml\n' : robots });
        if (canonical) {
          // The protocol is part of the sitemap XML namespace identifier.
          const sitemapNamespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml',
            source: `<urlset xmlns="${sitemapNamespace}"><url><loc>${canonical.replaceAll('&', '&amp;')}</loc></url></urlset>\n` });
        }
      },
    }],
  };
});
