import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { phoneCountries, phoneFlags, type PhoneCountry } from '../content/phoneCountries';
import { useForm, ValidationError } from '@formspree/react';
import { useEffect, useState, type SubmitEvent } from 'react';

const minimumMessage = 'Bitte beschreiben Sie Ihr Projekt mit mindestens 5 Zeichen.';
function checkPhone(input: HTMLInputElement) {
  const country = (input.form?.elements.namedItem('phone_country') as HTMLInputElement | null)?.value as PhoneCountry | undefined;
  const value = input.value.trim();
  if (!value) return { error: '', number: undefined };
  const parsed = parsePhoneNumberFromString(value.replace(/^00/, '+'), { defaultCountry: country, extract: false });
  if (!parsed) return { error: 'Bitte geben Sie eine gültige Telefonnummer ein.', number: undefined };
  if (parsed.country && parsed.country !== country) {
    return { error: 'Die Telefonnummer passt nicht zum ausgewählten Land.', number: undefined };
  }
  if (!parsed.isPossible()) {
    return { error: 'Die Länge der Telefonnummer passt nicht zum ausgewählten Land.', number: undefined };
  }
  if (parsed.country !== country || parsed.ext) {
    return { error: 'Bitte geben Sie eine Telefonnummer für das ausgewählte Land ohne Durchwahl ein.', number: undefined };
  }
  return { error: '', number: parsed.number };
}

function InquiryFields({ disabled }: { disabled: boolean }) {
  const [country, setCountry] = useState<PhoneCountry>('DE');
  const CountryFlag = phoneFlags[country];
  const currentCountry = phoneCountries.find(option => option.code === country);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateError(target: EventTarget, onlyWhenInvalid = false) {
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (onlyWhenInvalid && !errors[target.name]) return;
    const phoneError = target instanceof HTMLInputElement && target.name === 'phone' ? checkPhone(target).error : undefined;
    const message = phoneError ?? (target.name === 'message' && target.value.trim().length < 5
      ? minimumMessage
      : target.name === 'name' && target.validity.patternMismatch
        ? 'Bitte geben Sie einen Namen mit mindestens 3 Buchstaben ein.'
      : target.validationMessage);
    setErrors(previous => ({ ...previous, [target.name]: message }));
  }

  function fieldFeedback(name: string) {
    return {
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `inquiry-${name}-error` : undefined,
    };
  }

  function errorMessage(name: string) {
    return errors[name] && <span className="form-field-error" id={`inquiry-${name}-error`} role="status">{errors[name]}</span>;
  }

  return (
    <fieldset disabled={disabled} onBlur={event => updateError(event.target)} onChange={event => updateError(event.target, true)}>
      <legend className="sr-only">Projektanfrage</legend>
      <div className="form-row">
        <div className="form-field">
          <input name="name" aria-label="Ihr Name" placeholder="Ihr Name" autoComplete="name" pattern="(?:[^\p{L}]*\p{L}){3}.*" maxLength={100} required {...fieldFeedback('name')} />
          {errorMessage('name')}
        </div>
        <div className="phone-field">
          <div className="phone-controls">
            <details className="phone-country" onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
            }} onKeyDown={event => {
              if (event.key !== 'Escape') return;
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }}>
              <summary aria-label={`Land und Telefonvorwahl: ${currentCountry?.name} ${currentCountry?.prefix}`}
                aria-disabled={disabled} tabIndex={disabled ? -1 : 0}
                onClick={event => { if (disabled) event.preventDefault(); }}>
                <CountryFlag aria-hidden="true" />{currentCountry?.prefix}
              </summary>
              <input type="hidden" name="phone_country" value={country} />
              <ul className="phone-country-options">
                {phoneCountries.map(({ code, name, prefix }) => {
                  const Flag = phoneFlags[code];
                  return <li key={code}><button type="button" aria-pressed={code === country}
                    onMouseDown={event => event.preventDefault()} onClick={event => {
                    const form = event.currentTarget.form;
                    const picker = event.currentTarget.closest('details');
                    const selected = form?.elements.namedItem('phone_country');
                    const phone = form?.elements.namedItem('phone');
                    if (selected instanceof HTMLInputElement) selected.value = code;
                    setCountry(code);
                    if (phone instanceof HTMLInputElement) {
                      phone.setCustomValidity('');
                      updateError(phone);
                    }
                    if (picker) {
                      picker.open = false;
                      picker.querySelector('summary')?.focus();
                    }
                  }}><Flag aria-hidden="true" />{name} ({prefix})</button></li>;
                })}
              </ul>
            </details>
            <input name="phone" type="tel" aria-label="Telefonnummer (optional)" placeholder="Telefonnummer" autoComplete="tel-national" maxLength={35}
              onInput={event => event.currentTarget.setCustomValidity('')} {...fieldFeedback('phone')} />
          </div>
          {errorMessage('phone')}
        </div>
        <div className="form-field">
          <input name="email" type="email" aria-label="E-Mail-Adresse" placeholder="E-Mail-Adresse" autoComplete="email" maxLength={254} required {...fieldFeedback('email')} />
          {errorMessage('email')}
        </div>
      </div>
      <div className="form-field">
        <textarea name="message" aria-label="Beschreiben Sie Ihr Projekt" rows={4} placeholder="Beschreiben Sie Ihr Projekt" minLength={5} maxLength={3000}
          onInput={event => event.currentTarget.setCustomValidity('')} required {...fieldFeedback('message')} />
        {errorMessage('message')}
      </div>
    </fieldset>
  );
}

