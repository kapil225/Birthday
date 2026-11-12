import { config } from './messages';
// Add captions by filename. Images in public/photos are discovered at build time.
export const captions = {
  'memory-1.jpg': 'Little moments, beautiful memories.',
  'memory-2.jpg': 'Some memories never lose their magic.',
  'memory-3.jpg': 'Thank you for being part of so many beautiful chapters.'
};
const files = import.meta.glob('/public/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' });
const discovered = Object.keys(files).map(path => path.replace('/public', '')).sort((a,b) => a.localeCompare(b, undefined, { numeric: true }));
const defaults = ['Little moments, beautiful memories.', 'A little place for a beautiful memory.', 'Some memories never lose their magic.', 'A thousand pictures, and still so much to treasure.'];
export const memories = Array.from({ length: Math.max(config.placeholderCount, discovered.length) }, (_, i) => {
  const src = discovered[i];
  return { id: i + 1, src, placeholder: `/photos/placeholders/memory-${i % 100 + 1}.svg`, caption: captions[src?.split('/').pop()] || defaults[i % defaults.length], alt: src ? `Friendship photograph ${i + 1}` : `Pastel illustrated placeholder ${i + 1}`, rotation: [-3,2,-1,3,1,-2][i % 6] };
});
