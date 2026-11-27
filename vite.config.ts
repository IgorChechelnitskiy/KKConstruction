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
                <legend class="sr-only">Project inquiry</legend>
                <div class="form-row">
                  <label>Name<input name="name" autocomplete="name" required /></label>
                  <label>Email<input name="email" type="email" autocomplete="email" required /></label>
                </div>
                <label>Project type
                  <select name="project_type" required>
                    <option value="" selected disabled>Select a project type</option>
                    <option>New construction</option><option>Renovation</option>
                    <option>Interior fit-out</option><option>Other</option>
                  </select>
                </label>
                <label>Tell us about your project<textarea name="message" rows="4" required></textarea></label>
              </fieldset>
              <button class="button">Send inquiry</button>
            </form>`
          : '<p class="form-card">Online inquiries are currently unavailable.</p>';

        return html.replace('<!-- project-inquiry-fallback -->', form);
      },
    }],
  };
});
