import { useEffect, useRef } from 'react';
import { SYNC_APPLIED } from './syncModel';

export function useCloudRefresh(keys: string[], refresh: () => void) {
  const callback = useRef(refresh);callback.current = refresh;
  const names = keys.join('|');
  useEffect(() => {
    let active = true, scheduled = false;
    const handler = (event: Event) => {
      const changed = (event as CustomEvent<string[]>).detail;
      if (!scheduled && Array.isArray(changed) && changed.some(key => names.split('|').some(pattern => pattern.endsWith('*') ? key.startsWith(pattern.slice(0,-1)) : key === pattern))) {
        scheduled = true;
        queueMicrotask(() => {scheduled=false;if(active)callback.current();});
      }
    };
    window.addEventListener(SYNC_APPLIED,handler);
    const fromTab=(event:StorageEvent)=>{if(event.key)handler(new CustomEvent(SYNC_APPLIED,{detail:[event.key]}));};
    window.addEventListener('storage',fromTab);
    return () => {active=false;window.removeEventListener(SYNC_APPLIED,handler);window.removeEventListener('storage',fromTab);};
  },[names]);
}
