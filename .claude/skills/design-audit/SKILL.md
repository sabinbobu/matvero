---
name: design-audit
description: Audit the Matvero storefront for visual bugs and design flaws, fix them in Site.css/Site.js, and verify each fix by re-rendering. Use when asked to check the site design, hunt UI bugs, or review how the storefront looks.
---

# Matvero design audit

Find what's visually broken or badly designed on the storefront, fix it in
`Site.css` / `Site.js`, and prove each fix with a screenshot.

Read `CLAUDE.md` first — it carries the Gomag platform constraints (two
editable files, no HTML access, jQuery preloaded). This skill carries the
*procedure*.

## 1. Render before you judge

```bash
python3 preview.py          # http://localhost:8080
```

This serves `SourceCode.html` with the Gomag-hosted `theme/100.css` and
`theme/100.js` swapped for the local `Site.css` / `Site.js`. Everything else
— jQuery, fonts, product images — still loads from Gomag's CDN, so what you
see matches production.

**Open it and look at it.** In the last audit, three real bugs were found:
only one was visible by reading source. The other two — a footer collapsing
to half-empty, and above-fold content painting blank before animating in —
existed only in pixels. Reading `Site.css` would never have surfaced them.

Never report a *visual* claim you got from static reading. Render it, screenshot
it, then describe what you saw.

Stop the server when done: `pkill -f preview.py`. Don't narrow the pattern to
a port — `preview.py` defaults to 8080 with no argument, so `pkill -f
"preview.py 8080"` matches nothing and leaves the server orphaned, which makes
the next run fail to bind.

## 2. Breakpoints

| Width | What it exercises |
|-------|-------------------|
| 1440px | Desktop — full multi-column layouts |
| 1024px | The `max-width:1199px` branch in `Site.css` |
| 390px  | The `max-width:767px` branch |

**Resize gotcha:** resizing the Chrome window does not reliably change
`window.innerWidth` — it stayed pinned at 2240 across resize calls in the last
session, silently invalidating every "mobile" screenshot. Verify with
`javascript_tool`: `({w: innerWidth, h: innerHeight})`. If it won't move, use
the iframe harness at `/mobile-frame.html` (a fixed-width iframe pointing at
`/`), which gives a genuine narrow viewport regardless of window size. Zoom
into the iframe region to read it.

## 3. Bug classes that have actually bitten this codebase

Hunt these specifically. Each one shipped here at least once:

- **Helpers that silently no-op.** `esc()` mapped every character to itself
  (`{'&':'&', '<':'<'}`), so nothing was ever escaped while looking like it
  was. Check that guard functions actually guard.
- **Reveal-on-load flash.** `mv-reveal` starts at `opacity:0` and waits for
  IntersectionObserver. Applied to above-fold content, that reads as *missing
  content*, not animation. Anything in the initial viewport must paint
  immediately.
- **Theme grid vs JS `display:none`.** The theme's footer uses float-based
  `col-md-3`. Hiding one column from JS does not let siblings reclaim the
  width — you get dead space. When JS hides a themed element, check the
  parent's layout model.
- **Lazy images measuring zero.** Product thumbnails are `loading="lazy"`;
  `naturalWidth` is 0 at first measure. This is why `fitProductImages` runs
  retry passes at 400ms and 1500ms plus a `load` listener. Any new
  measurement code needs the same treatment.
- **CMS blocks painting before `Site.js` runs.** `.mtv-alert-banner` lives in
  a Gomag CMS content block with its own inline `<style>`, appears early in
  the DOM, and self-animates in — long before the bottom-of-body `Site.js`
  can hide it. Hiding such a block from CSS produces a visible flash, not a
  clean removal.
- **Specificity wars.** The theme ships its own `!important` rules. If an
  override "doesn't work," inspect computed styles before assuming the
  selector is wrong.
- **Sparse-catalog layout.** 2 products and 2 categories in grids sized for
  many. Distinguish "the CSS is broken" from "the catalog is small" — they
  look identical in a screenshot and only one is worth fixing.

## 4. Gomag editor constraints

The platform's CSS editor rejects modern syntax. From the `Site.css` header:

- No `var()`, no `grid`, no `gap`, no `inset`, no `clamp`
- Flexbox and percentages only
- `!important` warnings in the editor are intentional — without them the
  theme wins

Write CSS that would have been valid in 2016. This is not a style preference;
non-conforming CSS gets flagged as an error and won't save.

## 5. Fix rules

- CSS overrides and jQuery DOM injection only. HTML templates are not editable.
- No new dependencies. jQuery 2.1.4 is already global.
- Match the existing conventions: Romanian comments that explain **why**, not
  what. Look at the surrounding code before writing.
- Smallest diff that solves the problem. No drive-by refactors, renames, or
  reformatting.
- Never edit `SourceCode.html` — it's a read-only reference snapshot of the
  server-rendered markup, not a page we serve.

## 6. Output contract

**`Site.css` and `Site.js` must end up complete and current.** They get pasted
wholesale into the Gomag editors, so the working files in this repo are the
deliverable. Do not hand back fragments or ask the user to splice a diff.

For each fix:
1. Make the edit
2. Re-run the preview and screenshot the affected area
3. Only then call it done

Report structure:
- **Findings** — each with `path:line`, what's wrong, and why it matters
- **Fixed** — what changed, and what the screenshot showed after
- **Not fixable from these files** — anything that requires the Gomag CMS
  block editor instead (e.g. removing a CMS content block outright). Say so
  explicitly rather than papering over it from CSS.

## 7. Honesty

- Never claim a fix works unless it was executed and observed this session.
  Anything else gets prefixed `UNVERIFIED:`.
- Say what you did not check.
- Report failures verbatim — no compressing a broken render into "minor
  visual issue."
- If a previous claim was wrong: "I was wrong about X," plus the correction.

## 8. Scope

Homepage only. `SourceCode.html` is a homepage snapshot — there is no captured
markup for product, category, cart, or checkout pages, so they cannot be
rendered or audited. State that limit in the report; do not speculate about
pages you can't see.
