export const progressFixtures: Record<string, unknown> = {
  namaz_memorized_ids:['fatiha'], esma_learned_names:{'1':true},
  elifba_state:{consentGiven:true,letter_Elif:true},tecvid_completed_lessons:{'0':true},ezber_saved_surahs:[1,67],
  hayat_rehberi_hadis_user_state_v1:{'1':{isFavorite:true,isMemorized:true,userNote:'Cihazlar arasında korunacak not',reviewCount:2}},
  hayat_rehberi_hadis_custom_order_v1:[2,1,3],
  hayat_rehberi_hadis_activity_logs_v1:[{id:'review-1',hadisId:1,timestamp:'2026-11-01T10:00:00.000Z',action:'review',kategori:'iman'}],
  quran_listening_manual_bookmarks_v1:[{id:'bookmark-1',name:'Fatiha dinleme',note:'Özel not',surahId:1,ayahIndex:0,currentTime:3,reciter:'ar.alafasy',createdAt:'2026-11-01T10:00:00.000Z'}],
  kuran_user_bookmarks_v1:[{page:1,title:'Fatiha yer imi',note:'İlk sayfa notu',date:'2026-11-01'}],
  kuran_mushaf_read_pages_v1:[1,2,604],
  kaza_namazlari_data:['sabah','ogle','ikindi','aksam','yatsi','vitir'].map(id => ({id,count:9,completed:1,initial:10})),
  kaza_custom_counters_data:[{id:'kaza-orucu',title:'Kaza Orucu',unit:'Gün',count:9,completed:1}],
  hayat_rehberi_special_goals_v1:[{id:'goal-1',title:'Çalışma hedefi',description:'Korunacak hedef',targetISO:'2099-12-31T12:00',targetTimestamp:4102390800000,createdAt:1793527200000}],
  appData:{left:['Deneme A'],right:['Deneme B'],history:[{time:'1.11.2026 12:00:00',name:'Deneme B',from:'Kılınmayanlar',to:'Kılınanlar'}]},
  quran_listening_completed_cycles_v1:2,
  'kaza_today_2026-11-01':3,
};
export const encodedFixtures = Object.fromEntries(Object.entries(progressFixtures).map(([key,value]) => [key,JSON.stringify(value)]));
