# A Little Universe for U

A complete seven-chapter birthday gift built with React, Vite, Tailwind CSS, Framer Motion, Lucide, Canvas Confetti, and jsPDF. All artwork and the included instrumental were created for this project. No personal memories or third-party photographs are invented.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
cd birthday-for-u
npm install
npm run dev
```

Open the URL Vite prints. To create and inspect a production build:

```bash
npm run build
npm run preview
```

## Add your photos

Place photos directly in `public/photos/`, for example:

```
public/photos/memory-1.jpg
public/photos/memory-2.jpg
...
public/photos/memory-100.jpg
```

JPG, JPEG, PNG, WebP, and AVIF are discovered by Vite at build time. Any filename is accepted; numbers sort naturally. Restart the development server after adding files, and rebuild/redeploy the production version. More than 100 images automatically expand the gallery. With fewer images, the remaining slots use the 100 supplied original SVG illustrations. There are no broken-image requests for unfilled slots, and failed photos fall back to the illustrations.

Use reasonably sized photos (roughly 1200–1800px on the long edge), WebP/AVIF where possible, and strip private GPS metadata before sharing. Images load lazily. Originals remain available in the viewer, so optimize files before adding a large collection.

## Captions and messages

Edit `src/data/memories.js` to add captions keyed by filename:

```js
export const captions = {
  'memory-1.jpg': 'Your own caption here.',
  'a-favorite-picture.webp': 'Another little moment to treasure.'
};
```

Edit `src/data/messages.js` for the letter, final message, appreciation notes, and configuration. Adjust `placeholderCount` to change the minimum number of gallery slots. Gallery code never needs to change when adding photos.

## Music and effects

`public/music/little-universe.wav` is an original synthesized instrumental composed for this project; you may use, change, and redistribute it with this gift. It loops softly, and starts only when the visitor explicitly presses the music control. Sound effects have their own separate speaker control, disabled by default. The slideshow offers access to the same music toggle and does not override the visitor's choice.

To use another properly licensed instrumental, put it in `public/music/` and change `config.music` in `src/data/messages.js`. Keep any required attribution and licence with your replacement. An unavailable track never prevents the rest of the experience from working.

## Optional birthday countdown

Disabled by default. Set a full ISO date with an explicit timezone offset:

```js
birthday: '2027-06-15T00:00:00+01:00'
```

The welcome screen shows the remaining days, hours, minutes, and seconds. At the configured instant, the countdown automatically switches to the available gift-opening button. A missing, invalid, or past date leaves the gift available immediately.

## Interactions and accessibility

- Open the gift to begin; navigate freely using chapter links and the progress rail.
- Gallery: initially 12 cards, 12 more per click, show all, or collapse.
- Fullscreen viewer: previous/next buttons, arrow keys, Escape, and horizontal touch swipes.
- Slideshow: play/pause and 3, 5, or 8 second intervals. Default 5 seconds.
- Letter: animated envelope, progressive paragraphs, downloadable paper-styled PDF.
- Wish: tap each of five candles; relight for another wish.
- Notes: tap to reveal a personal appreciation.
- Three hidden stars reveal positive messages. Tap empty space for a tiny floating heart.
- Replay resets the chapters, gallery, letter, cake, notes, and star discoveries without refreshing. Music preferences remain under the visitor's control.
- Reduced motion disables decoration, confetti, and motion transitions; keyboard navigation, focus trapping/restoration, labelled buttons, and live status messages are included.

Google Fonts enhance the typography when online; the site falls back to local serif, sans-serif, and cursive fonts when unavailable. No analytics, accounts, or photo-upload backend are used. Photos included in a public deployment are public assets.

## Deploy to Vercel

1. Put this directory in your own Git repository and push it to GitHub, GitLab, or Bitbucket.
2. In Vercel choose **Add New → Project** and import it.
3. If importing the parent folder, choose `birthday-for-u` as the Root Directory.
4. Framework: **Vite**. Install: `npm install`. Build: `npm run build`. Output: `dist`.
5. Deploy. No environment variables or server are required.

Alternatively, use the Vercel CLI from this project directory:

```bash
npx vercel
```

Confirm the desired audience before sharing personal photos. The optional `.openai/hosting.json` belongs to the private Sites deployment and is not required by Vercel.

## Project layout

```
public/photos/placeholders/  100 original SVG illustration placeholders
public/photos/              Your photographs
public/music/               Original instrumental / your licensed replacement
src/components/             Reusable chapter, viewer, audio, and shared components
src/data/                   Captions, photo discovery, messages, and settings
src/App.jsx                 Journey state, navigation, replay, countdown
src/index.css               Responsive storybook design and reduced-motion rules
```

The downloadable ZIP excludes dependencies, generated builds, Git history, and deployment identity. Run `npm install` after extracting.

## Browser checks

```bash
npx playwright install chromium
npm run test:e2e
```

The checks exercise gallery pagination, keyboard and swipe navigation, slideshow controls, PDF download, all candles, appreciation cards, hidden stars, final reveal, replay, and mobile overflow. They use installed Brave on macOS when available; otherwise Playwright Chromium. Set `BIRTHDAY_BROWSER` to use another compatible browser executable.
