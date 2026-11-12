import { useState } from 'react';
import { Heart,Flower2,Sun,Sparkles } from 'lucide-react';
import { Section } from './Shared';
import { appreciations } from '../data/messages';
const icons=[Heart,Sun,Flower2,Sparkles];
export default function AppreciationCards(){const [opened,setOpened]=useState([]);return <Section id="appreciation" number="06" eyebrow="THE LOVELY THINGS THAT MAKE YOU, YOU" title={<>Just a few reasons<br/>you're so special.</>} className="appreciation-section"><p className="section-intro">Eight little notes. Every single one, meant from the heart.</p><div className="appreciation-grid">{appreciations.map(([front,back],i)=>{const Icon=icons[i%4],isOpen=opened.includes(i);return <button className={`appreciation-card tone-${i%4} ${isOpen?'revealed':''}`} key={front} aria-expanded={isOpen} onClick={()=>setOpened(v=>isOpen?v.filter(n=>n!==i):[...v,i])}><span className="note-number">0{i+1}</span><Icon size={27} strokeWidth={1}/><h3>{front}</h3><p>{isOpen?back:'a little more, just for you ↗'}</p></button>;})}</div></Section>;}
