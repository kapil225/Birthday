import { config } from './messages';
import personalPhotos from './photo-manifest.json';
// Captions use the original filename from photos/ (including its extension).
export const captions = {
  'memory-1.jpg': 'Little moments, beautiful memories.',
  'memory-2.jpg': 'Some memories never lose their magic.',
  'memory-3.jpg': 'Thank you for being part of so many beautiful chapters.'
};
// Keep support for adding browser-ready images directly to public/photos/.
const files = import.meta.glob('/public/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', { eager: true, query: '?url', import: 'default' });
const directPhotos = Object.keys(files).sort((a,b) => a.localeCompare(b, undefined, { numeric: true })).map(path => ({ filename: path.split('/').pop(), src: path.replace('/public', '') }));
const videoFiles = import.meta.glob('/public/videos/*.{mp4,webm,mov,m4v,MP4,WEBM,MOV,M4V}', { eager: true, query: '?url', import: 'default' });
const preparedSources = new Set(personalPhotos.map(item=>item.src));
const directVideos = Object.keys(videoFiles).sort().map(path=>({filename:path.split('/').pop(),src:path.replace('/public',''),type:'video'})).filter(item=>!preparedSources.has(item.src));
const discovered = [...personalPhotos, ...directPhotos, ...directVideos];
const defaults = ['Little moments, beautiful memories.', 'Some moments are worth keeping close.', 'Some memories never lose their magic.', 'A thousand pictures, and still so much to treasure.'];
// Real photos become the collection. Illustrations are only the empty-state fallback.
export const memories = Array.from({ length: discovered.length || config.placeholderCount }, (_, i) => {
  const photo = discovered[i];
  return { id: i + 1, type: photo?.type || 'image', src: photo?.src, thumbnail: photo?.thumbnail, poster: photo?.poster, filename: photo?.filename, placeholder: `/photos/placeholders/memory-${i % 100 + 1}.svg`, caption: captions[photo?.filename] || defaults[i % defaults.length], alt: photo ? `Friendship photograph ${i + 1}` : `Pastel illustrated placeholder ${i + 1}`, rotation: [-3,2,-1,3,1,-2][i % 6] };
});
