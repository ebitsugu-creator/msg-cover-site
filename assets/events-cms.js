(() => {
  'use strict';

  const mount = document.getElementById('cms-events');
  if (!mount) return;

  const REPO_API = 'https://api.github.com/repos/ebitsugu-creator/msg-cover-site/contents/content/free?ref=main';
  const categoryLabels = { events: 'イベント・勉強会' };
  const subcategoryLabels = {
    events_study: '勉強会',
    events_party: 'パーティ・交流',
    events_policy: '党運営・政策関連・その他',
    events_member: 'メンバー紹介',
    events_other: 'その他'
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]));

  function parseScalar(raw) {
    const v = raw.trim();
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null') return null;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
    return v;
  }

  function parseMarkdown(text, sourceUrl) {
    const normalized = text.replace(/^\uFEFF/, '');
    const m = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) return null;
    const data = {};
    m[1].split(/\r?\n/).forEach(line => {
      const i = line.indexOf(':');
      if (i < 1) return;
      data[line.slice(0, i).trim()] = parseScalar(line.slice(i + 1));
    });
    return { ...data, body: m[2].trim(), sourceUrl, fileName: sourceUrl ? decodeURIComponent(sourceUrl.split('/').pop()) : '' };
  }

  function toDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function isVisible(article, now) {
    if (article.category !== 'events' || article.publishable !== true || article.isDraft === true) return false;
    const start = toDate(article.publishStartAt);
    const end = toDate(article.publishEndAt);
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }

  function formatDate(value) {
    const d = toDate(value);
    if (!d) return { iso: '', main: '日程未定', sub: '' };
    const wd = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
    return {
      iso: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      main: `${d.getMonth()+1}.${d.getDate()}`,
      sub: `${d.getFullYear()}　${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${wd}`
    };
  }

  function renderCard(article) {
    const date = formatDate(article.eventAt);
    const sub = subcategoryLabels[article.subcategory] || article.subcategory || 'その他';
    const image = article.image1 || article.image2 || '';
    const detailUrl = `article.html?collection=free&file=${encodeURIComponent(article.fileName)}`;
    const action = article.linkUrl ? `<a class="cms-event-button" href="${escapeHtml(article.linkUrl)}">${escapeHtml(article.linkLabel || '申し込む')} →</a>` : '';
    const imageHtml = image ? `<a class="cms-event-image" href="${detailUrl}" aria-label="${escapeHtml(article.title || '記事を読む')}"><img src="${escapeHtml(image)}" alt="" loading="lazy"></a>` : '';
    return `
      <article class="cms-event-card" data-subcategory="${escapeHtml(article.subcategory || '')}">
        ${imageHtml}
        <div class="cms-event-main">
          <div class="cms-event-meta">
            <span class="tag">${escapeHtml(sub)}</span>
            <time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.main)} <small>${escapeHtml(date.sub)}</small></time>
          </div>
          <h3><a class="cms-event-title-link" href="${detailUrl}">${escapeHtml(article.title || '無題')}</a></h3>
          ${article.subtitle ? `<p class="cms-event-subtitle">${escapeHtml(article.subtitle)}</p>` : ''}
          ${article.summary ? `<p class="cms-event-summary">${escapeHtml(article.summary)}</p>` : ''}
          ${action}
        </div>
      </article>`;
  }

  async function load() {
    try {
      const listingRes = await fetch(REPO_API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!listingRes.ok) throw new Error(`GitHub API ${listingRes.status}`);
      const files = (await listingRes.json()).filter(item => item.type === 'file' && /\.md$/i.test(item.name));
      const texts = await Promise.all(files.map(async file => {
        const res = await fetch(file.download_url, { cache: 'no-store' });
        return res.ok ? parseMarkdown(await res.text(), file.html_url) : null;
      }));
      const now = new Date();
      const articles = texts.filter(Boolean).filter(a => isVisible(a, now)).sort((a,b) => {
        const ad = toDate(a.eventAt) || toDate(a.publishedAt) || new Date(0);
        const bd = toDate(b.eventAt) || toDate(b.publishedAt) || new Date(0);
        return ad - bd;
      });
      if (!articles.length) {
        mount.innerHTML = '<p class="cms-events-status">現在、掲載中のイベント・勉強会はありません。</p>';
        return;
      }
      const groups = new Map();
      articles.forEach(a => {
        const key = a.subcategory || 'events_other';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(a);
      });
      mount.innerHTML = [...groups.entries()].map(([key, items]) => `
        <section class="cms-event-group" aria-label="${escapeHtml(subcategoryLabels[key] || key)}">
          <h3 class="cms-event-group-title">${escapeHtml(subcategoryLabels[key] || key)}</h3>
          <div class="cms-event-list">${items.map(renderCard).join('')}</div>
        </section>`).join('');
    } catch (err) {
      console.error('[events-cms]', err);
      mount.innerHTML = '<p class="cms-events-status">記事を読み込めませんでした。時間をおいて再度お試しください。</p>';
    }
  }

  load();
})();
