(() => {
  "use strict";

  if (window.__ml_selecaoperfil_init__) return;
  window.__ml_selecaoperfil_init__ = true;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const nav = $(".nav-pilula");

  const onScroll = () => {
    if (!nav) return;
    const scrolled = window.scrollY > 8;
    nav.dataset.scrolled = scrolled ? "1" : "0";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks =
    (window.MapsApp && typeof window.MapsApp.navLinks === "function")
      ? (window.MapsApp.navLinks() || [])
      : $$(".nav-link");

  const markActive = () => {
    const path = (location.pathname.split("/").pop() || "index.html").split("?")[0];
    if (window.MapsApp && typeof window.MapsApp.highlightNav === "function") {
      try { window.MapsApp.highlightNav(path); return; } catch {}
    }
    navLinks.forEach(a => {
      const href = (a.getAttribute("href") || "").split("?")[0];
      const isHashOnly = href.startsWith("#");
      const matches =
        (!isHashOnly && (href.endsWith(path) || href === path)) ||
        (path === "index.html" && href.includes("#home"));
      a.classList.toggle("active", !!matches);
      if (!isHashOnly) a.setAttribute("aria-current", matches ? "page" : "false");
    });
  };
  markActive();
  window.addEventListener("popstate", markActive);

  const PERFIL_KEY = "mapslink:perfil";
  const safeSet = (k, v) => {
    try { localStorage.setItem(k, v); } catch {}
  };

  const escolherPerfil = tipo => {
    safeSet(PERFIL_KEY, tipo);
    const destino = tipo === "empresarial" ? "loginempresa.html" : "loginpessoal.html";
    window.location.href = destino;
  };

  const btnEmp = $('[data-action="escolher-empresarial"]');
  const btnPes = $('[data-action="escolher-pessoal"]');
  if (btnEmp && !btnEmp.__sp_bound) {
    btnEmp.__sp_bound = true;
    btnEmp.setAttribute("type", "button");
    btnEmp.addEventListener("click", () => escolherPerfil("empresarial"));
  }
  if (btnPes && !btnPes.__sp_bound) {
    btnPes.__sp_bound = true;
    btnPes.setAttribute("type", "button");
    btnPes.addEventListener("click", () => escolherPerfil("pessoal"));
  }

  $$(".perfil-card").forEach(card => {
    if (card.__sp_bound) return;
    card.__sp_bound = true;

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");

    const go = () => {
      const tipo = card.dataset.perfil === "empresarial" ? "empresarial" : "pessoal";
      escolherPerfil(tipo);
    };

    card.addEventListener("click", e => {
      if (e.target.closest(".perfil-cta")) return;
      go();
    });
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const applyMotion = () => {
    document.documentElement.style.setProperty("--ml-motion-scale", prefersReduced.matches ? "0" : "1");
  };
  try {
    applyMotion();
    prefersReduced.addEventListener?.("change", applyMotion);
  } catch {}

})();
