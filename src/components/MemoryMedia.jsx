import { useState } from 'react';
export function MemoryImage({memory,thumbnail=false,...props}) {
  const [failed,setFailed]=useState(false);
  return <img {...props} src={!failed&&memory.src?(thumbnail&&memory.thumbnail?memory.thumbnail:memory.src):memory.placeholder} alt={memory.alt} onError={()=>setFailed(true)}/>;
}
