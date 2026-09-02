/* 中くらいの政府 — 共通の小さな仕掛け
   ・モバイルメニューの開閉(キーボード対応)
   ・スクロールに合わせたふわっと表示(動きを減らす設定時は無効)
   ・ページ先頭へ戻るボタン
*/
(function () {
  "use strict";

  /* ---------- モバイルメニュー ---------- */
  var gh = document.querySelector(".gh");
  var btn = gh && gh.querySelector(".gh-menu-btn");
  var drop = gh && gh.querySelector(".gh-drop");

  if (gh && btn && drop) {
    var setOpen = function (open) {
      gh.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    };
    btn.addEventListener("click", function () {
      setOpen(!gh.classList.contains("open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gh.classList.contains("open")) {
        setOpen(false);
        btn.focus();
      }
    });
    drop.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    /* 画面を広げたときは開閉状態を戻す */
    var mq = window.matchMedia("(min-width:1024px)");
    var sync = function () { if (mq.matches) setOpen(false); };
    mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
  }

  /* ---------- ふわっと表示 ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".rv");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("on"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 図のスクロール連動シーン ---------- */
  var tracks = Array.prototype.slice.call(document.querySelectorAll("[data-fs]"));
  if (tracks.length) {
    tracks.forEach(function (t) { t.classList.add("js-fs"); });
    if (reduce) {
      tracks.forEach(function (t) {
        t.querySelectorAll(".fs-st").forEach(function (el) { el.classList.add("on"); });
      });
    } else {
      var fsUpdate = function () {
        tracks.forEach(function (track) {
          var steps = Number(track.dataset.steps || 0);
          var rect = track.getBoundingClientRect();
          var dist = Math.max(1, track.offsetHeight - window.innerHeight);
          var p = Math.max(0, Math.min(1, -rect.top / dist));
          var step = Math.min(steps, Math.floor(p * (steps + 1)));
          track.querySelectorAll(".fs-st").forEach(function (el) {
            el.classList.toggle("on", Number(el.dataset.st || 0) <= step);
          });
        });
      };
      var fsTick = false;
      var fsRequest = function () {
        if (!fsTick) { fsTick = true; window.requestAnimationFrame(function () { fsTick = false; fsUpdate(); }); }
      };
      window.addEventListener("scroll", fsRequest, { passive: true });
      window.addEventListener("resize", fsRequest, { passive: true });
      fsUpdate();
    }
  }

})();
