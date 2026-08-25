# Matvero — Gomag theme customization

## What this is

E-commerce site for Matvero (building materials — Torggler silicone sealants
and roof-fixing products), built on **Gomag**, a Romanian SaaS e-commerce
platform. Domain: matvero.gomag.ro. Underlying theme is Gomag's stock
"fashion" theme (`gomagcdn.ro/themes/fashion/*`) — its HTML templates and
core CSS/JS are NOT editable.

## The only two levers we have

Gomag exposes exactly two custom code injection points, edited in
**Gomag admin > Aspect > Editor cod**:

- **JS editor** → deployed as `theme/100.js` on the live site
- **CSS editor** → deployed as `theme/100.css` on the live site

jQuery 2.1.4 is already loaded site-wide — use `$` freely, no need to
check for it or load it.

There is no other access: no server, no template files, no build step.
Everything — layout changes, new sections, bug fixes, "modern redesign" —
has to be achieved by CSS overrides and jQuery DOM manipulation injected
through these two files.

## Workflow in this repo

- `Site.css` and `Site.js` in this repo are the local source of truth,
  mirroring what goes into the Gomag CSS/JS editors above.
- After each implementation/edit, update `Site.css` and/or `Site.js` with
  the latest full version.
- The user copies the full file contents from this repo and pastes them
  into the Gomag configurator (CSS editor / JS editor) to deploy. There is
  no automated deploy — always hand back the complete, current file
  content, not a diff, since that's what gets pasted wholesale.
- Decision: starting fresh. `Site.css`/`Site.js` are being written from
  scratch in this repo, superseding whatever is currently live in the
  Gomag CSS/JS editors (including the 6 features described in the old
  `theme/100.js` comment header — hero injection, trust bar, category
  grid, "why us" block, CTA band, header-scroll effects). The user pastes
  the full contents of `Site.css`/`Site.js` over the existing editor
  content, replacing it wholesale.

## Rendering the site locally

`python3 preview.py` serves the homepage at `http://localhost:8080`, with the
Gomag-hosted `theme/100.css` / `theme/100.js` swapped for the local
`Site.css` / `Site.js`. Theme CSS/JS, jQuery, fonts and images still come from
Gomag's CDN, so the render matches production. Edit a file, refresh, see it.

`mobile-frame.html` (served at `/mobile-frame.html`) is a fixed-width iframe
harness for narrow breakpoints — resizing the Chrome window does not reliably
change `window.innerWidth`.

Run `/design-audit` for the full audit-and-fix procedure.

## `SourceCode.html`

Raw server-rendered HTML of the homepage — a "view source" style snapshot
**before** any custom JS runs (script tags are present, but their
DOM-injected output is not). Use it as the ground-truth reference for:

- exact class names / DOM structure to target with CSS selectors
- what markup jQuery in `Site.js` will actually find at `document.ready`

Since HTML templates can't be edited, any new section (hero, trust bar,
category grid, "why us" block, CTA band, etc.) has to be injected into the
DOM via `Site.js` and styled via `Site.css` — not added to the HTML source.

## Other customization channels (outside `Site.css`/`Site.js`)

Some homepage content is managed as separate Gomag CMS content
blocks/widgets, not through the 100.css/100.js pair — e.g. the current
"Hello Bar" banner (`.mtv-alert-banner`, homepage component id 330) ships
its own inline `<style>` block embedded directly in that CMS block. We
can still target these elements from `Site.css`/`Site.js` by class name,
but editing their own inline styles requires the user to go into that
specific Gomag content block, not the global CSS/JS editor.

## Current catalog state

Minimal / early-stage store: 2 products (Torggler Lamiera — sealant and
roof-fixing variants), 2 categories (*Fixaje de acoperiș*,
*Silicon și Etanșanți*). Design work should look intentional and
professional even with a sparse catalog, not assume a large product grid.

## Known template-level issues (Gomag-generated, can only be patched via JS)

- Homepage renders multiple `<h1>` tags (product-carousel section title,
  blog section title, each of the 3 blog post titles) — a semantic/SEO
  issue baked into the theme templates. Can be corrected client-side via
  jQuery (retag to `<h2>`/`<p>`) if desired, not by editing HTML directly.
