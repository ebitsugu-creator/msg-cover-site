(()=>{'use strict';
const host=document.getElementById('cms-whatsnew');if(!host)return;
const REPO='https://api.github.com/repos/ebitsugu-creator/msg-cover-site/contents/';
const SOURCES=[['free','content/free'],['lp-links','content/lp-links'],['text-qa','content/text-qa'],['videos','content/videos']];
const LABELS={
about_intro_message:'紹介・メッセージ',about_profile:'団体概要',about_people_org:'人事・組織',about_media:'広報・マスコミ登場',about_feedback:'頂いたご意見',about_other:'その他',
qa_membership:'会員に関して',qa_donation:'寄付に関して',qa_events:'勉強会・イベントに関して',qa_party:'党に対して',qa_policy:'政策に対して',qa_other:'その他',
events_advance:'事前告知',events_report:'開催レポート',events_study_library:'スタディライブラリ',events_party_library:'パーティライブラリ',
featured_hakomono:'ハコモノ探偵団',featured_closure:'港区廃業',featured_prices:'港区狂乱物価',featured_employment_social:'雇用・社会問題を斬る',featured_promo:'プロモーション・その他'};
let subcategories=null;
const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function scalar(r){let v=r.trim();if(v==='true')return true;if(v==='false')return false;if(v==='null')return null;if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);return v}
function parse(t,f,collection){const m=t.replace(/^\uFEFF/,'').match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);if(!m)return null;const d={};m[1].split(/\r?\n/).forEach(l=>{const i=l.indexOf(':');if(i>0)d[l.slice(0,i).trim()]=scalar(l.slice(i+1))});return {...d,fileName:f,collection}}
function dt(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function stamp(a){return dt(a.publishStartAt)||dt(a.publishedAt)}
function image(v){if(!v)return '';v=String(v).trim();if(/^https?:\/\//i.test(v))return v;if(v.startsWith('/public/'))return v;if(v.startsWith('public/'))return '/'+v;if(v.startsWith('/images/'))return '/public'+v;if(v.startsWith('images/'))return '/public/'+v;return v}
function yt(v){try{const u=new URL(String(v||'').trim().replace(/^["']|["']$/g,''));const h=u.hostname.replace(/^www\./,'');if(h==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||'';if(h==='youtube.com'||h==='m.youtube.com'||h==='music.youtube.com'||h==='youtube-nocookie.com'){const q=u.searchParams.get('v');if(q)return q;const m=u.pathname.match(/\/(?:shorts|embed|live|v)\/([^/?]+)/);return m?m[1]:''}}catch(_){}return ''}
function thumb(a){const id=yt(a.videoUrl||''),manual=image(a.image1||a.image2||'');if(a.collection==='videos'&&id)return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;if(manual)return manual;return id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:''}
async function youtubeMeta(a){if(a.collection!=='videos'||!yt(a.videoUrl||''))return a;try{const r=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(a.videoUrl)}&format=json`,{cache:'force-cache'});if(!r.ok)return a;const m=await r.json();return {...a,ytTitle:m.title||'',ytChannel:m.author_name||'',ytThumb:m.thumbnail_url||''}}catch(_){return a}}
function displayParts(a){if(a.collection!=='videos')return {title:a.title||'無題',summary:a.summary||''};const full=a.ytTitle||a.title||'動画',parts=String(full).split(/\s*[\/／∕⁄]\s*/);return {title:parts.shift()||'動画',summary:parts.length?parts.join('／'):(a.note||'')}}
function fmt(v,time=false){const d=dt(v);if(!d)return '';const base=`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;return time?`${base} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`:base}
function subLabel(a){return subcategories.label(a.subcategory)||LABELS[a.subcategory]||a.subcategory||'お知らせ'}
function isAdvance(a){return subcategories.matches(a.subcategory,'events_advance')}
function visible(a,now){if(a.publishable!==true||a.whatsNew!==true||a.isDraft===true||!subcategories.isActive(a.subcategory))return false;const s=dt(a.publishStartAt),e=dt(a.publishEndAt);if(s&&now<s)return false;if(e&&now>e)return false;if(isAdvance(a)){const ev=dt(a.eventAt);if(ev&&now>=ev)return false}const st=stamp(a);if(!st)return false;const limit=new Date(now);limit.setMonth(limit.getMonth()-3);return st>=limit}
function href(a){if(a.collection==='videos'){if(a.productionType==='external'&&a.videoUrl)return {url:a.videoUrl,ext:true};return {url:`article.html?collection=videos&file=${encodeURIComponent(a.fileName)}`,ext:false}}if(a.linkUrl)return {url:a.linkUrl,ext:/^https?:\/\//i.test(a.linkUrl)};return {url:`article.html?collection=${a.collection}&file=${encodeURIComponent(a.fileName)}`,ext:false}}
function meta(a){return `<div class="wn-meta"><time datetime="${esc(a.publishStartAt||a.publishedAt||'')}">${esc(fmt(stamp(a)))}</time><span class="wn-subcat">${esc(subLabel(a))}</span>${isAdvance(a)&&a.eventAt?`<span class="wn-event">開催 ${esc(fmt(a.eventAt,true))}</span>`:''}</div>`}
function mainCard(a){
 const h=href(a),im=thumb(a),attrs=h.ext?' target="_blank" rel="noopener noreferrer"':'',parts=displayParts(a);
 const date=`<time datetime="${esc(a.publishStartAt||a.publishedAt||'')}">${esc(fmt(stamp(a)))}</time>`;
 const sub=`<span class="wn-subcat">${esc(subLabel(a))}</span>`;
 const event=isAdvance(a)&&a.eventAt?`<span class="wn-event">開催 ${esc(fmt(a.eventAt,true))}</span>`:'';
 return `<article class="wn-main-card${im?'':' wn-main-card--noimage'}${parts.summary?'':' wn-main-card--nosummary'}">${im?`<a class="wn-main-image" href="${esc(h.url)}"${attrs}><img src="${esc(im)}" alt="" loading="lazy"></a>`:''}<div class="wn-main-body"><div class="wn-topline">${date}${sub}<h2><a href="${esc(h.url)}"${attrs}>${esc(parts.title)}</a>${parts.summary?`<span class="wn-inline-summary">　${esc(parts.summary)}</span>`:''}</h2>${event}</div></div></article>`
}
function compact(a){
 const h=href(a),attrs=h.ext?' target="_blank" rel="noopener noreferrer"':'',parts=displayParts(a);
 const sub=esc(subLabel(a));
 return `<article class="wn-compact-line"><time datetime="${esc(a.publishStartAt||a.publishedAt||'')}">${esc(fmt(stamp(a)))}</time><span class="wn-compact-subcat">${sub}</span><h3><a href="${esc(h.url)}"${attrs}>${esc(parts.title)}</a></h3><p>${parts.summary?esc(parts.summary):''}</p></article>`
}
async function source([collection,path]){const r=await fetch(`${REPO}${path}?ref=main&_=${Date.now()}`,{cache:'no-store'});if(r.status===404)return [];if(!r.ok)throw new Error(`${path}: ${r.status}`);const fs=(await r.json()).filter(x=>x.type==='file'&&/\.md$/i.test(x.name));return (await Promise.all(fs.map(async f=>{const q=await fetch(`${f.download_url}${f.download_url.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});return q.ok?parse(await q.text(),f.name,collection):null}))).filter(Boolean)}
async function load(){try{subcategories=await window.MSGSubcategories.ready;const all=(await Promise.all(SOURCES.map(source))).flat(),now=new Date();let items=all.filter(a=>visible(a,now)).sort((a,b)=>stamp(b)-stamp(a)).slice(0,15);items=await Promise.all(items.map(youtubeMeta));const top=items.slice(0,5),rest=items.slice(5,15);host.innerHTML=top.length?`<div class="wn-main-list">${top.map(mainCard).join('')}</div>${rest.length?`<div class="wn-older"><div class="wn-older-head"><span>MORE UPDATES</span><strong>過去の新着</strong></div><div class="wn-compact-list">${rest.map(compact).join('')}</div></div>`:''}`:'<p class="cms-events-status">現在、掲載中の新着情報はありません。</p>'}catch(err){console.error('[whatsnew]',err);host.innerHTML='<p class="cms-events-status">新着情報を読み込めませんでした。</p>'}}
load();})();
