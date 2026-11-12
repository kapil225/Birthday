import { useState } from 'react';
import { motion,AnimatePresence,useReducedMotion } from 'framer-motion';
import { Download,Heart,Mail } from 'lucide-react';
import { letter } from '../data/messages';
import { Section,SecretStar } from './Shared';
async function downloadLetter(){
 const { jsPDF } = await import('jspdf');
 const pdf=new jsPDF({unit:'mm',format:'a4'});
 function page(){pdf.setFillColor(255,248,244);pdf.rect(0,0,210,297,'F');pdf.setTextColor(115,63,86);pdf.setFont('times','italic');pdf.setFontSize(25);pdf.text('A little letter, just for U',23,26);pdf.setDrawColor(220,180,192);pdf.line(23,33,187,33);pdf.setFont('times','normal');pdf.setFontSize(12);}
 page();let y=45;
 const clean=letter.replace(/[❤️✨]/gu,'').replace(/’/g,"'");
 for(const paragraph of clean.split('\n\n')){for(const line of pdf.splitTextToSize(paragraph,162)){if(y>273){pdf.addPage();page();y=45;}pdf.text(line,24,y);y+=5.5;}y+=5;}
 pdf.save('A-letter-for-U.pdf');
}
export default function HeartfeltLetter({onFind}){const [open,setOpen]=useState(false);const reduced=useReducedMotion();return <Section id="letter" number="04" eyebrow="WORDS I HOPE YOU KEEP" title={<>Some things are easier<br/>to write than to say…</>} className="letter-section"><p className="section-intro">And this is one of them.</p><div className={`envelope ${open?'unsealed':''}`} aria-hidden="true"><div className="envelope-paper">Dear U, <span>this is for you.</span></div><div className="envelope-flap"/><div className="envelope-front"/><div className="wax-seal"><Heart fill="currentColor" size={20}/></div><span className="envelope-note script">with a grateful heart</span></div><button className="primary" onClick={()=>setOpen(v=>!v)}><Mail size={17}/>{open?'Fold My Letter':'Open My Letter'}</button><AnimatePresence>{open&&<motion.article className="letter-paper" initial={reduced?false:{opacity:0,height:0,y:40}} animate={{opacity:1,height:'auto',y:0}} exit={{opacity:0,height:0}} transition={{duration:.7}}><span className="paper-star">✦</span>{letter.split('\n\n').map((p,i)=><motion.p key={i} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:Math.min(i*.16,2)}}>{p}</motion.p>)}<button className="outline" onClick={downloadLetter}><Download size={16}/> Keep This Letter</button></motion.article>}</AnimatePresence><SecretStar message="Your kindness leaves a little sparkle everywhere you go. ✨" onFind={onFind}/></Section>;}
