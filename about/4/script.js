"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("stage");
  const openingCopy = document.getElementById("openingCopy");
  const secondScene = document.getElementById("secondScene");
  const thirdScene = document.getElementById("thirdScene");

  function fitStage(){
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  fitStage();
  window.addEventListener("resize", fitStage);

  function showOpening() {
    openingCopy.classList.remove("is-leaving");
    openingCopy.classList.add("is-visible");
  }

  function showSecond() {
    openingCopy.classList.remove("is-visible");
    openingCopy.classList.add("is-leaving");
    secondScene.classList.add("is-visible");
  }

  function showMembers() {
    secondScene.classList.add("members-visible");
  }

  function showThird() {
    secondScene.classList.add("is-leaving");
    thirdScene.classList.add("is-visible");
  }

  window.setTimeout(showOpening, 500);
  window.setTimeout(() => {
    openingCopy.classList.remove("is-visible");
    openingCopy.classList.add("is-leaving");
  }, 2740);
  window.setTimeout(() => secondScene.classList.add("is-visible"), 2840);
  window.setTimeout(showMembers, 5140);
  window.setTimeout(() => secondScene.classList.add("is-leaving"), 9000);
  window.setTimeout(() => thirdScene.classList.add("is-visible"), 9100);

  window.MSGAdvanceAnimation = () => {
    if (!openingCopy.classList.contains("is-visible") && !openingCopy.classList.contains("is-leaving") && !secondScene.classList.contains("is-visible")) {
      showOpening();
      return true;
    }
    if (!secondScene.classList.contains("is-visible")) {
      showSecond();
      return true;
    }
    if (!secondScene.classList.contains("members-visible")) {
      showMembers();
      return true;
    }
    if (!thirdScene.classList.contains("is-visible")) {
      showThird();
      return true;
    }
    return false;
  };
});
