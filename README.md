# 💜 For You

A small interactive slider website — a love confession.
Four screens: intro, a letter, a galaxy made of "I love you" in many languages, and a finale.

> Built with love, `three.js`, and an unreasonable amount of purple.

---

## ✨ What's Inside

| Slide | What happens |
|---|---|
| **1. Intro** | Dark background, text fades in, "Next" button |
| **2. Letter** | A "paper" sheet with a note about love being a choice. Tilted, shadowed, handwritten font |
| **3. Galaxy** | A 3D galaxy made of 200+ "I love you" phrases in different languages. Rotates on its own, draggable, zoomable — you can read the words |
| **4. Finale** | "I love you so much" + a pulsing heart |

**Controls:**
- `→` / `←` — switch slides with the keyboard
- swipe left / right — on mobile
- mouse / finger — rotate the galaxy
- wheel / pinch — zoom in

---

## 🛠 Stack

- **Vite** — build tool and dev server
- **Vanilla HTML / CSS / JS** — no frameworks
- **Three.js** — the 3D galaxy
- **OrbitControls** — rotation and zoom with inertia

---

## 📁 Project Structure

```
love-slider/
├── index.html            # markup for all 4 slides
├── favicon.svg           # icon (heart / galaxy)
├── package.json
├── vite.config.js        # (if present)
├── README.md
└── src/
├── main.js           # slide switching, swipes, keyboard
├── style.css         # all styles: slides, letter, galaxy, buttons
└── galaxy.js         # Three.js scene: word sprites, dust, core, stars
```

---

## 🚀 Getting Started

### Requirements
- Node.js 18+
- npm

### Install

```bash
# 1. clone / unzip the project
cd love-slider

# 2. install dependencies
npm install

# 3. start the dev server
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

### Production build

```bash
npm run build
```

The output goes to `dist/` — that's what you deploy.

### Preview the build locally

```bash
npm run preview
```

---

## 🌐 Deployment (so you can send a link)

### Option 1 — Netlify Drop (fastest, 10 seconds)

1. `npm run build`
2. Open [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page
4. Get a link like `https://random-name.netlify.app`

### Option 2 — Vercel

1. Push the project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → pick the repo
3. Vercel detects Vite automatically → hit **Deploy**
4. Get a link like `https://love-slider.vercel.app`

### Option 3 — GitHub Pages

```bash
npm run build
```

Push the contents of `dist/` to the `gh-pages` branch (or use repo settings → Pages → Source: GitHub Actions). Don't forget to set `base: '/repo-name/'` in `vite.config.js`.

---

## 🎨 Customization

### Slide texts
Edit them directly in `index.html` — each slide is a `<section class="slide">`.

### Words in the galaxy
In `src/galaxy.js`, the `PHRASES` array at the top:

```js
const PHRASES = [
  'I love you',
  'Je t\'aime',
  // add or remove languages
];
```

### Colors
The main accent lives in `src/style.css`:

```css
:root {
  --accent: #ff4d8d;       /* primary pink */
  --accent-soft: #ff8fb1;  /* soft pink */
  --bg-dark: #0a0614;      /* background */
}
```

### Galaxy density
In `src/galaxy.js`:

```js
const ARMS = 4;              // number of spiral arms
const PER_ARM = 55;          // words per arm (55 × 4 = 220 words)
const GALAXY_RADIUS = 200;   // galaxy radius
const SPIRAL_TIGHTNESS = 3.6;// how tight the spiral is
```

If it stutters on a low-end phone, drop `PER_ARM` to `35` and `dustCount` from `4000` to `2000`.

### Rotation speed
```js
controls.autoRotateSpeed = 0.35; // 0.2 — slow, 1 — fast
```

### Camera angle (top-down vs side)
```js
camera.position.set(0, 260, 140); // y — height, z — tilt
```

---

## 🧪 Tested Browsers

- ✅ Chrome / Edge (last 2 versions)
- ✅ Firefox (last 2 versions)
- ✅ Safari (macOS + iOS 15+)
- ✅ Chrome Mobile (Android)

WebGL is required for the galaxy slide. On very old devices slide 3 may fail to render — everything else still works.

---

## 📝 Notes

- **Favicon** — `favicon.svg` in the project root. Browsers cache favicons aggressively; if it doesn't update, hard refresh with `Ctrl+Shift+R`.
- **Fonts** — loaded via Google Fonts (`Caveat` / `Marck Script` for the letter, `Georgia` for the rest). For a fully offline build, download `.woff2` files into `public/fonts/` and load them via `@font-face`.
- **Import map for three** — if the project is opened **without Vite** (double-click on `index.html`), you need an `importmap` in `<head>`:
  ```html
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/"
    }
  }
  </script>
  ```
  When running through `npm run dev`, this isn't needed — Vite resolves `"three"` on its own.

---

## 💡 Roadmap

- [ ] Background music with a "play" button (autoplay is blocked by browsers)
- [ ] Bloom post-processing for the galaxy (`UnrealBloomPass`)
- [ ] Highlight the word under the cursor (raycasting)
- [ ] Heart-shaped fireworks on the finale slide
- [ ] Personalization: her name on the last slide, the date you met
- [ ] A "I love you too ❤" button → `wa.me` or `mailto`

---

## 📄 License

Personal project. Do whatever you want with it — but ideally, give it to someone you love 💜