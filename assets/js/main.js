(() => {
  "use strict";

  const intro = document.getElementById("intro");
  const header = document.querySelector(".intro-header");
  const audio = document.getElementById("openingAudio");
  const soundButton = document.getElementById("soundButton");
  const messages = [
    document.querySelector(".message--one"),
    document.querySelector(".message--two"),
    document.querySelector(".message--three"),
    document.querySelector(".message--four")
  ];
  const miyu = document.querySelector(".miyu-layer");
  const skip = document.getElementById("skipButton");
  const replay = document.getElementById("replayButton");
  const bar = document.getElementById("timelineBar");
  const drawer = document.getElementById("drawer");
  const menuButtons = [document.getElementById("menuButton"), document.getElementById("introMenuButton")].filter(Boolean);
  const closeButtons = drawer.querySelectorAll("[data-close]");
  const timers = [];
  const TOTAL = 22944;
  let raf = null;
  let started = 0;
  let finished = false;
  let audioUnlockArmed = false;
  let visualStep = 0;

  function later(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.splice(0).forEach(clearTimeout);
  }

  function showHeader() {
    header.classList.remove("is-hidden");
    header.classList.add("is-visible");
  }

  function hideHeader() {
    header.classList.remove("is-visible");
    header.classList.add("is-hidden");
  }

  function show(el) {
    el.classList.remove("is-leaving");
    el.classList.add("is-visible");
  }

  function clearMessages() {
    messages.forEach((message) => message.classList.remove("is-visible", "is-leaving"));
  }

  function clearAnimation() {
    clearTimers();
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function resetVisuals() {
    clearAnimation();
    finished = false;
    visualStep = 0;
    intro.classList.remove("is-finished", "is-running");
    clearMessages();
    miyu.classList.remove("is-visible");
    hideHeader();
    bar.style.width = "0%";
  }

  function progress() {
    if (finished) return;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime * 1000 : performance.now() - started;
    bar.style.width = Math.min(100, current / TOTAL * 100) + "%";
    raf = requestAnimationFrame(progress);
  }

  function finish({ stopAudio = false } = {}) {
    if (finished) return;
    finished = true;
    visualStep = 5;
    clearTimers();
    intro.classList.add("is-finished");
    hideHeader();
    bar.style.width = "100%";
    if (stopAudio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function renderStep(step) {
    if (finished) return;
    visualStep = Math.max(0, Math.min(5, step));
    clearMessages();
    miyu.classList.remove("is-visible");

    if (visualStep === 1) {
      showHeader();
      show(messages[0]);
    } else if (visualStep === 2) {
      showHeader();
      show(messages[1]);
    } else if (visualStep === 3) {
      hideHeader();
      show(messages[2]);
    } else if (visualStep === 4) {
      hideHeader();
      miyu.classList.add("is-visible");
      show(messages[3]);
    } else if (visualStep >= 5) {
      finish();
    }
  }

  function scheduleVisuals() {
    later(900, () => renderStep(1));
    later(5850, () => renderStep(2));
    later(9850, () => renderStep(3));
    later(15150, () => renderStep(4));
    later(22750, () => finish());
  }

  function scheduleAfterManualStep() {
    clearTimers();
    const delayByStep = { 1: 4950, 2: 4000, 3: 5300, 4: 7600 };
    const delay = delayByStep[visualStep];
    if (delay) later(delay, () => {
      renderStep(visualStep + 1);
      scheduleAfterManualStep();
    });
  }

  window.MSGAdvanceAnimation = () => {
    if (finished || drawer.classList.contains("is-open")) return false;
    renderStep(visualStep + 1);
    if (!finished) scheduleAfterManualStep();
    return true;
  };

  function armAudioUnlock() {
    if (audioUnlockArmed) return;
    audioUnlockArmed = true;

    const unlock = async () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      audioUnlockArmed = false;

      try {
        const elapsed = Math.max(0, Math.min(TOTAL, performance.now() - started));
        audio.currentTime = elapsed / 1000;
        await audio.play();
      } catch (error) {
        console.error("音源を再生できませんでした。", error);
      }
    };

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
  }

  function updateSoundButton() {
    const isOff = audio.muted;
    soundButton.textContent = isOff ? "SOUND ON" : "SOUND OFF";
    soundButton.setAttribute("aria-pressed", String(isOff));
    soundButton.setAttribute("aria-label", isOff ? "音楽を流す" : "音楽を消す");
  }

  function toggleSound() {
    audio.muted = !audio.muted;
    updateSoundButton();

    if (!audio.muted && audio.paused && !finished) {
      audio.play().catch(() => armAudioUnlock());
    }
  }

  async function playOpening({ userInitiated = false } = {}) {
    resetVisuals();
    audio.pause();
    audio.currentTime = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        intro.classList.add("is-running");
        started = performance.now();
        scheduleVisuals();
        raf = requestAnimationFrame(progress);
      });
    });

    try {
      await audio.play();
    } catch (error) {
      armAudioUnlock();
      if (userInitiated) console.error("音源を再生できませんでした。", error);
    }
  }

  function openMenu() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  soundButton.addEventListener("click", toggleSound);
  skip.addEventListener("click", () => finish({ stopAudio: true }));
  replay.addEventListener("click", () => playOpening({ userInitiated: true }));
  audio.addEventListener("ended", () => finish());
  menuButtons.forEach(btn => btn.addEventListener("click", openMenu));
  closeButtons.forEach(btn => btn.addEventListener("click", closeMenu));
  drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });

  updateSoundButton();
  playOpening();
})();
