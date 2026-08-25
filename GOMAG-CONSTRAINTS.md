# Gomag transport constraints — verified 2026-08-25

Facts established by fetching the live `theme/100.css` / `theme/100.js` from
`matvero.gomag.ro` and diffing them against the repo files that were pasted in.
These are **platform behaviours**, not style preferences.

## `theme/100.*` is a concatenation, not a file

Design → Tools CSS/JS is a *list* of independently toggleable snippets. Gomag
concatenates every enabled entry into one served file.

| Served file | Composition (as of 2026-08-25) |
|---|---|
| `theme/100.css` | 1249 lines = `blocks/base.css` (512) + our block (737) |
| `theme/100.js`  | 593 lines  = `blocks/base.js` (112)  + our block (478) |

`Schimba culoarea menu bar ului` is currently disabled and contributes nothing.

Editing "our" block in isolation means editing one fragment of a larger
stylesheet.

### The base block has been patched by accumulation

`blocks/base.css` contains **5 separate `:root` blocks**. Nobody edited the
original declaration; they appended a new override each time. Last-wins:

    --primary: #FE5210     (declared)
    --primary: #FE5210     (declared again)
    --primary: #97382e     (wins)

    --container-h: 1300px  (declared)
    --container-h: 1322px  (wins)

So the orange is **dead** — declared twice, overridden, still shipping. The
effective brand colour is `#97382e`.

Health of the base block: **386 `!important` across 563 selectors** (69% of
rules are fighting something) and 28 duplicated selectors. This is the actual
disease — not any single bug.

### Two near-identical reds are live right now

| Element | Colour | Source |
|---|---|---|
| `.mv-btn--primary`, `.mv-cat--accent`, `.mv-kicker__bar` | `#8C2D19` | our block, hardcoded |
| anything using `var(--primary)` | `#97382e` | base block |

Six percent apart — close enough to look like a rendering error rather than a
choice. Our block must consume `var(--primary)` instead of hardcoding, and
`--primary` should be set **once**.

## Gomag corrupts JavaScript on save

Confirmed by diffing pasted source against what is actually served.

### 1. HTML entities are decoded

    pasted:   { '&': '&amp;', '<': '&lt;' }
    served:   { '&': '&',     '<': '<'    }

Any `&amp;` / `&lt;` / `&gt;` / `&quot;` literal collapses to the bare
character. An HTML-escaping helper written the obvious way becomes a no-op the
moment it is saved — which is exactly what happened to `esc()`, twice.

**Workaround:** never write an entity literal. Build it:

    var AMP = '&' + 'amp;';          // survives
    var LT  = '&' + 'lt;';

### 2. Backslashes are doubled

    pasted:   /\s+/g          .replace(/cite(s|ș)te mai mult\.*$/i, '')
    served:   /\\s+/g         .replace(/cite(s|ș)te mai mult\\.*$/i, '')

`/\\s+/` matches a literal backslash followed by `s`, not whitespace. Every
regex with a backslash escape silently stops matching. 4 such regexes are
broken on the live site right now (`tidyBlogCards`, the phone-number cleanup).

**Workaround:** keep backslashes out of the source and build them at runtime:

    var BS = String.fromCharCode(92);
    var WS = new RegExp(BS + 's+', 'g');

Or avoid regex where a plain string method will do.

### 3. Everything is wrapped in a silent try/catch

The served file ends with:

    })();
    } catch (e) { console.log(e); }

Gomag wraps the whole block. A thrown error is swallowed into a `console.log`,
so a broken script looks like a script that simply did nothing. Never rely on an
uncaught error being visible — log deliberately.

### 4. Line endings become CRLF

Cosmetic; the CSS diff was 100% CRLF noise. Normalise with `tr -d '\r'` before
comparing, or every line reads as changed.

## CSS is NOT affected

The pasted CSS came back byte-identical modulo CRLF. No entity decoding, no
backslash doubling. CSS can be pasted verbatim.

Note: an earlier claim in this repo that the editor rejects `var()`, `gap`,
`grid` and `clamp` is **false**. The live CSS uses `var()` 38 times and `gap:`
10 times. That claim came from a comment header, not from the platform.

## Before pasting any JS

Check it round-trips. `sync.py` fetches the live files and diffs them against
the repo blocks, which is the only reliable way to learn what the platform did
to the code after it left your hands.
