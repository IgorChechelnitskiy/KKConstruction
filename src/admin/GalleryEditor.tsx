import { useEffect, useRef, useState, type SubmitEvent } from 'react';
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto>();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 2000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const urls = selectedImages.map(image => URL.createObjectURL(image));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedImages]);

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
    if (!selectedImages.length) return;
    const saved = await save(async () => ({
      action: 'add',
      images: await Promise.all(selectedImages.map(encodeImage)),
    }), 'Bilder hinzugef\u00fcgt.');
    if (saved) {
      form.reset();
      setSelectedImages([]);
    }
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
      {message && <div className="form-toast form-toast-success">
        <p role="status">{message}</p>
        <button type="button" aria-label="Meldung schließen" onClick={() => setMessage('')}>×</button>
      </div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="form-card gallery-upload" onSubmit={upload}>
        <fieldset disabled={busy || !photos}>
          <legend className="gallery-upload-heading">
            <span>Bilder hinzufügen</span>
            <span id="gallery-upload-help">Bis zu 5 Bilder (JPEG, PNG oder WebP, je max. 5 MB)</span>
          </legend>
          <label className="gallery-upload-file">
            {selectedImages.length > 0 && <span aria-hidden="true">Bilder auswählen</span>}
            <input type="file" aria-label="Bilder auswählen" aria-describedby="gallery-upload-help"
              accept="image/jpeg,image/png,image/webp" multiple onChange={event => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = '';
              if (files.length === 0) return;
              if (selectedImages.length + files.length > 5 || files.some(file => file.size > 5 * 1024 * 1024)) {
                setError('Bitte w\u00e4hlen Sie bis zu 5 Bilder mit jeweils maximal 5 MB aus.');
                return;
              }
              setError('');
              setSelectedImages(images => [...images, ...files]);
            }} />
          </label>
          {selectedImages.length > 0 && (
            <ul className="gallery-upload-previews">
              {selectedImages.map((image, index) => (
                <li key={index}>
                  {previewUrls[index] && <img className="gallery-upload-preview" src={previewUrls[index]} alt={image.name} />}
                  <button className="gallery-preview-remove" type="button" aria-label={image.name + ' entfernen'}
                    onClick={() => setSelectedImages(images => images.filter((_, position) => position !== index))}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="button" disabled={!selectedImages.length}>Bilder hinzufügen</button>
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
                    setPhotoToDelete({ file, alt, origin });
                    deleteDialog.current?.showModal();
                  }}>Entfernen</button>
                </div>
              </fieldset>
            </form>
          </li>
        ))}
      </ol>
      <dialog ref={deleteDialog} className="gallery-delete-dialog" aria-labelledby="gallery-delete-title"
        aria-describedby="gallery-delete-description" onClose={() => setPhotoToDelete(undefined)}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX >= bounds.right ||
            event.clientY < bounds.top || event.clientY >= bounds.bottom) {
            event.currentTarget.close();
          }
        }}>
        <button className="gallery-preview-remove gallery-delete-close" type="button" aria-label="Dialog schließen"
          onClick={() => deleteDialog.current?.close()}>×</button>
        <h2 id="gallery-delete-title">Bild entfernen?</h2>
        <p id="gallery-delete-description">Das Bild wird aus der Galerie entfernt.</p>
        {photoToDelete && <img src={`/images/${photoToDelete.file}`} alt={photoToDelete.alt} />}
        <div className="gallery-editor-actions">
          <button type="button" autoFocus onClick={() => deleteDialog.current?.close()}>Abbrechen</button>
          <button className="gallery-delete-confirm" type="button" onClick={() => {
            if (!photoToDelete) return;
            const { file } = photoToDelete;
            deleteDialog.current?.close();
            void save(() => ({ action: 'remove', file }), 'Bild aus der Galerie entfernt.');
          }}>Bild entfernen</button>
        </div>
      </dialog>
    </main>
  );
}

const root = document.getElementById('admin-root');
if (root) createRoot(root).render(<GalleryEditor />);
