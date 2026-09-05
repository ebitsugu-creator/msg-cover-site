/*
  トップページ v4 — 白基調・さわやか（自動再生版）
  ---------------------------------------------------------
  ・冒頭のプロローグは「時間で自動進行」（スクロール不要）
    4つの文章 → 朝もやが晴れてキービジュアル → 終了（約22秒、音楽と同尺）
    クリック/タップで場面送り、SKIPで即終了、「もう一度」で再生
  ・BGM（assets/audio/opening-chorus.mp3）
    自動再生がブラウザに止められた場合は、最初の操作で鳴らす
  ・?view=top / #explore で来た場合はプロローグを飛ばして8つの入口へ
  ・セクションのふわっと表示、ヘッダー下の進捗ライン、トップに戻る
*/
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DURATION = 22000;   // 音源(約23秒)に合わせる
  var SEG = 0.185;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function smooth(v) { return v * v * (3 - 2 * v); }

  /* =========================================================
     プロローグ（自動再生）
  ========================================================= */
  var prologue = null;

  function initPrologue() {
    var root = document.getElementById("prologue");
    if (!root) return null;

    var stage = root.querySelector(".prologue-stage");
    var scenes = Array.prototype.slice.call(root.querySelectorAll(".pro-scene"));
    var sky = root.querySelector(".pro-sky");
    var mist = root.querySelector(".pro-mist");
    var bloom = root.querySelector(".pro-bloom");
    var clear = root.querySelector(".pro-clear");
    var final = root.querySelector(".pro-final");
    var guide = root.querySelector(".pro-guide");
    var skip = root.querySelector(".pro-skip");
    var timeline = document.getElementById("proTimeline");

    var startAt = 0;
    var offset = 0;        // 場面送りで進めた分（ms）
    var raf = 0;
    var finished = false;

    function render(p) {
      scenes.forEach(function (s, i) {
        var local = (p - i * SEG) / SEG;
        var op = 0, ty = 30;
        if (local >= 0 && local <= 1.18) {
          var rise = i === 0 ? 1 : Math.min(1, local / 0.32);
          op = local > 0.82 ? clamp((1.18 - local) / 0.36) : rise;
          ty = (1 - rise) * 34 - (local > 0.82 ? (local - 0.82) * 90 : 0);
        }
        s.style.opacity = op.toFixed(3);
        s.style.transform = "translate(-50%,-50%) translateY(" + ty.toFixed(1) + "px)";
      });

      var mp = clamp((p - 0.76) / 0.2);
      if (final) {
        final.style.opacity = mp.toFixed(3);
        final.style.transform = "scale(" + (0.955 + 0.045 * mp).toFixed(4) + ")";
      }
      var eo = smooth(mp);
      if (sky) {
        sky.style.opacity = (0.72 + 0.28 * eo).toFixed(3);
        sky.style.transform = "scale(" + (1.12 - 0.12 * eo).toFixed(4) + ")";
      }
      if (mist) mist.style.opacity = (1 - 0.88 * eo).toFixed(3);
      if (clear) clear.style.opacity = (0.2 * eo).toFixed(3);
      if (bloom) {
        var flash = Math.sin(Math.PI * clamp((mp - 0.1) / 0.55)) * 0.5;
        bloom.style.opacity = flash.toFixed(3);
        bloom.style.transform = "scale(" + (0.7 + 0.9 * eo).toFixed(3) + ")";
      }
      var bg = "rgb(" + Math.round(237 + 18 * eo) + "," + Math.round(245 + 10 * eo) + ",255)";
      if (stage) stage.style.background = bg;
      root.style.background = bg;

      if (skip) {
        skip.style.opacity = (1 - eo).toFixed(3);
        skip.style.pointerEvents = eo > 0.6 ? "none" : "auto";
      }
      if (guide) guide.style.opacity = clamp((p - 0.9) / 0.1).toFixed(3);
      if (timeline) timeline.style.width = (p * 100).toFixed(2) + "%";
    }

    function elapsed() {
      return (performance.now() - startAt) + offset;
    }

    var timer = 0;   // rAFが止まる環境(非表示タブ等)でも進むための保険

    function tick() {
      raf = 0;
      var p = clamp(elapsed() / DURATION);
      render(p);
      if (p >= 1) { finish(); return; }
      raf = window.requestAnimationFrame(tick);
    }

    function goMenu(delay) {
      /* 演出後はステージが縮み、キービジュアル＋8つの入口が1画面に収まる。
         ページ先頭に合わせる(スクロール不要で両方見える) */
      window.setTimeout(function () {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }, delay || 0);
    }

    function finish(opts) {
      if (finished) return;
      finished = true;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      if (timer) { window.clearInterval(timer); timer = 0; }
      render(1);
      root.classList.add("is-finished");
      var liveGrid = root.closest(".top-live-grid");
      if (liveGrid) liveGrid.classList.add("is-dashboard");
      document.body.classList.remove("prologue-running");
      document.dispatchEvent(new Event("MSGPrologueFinished"));
      /* 演出が終わったら、少し余韻を置いて8つの入口(メニュー画面)へ */
      if (!(opts && opts.stay)) goMenu(opts && opts.immediate ? 0 : 1600);
    }

    function play() {
      finished = false;
      offset = 0;
      startAt = performance.now();
      root.classList.remove("is-finished");
      var liveGrid = root.closest(".top-live-grid");
      if (liveGrid) liveGrid.classList.remove("is-dashboard");
      document.body.classList.add("prologue-running");
      if (raf) window.cancelAnimationFrame(raf);
      if (timer) window.clearInterval(timer);
      render(0);
      raf = window.requestAnimationFrame(tick);
      timer = window.setInterval(function () {
        if (finished) { window.clearInterval(timer); timer = 0; return; }
        var p = clamp(elapsed() / DURATION);
        render(p);
        if (p >= 1) finish();
      }, 250);
    }

    /* クリック/タップで次の場面へ */
    function advance() {
      if (finished) return false;
      var p = clamp(elapsed() / DURATION);
      var idx = Math.floor(p / SEG);
      var target = Math.min(1, (idx + 1) * SEG + 0.02);
      if (target >= 0.99) { finish(); return true; }
      offset = target * DURATION - (performance.now() - startAt);
      return true;
    }

    /* 再生中は演出のクリック(リンクやボタン以外)で場面送り */
    stage.addEventListener("pointerup", function (e) {
      if (e.button && e.button !== 0) return;
      if (e.target.closest("a,button")) return;
      advance();
    }, { passive: true });

    if (skip) {
      skip.addEventListener("click", function (e) {
        e.preventDefault();
        document.dispatchEvent(new Event("MSGPrologueSkipped"));
        finish({ immediate: true });
      });
    }

    if (reduce) {
      /* 動きを減らす設定：最終画面を即表示（スクロールは boot 側で） */
      render(1); finish({ stay: true });
    }

    return { play: play, finish: finish, isFinished: function () { return finished; } };
  }

  /* =========================================================
     ふわっと表示
  ========================================================= */
  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-inview"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = Number(el.dataset.reveal || 0);
        el.style.transition =
          "opacity .9s cubic-bezier(.2,.6,.2,1) " + d + "ms," +
          "transform .9s cubic-bezier(.2,.6,.2,1) " + d + "ms";
        el.classList.add("is-inview");
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* =========================================================
     BGM
  ========================================================= */
  function initSound(pro) {
    var audio = document.getElementById("openingAudio");
    var button = document.getElementById("soundButton");
    var replay = document.getElementById("replayButton");
    if (!audio || !button) return { play: function () {}, stop: function () {} };

    var label = button.querySelector(".label");
    var unlockArmed = false;
    var unlockFn = null;

    function setLabel(on) {
      button.classList.toggle("is-playing", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.setAttribute("aria-label", on ? "音楽を止める" : "音楽を鳴らす");
      if (label) label.textContent = on ? "SOUND ON" : "SOUND OFF";
    }
    /* 自動再生がブラウザに止められたときの「最初の操作で鳴らす」処理。
       SKIP・リンク・ボタンの操作では鳴らさない(演出の場面送りのタップのみ)。
       演出が終わったら解除し、以後は SOUND / もう一度 ボタンだけで鳴らす。 */
    function disarmUnlock() {
      if (!unlockFn) return;
      document.removeEventListener("pointerdown", unlockFn);
      unlockFn = null;
      unlockArmed = false;
    }
    function armUnlock() {
      if (unlockArmed) return;
      unlockArmed = true;
      unlockFn = function (e) {
        if (e.target && e.target.closest && e.target.closest("a,button")) return;
        disarmUnlock();
        audio.play().then(function () { setLabel(true); }).catch(function () {});
      };
      document.addEventListener("pointerdown", unlockFn);
    }
    document.addEventListener("MSGPrologueFinished", disarmUnlock);
    document.addEventListener("MSGPrologueSkipped", function () { disarmUnlock(); stop(); });
    function play(fromStart) {
      if (fromStart) { try { audio.currentTime = 0; } catch (e) {} }
      audio.loop = false;   /* コーラスは1回のみ */
      audio.volume = 0.55;
      var p = audio.play();
      if (p && p.then) {
        p.then(function () { setLabel(true); }).catch(function () { setLabel(false); armUnlock(); });
      } else { setLabel(true); }
    }
    function stop() { audio.pause(); setLabel(false); }

    button.addEventListener("click", function () {
      if (audio.paused) play(audio.ended); else stop();
    });
    audio.addEventListener("play", function () { setLabel(true); });
    audio.addEventListener("pause", function () { setLabel(false); });
    audio.addEventListener("ended", function () { setLabel(false); });

    if (replay) {
      replay.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "auto" });
        if (pro) pro.play();
        play(true);
      });
    }
    setLabel(false);
    return { play: play, stop: stop };
  }


  /* SOUND/もう一度は画面左上固定。フッター回避の上下移動は行わない。 */
  function initControlsClearFooter() {
    var box = document.querySelector(".msg-controls");
    if (!box) return;
    box.style.transform = "";
  }

  /* =========================================================
     進捗ライン
  ========================================================= */
  function initProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    var tick = false;
    function sync() {
      tick = false;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (total > 0 ? clamp(window.scrollY / total).toFixed(4) : 0) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!tick) { tick = true; window.requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  }

  function boot() {
    var pro = initPrologue();
    var snd = initSound(pro);
    initReveal();
    initProgress();
    initControlsClearFooter();

    var params = new URLSearchParams(window.location.search);
    var wantsMenu = params.get("view") === "top" || params.get("view") === "menu" ||
                    location.hash === "#explore" || location.hash === "#top";
    var seen = false;
    try { seen = sessionStorage.getItem("msgOpeningSeen") === "1"; } catch (e) {}

    if (pro && (wantsMenu || seen)) {
      /* 再訪・メニュー直行：演出は最終画面で止め、8つの入口へ */
      pro.finish({ stay: true });
      window.requestAnimationFrame(function () { window.scrollTo({ top: 0, behavior: "auto" }); });
    } else if (pro) {
      try { sessionStorage.setItem("msgOpeningSeen", "1"); } catch (e) {}
      pro.play();
      if (!reduce) snd.play(true);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
