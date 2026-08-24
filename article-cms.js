(() => {
  'use strict';
  const mount = document.getElementById('cms-article');
  if (!mount) return;
  const params = new URLSearchParams(location.search);
  const collection = params.get('collection') || 'free';
  const file = params.get('file') || '';
  const allowedCollections = new Set(['free']);
  const categoryLabels = { events: 'イベント・勉強会' };
  const subcategoryLabels = { events_advance:'事前告知', events_notice:'事前告知', events_study:'事前告知', events_report:'開催レポート' };
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function scalar(raw){ const v=raw.trim(); if(v==='true')return true;if(v==='false')return false;if(v==='null')return null;if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))return v.slice(1,-1);return v; }
  function parse(text){ const m=text.replace(/^\uFEFF/,'').match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/); if(!m)return null; const d={}; m[1].split(/\r?\n/).forEach(line=>{const i=line.indexOf(':');if(i>0)d[line.slice(0,i).trim()]=scalar(line.slice(i+1));}); return {...d,body:m[2].trim()}; }
  function inline(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/==(.+?)==/g,'<mark>$1</mark>').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2">$1</a>'); }
  function markdown(md){
    const lines=md.split(/\r?\n/), out=[]; let list=false;
    const close=()=>{if(list){out.push('</ul>');list=false;}};
    for(const raw of lines){ const line=raw.trim(); if(!line){close();continue;} const h=line.match(/^(#{1,6})\s+(.+)$/); if(h){close();const n=Math.min(4,Math.max(2,h[1].length));out.push(`<h${n}>${inline(h[2])}</h${n}>`);continue;} if(/^[-*]\s+/.test(line)){if(!list){out.push('<ul>');list=true;}out.push(`<li>${inline(line.replace(/^[-*]\s+/,''))}</li>`);continue;} close();out.push(`<p>${inline(line)}</p>`); } close(); return out.join('\n');
  }
  function date(v){ if(!v)return ''; const d=new Date(v); if(Number.isNaN(d.getTime()))return esc(v); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; }
  async function load(){
    try{
      if(!allowedCollections.has(collection) || !/^[^/\\]+\.md$/i.test(file)) throw new Error('invalid article');
      const url=`https://raw.githubusercontent.com/ebitsugu-creator/msg-cover-site/main/content/${encodeURIComponent(collection)}/${encodeURIComponent(file)}`;
      const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error(`GitHub ${r.status}`); const a=parse(await r.text()); if(!a || a.publishable!==true || a.isDraft===true)throw new Error('not published');
      const cat=categoryLabels[a.category]||a.category||''; const sub=subcategoryLabels[a.subcategory]||a.subcategory||'';
      const rawImage=a.image1||a.image2||''; const image=rawImage.startsWith('/images/')?`/public${rawImage}`:rawImage; document.title=`${a.title||'記事'}｜中くらいの政府`;
      mount.innerHTML=`
        <nav class="cms-article-breadcrumb" aria-label="パンくず"><a href="activity.html#events">イベント・勉強会</a><span>›</span><span>${esc(sub||cat)}</span></nav>
        <header class="cms-article-head">
          <div class="cms-article-labels">${cat?`<span class="tag">${esc(cat)}</span>`:''}${sub?`<span class="cms-article-subcat">${esc(sub)}</span>`:''}</div>
          <h1>${esc(a.title||'無題')}</h1>
          ${a.subtitle?`<p class="cms-article-subtitle">${esc(a.subtitle)}</p>`:''}
          ${a.publishedAt?`<time datetime="${esc(a.publishedAt)}">${date(a.publishedAt)}</time>`:''}
        </header>
        ${image?`<figure class="cms-article-eyecatch"><img src="${esc(image)}" alt="" loading="eager"></figure>`:''}
        ${a.summary?`<p class="cms-article-summary">${esc(a.summary)}</p>`:''}
        <div class="cms-article-body">${markdown(a.body||'')}</div>
        ${a.videoUrl?`<p class="cms-article-video"><a href="${esc(a.videoUrl)}">動画を見る →</a></p>`:''}
        ${a.linkUrl?`<p class="cms-article-action"><a class="btn btn-primary" href="${esc(a.linkUrl)}">${esc(a.linkLabel||'詳しく見る')}</a></p>`:''}
        <p class="cms-article-back"><a href="activity.html#events">← イベント・勉強会へ戻る</a></p>`;
    }catch(e){console.error('[article-cms]',e);mount.innerHTML='<div class="cms-article-error"><h1>記事を表示できませんでした</h1><p>記事が見つからないか、現在公開されていません。</p><p><a href="activity.html#events">イベント・勉強会へ戻る</a></p></div>';}
  }
  load();
})();
