/* =========================================================================
   SALTAMONTES — Comportamientos base del sitio (sin dependencias).
   La capa de animacion GSAP vive en effects.js.
   ========================================================================= */

/* CAMBIA ESTE NUMERO por el WhatsApp real.
   Formato internacional SIN "+", SIN espacios, SIN guiones.
   Ej. Venezuela: 58 + 4XXXXXXXXX -> "584141234567" */
const WHATSAPP_NUMBER = "584140000000";

/* ---- 1. Enlaces a WhatsApp con mensaje prellenado ---- */
(function initWhatsApp() {
  document.querySelectorAll(".js-wa").forEach((el) => {
    const build = () => {
      let msg = el.getAttribute("data-wa") || "Hola, quiero informacion sobre el cafe de Saltamontes.";
      if (el.hasAttribute("data-size-msg")) {
        const card = el.closest(".product");
        const size = card && card.querySelector(".size.is-active");
        if (size) msg += ` en presentacion de ${size.dataset.size}`;
        msg += ". ¿Precio y disponibilidad?";
      }
      el.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
    };
    build();
    el.addEventListener("focus", build);
    el.addEventListener("pointerenter", build);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
})();

/* ---- 2. Selector de presentacion en tarjetas ---- */
(function initSizes() {
  document.querySelectorAll(".product__sizes").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".size");
      if (!btn) return;
      group.querySelectorAll(".size").forEach((s) => {
        s.classList.toggle("is-active", s === btn);
        s.setAttribute("aria-pressed", String(s === btn));
      });
    });
  });
})();

/* ---- 3. Filtros de la tienda por proceso ---- */
(function initFilters() {
  const chips = Array.from(document.querySelectorAll(".filters .chip"));
  const cards = Array.from(document.querySelectorAll("#shopGrid .product"));
  if (!chips.length || !cards.length) return;

  function apply(filter) {
    chips.forEach((c) => {
      const on = c.dataset.filter === filter;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    cards.forEach((card) => {
      const show = filter === "todos" || card.dataset.proc === filter;
      card.classList.toggle("is-hidden", !show);
    });
  }

  chips.forEach((c) => c.addEventListener("click", () => apply(c.dataset.filter)));

  /* Los enlaces del mega menu tambien filtran */
  document.querySelectorAll(".mega a[data-filter]").forEach((a) => {
    a.addEventListener("click", () => apply(a.dataset.filter));
  });

  window.__applyShopFilter = apply;
})();

/* ---- 4. Header con borde al hacer scroll ---- */
(function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- 5. Mega menu (hover en desktop, click y teclado siempre) ---- */
(function initMega() {
  const trigger = document.getElementById("megaTrigger");
  const panel = document.getElementById("megaCafe");
  if (!trigger || !panel) return;

  let closeTimer = null;
  const isOpen = () => !panel.hidden;

  function open() {
    clearTimeout(closeTimer);
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }
  function close() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }
  function delayedClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 180);
  }

  trigger.addEventListener("click", () => (isOpen() ? close() : open()));

  const hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (hoverable.matches) {
    trigger.addEventListener("pointerenter", open);
    trigger.addEventListener("pointerleave", delayedClose);
    panel.addEventListener("pointerenter", open);
    panel.addEventListener("pointerleave", delayedClose);
  }

  panel.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { close(); trigger.focus(); } });
  document.addEventListener("click", (e) => {
    if (isOpen() && !e.target.closest("#megaCafe") && !e.target.closest("#megaTrigger")) close();
  });
  panel.addEventListener("focusout", (e) => {
    if (!panel.contains(e.relatedTarget) && e.relatedTarget !== trigger) close();
  });
})();

/* ---- 6. Menu movil ---- */
(function initMobileNav() {
  const menu = document.getElementById("mobileMenu");
  const open = document.getElementById("navToggle");
  const close = document.getElementById("navClose");
  if (!menu) return;

  const setOpen = (state) => {
    menu.classList.toggle("open", state);
    open?.setAttribute("aria-expanded", String(state));
    document.body.style.overflow = state ? "hidden" : "";
    if (state) close?.focus();
  };

  open?.addEventListener("click", () => setOpen(true));
  close?.addEventListener("click", () => setOpen(false));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
})();

/* ---- 7. Ticker: duplica el contenido para el loop infinito ---- */
(function initTicker() {
  const track = document.querySelector("[data-ticker]");
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

/* ---- 8. Carrusel de testimonios: arrastre con puntero ---- */
(function initDragScroll() {
  const el = document.querySelector("[data-drag-scroll]");
  if (!el) return;
  let down = false, startX = 0, startLeft = 0, moved = false;

  el.addEventListener("pointerdown", (e) => {
    down = true; moved = false;
    startX = e.clientX; startLeft = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) { moved = true; el.classList.add("is-dragging"); }
    el.scrollLeft = startLeft - dx;
  });
  const release = () => { down = false; el.classList.remove("is-dragging"); };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
  el.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
})();

/* ---- 9. Video de manifiesto: carga y reproduce solo al acercarse ---- */
(function initLazyVideo() {
  const video = document.querySelector("[data-lazy-video]");
  if (!video) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function load() {
    video.querySelectorAll("source[data-src]").forEach((s) => {
      s.src = s.dataset.src;
      s.removeAttribute("data-src");
    });
    video.load();
    if (!reduce) video.play?.().catch(() => {});
  }

  if (!("IntersectionObserver" in window)) { load(); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { load(); io.disconnect(); }
    });
  }, { rootMargin: "400px 0px" });
  io.observe(video);
})();

/* ---- 10. Hero: pausa el video con reduced motion ---- */
(function initHeroVideo() {
  const video = document.querySelector(".hero__media video");
  if (!video) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
  }
})();

/* ---- 11. Año del footer ---- */
(function initYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
