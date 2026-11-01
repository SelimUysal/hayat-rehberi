(() => {
  if (window.parent !== window) return;
  const frame=document.createElement('iframe');
  frame.id='hayat-account-frame';frame.src='./account-frame.html';frame.hidden=true;frame.title='Hesap bağlantısı';
  const status=document.createElement('a');status.href='./';status.hidden=true;
  status.setAttribute('role','status');
  Object.assign(status.style,{position:'fixed',top:'12px',right:'12px',zIndex:'30000',maxWidth:'85vw',padding:'10px 14px',borderRadius:'12px',background:'#432b0c',color:'#fef3c7',font:'13px system-ui',boxShadow:'0 4px 14px #0004'});
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==frame.contentWindow || event.data?.type!=='HAYAT_ACCOUNT_FRAME_STATUS')return;
    const data=event.data;
    status.hidden=!(data.needsImport || data.error || data.pending || !data.ready);
    status.textContent=data.needsImport?'Cihaz kayıtları için hesap seçimini tamamla':data.error?'Kayıtlar cihazda korunuyor. Hesap durumunu aç':data.pending?`${data.pending} değişiklik eşitlenmeyi bekliyor`:'Hesap kayıtları hazırlanıyor…';
  });
  frame.addEventListener('error',()=>{status.hidden=false;status.textContent='Kayıtlar cihazda korunuyor. Hesap durumunu aç';});
  document.body.append(frame,status);
})();
