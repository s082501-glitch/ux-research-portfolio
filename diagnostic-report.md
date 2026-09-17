# Case Study Diagnostic Report

Generated from static file inspection and Playwright measurements at **1440×900** viewport against `http://127.0.0.1:8000/case-study.html`. No code was changed.

---

## 1. HERO MOCK STRUCTURE

### Finding: single wrapper element, two-column interior

`.cs-mock--hero` is **one** outer element (`<div>`). It is not two sibling mock frames at the page level. The “split box” appearance comes from **two grid children inside** `.cs-mock-body`: a dark `.cs-mock-sidebar` (220px column) and a light `.cs-mock-canvas` (`1fr` column) with contrasting backgrounds.

### Complete HTML for `.cs-mock--hero` (opening tag through closing tag)

```html
        <div class="cs-mock cs-mock--hero" aria-label="Super Labs agent builder interface">
          <div class="cs-mock-chrome">
            <span></span><span></span><span></span>
          </div>
          <div class="cs-mock-body">
            <div class="cs-mock-sidebar">
              <div class="cs-mock-sidebar-bar"></div>
              <div class="cs-mock-sidebar-bar"></div>
              <div class="cs-mock-sidebar-bar"></div>
              <div class="cs-mock-sidebar-bar"></div>
              <div class="cs-mock-sidebar-bar"></div>
            </div>
            <div class="cs-mock-canvas">
              <div class="cs-mock-card">
                <div class="cs-mock-card-title"></div>
                <div class="cs-mock-card-line"></div>
                <div class="cs-mock-card-line"></div>
                <div class="cs-mock-card-line"></div>
                <div class="cs-mock-btn-row">
                  <div class="cs-mock-btn"></div>
                  <div class="cs-mock-btn cs-mock-btn--ghost"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
```

Source: `case-study.html` lines 39–64.

### CSS: width / layout for sidebar and canvas sibling

**Parent grid (positions sidebar + canvas side by side):**

```css
.cs-mock--hero .cs-mock-body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0;
}
```

**Sidebar (`.cs-mock-sidebar`):**

