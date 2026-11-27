import { useForm, ValidationError } from '@formspree/react';

function InquiryFields({ disabled }: { disabled: boolean }) {
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Projektanfrage</legend>
      <div className="form-row">
        <label>Ihr Name<input name="name" autoComplete="name" required /></label>
        <label>E-Mail-Adresse<input name="email" type="email" autoComplete="email" required /></label>
        <label>Telefonnummer<input name="phone" type="tel" autoComplete="tel" /></label>
      </div>
      <label>Projektart
        <select name="project_type" required defaultValue="">
          <option value="" disabled>Projektart auswählen</option>
          <option value="New construction">Neubau</option>
          <option value="Renovation">Renovierung</option>
          <option value="Interior fit-out">Innenausbau</option>
          <option value="Other">Sonstiges</option>
        </select>
      </label>
      <label>Beschreiben Sie Ihr Projekt
        <textarea name="message" rows={4} placeholder="Ort, Umfang und Zeitrahmen" required />
      </label>
    </fieldset>
  );
}

function ConnectedForm({ formId }: { formId: string }) {
  const [state, submit, reset] = useForm(formId);

  if (state.succeeded) {
    return (
      <div className="form-card">
        <p role="status">Vielen Dank. Ihre Projektanfrage wurde gesendet.</p>
        <button className="button" type="button" onClick={reset}>Weitere Anfrage senden</button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} aria-busy={state.submitting}>
      <InquiryFields disabled={state.submitting} />
      {state.errors && (
        <div className="form-error" role="alert">
          <p>Ihre Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.</p>
          <ValidationError errors={state.errors} />
          <ValidationError field="email" errors={state.errors} />
          <ValidationError field="message" errors={state.errors} />
        </div>
      )}
      <button className="button" disabled={state.submitting}>
        {state.submitting ? 'Wird gesendet…' : 'Angebot anfordern'}
      </button>
    </form>
  );
}

export function ProjectForm() {
  const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim();

  return formId ? <ConnectedForm formId={formId} /> : (
    <div className="form-card">
      <InquiryFields disabled />
      <p className="form-note">Online-Anfragen sind derzeit nicht verfügbar.</p>
      <button className="button" disabled>Angebot anfordern</button>
    </div>
  );
}
