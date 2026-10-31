import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  MANUAL_LISTENING_BOOKMARK_KEY, MAX_MANUAL_LISTENING_BOOKMARKS,
  bookmarkLabel, formatListeningBookmarkTime, createManualListeningBookmark,
  editManualListeningBookmark, readManualListeningBookmarks, writeManualListeningBookmarks
} from '../src/utils/listeningBookmarks';

function withStorage(run: (storage: Storage) => void) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test'});
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:dom.window.localStorage});
  try { run(dom.window.localStorage); }
  finally {
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:previous});
    dom.window.close();
  }
}

test('manual bookmarks never overwrite automatic resume progress, even across add/edit/delete',()=>{
 withStorage(storage=>{
  const oldProgress=JSON.stringify({surahId:3,ayahIndex:35,currentTime:21,reciter:'ar.mahermuaiqly'});
  storage.setItem('quran_listening_bookmark',oldProgress);
  const position={surahId:67,ayahIndex:5,currentTime:13.75,reciter:'ar.mahermuaiqly'};
  const first=createManualListeningBookmark([],position,'Ezber çalışması','Tekrar et');
  assert.ok(first);
  assert.equal(first[0].currentTime,13.75);
  assert.equal(first[0].name,'Ezber çalışması');
  assert.ok(writeManualListeningBookmarks(first));
  assert.equal(readManualListeningBookmarks().length,1);
  const second=createManualListeningBookmark(readManualListeningBookmarks(),{...position,ayahIndex:9,currentTime:8},'İkinci yer');
  assert.ok(second && writeManualListeningBookmarks(second));
  const renamed=editManualListeningBookmark(readManualListeningBookmarks(),first[0].id,'Çalışma','Yeni not');
  assert.ok(renamed && writeManualListeningBookmarks(renamed));
  const stored=readManualListeningBookmarks();
  assert.equal(stored.find(b=>b.id===first[0].id)?.name,'Çalışma');
  assert.equal(stored.find(b=>b.id===first[0].id)?.note,'Yeni not');
  assert.equal(stored.find(b=>b.id===second[0].id)?.ayahIndex,9);
  assert.ok(writeManualListeningBookmarks(stored.filter(b=>b.id!==first[0].id)));
  assert.equal(readManualListeningBookmarks().length,1);
  assert.equal(storage.getItem('quran_listening_bookmark'),oldProgress);
 });
});

test('manual bookmarks validate surah/verse and tolerate corrupted local storage',()=>{
 withStorage(storage=>{
  assert.equal(createManualListeningBookmark([],{surahId:114,ayahIndex:7,currentTime:1,reciter:'ar.mahermuaiqly'},'invalid'),null);
  assert.equal(createManualListeningBookmark([],{surahId:67,ayahIndex:-1,currentTime:1,reciter:'ar.mahermuaiqly'},'invalid'),null);
  assert.equal(createManualListeningBookmark([],{surahId:67,ayahIndex:4,currentTime:Infinity,reciter:'ar.mahermuaiqly'},'invalid'),null);
  storage.setItem(MANUAL_LISTENING_BOOKMARK_KEY,'invalid json');
  assert.deepEqual(readManualListeningBookmarks(),[]);
  storage.setItem(MANUAL_LISTENING_BOOKMARK_KEY,JSON.stringify([{id:'invalid!',name:'x',note:'',surahId:67,ayahIndex:2,currentTime:0,reciter:'ar.mahermuaiqly',createdAt:new Date().toISOString()}]));
  assert.deepEqual(readManualListeningBookmarks(),[]);
  assert.equal(editManualListeningBookmark([], 'unknown', 'New', ''),null);
  assert.equal(formatListeningBookmarkTime(72.8),'01:12');
  assert.equal(bookmarkLabel({surahId:67,ayahIndex:2,currentTime:0,reciter:'ar.mahermuaiqly'}),'Mülk · 3. ayet');
 });
});

test('manual bookmarks limit count, enforce valid edit and optionally update saved location',()=>{
 withStorage(()=>{
  const position={surahId:67,ayahIndex:1,currentTime:2,reciter:'ar.mahermuaiqly'};
  let bookmarks=readManualListeningBookmarks();
  for(let i=0;i<MAX_MANUAL_LISTENING_BOOKMARKS;i++){
    const added=createManualListeningBookmark(bookmarks,position,'Yer '+i);
    assert.ok(added);
    bookmarks=added;
  }
  assert.equal(createManualListeningBookmark(bookmarks,position,'Too many'),null);
  assert.equal(editManualListeningBookmark(bookmarks,bookmarks[0].id,' ',''),null);
  const updated=editManualListeningBookmark(bookmarks,bookmarks[0].id,'Yeni ad','Not',{...position,ayahIndex:3,currentTime:17});
  assert.ok(updated);
  assert.equal(updated[0].ayahIndex,3);
  assert.equal(updated[0].currentTime,17);
  assert.equal(updated[1].ayahIndex,1);
  assert.ok(writeManualListeningBookmarks(updated));
  assert.equal(readManualListeningBookmarks().length,MAX_MANUAL_LISTENING_BOOKMARKS);
 });
});

test('manual bookmark dialog offers save, rename, position update, play and confirmed deletion',()=>{
 const component=fs.readFileSync('src/components/ListeningBookmarksDialog.tsx','utf8');
 const listen=fs.readFileSync('src/components/ListeningMode.tsx','utf8');
 assert.ok(component.includes('Yer İmi Kaydet'));
 assert.ok(component.includes('Değişiklikleri Kaydet'));
 assert.ok(component.includes('onListen(bookmark)'));
 assert.ok(component.includes('onEdit(editingId, name, note, replacePosition)'));
 assert.ok(component.includes('onDelete(id)'));
 assert.ok(component.includes('Evet, Sil'));
 assert.ok(component.includes('onClick={() => setDeleteId(bookmark.id)}') || component.includes("setDeleteId(bookmark.id);"));
 assert.ok(component.includes('role="dialog"'));
 assert.ok(component.includes('aria-modal="true"'));
 assert.ok(listen.includes('setBookmarksOpen(true)'));
 assert.ok(listen.includes('writeManualListeningBookmarks(next)'));
 assert.ok(listen.includes('playAyahAt(bookmark.ayahIndex, bookmark.currentTime)'));
 assert.ok(listen.includes('shouldAutoPlayNextSurahRef.current = true'));
 assert.ok(listen.includes('persistBookmark(bookmark.surahId, bookmark.ayahIndex, bookmark.currentTime, bookmark.reciter)'));
 assert.ok(!listen.includes('onClick={resumeFromBookmark}'));
 assert.ok(listen.includes('Yer İmlerim'));
 assert.ok(listen.includes('bg-slate-800/80 hover:bg-slate-700'));
});
