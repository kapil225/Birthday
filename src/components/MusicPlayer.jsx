import { forwardRef,useImperativeHandle,useRef,useState,useEffect,useCallback } from 'react';
import { Music2,Volume2,VolumeX } from 'lucide-react';
import { config } from '../data/messages';

const MusicPlayer=forwardRef(function MusicPlayer(_,ref){
  const audio=useRef();
  const effectsContext=useRef();
  const preference=useRef('auto');
  const mounted=useRef(false);
  const [music,setMusic]=useState(false);
  const [effects,setEffects]=useState(false);
  const [error,setError]=useState('');

  const play=useCallback(async()=>{
    const player=audio.current;
    if(!player)return;
    player.volume=.25;
    try{
      await player.play();
      if(mounted.current)setError('');
    }catch(error){
      // A blocked autoplay attempt is retried during the first real interaction.
      if(mounted.current&&!['NotAllowedError','AbortError'].includes(error.name)){
        setError('Music is unavailable. You can still enjoy every chapter.');
      }
    }
  },[]);

  useEffect(()=>{
    mounted.current=true;
    const player=audio.current;
    const startAutomatically=event=>{
      if(preference.current!=='auto')return;
      // A deliberate sound-control click must take precedence over autoplay.
      if(event?.target instanceof Element&&event.target.closest('[data-sound-controls],[data-music-toggle]'))return;
      if(event?.type==='keydown'&&(event.metaKey||event.ctrlKey||event.altKey||event.key==='Escape'))return;
      void play();
    };
    const events=['pointerdown','touchend','click','keydown'];
    for(const event of events)document.addEventListener(event,startAutomatically,{capture:true,passive:true});
    startAutomatically();
    return()=>{
      mounted.current=false;
      for(const event of events)document.removeEventListener(event,startAutomatically,true);
      player?.pause();
      effectsContext.current?.close();
      effectsContext.current=null;
    };
  },[play]);

  const toggle=useCallback(()=>{
    const player=audio.current;
    if(!player)return;
    if(player.paused){preference.current='on';void play();}
    else{preference.current='off';player.pause();}
  },[play]);

  useImperativeHandle(ref,()=>({toggle,chime:()=>{
    if(!effects)return;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return;
    const ctx=effectsContext.current ||= new Ctx();
    void ctx.resume();
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(784,ctx.currentTime);
    gain.gain.setValueAtTime(.09,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.6);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.6);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }}),[toggle,effects]);

  return <div className="sound-controls" data-sound-controls>
    <audio ref={audio} src={config.music} autoPlay loop preload="auto"
      onPlay={()=>{preference.current='on';setMusic(true);}}
      onPause={()=>setMusic(false)}
      onError={()=>{setMusic(false);setError('Music is unavailable.');}}/>
    <button className={music?'sound-active':''} onClick={toggle} aria-pressed={music} aria-label={music?'Pause background music':'Play background music'}><Music2 size={15}/><span>{music?'Music on':'Music off'}</span><span className="sound-dot"/></button>
    <button onClick={()=>setEffects(v=>!v)} aria-pressed={effects} aria-label={effects?'Disable sound effects':'Enable sound effects'}>{effects?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
    {error&&<span className="audio-error" role="status">{error}</span>}
  </div>;
});
export default MusicPlayer;
