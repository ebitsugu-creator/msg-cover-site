(() => {
  "use strict";

  const interactiveSelector = [
    "a", "button", "input", "select", "textarea", "label", "summary",
    "[role='button']", ".section-nav", ".drawer", "[data-no-advance]"
  ].join(",");

  let locked = false;
  let guideButton = null;
  let guideTimer = 0;

  function shouldIgnore(event) {
    if (event.defaultPrevented) return true;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return true;
    if (target.closest(interactiveSelector)) return true;
    if (document.querySelector(".drawer.is-open")) return true;
    return false;
  }

  function setGuideVisible(visible) {
    if (!guideButton) return;
    guideButton.classList.toggle("is-visible", visible);
  }

  function reshowGuide() {
    window.clearTimeout(guideTimer);
    guideTimer = window.setTimeout(() => setGuideVisible(true), 420);
  }

  function runAdvance() {
    if (locked) return false;
    const fn = window.MSGAdvanceAnimation;
    if (typeof fn !== "function") return false;

    const handled = fn();
    if (!handled) {
      setGuideVisible(false);
      return false;
    }

    locked = true;
    setGuideVisible(false);
    reshowGuide();
    window.setTimeout(() => { locked = false; }, 220);
    return true;
  }

  function advanceFromPage(event) {
    if (locked || shouldIgnore(event)) return;
    if (runAdvance()) event.preventDefault();
  }

  function createGuideButton() {
    if (typeof window.MSGAdvanceAnimation !== "function") return;

    const style = document.createElement("style");
    style.textContent = `
      .msg-click-next-guide {
        position: fixed;
        right: 24px;
        bottom: 96px;
        z-index: 2147483000;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 10px 18px;
        border: 1px solid rgba(255,255,255,.55);
        border-radius: 999px;
        background: rgba(17,43,83,.78);
        color: #fff;
        font: 700 15px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
        letter-spacing: .04em;
        box-shadow: 0 8px 24px rgba(0,0,0,.22);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(8px);
        transition: opacity .28s ease, transform .28s ease, visibility .28s;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .msg-click-next-guide.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .msg-click-next-guide:hover { background: rgba(17,43,83,.9); }
      .msg-click-next-guide:focus-visible {
        outline: 3px solid rgba(255,255,255,.9);
        outline-offset: 3px;
      }
      @media (max-width: 700px) {
        .msg-click-next-guide {
          right: 14px;
          bottom: 72px;
          min-height: 40px;
          padding: 9px 14px;
          font-size: 13px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .msg-click-next-guide { transition: none; }
      }
    `;
    document.head.appendChild(style);

    guideButton = document.createElement("button");
    guideButton.type = "button";
    guideButton.className = "msg-click-next-guide";
    guideButton.textContent = "▶ クリックで次へ";
    guideButton.setAttribute("aria-label", "次のアニメーションへ進む");
    guideButton.setAttribute("data-no-advance", "");

    guideButton.addEventListener("pointerup", (event) => {
      event.preventDefault();
      event.stopPropagation();
      runAdvance();
    });

    document.body.appendChild(guideButton);
    window.setTimeout(() => setGuideVisible(true), 1200);
  }

  // capture=true で、画面上の別要素にイベントを止められても確実に拾う。
  document.addEventListener("pointerup", advanceFromPage, { capture: true, passive: false });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createGuideButton, { once: true });
  } else {
    createGuideButton();
  }
})();
