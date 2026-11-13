import { useState,useEffect,useCallback,useMemo,useRef } from 'react';
import { Play,Pause,Shuffle,Sparkles } from 'lucide-react';
import { useInView,useReducedMotion } from 'framer-motion';
import { memories } from '../data/memories';
import PhotoLightbox from './PhotoLightbox';
import MemoryCollage,{useCollageTileCount} from './MemoryCollage';
import { Section } from './Shared';
import './MemoryCollage.css';

export default function MemoryGallery({onMusic}) {
  const reduced=useReducedMotion();
  const [running,setRunning]=useState(true);
  const [viewer,setViewer]=useState(null);
  const [offset,setOffset]=useState(0);
  const [hidden,setHidden]=useState(()=>document.hidden);
  const wall=useRef(null);
  const inView=useInView(wall,{amount:.08});
  const photoIndices=useMemo(()=>memories.map((memory,index)=>memory.type==='video'?null:index).filter(index=>index!==null),[]);
  const count=useCollageTileCount(photoIndices.length);
  const [renderedCount,setRenderedCount]=useState(count);
  // Keep the clicked tile mounted while a viewer is open, including rotation.
  useEffect(()=>{if(!viewer)setRenderedCount(count);},[count,viewer]);
  const close=useCallback(()=>setViewer(null),[]);
  const openPhoto=useCallback(index=>setViewer({index,slideshow:false}),[]);
  const active=running&&!reduced&&!viewer&&!hidden&&inView&&photoIndices.length>1;
  useEffect(()=>{
    const update=()=>setHidden(document.hidden);
    document.addEventListener('visibilitychange',update);
    return()=>document.removeEventListener('visibilitychange',update);
  },[]);

  return <Section id="memories" number="03" eyebrow="THE MOMENTS WE KEEP" title={<>A Thousand Memories,<br/><em>One Beautiful You <span className="collage-heading-sparkle">✨</span></em></>} className="memory-section">
    <div className="gallery-intro collage-intro">
      <p>Some moments become memories. Some people<br/>{' '}make those memories unforgettable.</p>
      <span className="collage-dedication"><Sparkles size={15} strokeWidth={1.25}/> A little universe, always unfolding.</span>
    </div>
    <div ref={wall} className="living-memory-wall" data-paused={!active}>
      {photoIndices.length>0&&<MemoryCollage key={`${renderedCount}-${offset}`} indices={photoIndices} count={renderedCount} offset={offset} memories={memories} active={active} reduced={!!reduced} onOpen={openPhoto}/>}
      <div className="collage-controls">
        {!reduced&&photoIndices.length>1&&<button className="outline" onClick={()=>setRunning(value=>!value)} aria-pressed={!running}>{running?<Pause size={16}/>:<Play size={16}/>} {running?'Pause collage':'Play collage'}</button>}
        {photoIndices.length>1&&<button className="text-button" onClick={()=>setOffset(value=>(value+(renderedCount<photoIndices.length?renderedCount:1))%photoIndices.length)}><Shuffle size={16}/> Shuffle memories</button>}
        <button className="text-button" onClick={()=>setViewer({index:0,slideshow:true})}><Play size={15}/> Relive Memories</button>
      </div>
      {reduced&&<p className="collage-motion-note">A quieter little universe, following your reduced motion setting.</p>}
    </div>
    {viewer&&<PhotoLightbox {...viewer} onClose={close} onMusic={onMusic}/>}
  </Section>;
}
