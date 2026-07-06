/* =========================================================================
   SALTAMONTES — Capa de animacion GI Group.
   Preloader, scroll cinematografico, micro-interacciones y cursor custom.
   Todo es aditivo: sin GSAP la pagina funciona y se ve completa.
   ========================================================================= */

(function () {
  const doc = document.documentElement;

  /* Sin GSAP no hay animacion: se libera el preloader y listo */
  if (typeof window.gsap === "undefined") {
    doc.classList.remove("loading");
    return;
  }

  const hasST = typeof window.ScrollTrigger !== "undefined";
  const hasSplit = typeof window.SplitText !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();

  /* =======================================================================
     1. PRELOADER — contador 0-100 y revelado del hero. Una vez por sesion.
     ======================================================================= */
  function heroIntro(delay) {
    const items = [".hero__logo", ".hero__notes", ".hero__cta", ".hero__foot"];
    const title = document.querySelector(".hero__title");
    const tl = gsap.timeline({ delay: delay, defaults: { ease: "power3.out" } });

    if (title && hasSplit) {
      const split = new SplitText(title, { type: "lines", mask: "lines" });
      tl.from(split.lines, { yPercent: 115, duration: 1.05, stagger: 0.09 });
    } else if (title) {
      tl.from(title, { y: 44, opacity: 0, duration: 1 });
    }
    tl.from(items, { y: 26, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.65");
    return tl;
  }

  mm.add("(prefers-reduced-motion: no-preference)", () => {

    if (doc.classList.contains("loading")) {
      const counter = { v: 0 };
      const countEl = document.getElementById("preCount");
      const pre = document.getElementById("preloader");

      const tl = gsap.timeline({
        onComplete: () => {
          doc.classList.remove("loading");
          try { sessionStorage.setItem("sm-intro", "1"); } catch (e) { /* privado */ }
        }
      });

      tl.to(counter, {
        v: 100,
        duration: 1.05,
        ease: "power2.inOut",
        onUpdate: () => { if (countEl) countEl.textContent = Math.round(counter.v); }
      })
      .to(".preloader__inner", { y: -26, opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.15")
      .to(pre, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.7,
        ease: "power4.inOut",
        onComplete: () => gsap.set(pre, { display: "none" })
      }, "-=0.1")
      .add(heroIntro(0), "-=0.35");
    } else {
      heroIntro(0.15);
    }

    /* =====================================================================
       2. SCROLL CINEMATOGRAFICO
       ===================================================================== */
    if (hasST) {

      /* Hero: el video escala y se desplaza con el scroll (parallax scrub) */
      const heroMedia = document.querySelector("[data-hero-media] video");
      if (heroMedia) {
        gsap.to(heroMedia, {
          scale: 1.18,
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
      }

      /* Ahorro de bateria: pausa los videos fuera de pantalla */
      document.querySelectorAll(".hero__media video, .manifesto__media video").forEach((v) => {
        ScrollTrigger.create({
          trigger: v.closest("section, .hero") || v,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            if (self.isActive) { v.play?.().catch(() => {}); }
            else { v.pause?.(); }
          }
        });
      });

      /* Titulares: lineas enmascaradas que suben al entrar */
      if (hasSplit) {
        document.querySelectorAll("[data-split]:not(.hero__title)").forEach((el) => {
          const split = new SplitText(el, { type: "lines", mask: "lines" });
          gsap.from(split.lines, {
            yPercent: 115,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
          });
        });

        /* Manifiesto: las palabras se encienden con el scroll (scrub) */
        const line = document.querySelector("[data-split-words]");
        if (line) {
          const words = new SplitText(line, { type: "words" }).words;
          words.forEach((w) => w.classList.add("w"));
          gsap.fromTo(words,
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.06,
              ease: "none",
              scrollTrigger: {
                trigger: ".manifesto",
                start: "top 75%",
                end: "center center",
                scrub: 0.6
              }
            }
          );
        }
      }

      /* Reveals genericos */
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
      });

      /* Imagenes editoriales: revelado con clip-path + escala interna */
      gsap.utils.toArray(".reveal-img").forEach((fig) => {
        const img = fig.querySelector("img");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: fig, start: "top 85%", once: true }
        });
        tl.fromTo(fig,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.15, ease: "power4.inOut" }
        );
        if (img) tl.from(img, { scale: 1.16, duration: 1.15, ease: "power4.out" }, 0.1);
      });

      /* Origen: parallax sutil entre las figuras de la columna derecha */
      gsap.utils.toArray(".origin__fig").forEach((fig, i) => {
        gsap.to(fig, {
          yPercent: i % 2 === 0 ? -4 : 4,
          ease: "none",
          scrollTrigger: { trigger: ".origin", start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      /* Contadores de credenciales y del club */
      gsap.utils.toArray("[data-counter]").forEach((el) => {
        const target = parseInt(el.dataset.counter, 10) || 0;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.7,
          ease: "power2.out",
          snap: { v: 1 },
          onUpdate: () => { el.textContent = Math.round(obj.v); },
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
      });
    }

    /* =====================================================================
       3. MICRO-INTERACCIONES (solo puntero fino)
       ===================================================================== */
    mm.add("(hover: hover) and (pointer: fine)", () => {

      /* Botones magneticos */
      document.querySelectorAll(".btn").forEach((btn) => {
        const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
        });
        btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
      });

      /* Tilt sutil en las fotos de producto */
      document.querySelectorAll("[data-tilt]").forEach((card) => {
        gsap.set(card, { transformPerspective: 700 });
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2.out" });
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 7);
          rx(py * -7);
        });
        card.addEventListener("pointerleave", () => { rx(0); ry(0); });
      });

      /* ===================================================================
         4. CURSOR CUSTOM
         =================================================================== */
      const cursor = document.getElementById("cursor");
      const label = document.getElementById("cursorLabel");
      if (cursor) {
        doc.classList.add("has-cursor");
        const cx = gsap.quickTo(cursor, "x", { duration: 0.28, ease: "power3.out" });
        const cy = gsap.quickTo(cursor, "y", { duration: 0.28, ease: "power3.out" });

        window.addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); });

        document.addEventListener("pointerover", (e) => {
          const target = e.target.closest("[data-cursor]");
          const link = e.target.closest("a, button");
          if (target) {
            if (label) label.textContent = target.dataset.cursor;
            gsap.to(cursor, { scale: 4.6, duration: 0.3, ease: "power3.out" });
            if (label) gsap.to(label, { opacity: 1, duration: 0.2 });
          } else if (link) {
            gsap.to(cursor, { scale: 2.2, duration: 0.3, ease: "power3.out" });
            if (label) gsap.to(label, { opacity: 0, duration: 0.15 });
          }
        });
        document.addEventListener("pointerout", (e) => {
          if (e.target.closest("[data-cursor], a, button")) {
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power3.out" });
            if (label) gsap.to(label, { opacity: 0, duration: 0.15 });
          }
        });
        document.addEventListener("pointerleave", () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
        document.addEventListener("pointerenter", () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
      }

      return () => { doc.classList.remove("has-cursor"); };
    });

  });

  /* Con reduced motion: nada de animacion, pero el preloader jamas bloquea */
  mm.add("(prefers-reduced-motion: reduce)", () => {
    doc.classList.remove("loading");
  });
})();
