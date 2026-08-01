(() => {
  "use strict";
  const title = document.querySelector(".title");
  const next = document.body.dataset.next || "";

  window.MSGAdvanceAnimation = () => {
    const opacity = Number.parseFloat(getComputedStyle(title).opacity || "0");
    if (opacity < 0.95) {
      title.classList.add("is-click-visible");
      return true;
    }
    if (next) {
      location.href = next;
      return true;
    }
    return false;
  };
})();
