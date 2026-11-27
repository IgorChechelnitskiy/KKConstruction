import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const formId = loadEnv(mode, '.', 'VITE_').VITE_FORMSPREE_FORM_ID?.trim() ?? '';

  return {
    plugins: [{
      name: 'native-inquiry-form',
      transformIndexHtml(html) {
        const form = /^[a-z\d]+$/i.test(formId)
          ? `<form class="form-card" action="https://formspree.io/f/${formId}" method="post">
              <fieldset>
                <legend class="sr-only">Projektanfrage</legend>
                <div class="form-row">
                  <label>Ihr Name<input name="name" autocomplete="name" required /></label>
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
                <label>Beschreiben Sie Ihr Projekt<textarea name="message" rows="4" required></textarea></label>
              </fieldset>
              <button class="button">Angebot anfordern</button>
            </form>`
          : '<p class="form-card">Online-Anfragen sind derzeit nicht verfügbar.</p>';

        return html.replace('<!-- project-inquiry-fallback -->', form);
      },
    }],
  };
});
