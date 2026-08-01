"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("stage");
  const next = document.body.dataset.next || "";

  function fitStage() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  fitStage();
  window.addEventListener("resize", fitStage);

  const horizontal = document.getElementById("horizontalGroup");
  const parties = document.getElementById("partyGroup");
  const vertical = document.getElementById("verticalGroup");
  const frame = document.getElementById("frameGroup");
  const leftCopy = document.getElementById("leftCopy");
  const donationCopy = document.getElementById("donationCopy");
  const rightCopy = document.getElementById("rightCopy");
  const headline = document.getElementById("headline");

  const steps = [
    [horizontal, parties],
    [vertical],
    [frame, leftCopy],
    [donationCopy],
    [rightCopy],
    [headline]
  ].map(group => group.filter(Boolean));

  const firstDelay = 550;
  const interval = 1750;

  function revealGroup(group) {
    group.forEach((element) => element.classList.add("is-visible"));
  }

  steps.forEach((group, index) => {
    window.setTimeout(() => revealGroup(group), firstDelay + index * interval);
  });

  window.MSGAdvanceAnimation = () => {
    const pending = steps.find((group) => group.some((element) => !element.classList.contains("is-visible")));
    if (pending) {
      revealGroup(pending);
      return true;
    }
    if (next) {
      location.href = next;
      return true;
    }
    return false;
  };
});
