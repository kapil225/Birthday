import { useState } from 'react';
import { Film,Play } from 'lucide-react';
export function VideoPreview({memory}) {
  return <div className="video-preview">
    <video src={memory.src} poster={memory.poster} muted playsInline preload="metadata" aria-hidden="true" tabIndex={-1}/>
    <span className="video-play"><Play size={28} fill="currentColor"/></span>
    <span className="video-badge"><Film size={13}/> Video</span>
  </div>;
}
export default function MemoryVideo({memory,onEnded}) {
  const [failed,setFailed]=useState(false);
  if(failed)return <div className="video-unavailable" role="status"><Film size={35}/><p>This video can't play in this browser.</p><a className="outline" href={memory.src} download>Download video</a></div>;
  return <video className="memory-video" src={memory.src} poster={memory.poster} controls playsInline preload="metadata" aria-label="Memory video" onEnded={onEnded} onError={()=>setFailed(true)}/>;
}
