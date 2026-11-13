# A Little Universe for U

A complete seven-chapter birthday gift built with React, Vite, Tailwind CSS, Framer Motion, Lucide, Canvas Confetti, and jsPDF. All artwork and the included instrumental recording were created for this project. No personal memories or third-party photographs are invented.

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

The gallery uses your personal photos from `birthday-for-u/photos/`, including JPEG, HEIC, and DNG originals. The website uses optimized JPEG copies and smaller thumbnails from `public/photos/personal/`; originals are never changed. The gallery and slideshow show the actual collection, with the illustrated placeholders reserved for an empty collection or a failed image.

To add or replace originals on macOS:

```bash
# Put your images directly in birthday-for-u/photos/, then:
npm run photos
```

This regenerates `src/data/photo-manifest.json` and any new/changed browser-friendly copies. Restart the development server if necessary. Redeploy after changes. The converter uses Python 3 and macOS `sips`; both HEIC and RAW DNG are converted to JPEG. Already generated copies are included in the project, so Vercel and other hosts need only `npm run build`, with no conversion tools required.

You can also put browser-ready JPG, JPEG, PNG, WebP, or AVIF images directly into `public/photos/`; Vite discovers these at build time. More images automatically expand the collection. Without any personal photos, the gallery shows the 100 supplied illustrations.

Full-size copies use at most 1800px on the long edge; gallery thumbnails use at most 600px. Images load lazily. Captions use original filenames, including `.HEIC` or `.DNG` where applicable.

## Messages

Photo captions are off by default. Set `showCaptions: true` in `src/data/gallery.js` to show optional captions on collage tiles and in the fullscreen viewer. Edit captions in `src/data/memories.js`, keyed by the original filename:

```js
export const captions = {
  'IMG_4144.jpg': 'Your own caption here.',
  'a-favorite-picture.webp': 'Another little moment to treasure.'
};
```

Edit `src/data/messages.js` for the letter, final message, appreciation notes, and configuration. Adjust `placeholderCount` to change the size of the illustrated fallback collection when no photos exist. Gallery code never needs to change when adding photos.

## Music and effects

`public/music/happy-birthday-piano.wav` is a synthesized piano-style arrangement of the traditional Happy Birthday melody, rendered for this project without samples or third-party recordings; you may use, change, and redistribute it with this gift. It loops softly and attempts to start as soon as the site opens. Browsers that block audible autoplay start it automatically on the first tap, click, or keypress instead. The music button can pause or resume playback at any time; a deliberate pause is respected throughout the journey. Sound effects have their own separate speaker control, disabled by default. The slideshow offers access to the same music toggle and does not override the visitor's choice.

To use another properly licensed instrumental, put it in `public/music/` and change `config.music` in `src/data/messages.js`. Keep any required attribution and licence with your replacement. An unavailable track never prevents the rest of the experience from working.

## Optional birthday countdown

Disabled by default. Set a full ISO date with an explicit timezone offset:

```js
birthday: '2027-06-15T00:00:00+01:00'
```

The welcome screen shows the remaining days, hours, minutes, and seconds. At the configured instant, the countdown automatically switches to the available gift-opening button. A missing, invalid, or past date leaves the gift available immediately.

## Interactions and accessibility

