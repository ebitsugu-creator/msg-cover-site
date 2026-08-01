(() => {
  "use strict";
  const body = document.body;
  const next = body.dataset.next || "";
  const prev = body.dataset.prev || "";
  const autoMs = Number(body.dataset.autoMs || 0);
  const top = body.dataset.top || "../../";

  const nav = document.createElement("nav");
  nav.className = "section-nav";
  nav.setAttribute("aria-label", "ページ移動");
  nav.innerHTML = `${prev ? '<a class="section-nav__button" href="'+prev+'" aria-label="前のページ">‹</a>' : '<span></span>'}<a class="section-nav__home" href="${top}" aria-label="トップへ">TOP</a>${next ? '<a class="section-nav__button" href="'+next+'" aria-label="次のページ">›</a>' : '<span></span>'}`;
  document.body.appendChild(nav);

  let timer = null;
  if (next && autoMs > 0) timer = window.setTimeout(() => location.href = next, autoMs);
  nav.addEventListener("click", () => { if (timer) clearTimeout(timer); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && next) location.href = next;
    if (e.key === "ArrowLeft" && prev) location.href = prev;
    if (e.key === "Home") location.href = top;
  });
})();