```css
.cs-mock-sidebar {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

No explicit `width` on `.cs-mock-sidebar`; grid assigns **220px** via `grid-template-columns: 220px 1fr`.

**Canvas sibling (`.cs-mock-canvas`):**

```css
.cs-mock-canvas {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
```

No explicit `width`; grid assigns the remaining **`1fr`** column.

**Outer mock width rules:**

```css
.cs-media-zone > .cs-mock--hero {
  width: 100%;
  max-width: 100%;
}

.cs-mock {
  width: 100%;
  display: block; /* computed at runtime */
}

.cs-mock--hero {
  aspect-ratio: 16 / 10;
}
```

### Measured rendered widths @ 1440px

| Element | display (computed) | rendered width (px) |
|---|---|---:|
| `.cs-mock.cs-mock--hero` | block | 1072 |
| `.cs-mock-body` | grid | 1072 |
| `.cs-mock-sidebar` | flex | 220 |
| `.cs-mock-canvas` | flex | 852 |

### Is `.cs-mock-canvas` empty?

**No.** It contains a full `.cs-mock-card` subtree with placeholder UI chrome (title bar, three lines, two buttons). The card uses empty `<div>` elements styled as skeleton UI — no text content, but the structure is not empty.

### Why it renders as two visually separate boxes

1. **Intentional two-column mock UI layout** — `.cs-mock-body` is `display: grid` with `220px 1fr`.
2. **Contrasting backgrounds** — sidebar uses dark gradient (`#2d2d2d` → `#1a1a1a`); body area uses light gradient on `.cs-mock-body` (`#fafafa` → `#ececec` → `#f5f5f5`), so the canvas column reads as a separate gray panel beside the black sidebar.
3. **No gap between columns** (`gap: 0`), so the split is a hard color boundary, not two detached page-level elements.

---

## 2. TEXT WIDTH MISMATCH

### Elements compared

| | Highlight slide copy | Story paragraph below highlights |
|---|---|---|
| **Selector** | `.cs-highlight-slide .cs-highlight-copy` (first slide) | `#section-story .cs-chapter.reveal .cs-prose` (first paragraph: “Super Labs is a B2B platform…”) |
| **Rendered width @ 1440px** | **411.484 px** | **636.109 px** |
| **text-align (computed)** | **center** | **start** |
| **max-width (computed)** | **411.488 px** (`28ch`) | **636.12 px** (`62ch`) |
| **margin-left / margin-right** | **290.25 px / 290.25 px** (`0 auto` centering) | **0 px / 0 px** |

**Width difference:** prose is **224.625 px wider** than highlight copy at 1440px.

### CSS rules causing the difference

**Highlight copy (narrower, centered):**

```css
.cs-highlight-copy {
  font-family: var(--font-absans);
  font-size: clamp(17px, 2vw, 22px);
  font-weight: 400;
  line-height: 1.35;
  color: var(--text-primary);
  max-width: 28ch;
  margin: 0 auto;
  text-align: center;
}
```

**Story prose (wider, left-aligned):**

```css
.cs-prose {
  font-family: var(--font-dm-sans);
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-primary);
  max-width: 62ch;
}
```

**Cause:** `.cs-highlight-copy` caps at **`28ch`** and centers with **`margin: 0 auto`** + **`text-align: center`**. `.cs-prose` caps at **`62ch`** with default left alignment and no auto margins. Different `ch` limits (28 vs 62) are the primary width difference; alignment differs because only the highlight rule sets `text-align: center`.

Parent containers are both **1072 px** wide (slide vs chapter section). The mismatch is typography rules on the `<p>` elements, not parent width.

---

## 3. REVEAL ANIMATION

### Every `.reveal` element in `case-study.html` (10 total)

| # | Element | Location in file |
|---|---|---|
| 1 | `section#section-hero.cs-scroll-section.reveal` | line 31 |
| 2 | `section#section-highlights.cs-scroll-section.reveal` | line 112 |
| 3 | `#section-story .cs-body > section.cs-chapter.reveal` (intro, no heading) | line 175 |
| 4 | `#section-story .cs-body > section.cs-chapter.reveal` (“The challenge”) | line 180 |
| 5 | `#section-story .cs-body > section.cs-chapter.reveal` (journey mock) | line 194 |
| 6 | `#section-story .cs-body > section.cs-chapter.reveal` (“What we heard”) | line 229 |
| 7 | `#section-story .cs-body > section.cs-chapter.reveal` (“How we approached it”) | line 251 |
| 8 | `#section-story .cs-body > section.cs-chapter.reveal` (“What we shipped”) | line 279 |
| 9 | `#section-story .cs-body > section.cs-impact.reveal` | line 336 |
| 10 | `#section-story .cs-body > section.cs-chapter.reveal` (“Looking back”) | line 354 |

Note: Other elements use `cs-mock--hero` in the story section (lines 283, 307) but those mocks do **not** have `.reveal`.

### IntersectionObserver setup (`case-study.js`)

**Early-exit guard (runs before carousel + reveal init):**

```javascript
(function () {
  const caseStudy = document.querySelector('.case-study');
  const carousel = document.querySelector('.cs-highlights-carousel');
  if (!carousel || !caseStudy) return;
  // ... entire file including initScrollReveal() is skipped if guard fails
```

**`initScrollReveal()` — exact observer block:**

```javascript
  function initScrollReveal() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reveals = document.querySelectorAll('.reveal');

    if (reduced) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }
```

Called at end of IIFE: `initScrollReveal();` (line 137).

**Observer count:** one `IntersectionObserver` instance per page load.

### CSS for `.reveal` and `.reveal.is-visible` (`case-study.css`)

**Both rules exist** inside `@media (prefers-reduced-motion: no-preference)`:

```css
@media (prefers-reduced-motion: no-preference) {
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }

  .reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Reduced-motion fallback also present:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
  }
}
```

CSS has **not** been removed or overwritten by later edits in this file.

### Script tag in `case-study.html`

```html
  <script src="assets/js/case-study.js"></script>
```

- **Present:** yes (line 369, before `</body>`)
- **Path:** `assets/js/case-study.js` (relative — correct for `case-study.html` at repo root)
- **`defer` attribute:** **not present**
- **Typo / wrong path:** none detected; page returns HTTP 200 and script executes (carousel + reveal init run)

### Browser console @ page load (Playwright, 1440×900)

**JS errors:** none (`pageerror` and `console.error` listeners reported empty array).

### Runtime reveal state @ initial load (1440×900)

| Element | `.is-visible` | opacity | transform |
|---|---|---|---|
| `#section-hero` | yes | 1 | `translateY(0)` |
| `#section-highlights` | no | 0 | `translateY(20px)` |
| Story `.reveal` chapters (8) | no | 0 | `translateY(20px)` |

`#section-hero` intersects on load (~59% visible) and receives `.is-visible` immediately. Below-fold sections remain hidden until scroll crosses **20% visibility** threshold.

**After scrolling first story chapter into view:** `#section-highlights` and first two `.cs-chapter.reveal` elements gained `.is-visible` — observer **does fire** when elements enter viewport.

**If animation appears not to fire:** likely because (a) elements below the fold start at `opacity: 0` until scrolled, or (b) `threshold: 0.2` requires 20% of the element visible before trigger — tall sections need more scroll than expected.

---

## 4. FILE WRITE CONFIRMATION

- **File path:** `diagnostic-report.md` (project root)
- **Write status:** successful
- **Line count:** 305