- Open the gift to begin; navigate freely using chapter links and the progress rail.
- Gallery: a living CSS Grid collage with independent staggered image transitions, mixed tile sizes, pause/play, and manual shuffle. It pauses offscreen, in a hidden tab, or while a fullscreen memory is open. Reduced motion uses a static collage with manual shuffle.
- Fullscreen viewer: previous/next buttons, arrow keys, Escape, and horizontal touch swipes.
- Slideshow: play/pause and 3, 5, or 8 second intervals. Default 5 seconds.
- Letter: animated envelope, progressive paragraphs, downloadable paper-styled PDF.
- Wish: tap any candle once to blow out all five; relight for another wish.
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
public/music/               Happy Birthday instrumental / your licensed replacement
src/components/             Reusable chapter, viewer, audio, and shared components
src/data/                   Captions, photo discovery, messages, and settings
src/App.jsx                 Journey state, navigation, replay, countdown
src/index.css               Responsive storybook design and reduced-motion rules
```

The downloadable ZIP includes the optimized photo collection and excludes high-resolution originals, dependencies, generated builds, Git history, and deployment identity. Run `npm install` after extracting.

## Browser checks

```bash
npx playwright install chromium
npm run test:e2e
```

The checks exercise independent collage transitions, duplicate prevention, pause/resume, shuffle, keyboard and swipe navigation, slideshow controls, PDF download, all candles, appreciation cards, hidden stars, final reveal, replay, and mobile overflow. They use installed Brave on macOS when available; otherwise Playwright Chromium. Set `BIRTHDAY_BROWSER` to use another compatible browser executable.

Regenerate the included instrumental with `python3 scripts/create-birthday-music.py` (Python standard library only).

## Videos

Add videos to `birthday-for-u/photos/` and run `npm run photos`, or put browser-ready files directly in `public/videos/` and restart Vite. The Memories chapter shows only the photo collage, with no separate video section or placeholder. Added videos remain available through the fullscreen slideshow with native playback controls.

Use H.264/AAC MP4 for the broadest browser support, or WebM. MOV and M4V are also discovered, but their playback depends on the browser and codec; unsupported videos offer a download link. Videos are copied without transcoding. Video sound starts only when the visitor presses play. The slideshow waits on video slides and advances after a video ends when slideshow playback is enabled. Pressing next/previous or closing the viewer stops the video by unmounting it.

## Mobile layouts

`src/responsive.css` contains the phone, tablet, touch-target, and safe-area rules. On phones and small tablets, chapter navigation moves into a reachable bottom bar; text and art stack without overlapping. Fullscreen media uses dynamic viewport height and keeps controls reachable after rotation. Opening a viewer locks background scrolling, and closing restores the original page position. The collage has explicit pause/play controls and pauses automatically while a fullscreen memory is open. The candle area is one large tap target that blows out all five candles.

The browser suite includes 320, 360, 390, 430, 667, 768, 844, 1024, and 1280px viewports, portrait/landscape layouts, real touch events in Chromium emulation, normal and reduced motion, minimum 44px controls, text overflow, scroll restoration, and replay. These checks do not replace testing on a physical iPhone/Safari or Android device.


## Living memory collage

The Memories chapter is a responsive photo mosaic headed **A Thousand Memories, One Beautiful You ✨**. It renders up to 12 independently animated tiles on desktop, 8 on tablets, and 6 on phones, cycling through the entire photo collection. Every photo tile is portrait-oriented, with varied heights for a balanced vertical collage on phones, tablets, and desktops. No carousel or scroll strip is used.

`src/data/gallery.js` configures visible tile counts, staggered 3.4–4.9 second intervals, 1.5 second transitions, and optional captions. `src/data/memories.js` supplies the photo array; adding photos still requires no layout changes.

Each tile preloads and decodes its next thumbnail before transitioning. A shared reservation coordinator tracks outgoing, visible, and incoming images so different tiles avoid showing the same image when spare photos are available. With fewer photos than available positions, the tile count shrinks; duplicates during a transition are only allowed if every available photo is already visible. A one-photo collection remains still.

Dissolves, 3D turns, gentle rotations, and slides run through Motion values without React rendering every frame. Tile positions stay in CSS Grid throughout. Motion pauses when the wall leaves the viewport, the tab becomes hidden, the visitor presses Pause, or a fullscreen memory opens. Closing the viewer resumes an active wall. Timers, image preloads, event listeners, and animation controls are cleaned up on unmount.

With reduced motion enabled, automatic transitions, floating, zoom, and hover tilt stop; **Shuffle memories** changes the selection without animation. Videos in the fullscreen slideshow retain native playback controls and do not autoplay with the collage. The original 100 pastel illustration placeholders remain available when the collection is empty or a photo fails to load.

Files for this chapter:

- `src/components/MemoryGallery.jsx`: chapter composition and pause state.
- `src/components/MemoryCollage.jsx`: independent tile animation, preloading, and photo coordination.
- `src/components/MemoryCollage.css`: responsive mosaic and visual effects, scoped to this chapter.
- `src/components/PhotoLightbox.jsx`: existing fullscreen viewer and slideshow controls.
- `src/components/MemoryMedia.jsx`: shared image fallback.
- `src/data/gallery.js`: collage settings.
