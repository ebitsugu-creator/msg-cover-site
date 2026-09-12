(()=>{'use strict';
const API='https://api.github.com/repos/ebitsugu-creator/msg-cover-site/contents/content/subcategories';
const FALLBACK=[
['about_intro_message','about','【私たちについて】紹介・メッセージ','active',10,true],
['about_profile','about','【私たちについて】団体概要','active',20,true],
['about_people_org','about','【私たちについて】人事・組織','active',30,true],
['about_media','about','【私たちについて】広報・マスコミ登場','active',40,true],
['about_feedback','about','【私たちについて】頂いたご意見','active',50,true],
['about_other','about','【私たちについて】その他','active',60,true],
['qa_membership','qa','【Q&A】会員に関して','active',10,true],
['qa_donation','qa','【Q&A】寄付に関して','active',20,true],
['qa_events','qa','【Q&A】勉強会・イベントに関して','active',30,true],
['qa_party','qa','【Q&A】党に対して','active',40,true],
['qa_policy','qa','【Q&A】政策に対して','active',50,true],
['qa_other','qa','【Q&A】その他','active',60,true],
['events_advance','events','【イベント・勉強会】事前告知','active',10,true,'','これから開催するイベント・勉強会をご案内します。'],
['events_study_library','events','【イベント・勉強会】スタディ・ライブラリ','active',20,true,'','勉強会の開催レポート・動画などをまとめています。'],
['events_party_library','events','【イベント・勉強会】イベント・ライブラリ','active',30,true,'','交流会・パーティなどの開催レポート・動画をまとめています。'],
['featured_hakomono','featured','【推しネタ】ハコモノ探偵団','active',10,true],
['featured_prices','featured','【推しネタ】港区狂乱物価','active',20,true],
['featured_closure','featured','【推しネタ】港区廃業','active',30,true],
['featured_employment_social','featured','【推しネタ】雇用・社会問題を斬る','active',40,true],
['featured_promo','featured','【推しネタ】プロモーション・その他','active',50,true],
].map(([id,category,label,status,displayOrder,showBackNumber,mergeInto='',description=''])=>({id,category,label,status,displayOrder,showBackNumber,mergeInto,description}));
const cleanLabel=v=>String(v||'').replace(/^【[^】]+】\s*/,'').trim();
function createManager(rows){
 const byId=new Map((rows||[]).filter(x=>x&&x.id).map(x=>[String(x.id),x]));
 function resolveId(value){
  let id=String(value||''),steps=0;const seen=new Set();
  while(id&&steps++<20){const row=byId.get(id);if(!row||row.status!=='merged'||!row.mergeInto||seen.has(id))break;seen.add(id);id=String(row.mergeInto)}
  return id;
 }
 function get(value){return byId.get(resolveId(value))||null}
 function label(value){const row=get(value);return cleanLabel(row?row.label:value)}
 function matches(left,right){const a=resolveId(left),b=resolveId(right);return Boolean(a&&b&&a===b)}
 function isActive(value){const row=get(value);return Boolean(row&&row.status==='active')}
 function forCategory(category){return [...byId.values()].filter(x=>x.category===category&&x.status==='active'&&resolveId(x.id)===x.id).sort((a,b)=>(Number(a.displayOrder)||0)-(Number(b.displayOrder)||0)||String(a.label).localeCompare(String(b.label),'ja'))}
 function aliasesFor(value){const target=resolveId(value);return [...byId.keys()].filter(id=>resolveId(id)===target)}
 function showBackNumber(value){const row=get(value);return !row||row.showBackNumber!==false}
 function description(value){const row=get(value);return row&&row.description?String(row.description):''}
 return {resolveId,get,label,matches,isActive,forCategory,aliasesFor,showBackNumber,description,rows:[...byId.values()]};
}
async function load(){
 try{
  let rows=[];
  if(window.MSGRepo&&window.MSGRepo.list&&window.MSGRepo.text){
   const paths=await window.MSGRepo.list('content/subcategories','.json');
   rows=(await Promise.all(paths.map(async path=>{try{return {...JSON.parse(await window.MSGRepo.text(path)),id:path.split('/').pop().replace(/\.json$/i,'')}}catch(_){return null}}))).filter(Boolean);
  }else{
   const r=await fetch(`${API}?ref=main&_=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`subcategory list ${r.status}`);
   const files=(await r.json()).filter(x=>x.type==='file'&&/\.json$/i.test(x.name));
   rows=(await Promise.all(files.map(async f=>{try{const q=await fetch(`${f.download_url}${f.download_url.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});if(!q.ok)return null;return {...await q.json(),id:f.name.replace(/\.json$/i,'')}}catch(_){return null}}))).filter(Boolean);
  }
  if(!rows.length)throw new Error('subcategory master is empty');return createManager(rows);
 }catch(e){console.warn('[subcategory-manager] fallback master used',e);return createManager(FALLBACK)}
}
window.MSGSubcategories={ready:load(),createManager,fallback:FALLBACK};
})();
