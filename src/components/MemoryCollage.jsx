import { memo,useCallback,useEffect,useMemo,useRef,useState } from 'react';
import { animate,motion,useMotionValue,useTransform } from 'framer-motion';
import { galleryConfig } from '../data/gallery';
import { MemoryImage } from './MemoryMedia';

// Reserve both visible and incoming photos until each transition completes.
// This prevents independent tiles from choosing the same image concurrently.
export function createPhotoCoordinator(indices,initial) {
  const current=new Map(initial.map((photo,slot)=>[slot,photo]));
  const pending=new Map();
  let cursor=initial.length;
  return {
    reserve(slot) {
      if(indices.length<2)return null;
      const occupied=new Set([...current.values(),...pending.values()]);
      let next=null;
      for(let n=0;n<indices.length;n++) {
        const candidate=indices[(cursor+n)%indices.length];
        if(!occupied.has(candidate)){next=candidate;cursor=(cursor+n+1)%indices.length;break;}
      }
      // Temporarily occupied spare photos will become available after a flip.
      if(next===null&&indices.length>current.size)return null;
      // With no spare images, a repeat is unavoidable. Keep each tile moving
      // while still preventing it from transitioning to its own current photo.
      if(next===null) {
        next=indices.find(index=>index!==current.get(slot)&&![...pending.values()].includes(index));
      }
      if(next===undefined||next===null)return null;
      pending.set(slot,next);
      return next;
    },
    commit(slot,index){current.set(slot,index);pending.delete(slot);},
    release(slot){pending.delete(slot);},
  };
}

function preloadPhoto(memory,signal) {
  return new Promise(resolve=>{
    if(signal.aborted){resolve(false);return;}
    const image=new Image();
    let settled=false;
    let timeout;
    const finish=ready=>{
      if(settled)return;
      settled=true;
      clearTimeout(timeout);
      image.onload=null;image.onerror=null;
      signal.removeEventListener('abort',abort);
      resolve(ready);
    };
    const abort=()=>{finish(false);image.src='';};
    image.onload=async()=>{
      try{await image.decode();}catch{/* onload already guarantees a usable image */}
      finish(!signal.aborted&&image.naturalWidth>0);
    };
    image.onerror=()=>finish(false);
    signal.addEventListener('abort',abort,{once:true});
    timeout=setTimeout(()=>{finish(false);image.src='';},8000);
    image.src=memory.thumbnail||memory.src||memory.placeholder;
  });
}

