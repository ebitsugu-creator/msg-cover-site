(() => {
  "use strict";
  const stage = document.getElementById("stage");
  const replay = document.getElementById("replay");
  const next = document.body.dataset.next || "";
  const groups = [
    document.querySelector(".axis-group"),
    document.querySelector(".parties"),
    document.querySelector(".frame"),
    document.querySelector(".right-copy"),
    document.querySelector(".left-copy")
  ].filter(Boolean);

  function clearForcedState() {
    groups.forEach((element) => {
      element.style.animation = "";
      element.style.opacity = "";
      element.style.filter = "";
      element.style.transform = "";
    });
  }

  function reveal(element) {
    element.style.animation = "none";
    element.style.opacity = "1";
    element.style.filter = "none";
    element.style.transform = "none";
  }

  function play() {
    clearForcedState();
    stage.classList.remove("play");
    void stage.offsetWidth;
    stage.classList.add("play");
  }

  window.MSGAdvanceAnimation = () => {
    const pending = groups.find((element) => Number.parseFloat(getComputedStyle(element).opacity || "0") < 0.95);
    if (pending) {
      reveal(pending);
      return true;
    }
    if (next) {
      location.href = next;
      return true;
    }
    return false;
  };

  window.addEventListener("load", () => requestAnimationFrame(play), { once: true });
  replay.addEventListener("click", play);
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") play();
  });
})();
