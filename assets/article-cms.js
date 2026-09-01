(() => {
  'use strict';
  const mount = document.getElementById('cms-article');
  if (!mount) return;
  const params = new URLSearchParams(location.search);
  const collection = params.get('collection') || 'free';
  const file = params.get('file') || '';
  const allowedCollections = new Set(['free','text-qa','videos']);
  const categoryLabels = { events: 'イベント・勉強会', featured: '推しネタ', about:'私たちについて', qa:'Q&A' };
  const subcategoryLabels = { events_advance:'事前告知', events_notice:'事前告知', events_study:'事前告知', events_report:'開催レポート', about_intro_message:'紹介・メッセージ', about_profile:'団体概要', about_people_org:'人事・組織', about_media:'広報・マスコミ登場', about_feedback:'頂いたご意見', about_other:'その他', qa_membership:'会員に関して', qa_donation:'寄付に関して', qa_events:'勉強会・イベントに関して', qa_party:'党に対して', qa_policy:'政策に対して', qa_other:'その他' };
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function scalar(raw){ const v=raw.trim(); if(v==='true')return true;if(v==='false')return false;if(v==='null')return null;if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))return v.slice(1,-1);return v; }
  function parse(text){ const m=text.replace(/^\uFEFF/,'').match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/); if(!m)return null; const d={}; m[1].split(/\r?\n/).forEach(line=>{const i=line.indexOf(':');if(i>0)d[line.slice(0,i).trim()]=scalar(line.slice(i+1));}); return {...d,body:m[2].trim()}; }
  function inline(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/==(.+?)==/g,'<mark>$1</mark>').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2">$1</a>'); }
  function markdown(md){
    const lines=md.split(/\r?\n/), out=[]; let list=false;
    const close=()=>{if(list){out.push('</ul>');list=false;}};
    for(const raw of lines){ const line=raw.trim(); if(!line){close();continue;} const h=line.match(/^(#{1,6})\s+(.+)$/); if(h){close();const n=Math.min(5,Math.max(1,h[1].length));out.push(`<h${n}>${inline(h[2])}</h${n}>`);continue;} if(/^[-*]\s+/.test(line)){if(!list){out.push('<ul>');list=true;}out.push(`<li>${inline(line.replace(/^[-*]\s+/,''))}</li>`);continue;} close();out.push(`<p>${inline(line)}</p>`); } close(); return out.join('\n');
  }
  function date(v){ if(!v)return ''; const d=new Date(v); if(Number.isNaN(d.getTime()))return esc(v); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; }
  function imagePath(v){ if(!v)return ''; v=String(v).trim().replace(/^[\"']|[\"']$/g,''); if(/^https?:\/\//i.test(v))return v; if(v.startsWith('/public/'))return v; if(v.startsWith('public/'))return '/'+v; if(v.startsWith('/images/'))return '/public'+v; if(v.startsWith('images/'))return '/public/'+v; return v; }
  function youtubeId(v){ try{const u=new URL(v);if(u.hostname==='youtu.be')return u.pathname.slice(1);if(u.hostname.includes('youtube.com')){if(u.pathname==='/watch')return u.searchParams.get('v')||'';const m=u.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/);return m?m[1]:''}}catch(_){}return ''; }
  async function youtubeMeta(v){ try{const r=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(v)}&format=json`,{cache:'force-cache'});if(!r.ok)return {};return await r.json()}catch(_){return {}} }
  async function load(){
    try{
      if(!allowedCollections.has(collection) || !/^[^/\\]+\.md$/i.test(file)) throw new Error('invalid article');
      const url=`https://raw.githubusercontent.com/ebitsugu-creator/msg-cover-site/main/content/${encodeURIComponent(collection)}/${encodeURIComponent(file)}`;
      const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error(`GitHub ${r.status}`); const a=parse(await r.text()); if(!a || a.publishable!==true || a.isDraft===true)throw new Error('not published');
      if(collection==='videos'){
        if(a.productionType!=='original'){ if(a.videoUrl){ location.replace(a.videoUrl); return; } throw new Error('external video url missing'); }
        const id=youtubeId(a.videoUrl||''); if(!id)throw new Error('original video must be YouTube');
        const ym=await youtubeMeta(a.videoUrl); const title=ym.title||a.title||'動画'; const channel=ym.author_name||''; const extra=imagePath(a.image1||''); document.title=`${title}｜中くらいの政府`;
        const isFeatured=a.category==='featured'; const returnHref=isFeatured?'featured.html#featured':'activity.html#events'; const returnLabel=isFeatured?'推しネタ':'イベント・勉強会';
        mount.innerHTML=`<nav class="cms-article-breadcrumb" aria-label="パンくず"><a href="${returnHref}">${returnLabel}</a><span>›</span><span>動画</span></nav><div class="cms-video-watch"><header class="cms-article-head"><div class="cms-article-labels"><span class="tag">中くらいの政府制作</span></div><h1>${esc(title)}</h1>${channel?`<p class="cms-video-watch-channel">${esc(channel)}</p>`:''}</header><div class="cms-video-player"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>${extra||a.note?`<div class="cms-video-watch-meta">${extra?`<img class="cms-video-watch-extra" src="${esc(extra)}" alt="">`:''}${a.note?`<p class="cms-video-watch-note">${esc(a.note)}</p>`:''}</div>`:''}<p class="cms-article-back"><a href="${returnHref}">← ${returnLabel}へ戻る</a></p></div>`; return;
      }
      const cat=categoryLabels[a.category]||a.category||''; const sub=subcategoryLabels[a.subcategory]||a.subcategory||'';
      const isOrg=a.category==='about'||a.category==='qa'||collection==='text-qa'; const returnHref=isOrg?'organization.html':'activity.html#events'; const returnLabel=isOrg?'概要・Q&A':'イベント・勉強会';
      const image1=imagePath(a.image1||''); const image2=imagePath(a.image2||''); document.title=`${a.title||'記事'}｜中くらいの政府`;
      const breadcrumb=`<nav class="cms-article-breadcrumb" aria-label="パンくず"><a href="${returnHref}">${returnLabel}</a><span>›</span>${cat?`<span>${esc(cat)}</span><span>›</span>`:''}<span>${esc(sub||'記事')}</span>${a.publishedAt?`<time datetime="${esc(a.publishedAt)}">${date(a.publishedAt)}</time>`:''}</nav>`;
      const head=`<header class="cms-article-head"><h1>${esc(a.title||'無題')}</h1>${a.subtitle?`<p class="cms-article-subtitle">${esc(a.subtitle)}</p>`:''}</header>`;
      mount.innerHTML=`
        <section class="cms-article-hero${image1?' has-image':''}">
          ${image1?`<figure class="cms-article-image1"><img src="${esc(image1)}" alt="" loading="eager"></figure>`:''}
          <div class="cms-article-hero-copy">${breadcrumb}${head}${a.summary?`<p class="cms-article-summary cms-article-summary-hero">${esc(a.summary)}</p>`:''}</div>
        </section>
        <section class="cms-article-content">
          <div class="cms-article-body">${markdown(a.body||'')}</div>
          ${image2?`<figure class="cms-article-image2"><img src="${esc(image2)}" alt="" loading="lazy"></figure>`:''}
          ${a.videoUrl?`<p class="cms-article-video"><a href="${esc(a.videoUrl)}">動画を見る →</a></p>`:''}
          ${a.linkUrl?`<p class="cms-article-action"><a class="btn btn-primary" href="${esc(a.linkUrl)}">${esc(a.linkLabel||'詳しく見る')}</a></p>`:''}
        </section>
        <p class="cms-article-back"><a href="${returnHref}">← ${returnLabel}へ戻る</a></p>`;
    }catch(e){console.error('[article-cms]',e);mount.innerHTML='<div class="cms-article-error"><h1>記事を表示できませんでした</h1><p>記事が見つからないか、現在公開されていません。</p><p><a href="activity.html#events">イベント・勉強会へ戻る</a></p></div>';}
  }
  load();
})();
