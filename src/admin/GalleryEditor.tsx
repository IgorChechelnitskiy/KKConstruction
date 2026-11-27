import { useEffect, useState, type SubmitEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { galleryOrigins, type GalleryPhoto } from '../content/galleryTypes';

async function galleryRequest(operation?: Record<string, unknown>): Promise<GalleryPhoto[]> {
  const response = await fetch('/admin/gallery', operation ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operation),
  } : undefined);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

function encodeImage(image: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Das Bild konnte nicht gelesen werden.'));
    reader.readAsDataURL(image);
  });
}

function OriginOptions() {
  return Object.entries(galleryOrigins).map(([value, label]) => <option key={value} value={value}>{label}</option>);
}

function GalleryEditor() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void galleryRequest().then(setPhotos).catch(failure => setError(failure.message));
  }, []);

  async function save(operation: () => Record<string, unknown> | Promise<Record<string, unknown>>, success: string) {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      setPhotos(await galleryRequest(await operation()));
      setMessage(success);
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Die Änderung konnte nicht gespeichert werden.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function upload(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const image = fields.get('image');
    if (!(image instanceof File)) return;
    const saved = await save(async () => {
      if (image.size > 5 * 1024 * 1024) throw new Error('Das Bild darf höchstens 5 MB groß sein.');
      return { action: 'add', image: await encodeImage(image), alt: fields.get('alt'), origin: fields.get('origin') };
    }, 'Bild hinzugefügt.');
    if (saved) form.reset();
  }

  function edit(event: SubmitEvent<HTMLFormElement>, file: string) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void save(() => ({ action: 'edit', file, alt: fields.get('alt'), origin: fields.get('origin') }), 'Bilddaten gespeichert.');
  }

  return (
    <main className="wrap section legal-page gallery-editor">
      <a className="privacy-link" href="/#visualisierungen">Öffentliche Galerie ansehen</a>
      <h1>Galerie bearbeiten</h1>
      <p>Die Änderungen werden in diesem Projekt gespeichert.</p>
      {message && <p role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="form-card" onSubmit={upload}>
        <fieldset disabled={busy || !photos}>
          <legend>Bild hinzufügen</legend>
          <label>JPEG, PNG oder WebP (max. 5 MB)<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></label>
          <label>Alternativtext<input name="alt" maxLength={200} required /></label>
          <label>Bildherkunft<select name="origin" defaultValue="" required>
            <option value="" disabled>Bitte auswählen</option>
            <OriginOptions />
          </select></label>
          <button className="button">Bild hinzufügen</button>
        </fieldset>
      </form>
      <h2>Bilder in der Galerie</h2>
      {photos?.length === 0 && <p>Die Galerie ist leer.</p>}
      <ol className="gallery-editor-list">
        {photos?.map(({ file, alt, origin }, index) => (
          <li key={file}>
            <img src={`/images/${file}`} alt={alt} loading="lazy" />
            <form className="form-card" onSubmit={event => edit(event, file)}>
              <fieldset disabled={busy}>
                <label>Alternativtext<input name="alt" defaultValue={alt} maxLength={200} required /></label>
                <label>Bildherkunft<select name="origin" defaultValue={origin}><OriginOptions /></select></label>
                <div className="gallery-editor-actions">
                  <button type="submit">Speichern</button>
                  <button type="button" disabled={index === 0} onClick={() => void save(() => ({ action: 'move', file, direction: -1 }), 'Reihenfolge gespeichert.')}>Nach oben</button>
                  <button type="button" disabled={index === photos.length - 1} onClick={() => void save(() => ({ action: 'move', file, direction: 1 }), 'Reihenfolge gespeichert.')}>Nach unten</button>
                  <button type="button" onClick={() => {
                    if (window.confirm('Dieses Bild aus der Galerie entfernen?')) {
                      void save(() => ({ action: 'remove', file }), 'Bild aus der Galerie entfernt.');
                    }
                  }}>Entfernen</button>
                </div>
              </fieldset>
            </form>
          </li>
        ))}
      </ol>
    </main>
  );
}

const root = document.getElementById('admin-root');
if (root) createRoot(root).render(<GalleryEditor />);
