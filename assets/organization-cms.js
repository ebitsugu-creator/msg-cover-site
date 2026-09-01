(()=>{'use strict';
const host=document.getElementById('cms-organization');if(!host)return;
const ROOT='https://api.github.com/repos/ebitsugu-creator/msg-cover-site/contents/content';
const GROUPS={about:{label:'私たちについて',subs:[['about_intro_message','紹介・メッセージ'],['about_profile','団体概要'],['about_people_org','人事・組織'],['about_media','広報・マスコミ登場'],['about_feedback','頂いたご意見'],['about_other','その他']]},qa:{label:'Q&A',subs:[['qa_membership','会員に関して'],['qa_donation','寄付に関して'],['qa_events','勉強会・イベントに関して'],['qa_party','党に対して'],['qa_policy','政策に対して'],['qa_other','その他']]}};
const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function scalar(r){let v=r.trim();if(v==='true')return true;if(v==='false')return false;if(v==='null')return null;if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);return v}
function parse(t,f,collection){const m=t.replace(/^\uFEFF/,'').match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);if(!m)return null;const d={};m[1].split(/\r?\n/).forEach(l=>{const i=l.indexOf(':');if(i>0)d[l.slice(0,i).trim()]=scalar(l.slice(i+1))});return {...d,fileName:f,collection}}
function dt(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function visible(a,now){if(!['about','qa'].includes(a.category)||a.publishable!==true||a.isDraft===true)return false;const s=dt(a.publishStartAt),e=dt(a.publishEndAt);return !(s&&now<s)&&!(e&&now>e)}
function date(v){const d=dt(v);return d?`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`:''}
function image(v){if(!v)return '';v=String(v).trim().replace(/^["']|["']$/g,'');if(/^https?:\/\//i.test(v))return v;if(v.startsWith('/public/'))return v;if(v.startsWith('public/'))return '/'+v;if(v.startsWith('/images/'))return '/public'+v;if(v.startsWith('images/'))return '/public/'+v;return v}
async function collection(name){const r=await fetch(`${ROOT}/${name}?ref=main&_=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`${name} ${r.status}`);const fs=(await r.json()).filter(x=>x.type==='file'&&/\.md$/i.test(x.name));return (await Promise.all(fs.map(async f=>{const q=await fetch(`${f.download_url}${f.download_url.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});return q.ok?parse(await q.text(),f.name,name):null}))).filter(Boolean)}
function card(a){const url=`article.html?collection=${encodeURIComponent(a.collection)}&file=${encodeURIComponent(a.fileName)}`,img=image(a.image1||a.image2||''),qa=a.category==='qa'||a.articleType==='qa',text=a.articleType==='text';const kind=qa?'Q&amp;A':text?'テキスト情報':'フリー記事';return `<article class="cms-org-card">${img?`<a class="cms-org-card-image" href="${url}"><img src="${esc(img)}" alt="" loading="lazy"></a>`:''}<div class="cms-org-card-body"><div class="cms-org-card-meta"><span class="cms-org-kind">${kind}</span>${a.publishedAt?`<time datetime="${esc(a.publishedAt)}">${esc(date(a.publishedAt))}</time>`:''}</div><h3><a href="${url}">${esc(a.title||'無題')}</a></h3>${a.subtitle?`<p class="cms-org-card-subtitle">${esc(a.subtitle)}</p>`:''}${a.summary?`<p class="cms-org-card-summary">${esc(a.summary)}</p>`:''}</div></article>`}
let all=[],group='',sub='';
function render(){
const groupButtons=Object.entries(GROUPS).map(([key,v])=>`<button type="button" class="cms-org-major${key===group?' is-active':''}" data-group="${key}" aria-pressed="${key===group}">${v.label}</button>`).join('');
if(!group){
  host.innerHTML=`<div class="cms-org-choice-stage cms-org-choice-major"><p class="cms-org-step">まず、カテゴリを選択してください</p><nav class="cms-org-major-nav" aria-label="大カテゴリ">${groupButtons}</nav></div>`;
  host.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;sub='';render()}));
  return;
}
const g=GROUPS[group];
const available=g.subs.filter(([key])=>all.some(a=>a.category===group&&a.subcategory===key));
const subButtons=available.map(([key,label])=>`<button type="button" class="cms-org-sub${key===sub?' is-active':''}" data-sub="${key}" aria-pressed="${key===sub}">${label}</button>`).join('');
let results='';
if(sub){
  const items=all.filter(a=>a.category===group&&a.subcategory===sub).sort((a,b)=>(dt(b.publishedAt)?.getTime()||0)-(dt(a.publishedAt)?.getTime()||0));
  results=`<section class="cms-org-results"><div class="cms-org-results-head"><h2>${esc((g.subs.find(x=>x[0]===sub)||[])[1]||'')}</h2><span>${items.length}件</span></div>${items.length?`<div class="cms-org-card-rail">${items.slice(0,3).map(card).join('')}</div>`:'<p class="cms-org-empty">現在、掲載中の記事はありません。</p>'}${items.length>3?`<p class="cms-backnumber"><a href="organization-backnumber.html?group=${encodeURIComponent(group)}&subcategory=${encodeURIComponent(sub)}">Back Number →</a></p>`:''}</section>`;
}
host.innerHTML=`<div class="cms-org-choice-stage cms-org-choice-major"><p class="cms-org-step">カテゴリ</p><nav class="cms-org-major-nav" aria-label="大カテゴリ">${groupButtons}</nav></div><div class="cms-org-choice-stage cms-org-choice-sub"><p class="cms-org-step">${esc(g.label)}のサブカテゴリを選択してください</p>${available.length?`<nav class="cms-org-sub-nav" aria-label="サブカテゴリ">${subButtons}</nav>`:'<p class="cms-org-empty">現在、公開中のカテゴリはありません。</p>'}</div>${results}`;
host.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;sub='';render()}));
host.querySelectorAll('[data-sub]').forEach(b=>b.addEventListener('click',()=>{sub=b.dataset.sub;render()}));
}
async function load(){try{const [free,textqa]=await Promise.all([collection('free'),collection('text-qa')]);const now=new Date();all=[...free,...textqa].filter(a=>visible(a,now));render()}catch(e){console.error('[organization]',e);host.innerHTML='<p class="cms-org-status">記事を読み込めませんでした。</p>'}}load();})();