function validateInquiry(form: HTMLFormElement) {
  const phone = form.elements.namedItem('phone');
  if (phone instanceof HTMLInputElement) {
    phone.setCustomValidity(checkPhone(phone).error);
    if (!phone.reportValidity()) return false;
  }
  const message = form.elements.namedItem('message');
  if (!(message instanceof HTMLTextAreaElement)) return false;
  message.setCustomValidity(message.value.trim().length < 5 ? minimumMessage : '');
  return message.reportValidity();
}

function prepareInquiry(form: HTMLFormElement) {
  const data = new FormData(form);
  const phone = form.elements.namedItem('phone');
  const number = phone instanceof HTMLInputElement ? checkPhone(phone).number : undefined;
  data.delete('phone_country');
  if (number) data.set('phone', number);
  else data.delete('phone');
  return data;
}

function InquiryToast({ message, onDismiss, tone = 'success' }: {
  message: string;
  onDismiss: () => void;
  tone?: 'success' | 'error';
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 2000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div className={`form-toast form-toast-${tone}`}>
      <p role={tone === 'error' ? 'alert' : 'status'}>{message}</p>
      <button type="button" aria-label="Meldung schließen" onClick={onDismiss}>×</button>
    </div>
  );
}

function ConnectedForm({ formId }: { formId: string }) {
  const [state, submit, reset] = useForm(formId);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [errorToastDismissed, setErrorToastDismissed] = useState(false);

  if (state.succeeded) return (
    <div className="form-card">
      <p>Vielen Dank. Ihre Projektanfrage wurde gesendet.</p>
      <button className="button" type="button" onClick={() => { reset(); setToastDismissed(false); }}>Weitere Anfrage senden</button>
      {!toastDismissed && <InquiryToast message="Ihre Projektanfrage wurde gesendet." onDismiss={() => setToastDismissed(true)} />}
    </div>
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateInquiry(event.currentTarget)) return;
    setErrorToastDismissed(false);
    void submit(prepareInquiry(event.currentTarget));
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} aria-busy={state.submitting}>
      <div hidden><label>Website<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div>
      <InquiryFields disabled={state.submitting} />
      {state.errors && (
        <div className="form-error" role="alert">
          <p>Ihre Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.</p>
          <ValidationError errors={state.errors} />
          <ValidationError field="email" errors={state.errors} />
          <ValidationError field="message" errors={state.errors} />
        </div>
      )}
      {state.errors && !state.submitting && !errorToastDismissed && (
        <InquiryToast tone="error" message="Ihre Anfrage konnte nicht gesendet werden."
          onDismiss={() => setErrorToastDismissed(true)} />
      )}
      <button className="button" disabled={state.submitting}>
        {state.submitting ? 'Wird gesendet…' : 'Angebot anfordern'}
      </button>
    </form>
  );
}

function TestForm() {
  const [sent, setSent] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateInquiry(event.currentTarget)) return;
    setFormVersion(version => version + 1);
    setSent(true);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <p className="form-note">Testmodus: Es werden keine E-Mails versendet.</p>
      <InquiryFields key={formVersion} disabled={false} />
      <button className="button">Testanfrage senden</button>
      {sent && <InquiryToast message="Testanfrage erfolgreich. Es wurde keine E-Mail versendet." onDismiss={() => setSent(false)} />}
    </form>
  );
}

export function ProjectForm() {
  const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim();

  if (formId) return <ConnectedForm formId={formId} />;
  if (import.meta.env.DEV) return <TestForm />;

  return (
    <div className="form-card">
      <InquiryFields disabled />
      <p className="form-note">Online-Anfragen sind derzeit nicht verfügbar.</p>
      <button className="button" disabled>Angebot anfordern</button>
    </div>
  );
}
