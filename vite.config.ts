import { defineConfig, loadEnv } from 'vite';

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
    plugins: [{
      name: 'native-inquiry-form',
      transformIndexHtml(html) {
        if (!html.includes('<!-- project-inquiry-fallback -->')) return html;
        const form = /^[a-z\d]+$/i.test(formId)
          ? `<form class="form-card" action="https://formspree.io/f/${formId}" method="post">
              <div hidden><label>Website<input name="_gotcha" tabindex="-1" autocomplete="off" /></label></div>
              <fieldset>
                <legend class="sr-only">Projektanfrage</legend>
                <div class="form-row">
                  <label>Ihr Name<input name="name" autocomplete="name" pattern="(?:[^\\p{L}]*\\p{L}){3}.*" maxlength="100" required /></label>
                  <label>E-Mail-Adresse<input name="email" type="email" autocomplete="email" required /></label>
                  <label>Telefonnummer<input name="phone" type="tel" autocomplete="tel" /></label>
                </div>
                <label>Projektart
                  <select name="project_type" required>
                    <option value="" selected disabled>Projektart auswählen</option>
                    <option value="New construction">Neubau</option><option value="Renovation">Renovierung</option>
                    <option value="Interior fit-out">Innenausbau</option><option value="Other">Sonstiges</option>
                  </select>
                </label>
                <label>Beschreiben Sie Ihr Projekt<textarea name="message" rows="4" minlength="5" maxlength="3000" required></textarea></label>
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
