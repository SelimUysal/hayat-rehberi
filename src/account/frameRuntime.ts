import { createAccountRuntime } from './accountRuntime';

// Standalone Mushaf/Tesbih tabs keep syncing after the main tab is closed.
// The shared Web Lock and durable queue still allow only one writer/browser.
try {
  const runtime=createAccountRuntime();
  const report=()=>{
    const {ready,needsImport,error,pending,offline}=runtime.store.state;
    window.parent.postMessage({type:'HAYAT_ACCOUNT_FRAME_STATUS',ready,needsImport,error,pending,offline},window.location.origin);
  };
  const unwatch=runtime.store.subscribe(report);
  const unauth=runtime.watch(user=>{void runtime.store.activate(user?.uid || null);},()=>{
    window.parent.postMessage({type:'HAYAT_ACCOUNT_FRAME_STATUS',error:'Hesap bağlantısı açılamadı. Cihaz kayıtları korunuyor.'},window.location.origin);
  });
  report();
  window.addEventListener('pagehide',()=>{runtime.store.stop();unwatch();unauth();},{once:true});
} catch {
  window.parent.postMessage({type:'HAYAT_ACCOUNT_FRAME_STATUS',error:'Hesap bağlantısı açılamadı. Cihaz kayıtları korunuyor.'},window.location.origin);
}
