/*
  共通ナビゲーション v3 — 中くらいの政府
  ---------------------------------------------------------
  すべてのページ(トップ・下層)で使う、ヘッダー／フッター／お知らせ の定義。
  ここを直せば全ページに反映されます。

  ■ ヘッダー = メインコンテンツ（3分類）※全ページ同じ・画面上部に固定
     らしさ: 「中くらい」とは／成熟期の政治システム／私たちのスタイル／港区からはじめよう
     今    : What's New／推しネタ
     ともに: 寄付をする・会員になる／イベント・勉強会
     いま見ているページの項目は紺の丸い塗り(aria-current)で示します。
     ナビが畳まれる幅では <body data-page-title> のページ名をロゴ横に表示。
  ■ フッター = サポートコンテンツ
     概要／Q&A・綱領・基本政策・ご意見・ご相談・TOP・Music Video
  ■ お知らせ（ヘッダー右上）
     固定2件 + 新着3件（activity.html の What's New から自動取得）
*/
(function () {
  "use strict";

  /* ---------- 定義 ---------- */
  var MENU_URL = "index.html#explore";   /* 「TOP」＝8つの入口(メニュー画面) */

  var HEADER = [
    { group: "らしさ", items: [
      { label: "「中くらい」とは",   href: "about.html",  key: "about" },
      { label: "成熟期の政治システム", href: "system.html", key: "system" },
      { label: "私たちのスタイル",   href: "style.html",  key: "style" },
      { label: "港区からはじめよう", href: "https://miraiwithyou-minato.sites.repaint.com", ext: true }
    ]},
    { group: "今", items: [
      { label: "What's New", href: "whatsnew.html", key: "whatsnew" },
      { label: "推しネタ",   href: "featured.html", key: "featured" }
    ]},
    { group: "ともに", items: [
      { label: "寄付をする・会員になる", href: "join.html", key: "join" },
      { label: "イベント・勉強会",   href: "activity.html#events", key: "activity", hash: "#events" }
    ]}
  ];
  /* key … ページのファイル名(拡張子なし)。hash … 同じページ内で項目を分けるときの #。
     現在地の判定(ヘッダーの丸い塗り／ドロワーの●)に使います。 */

  var FOOTER = [
    { label: "概要／Q&A",  href: "organization.html" },
    { label: "綱領",       href: "https://miraiwithyou-platform.sites.repaint.com", ext: true },
    { label: "基本政策",   href: "https://miraiwithyou-policies.sites.repaint.com/", ext: true },
    { label: "ご意見・ご相談", href: "#contact" }
  ];
  /* TOP と Music Video は画面右下の丸ボタン(全ページ共通) */
  var FLOAT_BUTTONS = [
    { label: "MV",  title: "Music Video", href: "mv.html" },
    { label: "TOP", title: "TOP（8つの入口）へ", href: MENU_URL, top: true }
  ];

  /* お知らせ：固定2件（ここを書き換えてください） */
  var NOTICE_FIXED = [
    { label: "政治団体設立のお知らせ", href: "whatsnew.html" },
    { label: "寄附・会員のご案内",     href: "join.html" }
  ];
  var NOTICE_ROTATE = 3;   /* 新着から自動で載せる件数 */

  var CONTACT_MAIL = "contact@miraiwithyou.jp";
  var CONTACT_NAME = "中くらいの政府　ご意見・ご相談窓口";

  /* ---------- ユーティリティ ---------- */
  function esc(v) {
    return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function pageKey() {
    var f = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    return f.replace(/\.html$/, "") || "index";
  }
  function isTop() { return pageKey() === "index"; }
  function extAttr(item) { return item.ext ? ' target="_blank" rel="noopener"' : ""; }

  /* ---------- 現在地の判定 ---------- */
  /* いま見ているページに当たるヘッダー項目とその分類。
     同じページに複数の項目があるとき(activity: What's New／イベント)は
     URLの # で区別し、# が無い(または該当なし)なら先頭の項目 */
  function currentEntry() {
    var cur = pageKey(), hash = location.hash || "";
    var same = [];
    HEADER.forEach(function (g) {
      g.items.forEach(function (it) { if (it.key === cur) same.push({ group: g.group, item: it }); });
    });
    if (!same.length) return null;
    for (var i = 0; i < same.length; i++) { if (same[i].item.hash && same[i].item.hash === hash) return same[i]; }
    return same[0];
  }
  /* リンク要素(data-mn-key / data-mn-hash 付き)に aria-current を付け外し。
     同じページに複数の項目があるとき(activity: What's New／イベント)は
     URLの # で区別し、# が無ければ先頭の項目を現在地にする */
  function markCurrent(root) {
    var e = currentEntry();
    var links = Array.prototype.slice.call(root.querySelectorAll("a[data-mn-key]"));
    root.querySelectorAll(".mn-group.is-current").forEach(function (g) { g.classList.remove("is-current"); });
    links.forEach(function (a) {
      var on = !!e && a.getAttribute("data-mn-key") === e.item.key &&
               (a.getAttribute("data-mn-hash") || "") === (e.item.hash || "");
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      if (on) { var g = a.closest(".mn-group"); if (g) g.classList.add("is-current"); }
    });
  }

  /* ---------- ヘッダー ---------- */
  function pageTitle() { return document.body.getAttribute("data-page-title") || ""; }
  /* ヘッダー内のページ名(下層ページ)。
     3分類ナビが横並びの幅では出さず(ナビの現在地の塗りで足りる)、
     ナビがハンバーガーに畳まれる幅で表示。スマホは幅が無いので、
     スクロール後にロゴと入れ替わりで表示 */
  function pageBarHTML() {
    var title = pageTitle();
    if (!title) return "";
    return '<div class="mn-page"><span class="mn-page-title">' + esc(title) + '</span></div>';
  }

  function keyAttr(it) {
    return it.key ? ' data-mn-key="' + esc(it.key) + '"' + (it.hash ? ' data-mn-hash="' + esc(it.hash) + '"' : '') : '';
  }
  function headerHTML() {
    var pageBar = pageBarHTML();
    var groups = HEADER.map(function (g) {
      var items = g.items.map(function (it) {
        return '<a href="' + esc(it.href) + '"' + extAttr(it) + keyAttr(it) + '>' + esc(it.label) + '</a>';
      }).join("");
      return '<div class="mn-group"><span class="mn-group-name">' + esc(g.group) + '</span><div class="mn-group-items">' + items + '</div></div>';
    }).join("");

    return '' +
      '<div class="mn-inner' + (pageBar ? ' has-page' : '') + '">' +
        '<a class="mn-brand" href="' + esc(MENU_URL) + '" aria-label="中くらいの政府 メニューへ">' +
          '<img src="assets/img/msg-logo-ja.png" alt="中くらいの政府" width="300" height="66">' +
          '<span class="mn-brand-en" aria-hidden="true">MSG — MEDIUM SIZED GOVERNMENT</span>' +
        '</a>' +
        pageBar +
        '<nav class="mn-nav" aria-label="メインメニュー">' + groups + '</nav>' +
        '<div class="mn-tools">' +
          '<div class="mn-notice">' +
            '<button class="mn-notice-btn" type="button" aria-expanded="false" aria-controls="mn-notice-panel">お知らせ</button>' +
            '<div class="mn-notice-panel" id="mn-notice-panel" role="region" aria-label="お知らせ">' +
              '<p class="mn-notice-head">お知らせ</p>' +
              '<ul class="mn-notice-fixed"></ul>' +
              '<p class="mn-notice-sub">新着</p>' +
              '<ul class="mn-notice-new"><li class="mn-notice-loading">読み込み中…</li></ul>' +
              '<a class="mn-notice-more" href="whatsnew.html">すべて見る →</a>' +
            '</div>' +
          '</div>' +
          '<a class="mn-cta" href="join.html">参加する</a>' +
          '<button class="mn-menu-btn" type="button" aria-expanded="false" aria-controls="mn-drawer" aria-label="メニューを開く"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
      '<div class="mn-drawer" id="mn-drawer" aria-label="メニュー">' +
        '<div class="mn-drawer-inner">' +
          HEADER.map(function (g) {
            return '<div class="mn-drawer-group"><p class="mn-drawer-name">' + esc(g.group) + '</p>' +
              g.items.map(function (it) {
                return '<a href="' + esc(it.href) + '"' + extAttr(it) + keyAttr(it) + '>' + esc(it.label) + '</a>';
              }).join("") + '</div>';
          }).join("") +
          '<div class="mn-drawer-group mn-drawer-support"><p class="mn-drawer-name">サポート</p>' +
            FOOTER.map(function (it) {
              if (it.href === "#contact") return '<a href="#" data-mn-contact>' + esc(it.label) + '</a>';
              return '<a href="' + esc(it.href) + '"' + extAttr(it) + '>' + esc(it.label) + '</a>';
            }).join("") +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- フッター ---------- */
  function footerHTML() {
    var links = FOOTER.map(function (it) {
      if (it.href === "#contact") return '<a href="#" data-mn-contact>' + esc(it.label) + '</a>';
      return '<a href="' + esc(it.href) + '"' + extAttr(it) + '>' + esc(it.label) + '</a>';
    }).join("");
    return '' +
      '<div class="mf-inner mf-inner--line">' +
        '<a class="mf-brand" href="' + esc(MENU_URL) + '" aria-label="中くらいの政府 メニューへ">' +
          '<img src="assets/img/msg-logo-white-ja.png" alt="中くらいの政府" width="625" height="82" loading="lazy">' +
        '</a>' +
        '<nav class="mf-links" aria-label="サポート">' + links + '</nav>' +
        '<p class="mf-copy">© 中くらいの政府（MSG）</p>' +
      '</div>';
  }

  /* ---------- 右下の丸ボタン（MV / TOP） ---------- */
  function mountFloat() {
    if (document.querySelector(".mn-float")) return;
    var box = document.createElement("div");
    box.className = "mn-float";
    box.innerHTML = FLOAT_BUTTONS.map(function (b) {
      return '<a class="mn-float-btn' + (b.top ? ' mn-float-btn--top' : '') + '" href="' + esc(b.href) + '" title="' + esc(b.title) + '" aria-label="' + esc(b.title) + '">' + esc(b.label) + '</a>';
    }).join("");
    document.body.appendChild(box);
    var topBtn = box.querySelector(".mn-float-btn--top");
    function sync() {
      var show = window.scrollY > 240 || document.body.getAttribute("data-page-title");
      if (topBtn) topBtn.classList.toggle("is-visible", !!show);
    }
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  /* ---------- お知らせ ---------- */
  function fillNotice(root) {
    var fixed = root.querySelector(".mn-notice-fixed");
    var fresh = root.querySelector(".mn-notice-new");
    if (fixed) {
      fixed.innerHTML = NOTICE_FIXED.map(function (n) {
        return '<li><a href="' + esc(n.href) + '">' + esc(n.label) + '</a></li>';
      }).join("");
    }
    if (!fresh) return;

    function render(items) {
      if (!items.length) { fresh.innerHTML = '<li class="mn-notice-empty">新着はありません</li>'; return; }
      fresh.innerHTML = items.map(function (n) {
        return '<li><a href="' + esc(n.href) + '"><time>' + esc(n.date) + '</time>' + esc(n.title) + '</a></li>';
      }).join("");
    }

    /* 同一ページ(activity.html)ならDOMから、それ以外はfetchで取得 */
    var local = document.querySelector("#news ul.news");
    if (local) { render(parse(local)); return; }
    if (!window.fetch) { render([]); return; }
    fetch("activity.html", { credentials: "same-origin" }).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var ul = doc.querySelector("#news ul.news");
      render(ul ? parse(ul) : []);
    }).catch(function () { render([]); });

    function parse(ul) {
      var out = [];
      Array.prototype.forEach.call(ul.querySelectorAll("li"), function (li) {
        var a = li.querySelector("a"), t = li.querySelector("time"), h = li.querySelector("h3");
        if (!a || !h) return;
        var href = a.getAttribute("href") || "activity.html#news";
        if (href === "activity.html") href = "activity.html#news";
        out.push({ href: href, date: t ? t.textContent.trim() : "", title: h.textContent.trim() });
      });
      /* 新しい順に並べて先頭N件 */
      out.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      return out.slice(0, NOTICE_ROTATE);
    }
  }

  /* ---------- ご意見・ご相談 ---------- */
  function openContact() {
    if (window.MSGOpenContact) { window.MSGOpenContact(); return; }
    var pop = document.getElementById("mn-contact");
    if (!pop) {
      pop = document.createElement("div");
      pop.id = "mn-contact"; pop.className = "mn-contact";
      pop.setAttribute("role", "dialog"); pop.setAttribute("aria-modal", "true"); pop.setAttribute("aria-label", "ご意見・ご相談");
      pop.innerHTML = '<div class="mn-contact-card">' +
        '<button class="mn-contact-close" type="button" aria-label="閉じる">×</button>' +
        '<p class="mn-contact-title">ご意見・ご相談</p>' +
        '<p class="mn-contact-lead">' + esc(CONTACT_NAME) + '<br>メールでお気軽にお寄せください。</p>' +
        '<a class="mn-contact-mail" href="mailto:' + esc(CONTACT_MAIL) + '">' + esc(CONTACT_MAIL) + '</a>' +
        '<button class="mn-contact-copy" type="button">メールアドレスをコピー</button>' +
      '</div>';
      document.body.appendChild(pop);
      pop.querySelector(".mn-contact-close").addEventListener("click", function () { pop.classList.remove("is-open"); });
      pop.addEventListener("click", function (e) { if (e.target === pop) pop.classList.remove("is-open"); });
      pop.querySelector(".mn-contact-copy").addEventListener("click", function () {
        var b = this;
        function done() { b.textContent = "コピーしました"; setTimeout(function () { b.textContent = "メールアドレスをコピー"; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CONTACT_MAIL).then(done);
        else { var ta = document.createElement("textarea"); ta.value = CONTACT_MAIL; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); done(); }
      });
    }
    pop.classList.add("is-open");
  }

  /* ---------- 組み立て ---------- */
  function mount() {
    var head = document.getElementById("msg-header");
    var foot = document.getElementById("msg-footer");
    if (head && !head.dataset.ready) {
      head.dataset.ready = "1";
      head.className = "mn";
      head.innerHTML = headerHTML();
      fillNotice(head);

      /* 現在地(ヘッダーの3分類ナビ／ドロワー)。#が変わっても追従 */
      markCurrent(head);
      window.addEventListener("hashchange", function () { markCurrent(head); });

      /* スクロール状態(スマホではロゴ⇄ページ名の入れ替えに使う) */
      var syncScrolled = function () { head.classList.toggle("is-scrolled", window.scrollY > 72); };
      window.addEventListener("scroll", syncScrolled, { passive: true });
      syncScrolled();

      var nb = head.querySelector(".mn-notice-btn"), np = head.querySelector(".mn-notice-panel");
      var mb = head.querySelector(".mn-menu-btn"), dr = head.querySelector(".mn-drawer");
      function setNotice(o) { np.classList.toggle("is-open", o); nb.setAttribute("aria-expanded", o ? "true" : "false"); }
      function setDrawer(o) { dr.classList.toggle("is-open", o); mb.setAttribute("aria-expanded", o ? "true" : "false"); mb.setAttribute("aria-label", o ? "メニューを閉じる" : "メニューを開く"); document.body.classList.toggle("mn-drawer-open", o); }
      nb.addEventListener("click", function () { setNotice(!np.classList.contains("is-open")); setDrawer(false); });
      mb.addEventListener("click", function () { setDrawer(!dr.classList.contains("is-open")); setNotice(false); });
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".mn-notice")) setNotice(false);
      });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setNotice(false); setDrawer(false); } });
      dr.addEventListener("click", function (e) { if (e.target.closest("a")) setDrawer(false); });
    }
    if (foot && !foot.dataset.ready) {
      foot.dataset.ready = "1";
      foot.className = "mf";
      foot.innerHTML = footerHTML();
    }
    mountFloat();
    document.addEventListener("click", function (e) {
      var c = e.target.closest("[data-mn-contact]");
      if (c) { e.preventDefault(); openContact(); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
