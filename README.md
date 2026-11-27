# KK Construction GbR

`npm ci` installs dependencies. `npm run dev` starts the local site. `npm run build` writes the deployable site to `dist/`, and `npm run preview` serves that build locally.

## Content and configuration

- Edit services in `src/content/landingPage.ts`. Gallery entries live in `src/content/gallery.json`. Add completed work to a future **Referenzen** section using approved photos.
- Edit the company and contact copy in `src/pages/LandingPage.tsx`. Reflect content changes in the no-JavaScript markup in `index.html`.
- Add official social URLs in `src/config/socialLinks.ts`. Update the legal pages in `impressum/index.html` and `datenschutz/index.html` with the approved text.
- Copy `.env.example` to `.env.local` for local configuration. Set `VITE_FORMSPREE_FORM_ID` to the form endpoint ID. Set `VITE_SITE_URL` to the public HTTPS homepage URL to generate the sitemap, canonical URL, and absolute social preview image. Supply the same variables in the hosting build environment.
- Git is the current editing workflow. Agree with the company on the ongoing workflow and access before handover.

## Local photo editor

Start `npm run dev` and open `http://localhost:5173/admin/` (use the port shown by Vite). Add JPEG, PNG, or WebP files up to 5 MB, edit the alt text and provenance, reorder entries, or remove them from the gallery. Uploads are stored in `public/images/gallery/`. Removing an entry keeps the image file on disk. Commit the JSON and new image files to publish them through the normal build and deploy workflow.

The editor and its write endpoint are available only in the local development server. A hosted editor needs authenticated access and persistent storage or Git-backed publishing.

## Launch acceptance

1. Obtain approved Impressum and privacy texts and the official Instagram URL. Verify the contact details taken from the draft. Publish the approved legal pages and remove their draft notices and `noindex` directives. Replace or remove the draft PDF from the published output.
2. Configure the official recipient and verify notification delivery through Formspree. Test the honeypot, form errors, and a successful submission.
3. On staging, record hosting and log-retention details, Formspree behavior, and the intro’s browser storage. Verify consent requirements against the deployed site and the approved legal text.
4. Configure HTTPS redirects and host-level security headers. Back up the source, deployment settings, and form configuration, then verify that a known-good build can be restored.
5. Test Safari, Chrome, Firefox, and Edge at phone, tablet, and desktop widths. Check keyboard navigation, focus, contrast, zoom, reduced motion, the no-JavaScript path, image loading, and Core Web Vitals.
6. Confirm image rights and AI provenance, review the animation with the owner and Igor using `?intro=1`, and transfer repository, hosting, domain, and Formspree access. Obtain final approval before deployment.
