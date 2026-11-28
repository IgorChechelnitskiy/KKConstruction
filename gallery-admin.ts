import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { TLSSocket } from 'node:tls';
import type { Plugin } from 'vite';
import { galleryOrigins, type GalleryPhoto } from './src/content/galleryTypes';

const galleryFile = resolve('src/content/gallery.json');
const uploads = resolve('public/images/gallery');
const maxImageBytes = 5 * 1024 * 1024;
const maxPhotosPerUpload = 5;
const maxRequestBytes = maxPhotosPerUpload * Math.ceil(maxImageBytes / 3) * 4 + 4096;
const localHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/iu;
const imagePath = /^(?:gallery\/)?[\w-]+\.(?:webp|png|jpe?g)$/i;
const readGallery = (): GalleryPhoto[] => JSON.parse(readFileSync(galleryFile, 'utf8'));

class RequestError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function writeGallery(photos: GalleryPhoto[]) {
  const temporary = `${galleryFile}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(photos, null, 2) + '\n', { flag: 'wx' });
  try {
    renameSync(temporary, galleryFile);
  } catch (error) {
    unlinkSync(temporary);
    throw error;
  }
}

function imageExtension(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'jpg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  throw new RequestError('Bitte wählen Sie ein JPEG-, PNG- oder WebP-Bild.');
}

async function readOperation(request: IncomingMessage): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] ?? '')) {
    throw new RequestError('Ungültiges Anfrageformat.', 415);
  }
  if (Number(request.headers['content-length']) > maxRequestBytes) throw new RequestError('Das Bild ist zu groß.', 413);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxRequestBytes) throw new RequestError('Das Bild ist zu groß.', 413);
    chunks.push(chunk);
  }
  let operation: unknown;
  try {
    operation = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new RequestError('Ungültige Anfrage.');
  }
  if (!operation || typeof operation !== 'object' || Array.isArray(operation)) {
    throw new RequestError('Ungültige Anfrage.');
  }
  return operation as Record<string, unknown>;
}

function photoDetails(operation: Record<string, unknown>) {
  const alt = typeof operation.alt === 'string' ? operation.alt.trim() : '';
  if (!alt || alt.length > 200 || typeof operation.origin !== 'string' || !Object.hasOwn(galleryOrigins, operation.origin)) {
    throw new RequestError('Bitte geben Sie einen Alternativtext und die Herkunft des Bildes an.');
  }
  return { alt, origin: operation.origin as GalleryPhoto['origin'] };
}

function applyOperation(operation: Record<string, unknown>) {
  const photos = readGallery();
  if (operation.action === 'add') {
    const details = photoDetails({ alt: 'Galeriefoto', origin: 'photo', ...operation });
    const images = operation.images ?? [operation.image];
    if (!Array.isArray(images) || images.length < 1 || images.length > maxPhotosPerUpload) {
      throw new RequestError('Bitte wählen Sie zwischen 1 und 5 Bildern aus.');
    }
    const pending = images.map(image => {
      if (typeof image !== 'string') throw new RequestError('Ungültige Bilddatei.');
      const bytes = Buffer.from(image, 'base64');
      if (bytes.length > maxImageBytes) throw new RequestError('Das Bild ist zu groß.', 413);
      const filename = `${randomUUID()}.${imageExtension(bytes)}`;
      return { bytes, filename, destination: resolve(uploads, filename) };
    });
    mkdirSync(uploads, { recursive: true });
    const written: string[] = [];
    try {
      for (const { bytes, filename, destination } of pending) {
        writeFileSync(destination, bytes, { flag: 'wx' });
        written.push(destination);
      }
      photos.unshift(...pending.map(({ filename }) => ({ file: `gallery/${filename}`, ...details })));
      writeGallery(photos);
    } catch (error) {
      for (const destination of written) unlinkSync(destination);
      throw error;
    }
    return photos;
  }

  const index = photos.findIndex(photo => photo.file === operation.file);
  if (index < 0) throw new RequestError('Das Bild wurde bereits entfernt.', 409);
  if (operation.action === 'remove') {
    photos.splice(index, 1);
  } else if (operation.action === 'edit') {
    photos[index] = { ...photos[index], ...photoDetails(operation) };
  } else if (operation.action === 'move' && (operation.direction === -1 || operation.direction === 1)) {
    const next = index + operation.direction;
    if (next < 0 || next >= photos.length) throw new RequestError('Das Bild kann nicht weiter verschoben werden.', 409);
    [photos[index], photos[next]] = [photos[next], photos[index]];
  } else {
    throw new RequestError('Unbekannte Aktion.');
  }
  writeGallery(photos);
  return photos;
}

function sendJson(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  try {
    if (request.method === 'GET') return sendJson(response, 200, readGallery());
    if (request.method !== 'POST') return sendJson(response, 405, { error: 'Methode nicht erlaubt.' });
    const scheme = request.socket instanceof TLSSocket ? 'https:' : 'http:';
    if (request.headers.origin !== scheme + '//' + request.headers.host) {
      return sendJson(response, 403, { error: 'Nur Anfragen von der lokalen Admin-Seite sind erlaubt.' });
    }
    sendJson(response, 200, applyOperation(await readOperation(request)));
  } catch (error) {
    if (error instanceof RequestError) return sendJson(response, error.status, { error: error.message });
    console.error('Local gallery editor:', error);
    sendJson(response, 500, { error: 'Die Galerie konnte nicht gespeichert oder geladen werden.' });
  }
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function galleryAdmin(): Plugin {
  let base = '/';
  return {
    name: 'local-gallery-editor',
    configResolved(config) { base = config.base; },
    handleHotUpdate({ file, modules, server }) {
      if (resolve(file) !== galleryFile) return;
      for (const module of modules) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: 'custom', event: 'gallery:changed', data: null });
      return [];
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0];
        if (path !== '/admin' && !path?.startsWith('/admin/')) return next();
        const remote = request.socket.remoteAddress;
        if (!localHost.test(request.headers.host ?? '') || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote ?? '')) {
          return sendJson(response, 403, { error: 'Die Galerieverwaltung ist nur lokal verfügbar.' });
        }
        if (path === '/admin/gallery') return void handleRequest(request, response);
        if (path === '/admin') {
          response.writeHead(302, { Location: '/admin/' });
          return response.end();
        }
        next();
      });
    },
    transformIndexHtml(html) {
      const marker = '<!-- gallery-photos -->';
      if (!html.includes(marker)) return html;
      const photos = readGallery();
      const markup = photos.map(({ file, alt, origin }) => {
        if (!imagePath.test(file)) throw new Error(`Unsupported gallery image path: ${file}`);
        return `<figure><img src="${escapeHtml(base)}images/${file}" alt="${escapeHtml(alt)}" loading="lazy" /><figcaption class="gallery-photo-origin">${galleryOrigins[origin]}</figcaption></figure>`;
      }).join('\n');
      return html.replace(marker, () => markup || '<p>Derzeit sind keine Visualisierungen verfügbar.</p>');
    },
  };
}