const CollageTile=memo(function CollageTile({slot,initial,memories,coordinator,active,reduced,onOpen}) {
  const [displayed,setDisplayed]=useState(initial);
  const [incoming,setIncoming]=useState(null);
  const [attempt,setAttempt]=useState(0);
  const animation=useRef(null);
  const alive=useRef(true);
  const hasCycled=useRef(false);
  const activeRef=useRef(active);
  activeRef.current=active;
  const progress=useMotionValue(0);
  const variant=slot%4;
  const incomingOpacity=useTransform(progress,[0,.2,1],[0,variant===1?.08:.2,1]);
  const outgoingOpacity=useTransform(progress,[0,.7,1],[1,1,0]);
  const rotateY=useTransform(progress,[0,1],[variant===1?85:0,0]);
  const rotateZ=useTransform(progress,[0,1],[variant===2?-6:0,0]);
  const slideX=useTransform(progress,[0,1],[variant===3?'14%':'0%','0%']);
  const slideY=useTransform(progress,[0,1],[variant===2?'8%':'0%','0%']);
  const zoom=useTransform(progress,[0,1],[variant===0?1.08:1.025,1]);
  const incomingStyle={opacity:incomingOpacity,rotateY,rotateZ,x:slideX,y:slideY,scale:zoom};
  const outgoingStyle={opacity:outgoingOpacity};

  useEffect(()=>{
    alive.current=true;
    return()=>{alive.current=false;animation.current?.stop();coordinator.release(slot);};
  },[coordinator,slot]);

  useEffect(()=>{
    if(reduced&&incoming!==null&&animation.current){
      animation.current.stop();
      animation.current=null;
      coordinator.commit(slot,incoming);
      hasCycled.current=true;
      progress.set(1);
      setDisplayed(incoming);
      setIncoming(null);
      return;
    }
    if(active)animation.current?.play();
    else animation.current?.pause();
  },[active,reduced,incoming,coordinator,slot,progress]);

  useEffect(()=>{
    if(!active||animation.current)return;
    const controller=new AbortController();
    const interval=galleryConfig.intervals[slot%galleryConfig.intervals.length];
    const delay=hasCycled.current?Math.max(500,interval-galleryConfig.transitionSeconds*1000):interval;
    const timer=setTimeout(async()=>{
      const next=coordinator.reserve(slot);
      if(next===null){if(alive.current)setAttempt(n=>n+1);return;}
      const ready=await preloadPhoto(memories[next],controller.signal);
      if(!ready||controller.signal.aborted||!alive.current){
        coordinator.release(slot);
        if(!controller.signal.aborted&&alive.current)setAttempt(n=>n+1);
        return;
      }
      progress.set(0);
      setIncoming(next);
      animation.current=animate(progress,1,{
        duration:galleryConfig.transitionSeconds,
        ease:[.22,.61,.36,1],
        onComplete:()=>{
          coordinator.commit(slot,next);
          hasCycled.current=true;
          animation.current=null;
          if(alive.current){setDisplayed(next);setIncoming(null);}
        },
      });
      if(!activeRef.current)animation.current.pause();
    },delay);
    return()=>{clearTimeout(timer);controller.abort();};
  },[active,displayed,attempt,coordinator,memories,slot,progress]);

  const open=()=>onOpen(incoming!==null&&progress.get()>=.5?incoming:displayed);
  return <motion.button
    type="button"
    className={`collage-tile collage-tile-${slot%12}`}
    style={{'--float-duration':`${9+slot*.7}s`,'--float-delay':`${-slot*.8}s`}}
    data-photo-index={displayed}
    data-next-index={incoming??undefined}
    data-motion={['dissolve','flip','drift','slide'][variant]}
    aria-label={`Open photo ${displayed+1} of ${memories.length}`}
    onClick={open}
    whileHover={reduced?undefined:{scale:1.025,rotateX:2,rotateY:-2,zIndex:3}}
    transition={{duration:.45}}
  >
    {[displayed,...(incoming===null?[]:[incoming])].map(index=><motion.div
      className="collage-layer"
      key={index}
      style={incoming===null?undefined:index===incoming?incomingStyle:outgoingStyle}
      aria-hidden={index!==displayed}
    ><MemoryImage memory={memories[index]} thumbnail loading="lazy" decoding="async" width="600" height="750"/></motion.div>)}
    <span className="collage-shine" aria-hidden="true"/>
    {galleryConfig.showCaptions&&memories[displayed].caption&&<span className="collage-caption">{memories[displayed].caption}</span>}
  </motion.button>;
});

export function useCollageTileCount(photoCount) {
  const getCount=useCallback(()=>Math.min(photoCount,window.innerWidth<=600?galleryConfig.tiles.phone:window.innerWidth<=1000?galleryConfig.tiles.tablet:galleryConfig.tiles.desktop),[photoCount]);
  const [count,setCount]=useState(getCount);
  useEffect(()=>{
    const update=()=>setCount(getCount());
    const phone=matchMedia('(max-width:600px)'),tablet=matchMedia('(max-width:1000px)');
    phone.addEventListener('change',update);tablet.addEventListener('change',update);
    update();
    return()=>{phone.removeEventListener('change',update);tablet.removeEventListener('change',update);};
  },[getCount]);
  return count;
}

export default function MemoryCollage({indices,count,offset,memories,active,reduced,onOpen}) {
  const initial=useMemo(()=>Array.from({length:count},(_,slot)=>indices[(offset+slot)%indices.length]),[indices,count,offset]);
  const coordinator=useMemo(()=>createPhotoCoordinator(indices,initial),[indices,initial]);
  return <div className={`memory-collage ${active?'collage-running':'collage-paused'}`} role="group" aria-label="Animated photo collage">
    {initial.map((index,slot)=><CollageTile key={slot} slot={slot} initial={index} memories={memories} coordinator={coordinator} active={active} reduced={reduced} onOpen={onOpen}/>)}
  </div>;
}
