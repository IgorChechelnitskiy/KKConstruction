import { useForm, ValidationError } from '@formspree/react';

function InquiryFields({ disabled }: { disabled: boolean }) {
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Project inquiry</legend>
      <div className="form-row">
        <label>Name<input name="name" autoComplete="name" required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      </div>
      <label>Project type
        <select name="project_type" required defaultValue="">
          <option value="" disabled>Select a project type</option>
          <option>New construction</option>
          <option>Renovation</option>
          <option>Interior fit-out</option>
          <option>Other</option>
        </select>
      </label>
      <label>Tell us about your project
        <textarea name="message" rows={4} placeholder="Location, scope, and timeline" required />
      </label>
    </fieldset>
  );
}

function ConnectedForm({ formId }: { formId: string }) {
  const [state, submit, reset] = useForm(formId);

  if (state.succeeded) {
    return (
      <div className="form-card">
        <p role="status">Thanks. Your project inquiry has been sent.</p>
        <button className="button" type="button" onClick={reset}>Send another inquiry</button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} aria-busy={state.submitting}>
      <InquiryFields disabled={state.submitting} />
      {state.errors && (
        <div className="form-error" role="alert">
          <p>We couldn’t send your inquiry. Check the details or try again.</p>
          <ValidationError errors={state.errors} />
          <ValidationError field="email" errors={state.errors} />
          <ValidationError field="message" errors={state.errors} />
        </div>
      )}
      <button className="button" disabled={state.submitting}>
        {state.submitting ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}

export function ProjectForm() {
  const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim();

  return formId ? <ConnectedForm formId={formId} /> : (
    <div className="form-card">
      <InquiryFields disabled />
      <p className="form-note">Online inquiries are currently unavailable.</p>
      <button className="button" disabled>Send inquiry</button>
    </div>
  );
}
