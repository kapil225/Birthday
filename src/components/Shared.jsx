import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, X } from 'lucide-react';
export function celebrate() { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) confetti({particleCount:110,spread:85,origin:{y:.65},colors:['#d891ad','#c8b4df','#e3c182','#fff5dc'],disableForReducedMotion:true}); }
export function Section({id, number, eyebrow, title, children, className=''}) {const reduced = useReducedMotion();return <section id={id} className={`chapter ${className}`}><motion.div initial={reduced?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.7}}><div className="eyebrow"><span>CHAPTER {number}</span><i/> {eyebrow}</div><h2>{title}</h2>{children}</motion.div></section>;}
export function Modal({children,onClose,label,className=''}) {
  const ref=useRef();
  useEffect(()=>{
    const last=document.activeElement,root=document.getElementById('root');
    const scrollY=window.scrollY;
    const previous={overflow:document.body.style.overflow,position:document.body.style.position,top:document.body.style.top,width:document.body.style.width};
    const wasInert=root?.inert;
    if(root)root.inert=true;
    Object.assign(document.body.style,{overflow:'hidden',position:'fixed',top:`-${scrollY}px`,width:'100%'});
    ref.current?.focus({preventScroll:true});
    const key=e=>{
      if(e.key==='Escape')onClose();
      if(e.key==='Tab'){
        const items=[...ref.current.querySelectorAll('button,select,a[href],video[controls],[tabindex="0"]')].filter(el=>!el.disabled);
        const first=items[0],last=items.at(-1);
        if(!first){e.preventDefault();return;}
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',key);
    return()=>{
      document.removeEventListener('keydown',key);
      Object.assign(document.body.style,previous);
      if(root)root.inert=wasInert;
      window.scrollTo({top:last?.isConnected?scrollY:0,behavior:'instant'});
      if(last?.isConnected)last.focus({preventScroll:true});
    };
  },[onClose]);
  return createPortal(<div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label} ref={ref} tabIndex={-1}><button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X/></button>{children}</div>,document.body);
}

export function SecretStar({message,onFind,className=''}) {return <button className={`secret-star ${className}`} aria-label="Discover a hidden star" onClick={()=>onFind(message)}><Sparkles size={23}/></button>;}
export function FloatingParticles(){return <div className="particles" aria-hidden="true">{Array.from({length:22},(_,i)=><span key={i} style={{left:`${(i*47)%100}%`,top:`${(i*31)%100}%`,animationDelay:`${i%7}s`,fontSize:i%3?12:22}}>{i%4===0?'♡':'✦'}</span>)}</div>;}
